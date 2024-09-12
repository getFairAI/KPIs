import { request } from 'graphql-request';
import { graphql } from '../../gql/arbitrum-requests/gql.js';
import { graphQLarweave, QUERY_LIMIT_ARBITRUM } from '../config/api.config.js';
import { PAYMENTS_MODEL } from '../schema/payments_Schema.js';
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
    const savedOnDBAmount = await PAYMENTS_MODEL.countDocuments().exec();
    if (savedOnDBAmount) {
        console.log('=> OK! Found data on our DB. ARBITRUM TRANSFERS request will skip this amount of transers => ' + savedOnDBAmount);
        skipTransfers = savedOnDBAmount;
    }
    else {
        console.log(' => Could NOT anything on our DB for PAYMENTS.');
    }
    try {
        const results = await request({
            url: graphQLarweave,
            document: query,
            variables: {
                first: QUERY_LIMIT_ARBITRUM,
                skip: skipTransfers,
            },
        });
        console.log('=> Fetching complete. Found a total of ' + (results.transfers?.length ?? 0) + ' FairAI transfers.');
        if (results?.transfers?.length) {
            // filter only relevant data
            let dataPreparation = results.transfers.map(item => {
                return {
                    // relatedUserRequest: null,
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
            PAYMENTS_MODEL.insertMany(dataPreparation, {
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
        console.log(error?.response?.errors);
    }
};
