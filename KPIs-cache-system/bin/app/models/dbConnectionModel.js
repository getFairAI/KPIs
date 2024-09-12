import mongoose from 'mongoose';
import { dbConfig } from '../config/db.config.js'; // config file for the database
var wasConnectedBefore = false;
function handleError(error) {
    console.log('\x1b[31m', `Error: ${error}`);
}
var dbConnectionFunction = function () {
    console.log('');
    console.log('\x1b[33m', 'Attempting a new connection to MongoDB server at ' + dbConfig.dbUrl + ' ...');
    mongoose
        .connect(dbConfig.dbUrl, {
        dbName: dbConfig.dbName, // name of the database
        serverSelectionTimeoutMS: 5000,
    })
        .then(connected => {
        wasConnectedBefore = true;
    })
        .catch(error => handleError(error));
};
dbConnectionFunction();
mongoose.connection.on('connected', function () {
    wasConnectedBefore = true;
    console.log('\x1b[32m', `| Successfuly connected to database "${dbConfig.dbName}" at "${dbConfig.dbUrl}".`);
    console.log('\x1b[0m');
    console.log('\x1b[33m', 'Server is up and running. CTRL+C to stop.\n');
    console.log('\x1b[0m');
});
mongoose.connection.on('reconnected', function () {
    console.log('');
    console.log('\x1b[32m', `Connection restored to MongoDB at "${dbConfig.dbUrl}"`);
});
mongoose.connection.on('error', function () {
    console.log('');
    console.log('\x1b[31m', `Error trying to connect to MongoDB at "${dbConfig.dbUrl}"`);
    if (!wasConnectedBefore) {
        // needed because mongoose calls error AND disconnect everytime an error OR disconnect happens
        console.log('\x1b[33m', '- Trying to reconnect in 5 seconds...');
        console.log('\x1b[0m');
        setTimeout(dbConnectionFunction, 5000);
    }
});
mongoose.connection.on('disconnected', function () {
    if (wasConnectedBefore) {
        console.log('');
        console.log('\x1b[31m', `Connection lost to MongoDB at "${dbConfig.dbUrl}"`);
        console.log('\x1b[33m', '- Trying to reconnect in 5 seconds...');
        console.log('\x1b[0m');
        setTimeout(dbConnectionFunction, 5000);
    }
});
// Close the Mongoose connection, when receiving SIGINT
process.on('SIGINT', function () {
    console.log('\x1b[33m', '> Shutdown signal received, closing connection to MongoDB...');
    console.log('\x1b[0m');
    mongoose.connection.close().then(() => {
        console.log('\x1b[31m', 'Connection to MongoDB terminated. \n Server stopped.');
        console.log('\x1b[0m');
        process.exit(0);
    });
});
export const dbConnection = mongoose;
