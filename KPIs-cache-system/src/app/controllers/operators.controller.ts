import express from 'express';
import { SOLUTIONS_MODEL } from '../schema/solutions_Schema';
import { ACTIVE_OPERATORS_MODEL } from '../schema';
import { formatUnits } from 'viem';

var router = express.Router();

// base path - /operators

/**
 * @openapi
 * /:
 *   get-all:
 *     description: Get all
 *     responses:
 *       200:
 *         description: Returns an array of all operatprs { _id, registrationId, owner, relatedSolution, blockchainSolutionId, blockHeight, fee, timestamp }
 */
router.get('/get-all', async (_, response) => {
  ACTIVE_OPERATORS_MODEL.find()
    .select('-rawData')
    .lean()
    .then(results => response.status(200).json(results ?? []))
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    });
});

/**
 * @openapi
 * /:
 *   get-valid-operators:
 *     description: Get all valid operators
 *     responses:
 *       200:
 *         description: Returns an array of all valid operators { _id, registrationId, owner, relatedSolution, blockchainSolutionId, blockHeight, fee, timestamp }
 */
router.get('/valid-operators', async (_, response) => {
  try {
    // 1 day in seconds = 24 * 60 * 60 = 86400
    const pastDayInSec = new Date().getTime() / 1000 - 86400;
    // valid operators are those that have not been cancelled and have proof in the last 30m
    const results = await ACTIVE_OPERATORS_MODEL.aggregate([
      // find all operators that have not been cancelled
      { $lookup: { from: 'OPERATOR_CANCELLATIONS', localField: 'registrationId', foreignField: 'registrationId', as: 'cancellationTx' } },
      { $match: { cancellationTx: { $eq: [] } } },
      // find all operators that have proof in the last day
      { $lookup: { from: 'OPERATOR_PROOFS', localField: 'owner', foreignField: 'operatorAddress', as: 'proofTx' } },
      { $match: { 'proofTx.timestamp': { $gte: pastDayInSec } } },
    ]).exec();

    if (!results) {
      response.status(404).send('Operators not found.');
      return;
    }

    response.status(200).json(results ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

/**
 * @openapi
 * /:
 *   revenue?{operatorAddress}:
 *     description: Get revenue by operator address
 *     responses:
 *       200:
 *         description: Returns an object with the total revenue, total sent, total received, max sent, max received and the currency { currentRevenue, totalReceived, totalSent, maxReceived, maxSent, currency }
 */
router.get('/revenue?:operatorAddress', async (request, response) => {
  try {
    const operatorAddress = request.query.operatorAddress;

    if (!operatorAddress || typeof operatorAddress !== 'string') {
      response.status(400).send('Missing operatorAddress query parameter or invalid type.');
      return;
    }

    const [result] = await ACTIVE_OPERATORS_MODEL.aggregate([
      { $match: { owner: operatorAddress } },
      { $lookup: { from: 'WALLET_LINKS', localField: 'owner', foreignField: 'arweaveAddress', as: 'link' } },
      { $unwind: { path: '$link' } },
      { $group: { _id: null, operatorEvmAddress: { $addToSet: '$link.evmAddress' } } },
      { $unwind: { path: '$operatorEvmAddress' } },
      { $project: { operatorEvmAddress: { $toLower: '$operatorEvmAddress' } } },
      { $lookup: { from: 'ARBITRUM_TRANSFERS', localField: 'operatorEvmAddress', foreignField: 'to', as: 'operatorReceivedTransfers' } },
      { $unwind: { path: '$operatorReceivedTransfers', includeArrayIndex: 'arrayIndex' } },
      { $group: { _id: null, totalReceived: { $sum: '$operatorReceivedTransfers.amount' }, maxReceived: { $max: '$operatorReceivedTransfers.amount' }, operatorEvmAddress: { $first: '$operatorEvmAddress' } } },
      { $lookup: { from: 'ARBITRUM_TRANSFERS', localField: 'operatorEvmAddress', foreignField: 'from', as: 'operatorSentTransfers' } },
      { $unwind: { path: '$operatorSentTransfers', includeArrayIndex: 'arrayIndex' } },
      {
        $group: {
          _id: null,
          totalReceived: { $first: '$totalReceived' },
          totalSent: { $sum: '$operatorSentTransfers.amount' },
          maxReceived: { $first: '$maxReceived' },
          maxSent: { $max: '$operatorSentTransfers.amount' },
          operatorEvmAddress: { $first: '$operatorEvmAddress' },
        },
      },
      { $addFields: { currency: 'usdc' } },
    ]).exec();

    if (!result) {
      response.status(404).send('Operator not found.');
      return;
    }
    result.currentRevenue = formatUnits(BigInt(result.totalReceived - result.totalSent), 6);
    result.totalReceived = formatUnits(BigInt(result.totalReceived), 6);
    result.totalSent = formatUnits(BigInt(result.totalSent), 6);
    result.maxReceived = formatUnits(BigInt(result.maxReceived), 6);
    result.maxSent = formatUnits(BigInt(result.maxSent), 6);

    response.status(200).json(result ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

export default router;
