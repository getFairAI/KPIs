"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchArbitrumRequests = void 0;
const viem_1 = require("viem");
const apiConfigStartBlock = require('../config/api.config').startBlock;
const query_1 = require("@irys/query");
const bson_1 = require("bson");
const chains_1 = require("viem/chains");
const PAYMENTS_MODEL = require('../schema/payments_Schema').PAYMENTS_MODEL;
const NATIVE_USDC_ARB = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const CHAIN = chains_1.arbitrum;
const publicClient = (0, viem_1.createPublicClient)({
    chain: CHAIN,
    // transport: webSocket('wss://arb-sepolia.g.alchemy.com/v2/FW_nrdwBZaPL0d2O7HPcPcZIXx_zyuoq')
    // transport: http('https://arb-sepolia.g.alchemy.com/v2/FW_nrdwBZaPL0d2O7HPcPcZIXx_zyuoq')
    transport: (0, viem_1.http)('https://arb1.arbitrum.io/rpc'),
});
const filterLogs = async (transferLog) => {
    const paymentBlockNumber = transferLog.blockNumber;
    const transaction = await publicClient.getTransaction({
        hash: transferLog.transactionHash,
    });
    /*  const signature = serializeSignature({
      yParity: transaction.yParity,
      v: transaction.v,
      r: transaction.r,
      s: transaction.s,
    }); */
    /*  */
    // const userPubKey = 'QjR/p9u/PjzEectlTmYkoloQ6OpalGBstGSdsFG/80c=';
    const data = transaction.input;
    const memoSliceStart = 138; // 0x + function selector 4bytes-8chars + 2 32bytes arguments = 138 chars;
    const hexMemo = data.substring(memoSliceStart, data.length);
    const arweaveTxLength = 43;
    let arweaveTx = (0, viem_1.hexToString)(`0x${hexMemo}`);
    if (arweaveTx.length > arweaveTxLength) {
        // try decode based on transferFrom
        const tfMemoSliceStart = 202; //
        const tfHexMemo = data.substring(tfMemoSliceStart, data.length);
        arweaveTx = (0, viem_1.hexToString)(`0x${tfHexMemo}`);
    }
    if (!arweaveTx || arweaveTx?.length !== arweaveTxLength) {
        // not an arweave transaction, ignore
        return;
    }
    else {
        const irysQuery = new query_1.Query();
        const [txData] = await irysQuery.search('irys:transactions').ids([arweaveTx]).limit(1);
        if (!txData) {
            // invalid arweave request, ignore it too
            return;
        }
        return {
            log: transferLog,
            blockNumber: paymentBlockNumber,
            requestId: arweaveTx,
            timestamp: txData.timestamp,
        };
    }
};
const fetchArbitrumRequests = async () => {
    console.log('=> Updating PAYMENTS collection on DB, this might take several minutes ...');
    const blocksToAdvanceOnEachIteration = 100;
    const dateNowTime = new Date().getTime() / 1000;
    let lastBlockNumber = apiConfigStartBlock; // defaults to this one
    // get most recent block saved on our DB
    PAYMENTS_MODEL.find()
        .sort({ blockchainBlockNumber: -1 })
        .limit(1)
        .then(data => {
        if (data[0]?.blockchainBlockNumber) {
            console.log('=> OK! Found the latest block number in our DB for payments, will start checking new blocks after this one => ' + Number(data[0].blockchainBlockNumber));
            lastBlockNumber = Number(data[0].blockchainBlockNumber) ?? apiConfigStartBlock;
        }
        else {
            console.log(' => Could NOT find the latest block info in our DB, assuming default start block => ' + Number(lastBlockNumber));
        }
    })
        .catch(error => {
        console.log(error);
    });
    const result = await fetch(`https://coins.llama.fi/block/arbitrum/${dateNowTime}`);
    // let { height: nearestBlockNumber } = await result.json();
    const nearestBlockNumber = BigInt(lastBlockNumber + blocksToAdvanceOnEachIteration);
    let blockNumber = BigInt(lastBlockNumber);
    let toBlock = BigInt(lastBlockNumber + blocksToAdvanceOnEachIteration); // change this to limit this function
    let results = new Array();
    while (toBlock <= nearestBlockNumber) {
        console.log('=> Fetching all transaction blocks from ' + Number(blockNumber) + ' to ' + Number(toBlock));
        const logs = await publicClient.getContractEvents({
            address: NATIVE_USDC_ARB,
            abi: viem_1.erc20Abi,
            eventName: 'Transfer',
            fromBlock: blockNumber,
            toBlock: toBlock,
            // args: {
            //   to: evmAccount.address,
            // },
        });
        results = results.concat(logs);
        toBlock = toBlock + BigInt(blocksToAdvanceOnEachIteration);
        console.log('Found ' + logs.length + ' more transactions.');
    }
    console.log('=> Fetching done. Found a total of ' + results.length + ' transactions.');
    console.log('=> Filtering only FairAI transactions, this might take SEVERAL minutes ...');
    let resultsFiltered = new Array();
    let allBlocksFiltered = new Array(); // array of block numbers from resultsFiltered
    for (let index = 0; index < results.length; index++) {
        const element = results[index];
        const filtered = await filterLogs(element);
        if (filtered?.log?.args?.value) {
            // format this data according to DB Schema
            resultsFiltered.push({
                relatedUserRequest: new bson_1.ObjectId(), // TO DO
                blockchainBlockNumber: Number(filtered.blockNumber),
                blockchainRequestId: filtered.requestId,
                from: filtered.log.args.from,
                to: filtered.log.args.to,
                amount: Number((0, viem_1.formatUnits)(filtered.log.args.value, 6)), // format value
                type: 'request', // TO DO
                timestamp: filtered.timestamp,
            });
        }
        if (filtered?.blockNumber) {
            allBlocksFiltered.push(Number(filtered.blockNumber));
        }
        console.log('Checking transaction ' + (index + 1) + ' of ' + results.length + ', ' + resultsFiltered.length + ' FairAI transactions found until now ...');
    }
    console.log('=> Filtering done. Found a total of ' + resultsFiltered.length + ' FairAI transactions.');
    function sortNumbers(a, b) {
        return a - b;
    }
    allBlocksFiltered.sort(sortNumbers); // last element will be the biggest
    console.log('=> Saving data on DB ...');
    // save to database
    // we use insertMany to add all items at once
    PAYMENTS_MODEL.insertMany(resultsFiltered, {
        ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
    })
        .then(data => {
        console.log('=> Successfully updated PAYMENTS collection on DB. Update finished.');
    })
        .catch(error => {
        console.log(error);
    });
};
exports.fetchArbitrumRequests = fetchArbitrumRequests;
