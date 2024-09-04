const cron = require('node-cron');
const { createPublicClient, erc20Abi, http, hexToString, formatUnits } = require('viem');
const arbitrum = require('viem/chains');
const savedLastCronFile = require('../data/last-cron-data.json');
const startBlock = require('../config/api.config').startBlock;
const fs = require('fs');
const apiConfig = require('../config/api.config');

const NATIVE_USDC_ARB = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const CHAIN = arbitrum;

// initalize file
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

  if (!arweaveTx || arweaveTx.length !== arweaveTxLength) {
    // ignore
    return;
  } else {
    return {
      log: transferLog,
      blockNumber: paymentBlockNumber,
      requestId: arweaveTx,
    };
  }
};

const fetchArbitrumRequests = async () => {
  const blocksToAdvanceOnEachIteration = 10;
  const dateNowTime = new Date().getTime() / 1000;

  const lastBlockNumber = savedLastCronFile.lastBlockNumber;

  const result = await fetch(`https://coins.llama.fi/block/arbitrum/${dateNowTime}`);
  // let { height: nearestBlockNumber } = await result.json();
  const nearestBlockNumber = BigInt(lastBlockNumber + blocksToAdvanceOnEachIteration);

  let blockNumber = BigInt(lastBlockNumber);
  let toBlock = BigInt(lastBlockNumber + blocksToAdvanceOnEachIteration);

  let results = [];

  while (toBlock <= nearestBlockNumber) {
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

    results = results.concat(logs);
    toBlock = toBlock + BigInt(blocksToAdvanceOnEachIteration);
  }

  let resultsFiltered = [];
  let lastBlockNumberNew = lastBlockNumber;

  console.log(results.length);
  console.log('start for');

  for (const log of results) {
    console.log('one more for');
    const filtered = await filterLogs(log);

    if (filtered?.log) {
      resultsFiltered.push({
        from: filtered.log.args.from,
        to: filtered.log.args.to,
        value: Number(formatUnits(filtered.log.args.value, 6)), // format value
        requestId: filtered.requestId,
      });
    }

    if (filtered?.blockNumber) {
      lastBlockNumberNew = filtered.blockNumber;
    }
  }
  console.log('end for');

  // save the last block
  fs.writeFileSync('./app/data/last-cron-data.json', JSON.stringify({ ...savedLastCronFile, lastBlockNumber: Number(lastBlockNumberNew) }));

  console.log(resultsFiltered[0]);

  // save to database
  // const PAYMENTS_MODEL = require('../schema/payments_Schema').PAYMENTS_MODEL;

  // PAYMENTS_MODEL.findAndUpdate(
  //   {
  //     ID_AGRUPAMENTO_ESCOLAS_E360: routerRequest.params.ID_AGRUPAMENTO,
  //   },
  //   {
  //     // data to save
  //   },
  //   { upsert: true, new: true }
  // )
  //   .then(data => {
  //     routerResponse.status(200).send();
  //   })
  //   .catch(error => {
  //     routerResponse.status(500).send(error);
  //     console.log(error);
  //   });
};

// run once every day at 00:00
// cron.schedule('0 0 * * *', fetchArbitrumRequests);

(async () => fetchArbitrumRequests())();
