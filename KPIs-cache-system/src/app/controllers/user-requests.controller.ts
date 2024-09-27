import express from 'express';
import { ARBITRUM_TRANSFERS_MODEL, USER_REQUESTS_MODEL } from '../schema';
var router = express.Router();

// base path - /user-requests

/**
 * @openapi
 * /:
 *   get-all:
 *     description: Get all
 *     responses:
 *       200:
 *         description: Returns an array of all user requests { _id, owner, timestamp }
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
 *   get-unique:
 *     description: Get all unique users
 *     responses:
 *       200:
 *         description: Returns an array of all unique users { owner }
 */
router.get('/get-unique', async (_, response) => {
  try {
    const results = await USER_REQUESTS_MODEL.find().distinct('owner').select('-rawData').lean().exec();

    response.status(200).json(results ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

/**
 * @openapi
 * /:
 *   get-unpaid:
 *     description: Get all unpaid requests
 *     responses:
 *       200:
 *         description: Returns an array of all unpaid requests { _id, owner, timestamp }
 */
router.get('/get-unpaid', async (_, response) => {
  try {
    const results = await USER_REQUESTS_MODEL.aggregate([
      { $lookup: { from: 'ARBITRUM_TRANSFERS', localField: 'blockchainRequest', foreignField: 'blockchainRequestId', as: 'payment' } },
      { $match: { 'payment': { $eq: [] } } },
    ])

    response.status(200).json(results ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});

/**
 * @openapi
 * /:
 *   get-unanswered:
 *     description: Get all unanswered requests
 *     responses:
 *       200:
 *         description: Returns an array of all unanswered requests { _id, owner, timestamp }
 */
router.get('/get-unanswered', async (_, response) => {
  try {
    const results = await USER_REQUESTS_MODEL.aggregate([
      { $lookup: { from: 'USER_RESPONSES', localField: 'blockchainRequest', foreignField: 'blockchainRequestId', as: 'response' } },
      { $match: { 'response': { $eq: [] } } },
    ])

    response.status(200).json(results ?? []);
  } catch (error) {
    console.log(error);
    response.status(500).send(error);
  }
});


export default router;
