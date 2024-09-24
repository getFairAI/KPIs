import { request } from 'graphql-request';
import { graphQLArbitrumRequestsUrl, QUERY_LIMIT_ARBITRUM } from '../config/api.config';
import { ARBITRUM_TRANSFERS_MODEL } from '../schema/arbitrum-transfers_Schema';
import { GraphQLError } from 'graphql';
import { QueryArbitrumTransfersQuery } from '../../gql/arbitrum/graphql';
import arbitrumTransfersQuery from '../queries/arbitrum';

export const fetchArbitrumTransfers = async () => {
  console.log('');
  console.log('ARBITRUM TRANSFERS => Updating ARBITRUM TRANSFERS collection on DB, this might some time ...');

  let skipTransfers = 0;

  // get most recent cursor saved on our DB
  const savedOnDBAmount = await ARBITRUM_TRANSFERS_MODEL.countDocuments().exec();

  if (savedOnDBAmount) {
    console.log('ARBITRUM TRANSFERS => OK! Found data on our DB. ARBITRUM TRANSFERS request will skip the first [ ' + savedOnDBAmount + ' ] transfers.');
    skipTransfers = savedOnDBAmount;
  } else {
    console.log('ARBITRUM TRANSFERS => Could NOT find anything on our DB for ARBITRUM TRANSFERS. Getting all transfers...');
  }

  let finalResults = new Array();

  try {
    let newWhileLoopResults = new Array();
    let firstExecution = true;

    // loop to get all entries while results keep coming
    while (firstExecution || newWhileLoopResults?.length > 0) {
      const results: QueryArbitrumTransfersQuery = await request({
        url: graphQLArbitrumRequestsUrl,
        document: arbitrumTransfersQuery,
        variables: {
          first: QUERY_LIMIT_ARBITRUM ?? 1000,
          skip: firstExecution ? skipTransfers : skipTransfers + finalResults.length, // skip what we already have
        },
      });
      finalResults = finalResults.concat(results?.transfers ?? []);
      newWhileLoopResults = results?.transfers ?? []; // while will check length of this array
      if (firstExecution) {
        firstExecution = false;
      }

      if (newWhileLoopResults.length > 0) {
        console.log('ARBITRUM TRANSFERS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI transfers, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
      }
    }
  } catch (error) {
    console.log('ARBITRUM TRANSFERS => ERROR fetching ARBITRUM TRANSFERS:');
    console.log((error as GraphQLError).cause ?? error as string);
  }

  console.log('ARBITRUM TRANSFERS => Fetching complete. Found a total of [ ' + (finalResults.length ?? 0) + ' ] new FairAI transfers.');

  if (finalResults.length > 0) {
    // filter only relevant data
    let dataPreparation = finalResults.map(item => {
      return {
        relatedUserRequest: null, // TO DO
        blockchainRequestId: item.arweaveTx,
        blockchainBlockNumber: item.blockNumber,
        from: item.from,
        to: item.to,
        amount: Number(item.value),
        type: 'request', // TO DO
        timestamp: item.blockTimestamp,
      };
    });

    console.log('ARBITRUM TRANSFERS => Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    ARBITRUM_TRANSFERS_MODEL.insertMany(dataPreparation, {
      ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
      .then(data => {
        console.log('ARBITRUM TRANSFERS => Successfully updated ARBITRUM TRANSFERS collection on DB. Update finished.');
      })
      .catch(error => {
        console.log(error);
      });
  } else {
    console.log('ARBITRUM TRANSFERS => Nothing new to save on DB. Update finished.');
  }
};
