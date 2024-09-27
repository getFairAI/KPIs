import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

export interface WalletLink {
  arweaveAddress: string;
  evmPublicKey: string;
  blockchainTransactionId: string;
  evmAddress: string;
  blockHeight: number;
  timestamp: number;
}

const schema = new mongoose.Schema<WalletLink>(
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
