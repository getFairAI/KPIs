import { graphql } from '../../gql/arweave-native';

const arweaveTransactionsQuery = graphql(`
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

export default arweaveTransactionsQuery;