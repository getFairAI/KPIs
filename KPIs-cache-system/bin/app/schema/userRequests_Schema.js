"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.USER_REQUESTS_MODEL = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dbConnectionModel_1 = require("../models/dbConnectionModel");
const schema = new mongoose_1.default.Schema({
    // _id: ObjectId
    relatedSolution: { type: mongoose_1.default.Schema.Types.ObjectId, required: true, ref: 'SOLUTIONS', index: true },
    blockchainRequest: { type: String, required: true, unique: true, index: true },
    contentType: { type: String, required: true },
    requestTimestamp: { type: Date, required: true },
    responseTimestamp: { type: Date, required: false }, // required false: request may never get a response (and we want to know it)
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_REQUESTS',
});
exports.USER_REQUESTS_MODEL = dbConnectionModel_1.dbConnection.model('USER_REQUESTS', schema);
