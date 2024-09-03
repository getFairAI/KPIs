const express = require('express');
const cors = require('cors');
const app = express();
const runMiddleware = require('run-middleware');
runMiddleware(app);

// set the console logs to output better info
const path = require('path');
['debug', 'log', 'warn', 'error'].forEach(methodName => {
  const originalLoggingMethod = console[methodName];
  console[methodName] = (firstArgument, ...otherArguments) => {
    const originalPrepareStackTrace = Error.prepareStackTrace;
    Error.prepareStackTrace = (_, stack) => stack;
    const callee = new Error().stack[1];
    Error.prepareStackTrace = originalPrepareStackTrace;
    const relativeFileName = path.relative(process.cwd(), callee.getFileName());
    const prefix = `${relativeFileName}:${callee.getLineNumber()}:`;
    if (typeof firstArgument === 'string') {
      originalLoggingMethod(prefix + ' ' + firstArgument, ...otherArguments);
    } else {
      originalLoggingMethod(prefix, firstArgument, ...otherArguments);
    }
  };
});

var corsOptions = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json({ limit: '5mb' }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// init express router and define the base path to listen and answer requests
var router = require('express').Router();

// validate auth token before executing anything else =================================
app.use(function (req, res, next) {
  // executed in every request
  next(); // disabled for now
});

// just a simple lightweight response to test the connection to the API and get version info (/status)
router.get('/status', (req, res) => {
  res.status(200).json({
    message: 'API is online and listening to requests.',
    apiVersion: require('./app/config/api.config').apiVersion,
  });
});

const kpiCacheBaseURL = require('./app/config/api.config').apiBaseURL;
app.use(kpiCacheBaseURL, router); // base route (path) to answer requests

// start listening for requests at the given port
const PORT = 3003;
app.listen(+PORT, () => {
  console.log('');
  console.log('\x1b[36m', 'KPIs Caching System and Data Management for FairAI KPIs - getfair.ai');
  console.log('\x1b[0m');
  console.log('\x1b[32m', `| ExpressJS server started successfuly.`);
  console.log('\x1b[0m');
  console.log('\x1b[0m', 'Active ExpressJS server options:');
  console.log('\x1b[36m', '- Port: ' + PORT);
  console.log('\x1b[36m', '- Base href/URL for requests: ' + kpiCacheBaseURL);
  console.log('\x1b[0m');
});

// just a simple lightweight response to test the connection to the API at the root path "/" without using router
app.get('/', (req, res) => {
  res.json({
    message: 'The connection was successful, but you cannot make requests to this route! Wrong route.',
  });
});

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
