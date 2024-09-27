import express from 'express';
var router = express.Router();

// base path - /solutions

import { SOLUTIONS_MODEL } from '../schema/solutions_Schema';

// retrieves all solutions currently stored on DB
router.get('/get-all', async (_, response) => {
  SOLUTIONS_MODEL.find().select('-rawData')
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

export default router;
