/* eslint-disable */
import * as types from './graphql.js';
/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
    '\n  query queryArbitrumTransfers($first: Int, $skip: Int) {\n    transfers(first: $first, skip: $skip) {\n      from\n      to\n      value\n      blockTimestamp\n      arweaveTx\n      transactionHash\n      blockNumber\n    }\n  }\n': types.QueryArbitrumTransfersDocument,
};
export function graphql(source) {
    return documents[source] ?? {};
}
