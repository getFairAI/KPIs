"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importStar(require("express"));
const node_cron_1 = require("node-cron");
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = require("mongoose");
const app = (0, express_1.default)();
const run_middleware_1 = __importDefault(require("run-middleware"));
(0, run_middleware_1.default)(app);
(0, mongoose_1.set)('debug', false); // uncomment for debug/testing messages on console from mongoose
// set the console logs to output better info
const path_1 = require("path");
['debug', 'log', 'warn', 'error'].forEach(methodName => {
    const originalLoggingMethod = console[methodName];
    console[methodName] = (firstArgument, ...otherArguments) => {
        const originalPrepareStackTrace = Error.prepareStackTrace;
        Error.prepareStackTrace = (_, stack) => stack;
        const callee = new Error().stack[1];
        Error.prepareStackTrace = originalPrepareStackTrace;
        const relativeFileName = (0, path_1.relative)(process.cwd(), callee);
        const prefix = `${relativeFileName}:${callee}:`;
        if (typeof firstArgument === 'string') {
            originalLoggingMethod(prefix + ' ' + firstArgument, ...otherArguments);
        }
        else {
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
app.use((0, cors_1.default)(corsOptions));
// parse requests of content-type - application/json
app.use((0, express_1.json)({ limit: '5mb' }));
// parse requests of content-type - application/x-www-form-urlencoded
app.use((0, express_1.urlencoded)({ extended: true, limit: '5mb' }));
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
const api_config_1 = require("./app/config/api.config");
const kpiCacheBaseURL = api_config_1.apiBaseURL;
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
// run once every day at 00:00
// cron.schedule('0 0 * * *', fetchArbitrumRequests, { runOnInit: true }); // run once on init
const fetch_solutions_1 = require("./app/cron-jobs/fetch-solutions");
// run once every day at 00:00
(0, node_cron_1.schedule)('0 0 * * *', fetch_solutions_1.fetchSolutions, { runOnInit: true }); // run once on init
// general error handler =======================================================================
app.use(function (err, req, res, next) {
    console.log('\x1b[31m', new Date().toLocaleString() + ' - ' + err);
    console.log('\x1b[0m');
    if (err.stack)
        console.error(err.stack);
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
