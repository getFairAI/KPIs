import express from 'express';
var router = express.Router();

// base path - /solutions

import { SOLUTION_REQUESTS_MODEL } from '../schema';

// retrieves all solutions currently stored on DB
router.get('/get-all', async (_, response) => {
  SOLUTION_REQUESTS_MODEL.find().select('-rawData')
    .lean()
    .then(results => response.status(200).json(results ?? []))
    .catch(error => {
      console.log(error);
      response.status(500).send(error);
    });
});

// retrieves all solutions currently stored on DB - sends only raw data
router.get('/get-all-raw', async (_, response) => {
  SOLUTION_REQUESTS_MODEL.find()
    .select('-rawData')
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
