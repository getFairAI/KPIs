import { request } from 'graphql-request';
import { graphQLirysArweave, TAG_NAMES, QUERY_LIMIT_ARWEAVE, constants } from '../config/api.config';
import { USER_REQUESTS_MODEL } from '../schema/userRequests_Schema';
import { GraphQLError } from 'graphql';
import { findByTagsQuery, transactionEdge } from '../../gql/arweave-irys/graphql';
import irysTransactionsQuery from '../queries/arweave-irys';

export const fetchUserRequests = async () => {
  console.log('');
  console.log('USER REQUESTS => Updating USER REQUESTS collection on DB, this might some time ...');

  let lastTimestamp: number = new Date('2024-04-15').getTime(); // starts at 15 april 2024 by default

  // get most recent cursor saved on our DB
  const latestSavedOnDB = await USER_REQUESTS_MODEL.find().lean().sort({ timestamp: -1 }).limit(1).exec();

  if (latestSavedOnDB?.length && latestSavedOnDB[0]?.timestamp) {
    console.log('USER REQUESTS => OK! Found the latest timestamp in our DB for USER REQUESTS, will start checking new user requests after timestamp [ ' + latestSavedOnDB[0]?.timestamp + ' ] ...');
    lastTimestamp = latestSavedOnDB[0]?.timestamp + 1; // add 1 ms to exclude the currently saved most recent one
  } else {
    console.log('USER REQUESTS => Could NOT find the latest timestamp info in our DB for USER REQUESTS, assuming the default start timestamp - will fetch everything, this might take some time...');
  }

  const queryTags = [
    { name: TAG_NAMES.protocolName, values: [constants.PROTOCOL_NAME] },
    { name: TAG_NAMES.protocolVersion, values: [constants.PROTOCOL_VERSION] },
    { name: TAG_NAMES.operationName, values: [constants.INFERENCE_REQUEST] },
  ];

  const queryFirst = QUERY_LIMIT_ARWEAVE;
  let finalResults = new Array();

  try {
    let lastLoopHasNextPage = true;
    let mostRecentLoopCursor = '';
    let firstExecution = true;
    let newWhileLoopResults = new Array();
    let dateToday = new Date().getTime();

    while (lastLoopHasNextPage) {
      const results: findByTagsQuery = await request({
        url: graphQLirysArweave,
        document: irysTransactionsQuery,
        variables: {
          tags: queryTags,
          first: Number(queryFirst),
          after: mostRecentLoopCursor,
          from: lastTimestamp,
          to: dateToday,
        },
      });
      finalResults = finalResults.concat(results.transactions?.edges ?? []);
      newWhileLoopResults = results?.transactions?.edges ?? [];
      lastLoopHasNextPage = results?.transactions?.pageInfo?.hasNextPage ?? false;
      // on each loop we assign a new cursor for the next request
      mostRecentLoopCursor = newWhileLoopResults[newWhileLoopResults.length - 1]?.cursor;
      if (firstExecution) {
        firstExecution = false;
      }

      if (newWhileLoopResults.length > 0) {
        console.log('USER REQUESTS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI USER REQUESTS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
      }
    }
  } catch (error) {
    console.log('USER REQUESTS => ERROR fetching USER REQUESTS:');
    console.log((error as GraphQLError).cause ?? error as string);
  }

  console.log('USER REQUESTS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI USER REQUESTS.');

  if (finalResults.length > 0) {
    // filter only relevant data
    let dataPreparation = finalResults.map((itemFiltered: transactionEdge) => {
      return {
        rawData: JSON.stringify(itemFiltered.node),
        relatedSolution: null,
        blockchainRequest: itemFiltered.node.id,
        owner: itemFiltered.node.address,
        responseTimestamp: null,
        timestamp: itemFiltered.node.timestamp,
      };
    });

    dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it

    console.log('USER REQUESTS => Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    USER_REQUESTS_MODEL.insertMany(dataPreparation, {
      ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
      .then(data => {
        console.log('USER REQUESTS => Successfully updated USER REQUESTS collection on DB. Update finished.');
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    console.log('USER REQUESTS => Nothing new to save on DB. Update finished.');
  }
};
