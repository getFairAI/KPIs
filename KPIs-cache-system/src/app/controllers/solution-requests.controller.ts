import express from 'express';
import { SOLUTION_REQUESTS_MODEL } from '../schema';
var router = express.Router();

// base path - /solutions-requests

/**
 * @openapi
 * /:
 *   get-all:
 *     description: Get all
 *     responses:
 *       200:
 *         description: Returns an array of all solutions requests { _id, owner, timestamp }
 */
router.get('/get-all', async (_, response) => {
  SOLUTION_REQUESTS_MODEL.find().select('-rawData')
    .lean()
    .then(results => response.status(200).json(results ?? []))
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    });
});

export default router;
