const mongoose = require('mongoose');
const dbConnection = require('../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    relatedUserRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'USER_REQUESTS', required: true, index: true },
    blockchainRequestId: { type: String, required: true },
    blockchainBlockNumber: { type: Number, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['request', 'distribution'] }, // required: true
    timestamp: { type: Number, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'PAYMENTS',
  }
);

const PAYMENTS_MODEL = dbConnection.model('PAYMENTS', schema);
module.exports = { PAYMENTS_MODEL };
