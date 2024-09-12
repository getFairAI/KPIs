export const dbConfig = {
  dbUrl: process.env.MODCAE_MONGODB_URL || 'mongodb://localhost:27017',
  dbName: process.env.MODCAE_MONGODB_DBNAME || 'fairai-kpi-cache',
};
