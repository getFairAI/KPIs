import { ObjectId } from 'bson';
import { gql, request } from 'graffle';
import { apolloGraphQLRequestsUrl, TAG_NAMES, PROTOCOL_NAME, SOLUTION_CREATION, PROTOCOL_VERSION, QUERY_LIMIT } from '../config/api.config';

let afterQueryRequestId = ''; // when looping query, get requests after this Id

const query = gql`
  transactions(
    tags: [
      {name: ${TAG_NAMES.protocolName}, values: [${PROTOCOL_NAME}]},
      {name: ${TAG_NAMES.protocolVersion}, values: [${PROTOCOL_VERSION}]},
      {name: ${TAG_NAMES.operationName}, values: [${SOLUTION_CREATION}]},
    ],
    first: ${QUERY_LIMIT <= 100 ? QUERY_LIMIT : 100},
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

export const fetchSolutions = async () => {
  console.log('=> Updating SOLUTIONS collection on DB, this might some time ...');

  const results = await request(apolloGraphQLRequestsUrl, query);

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
