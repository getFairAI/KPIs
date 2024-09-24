import { graphql } from "../../gql/arweave-irys";

const irysTransactionsQuery = graphql(`
  query findByTags($tags: [TagFilter!], $first: Int!, $after: String, $from: BigInt, $to: BigInt) {
    transactions(tags: $tags, first: $first, after: $after, timestamp: { from: $from, to: $to }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          tags {
            name
            value
          }
          address
          timestamp
        }
      }
    }
  }
`);

export default irysTransactionsQuery;