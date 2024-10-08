import { block } from './../../gql/arweave-native/graphql';
import express from 'express';
import { ARBITRUM_TRANSFERS_MODEL } from '../schema';
import { formatUnits } from 'viem';

const VAULT_EVM_ADDRESS = '0x611dEe04f236BbC45e3a6De266ABe2B2b32eab31'.toLowerCase();
var router = express.Router();

// base path - /arbitrum-transfers

/**
 * @openapi
 * /:
 *   get-all:
 *     description: Get all transfers
 *     responses:
 *       200:
 *         description: Returns an array of all transfers { _id, relatedUserRequest, blockchainRequestId, blockchainBlockNumber, from, to, amount, fee, timestamp, type }
 */
router.get('/get-all', async (request, response) => {
  ARBITRUM_TRANSFERS_MODEL.find()
    .lean()
    .then(results => {
      response.status(200).json(results ?? []);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    });
});

/**
 * @openapi
 * /:
 *   get-payments:
 *     description: Get all payments
 *     responses:
 *       200:
 *         description: Returns an array of all transfers that reference a request { _id, relatedUserRequest, blockchainRequestId, blockchainBlockNumber, from, to, amount, fee, timestamp, type }
 */
router.get('/get-payments', async (_, response) => {
  try {
    // get payments that reference a request
    const results = await ARBITRUM_TRANSFERS_MODEL.aggregate([
      { $lookup: { from: 'USER_REQUESTS', localField: 'blockchainRequestId', foreignField: 'blockchainRequest', as: 'user_request' } },
      { $match: { 'user_request': { $ne: [] } } },
    ]).exec();

    response.status(200).json(results ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

/**
 * @openapi
 * /:
 *   marketplace-revenue:
 *     description: Get the total revenue from the marketplace
 *     request:
 *      parameters:
 *       - in: query
 *        name: startDateUnix
 *        schema:
 *        type: integer
 *        description: The start date in Unix timestamp
 *       - in: query
 *        name: endDateUnix
 *        schema:
 *        type: integer
 *        description: The end date in Unix timestamp
 *     responses:
 *       200:
 *         description: Returns an array [{ value, count }] of the total revenue, requests revenue, registrations revenue and unknown revenue { total, requests, registrations, unknown }
 *
 */
router.get('/marketplace-revenue/:startDateUnix?/:endDateUnix?', async (req, response) => {
  try {
    const startDateUnix = Number(req.query.startDateUnix) / 1000;
    const endDateUnix = Number(req.query.endDateUnix) / 1000;

    let skiptimestamp = false;
    if (Number.isNaN(startDateUnix) && Number.isNaN(endDateUnix)) {
      skiptimestamp = true;
    }
  
    const [result] = await ARBITRUM_TRANSFERS_MODEL.aggregate([
      {
        $match: {
          to: VAULT_EVM_ADDRESS,
          ...(!skiptimestamp) && { timestamp: {
            ...(startDateUnix && !Number.isNaN(startDateUnix)) && { $gte: startDateUnix },
            ...(endDateUnix && !Number.isNaN(endDateUnix)) && { $lte: endDateUnix },
          }}
        },
      },
      { $lookup: { from: 'ACTIVE_OPERATORS', localField: 'blockchainRequestId', foreignField: 'registrationId', as: 'operator_registration' } },
      { $lookup: { from: 'USER_REQUESTS', localField: 'blockchainRequestId', foreignField: 'blockchainRequest', as: 'user_request' } },
      {
        $group: {
          _id: null,
          unknownCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [ '$operator_registration', []] } ,
                    { $eq: [ '$user_request', []] } 
                  ]
                },
                1,
                0
              ]
            }
          },
          unknownSum: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: [ '$operator_registration', []] } ,
                    { $eq: [ '$user_request', []] } 
                  ]
                },
                '$amount',
                0
              ]
            }
          },
          registrationCount: {
            $sum: {
              $cond: [
                { $ne: [ '$operator_registration', []] },
                1,
                0
              ]
            }
          },
          registrationSum: {
            $sum: {
              $cond: [
                { $ne: [ '$operator_registration', []] },
                '$amount',
                0
              ]
            }
          },
          requestCount: {
            $sum: {
              $cond: [
                { $ne: [ '$user_request', []] },
                1,
                0
              ]
            }
          },
          requestSum: {
            $sum: {
              $cond: [
                { $ne: [ '$user_request', []] },
                '$amount',
                0
              ]
            }
          },
          totalCount: {
            $sum: 1
          },
          totalSum: {
            $sum: '$amount',
          },
        }
      }
    ]).exec();
    
    result.total = {
      value: formatUnits(BigInt(result.totalSum), 6),
      count: result.totalCount,
    }
    result.requests = {
      value: formatUnits(BigInt(result.requestSum), 6),
      count: result.requestCount,
    }
    result.registrations = {
      value: formatUnits(BigInt(result.registrationSum), 6),
      count: result.registrationCount,
    }
    result.unknown = {
      value: formatUnits(BigInt(result.unknownSum), 6),
      count: result.unknownCount,
    }

    response.status(200).json([ result.total, result.requests, result.registrations, result.unknown ]);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

export default router;
