"use strict";
module.exports = {
    // access to MongoDB KPI caching database
    dbUrl: process.env.MODCAE_MONGODB_URL || 'mongodb://localhost:27017', // url:PORT of the mongo database to connect, normally in the following format: mongodb://domainOrIP:PORT
    dbName: process.env.MODCAE_MONGODB_DBNAME || 'fairai-kpi-cache',
};
