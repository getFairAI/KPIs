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
    '\n  query findByTags($tags: [TagFilter!], $first: Int!, $after: String, $block: BlockFilter) {\n    transactions(tags: $tags, first: $first, after: $after, block: $block) {\n      pageInfo {\n        hasNextPage\n      }\n      edges {\n        cursor\n        node {\n          id\n          tags {\n            name\n            value\n          }\n          owner {\n            address\n          }\n          block {\n            height\n          }\n        }\n      }\n    }\n  }\n': types.findByTagsDocument,
};
export function graphql(source) {
    return documents[source] ?? {};
}
