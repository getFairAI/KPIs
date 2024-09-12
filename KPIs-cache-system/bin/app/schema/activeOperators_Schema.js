import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';
const schema = new mongoose.Schema({
    // _id: ObjectId
    relatedSolution: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SOLUTIONS' },
    fee: { type: Number, required: true },
    name: { type: String, required: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'ACTIVE_OPERATORS',
});
export const ACTIVE_OPERATORS_MODEL = dbConnection.model('ACTIVE_OPERATORS', schema);
