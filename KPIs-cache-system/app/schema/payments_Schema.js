const mongoose = require('mongoose');
const dbConnection = require('../../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    _id: true,
    type: { type: String, enum: ['request', 'distribution'], required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    amount: { type: Number, required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'USER_REQUESTS', index: true, unique: true },
    timestamp: { type: Date, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'PAYMENTS',
  }
);

const PAYMENTS_MODEL = dbConnection.model('PAYMENTS', schema);
module.exports = { PAYMENTS_MODEL };
