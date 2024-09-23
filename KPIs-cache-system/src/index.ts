import express, { json, urlencoded } from 'express';
import { schedule } from 'node-cron';
import cors from 'cors';
import { set } from 'mongoose';
const app = express();
import runMiddleware from 'run-middleware';
import { apiBaseURL, apiVersion, apiPORT } from './app/config/api.config.js';
runMiddleware(app);

set('debug', false); // uncomment for debug/testing messages on console from mongoose

// set the console logs to output better info
// import { relative } from 'path';

// ['debug', 'log', 'warn', 'error'].forEach(methodName => {
//   const originalLoggingMethod = console[methodName];
//   console[methodName] = (firstArgument, ...otherArguments) => {
//     const originalPrepareStackTrace = Error.prepareStackTrace;
//     Error.prepareStackTrace = (_, stack) => stack;
//     const callee = new Error().stack![1];
//     Error.prepareStackTrace = originalPrepareStackTrace;
//     const relativeFileName = relative(process.cwd(), callee);
//     const prefix = `${relativeFileName}:${callee}:`;
//     if (typeof firstArgument === 'string') {
//       originalLoggingMethod(prefix + ' ' + firstArgument, ...otherArguments);
//     } else {
//       originalLoggingMethod(prefix, firstArgument, ...otherArguments);
//     }
//   };
// });

var corsOptions = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(json({ limit: '5mb' }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(urlencoded({ extended: true, limit: '5mb' }));

// init express router and define the base path to listen and answer requests
var router = express.Router();

// validate auth token before executing anything else =================================
app.use(function (req, res, next) {
  // executed in every request
  next(); // disabled for now
});

// just a simple lightweight response to test the connection to the API and get version info (/status)
router.get('/status', (req, res) => {
  res.status(200).json({
    message: 'API is online and listening to requests.',
    apiVersion: apiVersion,
  });
});

app.use(apiBaseURL, router); // base route (path) to answer requests

import solutionsController from './app/controllers/solutions.controller.js';
app.use(apiBaseURL + '/solutions', solutionsController); // base route (path) to answer requests

import arbitrumTransfersController from './app/controllers/arbitrum-transfers.controlller.js';
app.use(apiBaseURL + '/arbitrum-transfers', arbitrumTransfersController); // base route (path) to answer requests

// start listening for requ ests at the given port
const PORT = apiPORT ?? 3005;
app.listen(+PORT, () => {
  console.log('');
  console.log('\x1b[36m', 'KPIs Caching System and Data Management for FairAI KPIs - getfair.ai');
  console.log('\x1b[0m');
  console.log('\x1b[32m', `| ExpressJS server started successfuly.`);
  console.log('\x1b[0m');
  console.log('\x1b[0m', 'Active ExpressJS server options:');
  console.log('\x1b[36m', '- Port: ' + PORT);
  console.log('\x1b[36m', '- Base href/URL for requests: ' + apiBaseURL);
  console.log('\x1b[0m');
});

// just a simple lightweight response to test the connection to the API at the root path "/" without using router
app.get('/', (req, res) => {
  res.json({
    message: 'The connection was successful, but you cannot make requests to this route! Wrong route.',
  });
});

// INITALIZE CRON JOBS AND SCHEDULING ==========================================================
import { fetchArbitrumTransfers } from './app/cron-jobs/fetch-arbitrum-transfers.js';
// run once every day at 00:00
schedule('0 0 * * *', fetchArbitrumTransfers, { runOnInit: true }); // run once on init

import { fetchSolutions } from './app/cron-jobs/fetch-solutions.js';
// run once every day at 00:05
schedule('5 0 * * *', fetchSolutions, { runOnInit: true });

import { fetchSolutionsRequests } from './app/cron-jobs/fetch-solutions-requests.js';
// run once every day at 00:10
schedule('10 0 * * *', fetchSolutionsRequests, { runOnInit: true });

import { fetchUserRequests } from './app/cron-jobs/fetch-user-requests.js';
// run once every day at 00:15
schedule('15 0 * * *', fetchUserRequests, { runOnInit: true });

import { fetchResponses } from './app/cron-jobs/fetch-responses.js';
// run once every day at 00:20
schedule('20 0 * * *', fetchResponses, { runOnInit: true });

import { fetchOperatorProofs } from './app/cron-jobs/fetch-operator-proofs.js';
// run once every day at 00:25
schedule('25 0 * * *', fetchOperatorProofs, { runOnInit: true });

import { fetchOperatorCancellations } from './app/cron-jobs/fetch-operator-cancellations.js';
// run once every day at 00:30
schedule('30 0 * * *', fetchOperatorCancellations, { runOnInit: true });

import { fetchActiveOperators } from './app/cron-jobs/fetch-active-operators.js';
// run once every day at 00:35
schedule('35 0 * * *', fetchActiveOperators, { runOnInit: true });

import { fetchWalletLinks } from './app/cron-jobs/fetch-wallet-links.js';
// run once every day at 00:40
schedule('40 0 * * *', fetchWalletLinks, { runOnInit: true });

// general error handler =======================================================================
app.use(function (err, req, res, next) {
  console.log('\x1b[31m', new Date().toLocaleString() + ' - ' + err);
  console.log('\x1b[0m');
  if (err.stack) console.error(err.stack);
  res.status(404).send(); // answer with 404 even if the route exist to avoid web crawlers from finding routes
});

// interrupt events handler
function handleInterruptEvents() {
  console.log('\x1b[33m', '> Caught shutdown signal, closing server...');
  // here we can add any function to execute before closing the server.
}

process.on('SIGINT', function () {
  handleInterruptEvents();
  process.exit();
});

process.on('SIGQUIT', function () {
  handleInterruptEvents();
  process.exit();
});

process.on('SIGTERM', function () {
  handleInterruptEvents();
  process.exit();
});
