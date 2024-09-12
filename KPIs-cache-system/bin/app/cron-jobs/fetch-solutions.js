import { request } from 'graphql-request';
import { graphql } from '../../gql/solutions/gql.js';
import { graphQLarweave, TAG_NAMES, PROTOCOL_NAME, SOLUTION_CREATION, PROTOCOL_VERSION, QUERY_LIMIT_ARWEAVE } from '../config/api.config.js';
import { SOLUTIONS_MODEL } from '../schema/solutions_Schema.js';
let afterQueryRequestId = ''; // when looping query, get requests after this Id
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
export const fetchSolutions = async () => {
    console.log('');
    console.log('=> Updating SOLUTIONS collection on DB, this might some time ...');
    let lastBlockHeight = null;
    // get most recent cursor saved on our DB
    const latestSavedOnDB = await SOLUTIONS_MODEL.find().sort({ _id: -1 }).limit(1).exec();
    if (latestSavedOnDB?.length && latestSavedOnDB[0]?.rawData) {
        const rawData = JSON.parse(latestSavedOnDB[0].rawData);
        if (rawData?.block?.height) {
            console.log('=> OK! Found the latest block height in our DB for SOLUTIONS, will start checking new blocks after this one => ' + rawData.block.height);
            lastBlockHeight = rawData.block.height;
        }
        else {
            console.log(' => Could NOT find the latest block info in our DB, assuming NULL start block height.');
        }
    }
    else {
        console.log(' => Could NOT find the latest block info in our DB, assuming NULL start block height.');
    }
    const queryTags = [
        { name: TAG_NAMES.protocolName, values: [PROTOCOL_NAME] },
        { name: TAG_NAMES.protocolVersion, values: [PROTOCOL_VERSION] },
        { name: TAG_NAMES.operationName, values: [SOLUTION_CREATION] },
    ];
    const queryBlock = { min: lastBlockHeight ? lastBlockHeight + 1 : null };
    const queryFirst = QUERY_LIMIT_ARWEAVE;
    const queryAfter = `${afterQueryRequestId.toString() ?? ''}`;
    try {
        const results = await request({
            url: graphQLarweave,
            document: query,
            variables: {
                tags: queryTags,
                first: Number(queryFirst),
                after: queryAfter,
                block: queryBlock,
            },
        });
        console.log('=> Fetching complete. Found a total of ' + (results?.transactions?.edges?.length ?? 0) + ' FairAI solutions.');
        if (results?.transactions?.edges?.length) {
            const findTag = (tx, tagName) => tx.node.tags.find(tag => tag.name === TAG_NAMES[tagName])?.value ?? '';
            // filter only relevant data
            let dataPreparation = results.transactions.edges.map(itemFiltered => {
                return {
                    solutionId: itemFiltered.node.id,
                    solutionName: findTag(itemFiltered, 'solutionName'),
                    solutionDescription: findTag(itemFiltered, 'description'),
                    solutionOwner: itemFiltered.node.owner.address,
                    rawData: JSON.stringify(itemFiltered.node),
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
            console.log('=> Saving data on DB ...');
            // save to database
            // we use insertMany to add all items at once
            SOLUTIONS_MODEL.insertMany(dataPreparation, {
                ordered: false, // this 'false' will make mongodb ignore duplicate 'unique keys', and proceed operation without fail
            })
                .then(data => {
                console.log('=> Successfully updated SOLUTIONS collection on DB. Update finished.');
            })
                .catch(error => {
                console.log(error);
            });
        }
    }
    catch (error) {
        console.log('=> ERROR fetching SOLUTIONS:');
        console.log(error?.response?.errors ?? error);
    }
};
