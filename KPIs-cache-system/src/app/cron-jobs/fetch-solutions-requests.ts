import { request } from 'graphql-request';
import { graphql } from '../../gql/solutions/gql.js';
import { findByTagsQuery, transactionEdge } from '../../gql/solutions/graphql.js';
import { graphQLarweave, TAG_NAMES, PROTOCOL_NAME, PROTOCOL_VERSION, QUERY_LIMIT_ARWEAVE } from '../config/api.config.js';
import { SOLUTION_REQUESTS_MODEL } from '../schema/solutionRequests_Schema.js';

const query = graphql(`
  query requestsOnIrys($tags: [TagFilter!], $first: Int, $after: String, $block: BlockFilter) {
    transactions(tags: $tags, first: $first, after: $after, order: DESC, block: $block) {
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          block {
            height
          }
          tags {
            name
            value
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`);

export const fetchSolutionsRequests = async () => {
  console.log('');
  console.log('SOLUTION REQUESTS => Updating collection on DB, this might some time ...');

  let lastBlockHeight: number | null = null;

  // get most recent cursor saved on our DB
  const latestSavedOnDB = await SOLUTION_REQUESTS_MODEL.find().sort({ _id: -1 }).limit(1).exec();

  if (latestSavedOnDB?.length && latestSavedOnDB[0]?.blockHeight) {
    console.log('SOLUTION REQUESTS => OK! Found the latest block height in our DB for SOLUTION REQUESTS, will start checking new blocks after block height [ ' + latestSavedOnDB[0]?.blockHeight + ' ] ...');
    lastBlockHeight = latestSavedOnDB[0]?.blockHeight;
  } else {
    console.log('SOLUTION REQUESTS => Could NOT find the latest block info in our DB for SOLUTION REQUESTS, assuming the default start block height - will fetch everything, this might take several minutes...');
  }

  const queryTags = [
    { name: TAG_NAMES.protocolName, values: [PROTOCOL_NAME] },
    { name: TAG_NAMES.protocolVersion, values: [PROTOCOL_VERSION] },
    { name: TAG_NAMES.operationName, values: ['Request-Solution'] },
  ];

  const queryStartBlock = { min: lastBlockHeight ? lastBlockHeight + 1 : null }; // + 1 or else it will fetch the same block again
  const queryFirst = QUERY_LIMIT_ARWEAVE;

  // try {
  //   let finalResults = new Array();

  //   let newWhileLoopResults = new Array();
  //   let mostRecentLoopCursor = '';
  //   let firstExecution = true;

  //   while (firstExecution || newWhileLoopResults?.length > 0) {
  //     const results: findByTagsQuery = await request({
  //       url: graphQLarweave,
  //       document: query,
  //       variables: {
  //         tags: queryTags,
  //         first: Number(queryFirst),
  //         after: mostRecentLoopCursor,
  //         block: queryStartBlock,
  //       },
  //     });
  //     finalResults = finalResults.concat(results.transactions.edges);
  //     newWhileLoopResults = results?.transactions?.edges ?? []; // while will check length of this array
  //     // on each loop we assign a new cursor for the next request
  //     mostRecentLoopCursor = results?.transactions?.edges[results.transactions.edges.length - 1]?.cursor;
  //     if (firstExecution) {
  //       firstExecution = false;
  //     }

  //     if (newWhileLoopResults.length > 0) {
  //       console.log('SOLUTION REQUESTS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI SOLUTION REQUESTS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
  //     }
  //   }

  //   console.log('SOLUTION REQUESTS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI SOLUTION REQUESTS.');

  //   if (finalResults.length > 0) {
  //     type tagName = keyof typeof TAG_NAMES;
  //     const findTag = (tx: transactionEdge, tagName: tagName) => tx.node.tags.find(tag => tag.name === TAG_NAMES[tagName])?.value ?? '';

  //     // filter only relevant data
  //     let dataPreparation = finalResults.map((itemFiltered: transactionEdge) => {
  //       return {
  //         name: itemFiltered.node.recipient,
  //         blockHeight: itemFiltered.node.block?.height,
  //       };
  //     });

  //     dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it

  //     console.log('SOLUTION REQUESTS => Saving data on DB ...');
  //     // save to database
  //     // we use insertMany to add all items at once
  //     SOLUTION_REQUESTS_MODEL.insertMany(dataPreparation, {
  //       ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
  //     })
  //       .then(data => {
  //         console.log('SOLUTION REQUESTS => Successfully updated SOLUTION_REQUESTS collection on DB. Update finished.');
  //       })
  //       .catch(error => {
  //         console.log(error);
  //       });
  //   } else {
  //     console.log('SOLUTION REQUESTS => Nothing new to save on DB. Update finished.');
  //   }
  // } catch (error) {
  //   console.log('SOLUTION REQUESTS => ERROR fetching SOLUTION REQUESTS:');
  //   console.log(error?.response?.errors ?? error);
  // }
};
