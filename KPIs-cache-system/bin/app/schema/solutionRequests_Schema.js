import mongoose from 'mongoose';
import { dbConnection } from '../models/dbConnectionModel.js';
const schema = new mongoose.Schema({
    // _id: ObjectId
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: String, required: true },
    timestamp: { type: Date, required: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTION_REQUESTS',
});
export const SOLUTION_REQUESTS_MODEL = dbConnection.model('SOLUTION_REQUESTS', schema);
