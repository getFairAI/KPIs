import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

export interface SolutionRequests {
  owner: string;
  timestamp: number;
  rawData: string;
}

const schema = new mongoose.Schema<SolutionRequests>(
  {
    // _id: ObjectId
    owner: { type: String, required: true },
    timestamp: { type: Number, required: true },
    rawData: { type: String, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTION_REQUESTS',
  }
);

export const SOLUTION_REQUESTS_MODEL = dbConnection.model('SOLUTION_REQUESTS', schema);
