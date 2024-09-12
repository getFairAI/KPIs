"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYMENTS_MODEL = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dbConnectionModel_1 = require("../models/dbConnectionModel");
const schema = new mongoose_1.default.Schema({
    // _id: ObjectId
    relatedUserRequest: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'USER_REQUESTS', required: true, index: true },
    blockchainRequestId: { type: String, required: true },
    blockchainBlockNumber: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['request', 'distribution'], required: true },
    timestamp: { type: Number, required: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'PAYMENTS',
});
exports.PAYMENTS_MODEL = dbConnectionModel_1.dbConnection.model('PAYMENTS', schema);
