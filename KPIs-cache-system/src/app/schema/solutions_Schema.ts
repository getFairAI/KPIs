import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    solutionId: { type: String, required: true, unique: true, index: true },
    solutionName: { type: String, required: true },
    solutionDescription: { type: String, required: true },
    solutionOwner: { type: String, required: true },
    rawData: { type: String, required: true }, // JSON stringified
    blockHeight: { type: Number, required: true },
    relatedNewSolutionRequest: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'SOLUTION_REQUESTS' }, // optional
    originalSolutionRequest: { type: String, required: false },
    output: { type: String, required: true },
    outputConfiguration: { type: String, required: false },
    rewardsAddress: { type: String, required: false },
    timestamp: { type: Number, required: true },
    allowFiles: { type: Boolean, default: false, required: false },
    allowText: { type: Boolean, default: true, required: false },
    contractAddress: { type: String, required: false },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTIONS',
  }
);

export const SOLUTIONS_MODEL = dbConnection.model('SOLUTIONS', schema);
