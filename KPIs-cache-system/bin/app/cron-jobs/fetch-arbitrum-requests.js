import { request } from 'graphql-request';
import { graphql } from '../../gql/arbitrum-requests/gql.js';
import { graphQLArbitrumRequestsUrl, QUERY_LIMIT_ARBITRUM } from '../config/api.config.js';
import { ARBITRUM_TRANSFERS_MODEL } from '../schema/payments_Schema.js';
const query = graphql(`
  query queryArbitrumTransfers($first: Int, $skip: Int) {
    transfers(first: $first, skip: $skip) {
      from
      to
      value
      blockTimestamp
      arweaveTx
      transactionHash
      blockNumber
    }
  }
`);
export const fetchArbitrumTransfers = async () => {
    console.log('');
    console.log('=> Updating ARBITRUM TRANSFERS collection on DB, this might some time ...');
    let skipTransfers = 0;
    // get most recent cursor saved on our DB
    const savedOnDBAmount = await ARBITRUM_TRANSFERS_MODEL.countDocuments().exec();
    if (savedOnDBAmount) {
        console.log('=> OK! Found data on our DB. ARBITRUM TRANSFERS request will skip the first [ ' + savedOnDBAmount + ' ] transfers.');
        skipTransfers = savedOnDBAmount;
    }
    else {
        console.log(' => Could NOT find anything on our DB for ARBITRUM TRANSFERS. Getting all transfers...');
    }
    try {
        let finalResults = new Array();
        let newWhileLoopResults = new Array();
        let firstExecution = true;
        // loop to get all entries while results keep coming
        while (firstExecution || newWhileLoopResults?.length > 0) {
            const results = await request({
                url: graphQLArbitrumRequestsUrl,
                document: query,
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
                console.log('|__ Found [ ' + newWhileLoopResults.length + ' ] more FairAI transfers, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming...');
            }
        }
        console.log('=> Fetching complete. Found a total of [ ' + (finalResults.length ?? 0) + ' ] new FairAI transfers.');
        if (finalResults.length > 0) {
            // filter only relevant data
            let dataPreparation = finalResults.map(item => {
                return {
                    relatedUserRequest: null,
                    blockchainRequestId: item.arweaveTx,
                    blockchainBlockNumber: item.blockNumber,
                    from: item.from,
                    to: item.to,
                    amount: Number(item.value),
                    type: 'request', // TO DO
                    timestamp: item.blockTimestamp,
                };
            });
            console.log('=> Saving data on DB ...');
            // save to database
            // we use insertMany to add all items at once
            ARBITRUM_TRANSFERS_MODEL.insertMany(dataPreparation, {
                ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
            })
                .then(data => {
                console.log('=> Successfully updated ARBITRUM TRANSFERS collection on DB. Update finished.');
            })
                .catch(error => {
                console.log(error);
            });
        }
    }
    catch (error) {
        console.log('=> ERROR fetching ARBITRUM TRANSFERS:');
        console.log(error?.response?.errors ?? error);
    }
};
