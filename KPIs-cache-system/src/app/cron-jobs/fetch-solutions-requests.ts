import { request } from 'graphql-request';
import { graphQLirysArweave, TAG_NAMES, QUERY_LIMIT_ARWEAVE, constants } from '../config/api.config';
import { SOLUTION_REQUESTS_MODEL } from '../schema/solutionRequests_Schema';
import { GraphQLError } from 'graphql';
import { findByTagsQuery, transactionEdge } from '../../gql/arweave-irys/graphql';
import irysTransactionsQuery from '../queries/arweave-irys';

export const fetchSolutionsRequests = async () => {
  console.log('');
  console.log('SOLUTION REQUESTS => Updating SOLUTION REQUESTS collection on DB, this might some time ...');

  let lastTimestamp: number = new Date('2024-04-15').getTime(); // starts at 15 april 2024 by default

  // get most recent cursor saved on our DB
  const latestSavedOnDB = await SOLUTION_REQUESTS_MODEL.find().lean().sort({ timestamp: -1 }).limit(1).exec();

  if (latestSavedOnDB?.length && latestSavedOnDB[0]?.timestamp) {
    console.log('SOLUTION REQUESTS => OK! Found the latest timestamp in our DB for SOLUTION REQUESTS, will start checking new SOLUTION REQUESTS after timestamp [ ' + latestSavedOnDB[0]?.timestamp + ' ] ...');
    lastTimestamp = latestSavedOnDB[0]?.timestamp + 1; // add 1 ms to exclude the currently saved most recent one
  } else {
    console.log('SOLUTION REQUESTS => Could NOT find the latest timestamp info in our DB for SOLUTION REQUESTS, assuming the default start timestamp - will fetch everything, this might take some time...');
  }

  const queryTags = [
    { name: TAG_NAMES.protocolName, values: [constants.PROTOCOL_NAME] },
    { name: TAG_NAMES.protocolVersion, values: [constants.PROTOCOL_VERSION] },
    { name: TAG_NAMES.operationName, values: [constants.REQUEST_SOLUTION] },
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
      mostRecentLoopCursor = results?.transactions?.pageInfo?.endCursor ?? '';
      if (firstExecution) {
        firstExecution = false;
      }

      if (newWhileLoopResults.length > 0) {
        console.log('SOLUTION REQUESTS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI SOLUTION REQUESTS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
      }
    }
  } catch (error) {
    console.log('SOLUTION REQUESTS => ERROR fetching SOLUTION REQUESTS:');
    console.log((error as GraphQLError).cause ?? error as string);
  }

  console.log('SOLUTION REQUESTS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI SOLUTION REQUESTS.');

  if (finalResults.length > 0) {
    // filter only relevant data
    let dataPreparation = finalResults.map((itemFiltered: transactionEdge) => {
      return {
        owner: itemFiltered.node.address,
        rawData: JSON.stringify(itemFiltered.node),
        timestamp: itemFiltered.node.timestamp,
      };
    });

    dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it

    console.log('SOLUTION REQUESTS => Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    SOLUTION_REQUESTS_MODEL.insertMany(dataPreparation, {
      ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
      .then(data => {
        console.log('SOLUTION REQUESTS => Successfully updated SOLUTION REQUESTS collection on DB. Update finished.');
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    console.log('SOLUTION REQUESTS => Nothing new to save on DB. Update finished.');
  }
};
