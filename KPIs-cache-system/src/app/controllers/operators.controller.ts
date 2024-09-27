import express from 'express';
var router = express.Router();
import { SOLUTIONS_MODEL } from '../schema/solutions_Schema';
import { ACTIVE_OPERATORS_MODEL, WALLET_LINKS_MODEL } from '../schema';

// base path - /solutions


// retrieves all solutions currently stored on DB
router.get('/get-all', async (_, response) => {
  ACTIVE_OPERATORS_MODEL.find().select('-rawData')
    .lean()
    .then(results => response.status(200).json(results ?? []))
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    });
});

// retrieves all solutions currently stored on DB - sends only raw data
router.get('/get-all-raw', async (_, response) => {
  SOLUTIONS_MODEL.find()
    .lean()
    .then(results => {
      let dataPreparation = results.map(item => {
        return JSON.parse(item?.rawData ?? '');
      });
      response.status(200).json(dataPreparation ?? []);
    })
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    });
});

router.get('/test', async (_, response) => {
  try {

    const [ result ] = await WALLET_LINKS_MODEL.find().exec();
    const x = ethers.computeAddress(`0x${result?.evmPublicKey}`);
    response.status(200).json({ result: x });
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

router.get('/revenue/:operatorAddress', async (request, response) => {
  const operatorAddress = request.params.operatorAddress;
  try {
    const [ result ] = await ACTIVE_OPERATORS_MODEL.aggregate([
      { $match: { operatorAddress: operatorAddress } },
      { $group: { _id: null, total: { $sum: '$revenue' } } },
    ]).exec();
    response.status(200).json(result ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

export default router;
