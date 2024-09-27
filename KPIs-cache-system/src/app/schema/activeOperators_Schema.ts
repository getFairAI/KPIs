import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    registrationId: { type: String, required: true },
    owner: { type: String, required: true },
    relatedSolution: { type: mongoose.Schema.Types.ObjectId || null, required: false, ref: 'SOLUTIONS' },
    blockchainSolutionId: { type: String, required: true },
    blockHeight: { type: Number, required: true },
    fee: { type: Number, required: true },
    timestamp: { type: Number, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'ACTIVE_OPERATORS',
  }
);

export const ACTIVE_OPERATORS_MODEL = dbConnection.model('ACTIVE_OPERATORS', schema);
