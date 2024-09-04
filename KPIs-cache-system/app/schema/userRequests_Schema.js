const mongoose = require('mongoose');
const dbConnection = require('../../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    _id: true,
    contentType: { type: String, required: true },
    solutionId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'SOLUTIONS' },
    timestamp: { type: Date, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_REQUESTS',
  }
);

const USER_REQUESTS_MODEL = dbConnection.model('USER_REQUESTS', schema);
module.exports = { USER_REQUESTS_MODEL };
