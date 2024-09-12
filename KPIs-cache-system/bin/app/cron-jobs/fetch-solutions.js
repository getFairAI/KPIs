"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchSolutions = void 0;
const graffle_1 = require("graffle");
const api_config_1 = require("../config/api.config");
let afterQueryRequestId = ''; // when looping query, get requests after this Id
const query = (0, graffle_1.gql) `
  transactions(
    tags: [
      {name: ${api_config_1.TAG_NAMES.protocolName}, values: [${api_config_1.PROTOCOL_NAME}]},
      {name: ${api_config_1.TAG_NAMES.protocolVersion}, values: [${api_config_1.PROTOCOL_VERSION}]},
      {name: ${api_config_1.TAG_NAMES.operationName}, values: [${api_config_1.SOLUTION_CREATION}]},
    ],
    first: ${api_config_1.QUERY_LIMIT <= 100 ? api_config_1.QUERY_LIMIT : 100},
    after: ${afterQueryRequestId.toString() ?? ''}
  )
  {
    edges {
      cursor
      node {
        id
        tags {
          name
          value
        }
      }
    }
  }
`;
const fetchSolutions = async () => {
    console.log('=> Updating SOLUTIONS collection on DB, this might some time ...');
    const results = await (0, graffle_1.request)(api_config_1.apolloGraphQLRequestsUrl, query);
    console.log(results);
    return;
    console.log('=> Fetching complete. Found a total of ' + results.length + ' FairAI solutions.');
    console.log('=> Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    const SOLUTIONS_MODEL = require('../schema/solutions_Schema').SOLUTIONS_MODEL;
    SOLUTIONS_MODEL.insertMany(results, {
        ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
        .then(data => {
        console.log('=> Successfully updated PAYMENTS collection on DB. Update finished.');
    })
        .catch(error => {
        console.log(error);
    });
};
exports.fetchSolutions = fetchSolutions;
