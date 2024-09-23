import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    relatedSolution: { type: mongoose.Schema.Types.ObjectId || null, required: false, ref: 'SOLUTIONS', index: true },
    blockchainRequest: { type: String, required: true },
    owner: { type: String, required: true },
    rawData: { type: String, required: true },
    responseTimestamp: { type: Date || null, required: false }, // required false: request may never get a response (and we want to know it)
    timestamp: { type: Number, required: true }, // timestamp of the request - in miliseconds (!!!!)
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_REQUESTS',
  }
);

export const USER_REQUESTS_MODEL = dbConnection.model('USER_REQUESTS', schema);
