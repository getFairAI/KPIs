import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';
const schema = new mongoose.Schema({
    // _id: ObjectId
    registrationId: { type: String, required: true },
    owner: { type: String, required: true },
    blockHeight: { type: Number, required: true },
    timestamp: { type: Number, required: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'OPERATOR_CANCELLATIONS',
});
export const OPERATOR_CANCELLATIONS_MODEL = dbConnection.model('OPERATOR_CANCELLATIONS', schema);
