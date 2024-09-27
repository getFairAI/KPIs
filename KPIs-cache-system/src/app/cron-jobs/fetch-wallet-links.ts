import { request } from 'graphql-request';
import { graphQLarweave, TAG_NAMES, QUERY_LIMIT_ARWEAVE, constants, startBlockArweave } from '../config/api.config';
import { WALLET_LINKS_MODEL } from '../schema/walletLinks_Schema';
import { GraphQLError } from 'graphql';
import { findByTagsQuery, transactionEdge } from '../../gql/arweave-native/graphql';
import arweaveTransactionsQuery from '../queries/arweave-native';

export const fetchWalletLinks = async () => {
  console.log('');
  console.log('WALLET LINKS => Updating WALLET LINKS collection on DB, this might some time ...');

  let lastBlockHeight: number = startBlockArweave;

  // get most recent cursor saved on our DB
  const latestSavedOnDB = await WALLET_LINKS_MODEL.find().lean().sort({ blockHeight: -1 }).limit(1).exec();

  if (latestSavedOnDB?.length && latestSavedOnDB[0]?.blockHeight) {
    console.log('WALLET LINKS => OK! Found the latest block height in our DB for WALLET LINKS, will start checking new blocks after block height [ ' + latestSavedOnDB[0]?.blockHeight + ' ] ...');
    lastBlockHeight = latestSavedOnDB[0]?.blockHeight;
  } else {
    console.log('WALLET LINKS => Could NOT find the latest block info in our DB for WALLET LINKS, assuming the default start block height - will fetch everything, this might take several minutes...');
  }

  const queryTags = [
    { name: TAG_NAMES.protocolName, values: [constants.PROTOCOL_NAME] },
    { name: TAG_NAMES.protocolVersion, values: [constants.PROTOCOL_VERSION] },
    { name: TAG_NAMES.operationName, values: [constants.WALLET_LINKS] },
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
        console.log('WALLET LINKS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI WALLET LINKS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
      }
    }
  } catch (error) {
    console.log('WALLET LINKS => ERROR fetching WALLET LINKS:');
    console.log((error as GraphQLError).cause ?? error as string);
  }

  console.log('WALLET LINKS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI WALLET LINKS.');
  if (finalResults.length > 0) {
    // map linking address with a timestamp of the link tx
    const addressLinkTimestampMap = new Map<string, number>();
    type tagName = keyof typeof TAG_NAMES;
    const findTag = (tx: transactionEdge, tagName: tagName) => tx.node.tags.find(tag => tag.name === TAG_NAMES[tagName])?.value ?? '';
    // filter only relevant data
    const dataPreparation: {
      evmAddress: string;
      arweaveAddress: string;
      blockchainTransactionId: string;
      evmPublicKey: string;
      blockHeight: number;
      timestamp: string;
    }[] = [];

    for (const itemFiltered of finalResults) {
      let evmAddress = '';
      try {
        const res = await fetch('https://arweave.net/'+itemFiltered.node.id);
        evmAddress = await res.text();
      } catch (_) {
        // ignore
      }

      // check if there are previous links for this address and if the new one is more recent
      const existingTimestampLink = addressLinkTimestampMap.get(itemFiltered.node.owner.address);
      if (existingTimestampLink && existingTimestampLink > Number(findTag(itemFiltered, 'unixTime') ?? '0')) {
        // ignore current link if "existingTimestampLink" is more recent
      } else {
        // if the new link is more recent, remove the old one
        const previous = dataPreparation.findIndex(el => el.arweaveAddress === itemFiltered.node.owner.address);
        dataPreparation.splice(previous, 1);
        // set new link timestamp
        addressLinkTimestampMap.set(itemFiltered.node.owner.address, Number(findTag(itemFiltered, 'unixTime') ?? '0'));

        dataPreparation.push({
          evmAddress,
          arweaveAddress: itemFiltered.node.owner.address,
          blockchainTransactionId: itemFiltered.node.id,
          evmPublicKey: findTag(itemFiltered, 'evmPublicKey'),
          blockHeight: itemFiltered.node.block?.height,
          timestamp: findTag(itemFiltered, 'unixTime'),
        });
      }
    };

    dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it

    console.log('WALLET LINKS => Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    WALLET_LINKS_MODEL.insertMany(dataPreparation, {
      ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
      .then(data => {
        console.log('WALLET LINKS => Successfully updated WALLET LINKS collection on DB. Update finished.');
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    console.log('WALLET LINKS => Nothing new to save on DB. Update finished.');
  }
};
