const mongoose = require('mongoose');
const dbConnection = require('../models/dbConnectionModel').dbConnection;

const schema = new mongoose.Schema(
  {
    // _id: ObjectId
    relatedUserRequest: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'USER_REQUESTS' },
    timestamp: { type: Date, required: true },
  },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
    collection: 'USER_RESPONSES',
  }
);

const USER_RESPONSES_MODEL = dbConnection.model('USER_RESPONSES', schema);
module.exports = { USER_RESPONSES_MODEL };
