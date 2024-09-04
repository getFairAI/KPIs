const mongoose = require('mongoose');
const dbConnection = require('../../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    _id: true,
    name: { type: String, required: true },
    description: { type: String, required: true },
    owner: { type: String, required: true },
    timestamp: { type: Date, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTION_REQUESTS',
  }
);

const SOLUTION_REQUESTS_MODEL = dbConnection.model('SOLUTION_REQUESTS', schema);
module.exports = { SOLUTION_REQUESTS_MODEL };
