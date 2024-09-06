const { createPublicClient, erc20Abi, http, hexToString, formatUnits } = require('viem');
const arbitrum = require('viem/chains');
const savedLastCronFile = require('../data/last-cron-data.json');
const startBlock = require('../config/api.config').startBlock;
const fs = require('fs');
const apiConfig = require('../config/api.config');
const { Query } = require('@irys/query');

const PAYMENTS_MODEL = require('../schema/payments_Schema').PAYMENTS_MODEL;

const NATIVE_USDC_ARB = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const CHAIN = arbitrum;

// initalize file with the default value
fs.writeFileSync('./app/data/last-cron-data.json', JSON.stringify({ lastBlockNumber: apiConfig.startBlock }));

const publicClient = createPublicClient({
  chain: CHAIN,
  // transport: webSocket('wss://arb-sepolia.g.alchemy.com/v2/FW_nrdwBZaPL0d2O7HPcPcZIXx_zyuoq')
  // transport: http('https://arb-sepolia.g.alchemy.com/v2/FW_nrdwBZaPL0d2O7HPcPcZIXx_zyuoq')
  transport: http('https://arb1.arbitrum.io/rpc'),
});

const filterLogs = async transferLog => {
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
  let arweaveTx = hexToString(`0x${hexMemo}`);

  if (arweaveTx.length > arweaveTxLength) {
    // try decode based on transferFrom
    const tfMemoSliceStart = 202; //
    const tfHexMemo = data.substring(tfMemoSliceStart, data.length);
    arweaveTx = hexToString(`0x${tfHexMemo}`);
  }

  console.log('yes');

  if (!arweaveTx || arweaveTx.length !== arweaveTxLength) {
    // not an arweave transaction, ignore

    console.log('yes 2');
    return;
  } else {
    console.log('yes query');
    const irysQuery = new Query();
    const [txData] = await irysQuery.search('irys:transactions').ids([arweaveTx]).limit(1);

    if (!txData) {
      // invalid arweave request, ignore it too
      return;
    }

    console.log('yes 3');

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

  const blocksToAdvanceOnEachIteration = 200;
  const dateNowTime = new Date().getTime() / 1000;

  let lastBlockNumber = savedLastCronFile.lastBlockNumber;

  // get most recent block saved on our DB
  PAYMENTS_MODEL.find()
    .sort({ blockchainBlockNumber: -1 })
    .limit(1)
    .then(data => {
      if (data[0]?.blockchainBlockNumber) {
        console.log('Found the latest block number in our DB for payments -> ' + Number(data[0].blockchainBlockNumber));
        lastBlockNumber = Number(data[0].blockchainBlockNumber) ?? savedLastCronFile.lastBlockNumber;
      } else {
        console.log('Couldnt find the latest block in our DB, assuming default start block -> ' + Number(lastBlockNumber));
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

  let results = [];

  while (toBlock <= nearestBlockNumber) {
    console.log('Fetching all transaction blocks from ' + Number(blockNumber) + ' to ' + Number(toBlock));
    const logs = await publicClient.getContractEvents({
      address: NATIVE_USDC_ARB,
      abi: erc20Abi,
      eventName: 'Transfer',
      fromBlock: blockNumber,
      toBlock: toBlock,
      // args: {
      //   to: evmAccount.address,
      // },
    });

    console.log('Found ' + results.length + ' more transactions.');

    results = results.concat(logs);
    toBlock = toBlock + BigInt(blocksToAdvanceOnEachIteration);
  }

  console.log('=> Fetching done. Found a total of ' + results.length + ' transactions.');
  console.log('=> Filtering only FairAI transactions, this might take SEVERAL minutes ...');

  let resultsFiltered = [];
  let allBlocksFiltered = []; // array of block numbers from resultsFiltered

  for (const log of results) {
    console.log('new for');
    const filtered = await filterLogs(log);

    if (filtered?.log) {
      resultsFiltered.push({
        from: filtered.log.args.from,
        to: filtered.log.args.to,
        blockchainBlockNumber: Number(blockchainBlockNumber),
        amount: Number(formatUnits(filtered.log.args.value, 6)), // format value
        requestId: filtered.requestId,
        type: '',
        timestamp: filtered.timestamp,
      });
    }

    if (filtered?.blockNumber) {
      allBlocksFiltered.push(Number(filtered.blockNumber));
    }

    console.log('Still filtering transactions, ' + resultsFiltered.length + ' FairAI transactions found until now ...');
  }

  console.log('=> Filtering done. Found a total of ' + results.length + ' FairAI transactions.');

  function sortNumbers(a, b) {
    return a - b;
  }

  allBlocksFiltered.sort(sortNumbers); // last element will be the biggest

  // save the last block
  fs.writeFileSync('./app/data/last-cron-data.json', JSON.stringify({ ...savedLastCronFile, lastBlockNumber: allBlocksFiltered[allBlocksFiltered.length - 1] }));

  console.log('=> Saving data on DB ...');
  // save to database
  // we use insertMany to add all items at once
  PAYMENTS_MODEL.insertMany(resultsFiltered)
    .then(data => {
      console.log('=> Successfully updated PAYMENTS collection on DB. Update finished.');
    })
    .catch(error => {
      console.log(error);
    });
};

module.exports = { fetchArbitrumRequests };
