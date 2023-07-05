import { gql } from '@apollo/client';

export const QUERY_TXS_WITH = gql`
  query QUERY_TX_WITH($tags: [TagFilter!], $first: Int, $after: String) {
    transactions(tags: $tags, sort: HEIGHT_ASC, first: $first, after: $after) {
      edges {
        cursor
        node {
          id
          owner {
            address
          }
          fee {
            ar
          }
          quantity {
            ar
            winston
          }
          block {
            timestamp
          }
          tags {
            name
            value
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;