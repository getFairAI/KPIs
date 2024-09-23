import { request } from 'graphql-request';
import { graphql } from '../../gql/responses/gql.js';
import { findByTagsQuery, transactionEdge } from '../../gql/responses/graphql.js';
import { graphQLarweave, TAG_NAMES, QUERY_LIMIT_ARWEAVE, constants, startBlockArweave } from '../config/api.config.js';
import { OPERATOR_PROOF_MODEL } from '../schema/operatorProofs_Schema.js';

const query = graphql(`
  query findByTags($tags: [TagFilter!], $first: Int!, $after: String, $block: BlockFilter) {
    transactions(tags: $tags, first: $first, after: $after, block: $block) {
      pageInfo {
        hasNextPage
      }
      edges {
        cursor
        node {
          id
          tags {
            name
            value
          }
          owner {
            address
          }
          block {
            height
          }
        }
      }
    }
  }
`);

export const fetchOperatorProofs = async () => {
  console.log('');
  console.log('OPERATOR PROOFS => Updating OPERATOR PROOFS collection on DB, this might some time ...');

  let lastBlockHeight: number = startBlockArweave;

  // get most recent cursor saved on our DB
  const latestSavedOnDB = await OPERATOR_PROOF_MODEL.find().lean().sort({ blockHeight: -1 }).limit(1).exec();

  if (latestSavedOnDB?.length && latestSavedOnDB[0]?.blockHeight) {
    console.log('OPERATOR PROOFS => OK! Found the latest block height in our DB for OPERATOR PROOFS, will start checking new blocks after block height [ ' + latestSavedOnDB[0]?.blockHeight + ' ] ...');
    lastBlockHeight = latestSavedOnDB[0]?.blockHeight;
  } else {
    console.log('OPERATOR PROOFS => Could NOT find the latest block info in our DB for OPERATOR PROOFS, assuming the default start block height - will fetch everything, this might take several minutes...');
  }

  const queryTags = [
    { name: TAG_NAMES.protocolName, values: [constants.PROTOCOL_NAME] },
    { name: TAG_NAMES.protocolVersion, values: [constants.PROTOCOL_VERSION] },
    { name: TAG_NAMES.operationName, values: [constants.OPERATOR_PROOF] },
  ];

  const queryStartBlock = { min: lastBlockHeight ? lastBlockHeight + 1 : null }; // + 1 or else it will fetch the same block again
  const queryFirst = QUERY_LIMIT_ARWEAVE;

  let finalResults = new Array();

  try {
    let lastLoopHasNextPage = true;
    let mostRecentLoopCursor = '';
    let firstExecution = true;
    let newWhileLoopResults = new Array();

    while (lastLoopHasNextPage) {
      const results: findByTagsQuery = await request({
        url: graphQLarweave,
        document: query,
        variables: {
          tags: queryTags,
          first: queryFirst,
          after: mostRecentLoopCursor,
          block: queryStartBlock,
        },
      });
      finalResults = finalResults.concat(results.transactions.edges);
      newWhileLoopResults = results?.transactions?.edges ?? [];
      lastLoopHasNextPage = results.transactions.pageInfo.hasNextPage ?? false;
      // on each loop we assign a new cursor for the next request
      mostRecentLoopCursor = results?.transactions?.edges[results.transactions.edges.length - 1]?.cursor;
      if (firstExecution) {
        firstExecution = false;
      }

      if (newWhileLoopResults.length > 0) {
        console.log('OPERATOR PROOFS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI OPERATOR PROOFS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
      }
    }
  } catch (error) {
    console.log('OPERATOR PROOFS => ERROR fetching OPERATOR PROOFS:');
    console.log(error?.response?.errors ?? error);
  }

  console.log('OPERATOR PROOFS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI OPERATOR PROOFS.');
  if (finalResults.length > 0) {
    type tagName = keyof typeof TAG_NAMES;
    const findTag = (tx: transactionEdge, tagName: tagName) => tx.node.tags.find(tag => tag.name === TAG_NAMES[tagName])?.value ?? '';
    // filter only relevant data
    let dataPreparation = finalResults.map((itemFiltered: transactionEdge) => {
      return {
        operatorAddress: itemFiltered.node.owner.address,
        blockHeight: itemFiltered.node.block?.height,
        timestamp: findTag(itemFiltered, 'unixTime'),
      };
    });

    dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it

    console.log('OPERATOR PROOFS => Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    OPERATOR_PROOF_MODEL.insertMany(dataPreparation, {
      ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
      .then(data => {
        console.log('OPERATOR PROOFS => Successfully updated OPERATOR PROOFS collection on DB. Update finished.');
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    console.log('OPERATOR PROOFS => Nothing new to save on DB. Update finished.');
  }
};
