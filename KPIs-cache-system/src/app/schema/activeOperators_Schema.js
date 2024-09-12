const mongoose = require('mongoose');
const dbConnection = require('../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    relatedSolution: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SOLUTIONS' },
    fee: { type: Number, required: true },
    name: { type: String, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'ACTIVE_OPERATORS',
  }
);

const ACTIVE_OPERATORS_MODEL = dbConnection.model('ACTIVE_OPERATORS', schema);
module.exports = { ACTIVE_OPERATORS_MODEL };
