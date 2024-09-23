import express from 'express';
var router = express.Router();

// base path - /arbitrum-transfers

import { ARBITRUM_TRANSFERS_MODEL } from '../schema/arbitrum-transfers_Schema.js';

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

export default router;
