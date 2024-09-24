import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    arweaveAddress: { type: String, required: true },
    evmPublicKey: { type: String, required: true },
    blockchainTransactionId: { type: String, required: true },
    evmAddress: { type: String || null, required: false },
    blockHeight: { type: Number, required: true },
    timestamp: { type: Number, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'WALLET_LINKS',
  }
);

export const WALLET_LINKS_MODEL = dbConnection.model('WALLET_LINKS', schema);
