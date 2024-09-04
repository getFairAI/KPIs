const mongoose = require('mongoose');
const dbConnection = require('../../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    _id: true,
    name: { type: String, required: true },
    owner: { type: String, required: true },
    solutionRequestId: { type: mongoose.Schema.Types.ObjectId, required: false, ref: 'SOLUTION_REQUESTS' },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'SOLUTIONS',
  }
);

const SOLUTIONS_MODEL = dbConnection.model('SOLUTIONS', schema);
module.exports = { SOLUTIONS_MODEL };
