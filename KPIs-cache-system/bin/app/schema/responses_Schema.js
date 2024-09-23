import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';
const schema = new mongoose.Schema({
    // _id: ObjectId
    owner: { type: String, required: true },
    requestOwner: { type: String, required: true },
    blockchainRequestId: { type: String, required: true },
    blockchainResponseId: { type: String, required: true },
    blockchainSolutionId: { type: String, required: true },
    blockHeight: { type: Number, required: true },
    rawData: { type: String, required: true }, // JSON stringified
    timestamp: { type: Number, required: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_RESPONSES',
});
export const USER_RESPONSES_MODEL = dbConnection.model('USER_RESPONSES', schema);
