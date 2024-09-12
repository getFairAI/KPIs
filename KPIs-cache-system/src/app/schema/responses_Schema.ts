import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    relatedUserRequest: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'USER_REQUESTS' },
    timestamp: { type: Date, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_RESPONSES',
  }
);

export const USER_RESPONSES_MODEL = dbConnection.model('USER_RESPONSES', schema);
