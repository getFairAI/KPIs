import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel';

export interface OperatorProof {
  operatorAddress: string;
  blockHeight: number;
  timestamp: number;
}

const schema = new mongoose.Schema<OperatorProof>(
  {
    // _id: ObjectId
    operatorAddress: { type: String, required: true },
    blockHeight: { type: Number, required: true },
    timestamp: { type: Number, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'OPERATOR_PROOFS',
  }
);

export const OPERATOR_PROOF_MODEL = dbConnection.model('OPERATOR_PROOFS', schema);
