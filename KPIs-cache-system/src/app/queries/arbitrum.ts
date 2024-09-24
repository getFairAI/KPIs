import { graphql } from '../../gql/arbitrum';

const arbitrumTransfersQuery = graphql(`
  query queryArbitrumTransfers($first: Int, $skip: Int) {
    transfers(first: $first, skip: $skip) {
      from
      to
      value
      blockTimestamp
      arweaveTx
      transactionHash
      blockNumber
    }
  }
`);

export default arbitrumTransfersQuery;