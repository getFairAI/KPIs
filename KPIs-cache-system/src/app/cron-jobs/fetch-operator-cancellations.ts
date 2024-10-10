import { request } from 'graphql-request';
import { graphQLarweave, TAG_NAMES, QUERY_LIMIT_ARWEAVE, constants, startBlockArweave } from '../config/api.config';
import { OPERATOR_CANCELLATIONS_MODEL } from '../schema/operatorCancellations_Schema';
import { GraphQLError } from 'graphql';
import { findByTagsQuery, transactionEdge } from '../../gql/arweave-native/graphql';
import arweaveTransactionsQuery from '../queries/arweave-native';

export const fetchOperatorCancellations = async () => {
  console.log('');
  console.log('OPERATOR CANCELLATIONS => Updating OPERATOR CANCELLATIONS collection on DB, this might some time ...');

  let lastBlockHeight: number = startBlockArweave; // use custom start block for operators

  // get most recent cursor saved on our DB
  const latestSavedOnDB = await OPERATOR_CANCELLATIONS_MODEL.find().lean().sort({ blockHeight: -1 }).limit(1).exec();

  if (latestSavedOnDB?.length && latestSavedOnDB[0]?.blockHeight) {
    console.log('OPERATOR CANCELLATIONS => OK! Found the latest block height in our DB for OPERATOR CANCELLATIONS, will start checking new blocks after block height [ ' + latestSavedOnDB[0]?.blockHeight + ' ] ...');
    lastBlockHeight = latestSavedOnDB[0]?.blockHeight;
  } else {
    console.log('OPERATOR CANCELLATIONS => Could NOT find the latest block info in our DB for OPERATOR CANCELLATIONS, assuming the default start block height - will fetch everything, this might take several minutes...');
  }

  const queryTags = [
    { name: TAG_NAMES.protocolName, values: [ constants.PROTOCOL_NAME, 'Fair Protocol' ] },
   //  { name: TAG_NAMES.protocolVersion, values: [constants.PROTOCOL_VERSION, '1.0' ] },
    { name: TAG_NAMES.operationName, values: [constants.OPERATOR_CANCELLATIONS] },
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
        document: arweaveTransactionsQuery,
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
        console.log('OPERATOR CANCELLATIONS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI OPERATOR CANCELLATIONS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
      }
    }
  } catch (error) {
    console.log('OPERATOR CANCELLATIONS => ERROR fetching OPERATOR CANCELLATIONS:');
    console.log((error as GraphQLError).cause ?? error as string);
  }

  console.log('OPERATOR CANCELLATIONS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI OPERATOR CANCELLATIONS.');
  if (finalResults.length > 0) {
    type tagName = keyof typeof TAG_NAMES;
    const findTag = (tx: transactionEdge, tagName: tagName) => tx.node.tags.find(tag => tag.name === TAG_NAMES[tagName])?.value ?? '';
    // filter only relevant data
    let dataPreparation = finalResults.map((itemFiltered: transactionEdge) => {
      return {
        owner: itemFiltered.node.owner.address,
        blockchainId: itemFiltered.node.id,
        registrationId: findTag(itemFiltered, 'registrationTransaction'),
        blockHeight: itemFiltered.node.block?.height,
        timestamp: findTag(itemFiltered, 'unixTime'),
      };
    });

    dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it
    console.log('OPERATOR CANCELLATIONS => Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    OPERATOR_CANCELLATIONS_MODEL.insertMany(dataPreparation, {
      ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
      .then(data => {
        console.log('OPERATOR CANCELLATIONS => Successfully updated OPERATOR CANCELLATIONS collection on DB. Update finished.');
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    console.log('OPERATOR CANCELLATIONS => Nothing new to save on DB. Update finished.');
  }
};
