
import { IGraphQLConfig } from 'graphql-config';

const config: IGraphQLConfig = {
  projects: {
    arbitrumTransactions: {
      schema: ['https://subgraph.satsuma-prod.com/2f3d33952889/fairai--inc--359110/FairAI-payments/version/v1.1/api'],
      documents: ['./src/app/queries/arbitrum.ts'],
      extensions: {
        codegen: {
          generates: {
            './src/gql/arbitrum/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
    arweaveNative: {
      schema: ['https://arweave.net/graphql'],
      documents: ['./src/app/queries/arweave-native.ts'],
      extensions: {
        codegen: {
          ignoreNoDocuments: true, // for better experience with the watcher
          config: {
            namingConvention: 'change-case-all#camelCase',
          },
          generates: {
            './src/gql/arweave-native/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
    arweaveIrys: {
      schema: ['https://arweave.mainnet.irys.xyz/graphql'],
      documents: ['./src/app/queries/arweave-irys.ts'],
      extensions: {
        codegen: {
          ignoreNoDocuments: true,
          config: {
            namingConvention: 'change-case-all#camelCase',
          },
          generates: {
            './src/gql/arweave-irys/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
  },
};

export default config;