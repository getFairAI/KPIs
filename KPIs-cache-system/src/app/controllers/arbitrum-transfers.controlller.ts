import express from 'express';
import { ARBITRUM_TRANSFERS_MODEL } from '../schema';
import { formatUnits } from 'viem';

const VAULT_EVM_ADDRESS = '0x611dEe04f236BbC45e3a6De266ABe2B2b32eab31'.toLowerCase();
var router = express.Router();

// base path - /arbitrum-transfers

// retrieves all solutions currently stored on DB
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

router.get('/request-payments', async (_, response) => {
  try {
    // query payments that have a matching request id from the user requests collection and join with the user requests collection
    /* const result = await ARBITRUM_TRANSFERS_MODEL.aggregate([
      {
        $lookup: {
          from: 'user_requests',
          localField: 'blockchainRequestId',
          foreignField: 'blockchainRequest',
          as: 'user_requestId',
        },
      },
    ]).exec(); */
    const results = await ARBITRUM_TRANSFERS_MODEL.aggregate([
      { $lookup: { from: 'USER_REQUESTS', localField: 'blockchainRequestId', foreignField: 'blockchainRequest', as: 'xxx' } },
      { $lookup: { from: 'USER_RESPONSES', localField: 'blockchainRequestId', foreignField: 'blockchainResponseId', as: 'yyy' } },
    ]).exec();

    const responses = results.filter(el => el.yyy.length > 0);
    console.log('responses', responses.length);
    const requests = results.filter(el => el.xxx.length > 0);
    console.log('requests', requests.length);

    response.status(200).json(results.filter(el => el.xxx.length > 0 || el.yyy.length > 0) ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

router.get('/marketplace-revenue', async (_, response) => {
  try {
    const [ result ] = await ARBITRUM_TRANSFERS_MODEL.aggregate([
      { $match: { to: VAULT_EVM_ADDRESS }, },
      { $group: { _id: null, total: { $sum: '$amount' } } },
      { $addFields: { currency: 'usdc' } },
    ]).exec();
    
    result.total = formatUnits(BigInt(result.total), 6);

    response.status(200).json(result ?? { total: 0, currency: 'usdc' });
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

export default router;
