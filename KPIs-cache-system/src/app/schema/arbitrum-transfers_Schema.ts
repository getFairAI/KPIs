import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

export interface ArbitrumTransfers {
  relatedUserRequest: mongoose.Schema.Types.ObjectId;
  blockchainRequestId: string;
  blockchainBlockNumber: number;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: number;
  type: 'request' | 'distribution';
}

const schema = new mongoose.Schema<ArbitrumTransfers>(
  {
    // _id: ObjectId
    relatedUserRequest: { type: mongoose.Schema.Types.ObjectId || null, ref: 'USER_REQUESTS', required: false }, // false to add later
    blockchainRequestId: { type: String, required: true },
    blockchainBlockNumber: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['request', 'distribution'], required: true },
    timestamp: { type: Number, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'ARBITRUM_TRANSFERS',
  }
);

export const ARBITRUM_TRANSFERS_MODEL = dbConnection.model('ARBITRUM_TRANSFERS', schema);
