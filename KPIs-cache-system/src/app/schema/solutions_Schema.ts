import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    name: { type: String, required: true },
    owner: { type: String, required: true },
    relatedSolutionRequest: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'SOLUTION_REQUESTS', index: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTIONS',
  }
);

export const SOLUTIONS_MODEL = dbConnection.model('SOLUTIONS', schema);
