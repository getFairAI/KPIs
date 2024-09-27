import express from 'express';
import  * as swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

var router = express.Router();

const options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Fair KPIS Cache System API',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3005',
      },
    ],
  },
  apis: ['dist/src/app/controllers/*.js'],
};

const specs = swaggerJsdoc(options);
console.log(specs)
router.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, { explorer: true })
);

export default router;
