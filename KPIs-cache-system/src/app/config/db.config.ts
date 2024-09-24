const { DB_USER = 'root', DB_PASSWORD = 'example', DB_HOST = 'localhost', DB_PORT = '27017', DB_NAME = 'fairai-kpi-cache' } = process.env;

export const dbConfig = {
  url: process.env.KPI_CACHE_PROD_MODE === 'true' ? `mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=admin` : `mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`,
};
