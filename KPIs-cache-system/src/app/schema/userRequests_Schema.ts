import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    relatedSolution: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SOLUTIONS', index: true },
    blockchainRequest: { type: String, required: true, unique: true, index: true },
    contentType: { type: String, required: true },
    requestTimestamp: { type: Date, required: true },
    responseTimestamp: { type: Date, required: false }, // required false: request may never get a response (and we want to know it)
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_REQUESTS',
  }
);

export const USER_REQUESTS_MODEL = dbConnection.model('USER_REQUESTS', schema);
