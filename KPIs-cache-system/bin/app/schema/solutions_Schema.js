"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SOLUTIONS_MODEL = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dbConnectionModel_1 = require("../models/dbConnectionModel");
const schema = new mongoose_1.default.Schema({
    // _id: ObjectId
    name: { type: String, required: true },
    owner: { type: String, required: true },
    relatedSolutionRequest: { type: mongoose_1.default.Schema.Types.ObjectId, required: false, ref: 'SOLUTION_REQUESTS', index: true },
}, {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTIONS',
});
exports.SOLUTIONS_MODEL = dbConnectionModel_1.dbConnection.model('SOLUTIONS', schema);
