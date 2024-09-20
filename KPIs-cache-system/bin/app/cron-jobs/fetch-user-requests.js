import { request } from 'graphql-request';
import { graphql } from '../../gql/solutions/gql.js';
import { graphQLarweave, TAG_NAMES, PROTOCOL_NAME, SOLUTION_CREATION, PROTOCOL_VERSION, QUERY_LIMIT_ARWEAVE } from '../config/api.config.js';
import { SOLUTIONS_MODEL } from '../schema/solutions_Schema.js';
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
export const fetchResponses = async () => {
    console.log('');
    console.log('SOLUTIONS => Updating SOLUTIONS collection on DB, this might some time ...');
    let lastBlockHeight = null;
    // get most recent cursor saved on our DB
    const latestSavedOnDB = await SOLUTIONS_MODEL.find().sort({ _id: -1 }).limit(1).exec();
    if (latestSavedOnDB?.length && latestSavedOnDB[0]?.blockHeight) {
        console.log('SOLUTIONS => OK! Found the latest block height in our DB for SOLUTIONS, will start checking new blocks after block height [ ' + latestSavedOnDB[0]?.blockHeight + ' ] ...');
        lastBlockHeight = latestSavedOnDB[0]?.blockHeight;
    }
    else {
        console.log('SOLUTIONS => Could NOT find the latest block info in our DB for SOLUTIONS, assuming the default start block height - will fetch everything, this might take several minutes...');
    }
    const queryTags = [
        { name: TAG_NAMES.protocolName, values: [PROTOCOL_NAME] },
        { name: TAG_NAMES.protocolVersion, values: [PROTOCOL_VERSION] },
        { name: TAG_NAMES.operationName, values: [SOLUTION_CREATION] },
    ];
    const queryStartBlock = { min: lastBlockHeight ? lastBlockHeight + 1 : null }; // + 1 or else it will fetch the same block again
    const queryFirst = QUERY_LIMIT_ARWEAVE;
    try {
        let finalResults = new Array();
        let lastLoopHasNextPage = true;
        let mostRecentLoopCursor = '';
        let firstExecution = true;
        let newWhileLoopResults = new Array();
        while (lastLoopHasNextPage) {
            const results = await request({
                url: graphQLarweave,
                document: query,
                variables: {
                    tags: queryTags,
                    first: Number(queryFirst),
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
                console.log('SOLUTIONS => ... Found [ ' + newWhileLoopResults.length + ' ] more FairAI SOLUTIONS, with [ ' + finalResults.length + ' ] in total until now. Fetching more while results keep coming ...');
            }
        }
        console.log('SOLUTIONS => Fetching complete. Found a total of [ ' + (finalResults?.length ?? 0) + ' ] new FairAI SOLUTIONS.');
        if (finalResults.length > 0) {
            const findTag = (tx, tagName) => tx.node.tags.find(tag => tag.name === TAG_NAMES[tagName])?.value ?? '';
            // filter only relevant data
            let dataPreparation = finalResults.map((itemFiltered) => {
                return {
                    solutionId: itemFiltered.node.id,
                    solutionName: findTag(itemFiltered, 'solutionName'),
                    solutionDescription: findTag(itemFiltered, 'description'),
                    solutionOwner: itemFiltered.node.owner.address,
                    rawData: JSON.stringify(itemFiltered.node),
                    blockHeight: itemFiltered.node.block?.height,
                    relatedNewSolutionRequest: null,
                    originalSolutionRequest: findTag(itemFiltered, 'solutionRequestId'),
                    output: findTag(itemFiltered, 'output'),
                    outputConfiguration: findTag(itemFiltered, 'outputConfiguration'),
                    rewardsAddress: findTag(itemFiltered, 'rewardsEvmAddress'),
                    timestamp: findTag(itemFiltered, 'unixTime'),
                    allowFiles: findTag(itemFiltered, 'allowFiles'),
                    allowText: findTag(itemFiltered, 'allowText'),
                    contractAddress: findTag(itemFiltered, 'contractSrc'),
                };
            });
            dataPreparation.reverse(); // arweave returns more recent first so we need to reverse it
            console.log('SOLUTIONS => Saving data on DB ...');
            // save to database
            // we use insertMany to add all items at once
            SOLUTIONS_MODEL.insertMany(dataPreparation, {
                ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
            })
                .then(data => {
                console.log('SOLUTIONS => Successfully updated SOLUTIONS collection on DB. Update finished.');
            })
                .catch(error => {
                console.log(error);
            });
        }
        else {
            console.log('SOLUTIONS => Nothing new to save on DB. Update finished.');
        }
    }
    catch (error) {
        console.log('SOLUTIONS => ERROR fetching SOLUTIONS:');
        console.log(error?.response?.errors ?? error);
    }
};
