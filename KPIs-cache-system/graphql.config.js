/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    arbitrumRequests: {
      schema: ['https://subgraph.satsuma-prod.com/2f3d33952889/fairai--inc--359110/FairAI-payments/version/v1.1/api'],
      documents: ['./src/app/cron-jobs/fetch-arbitrum-requests.ts'],
      extensions: {
        codegen: {
          generates: {
            './src/gql/arbitrum-requests/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
    solutions: {
      schema: ['https://arweave.net/graphql'],
      documents: ['./src/app/cron-jobs/fetch-solutions.ts'],
      extensions: {
        codegen: {
          ignoreNoDocuments: true, // for better experience with the watcher
          config: {
            namingConvention: 'change-case-all#camelCase',
          },
          generates: {
            './src/gql/solutions/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
    userRequests: {
      schema: ['https://arweave.mainnet.irys.xyz/graphql'],
      documents: ['./src/app/cron-jobs/fetch-user-requests.ts'],
      extensions: {
        codegen: {
          ignoreNoDocuments: true,
          config: {
            namingConvention: 'change-case-all#camelCase',
          },
          generates: {
            './src/gql/users-requests/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
    solutionRequests: {
      schema: ['https://arweave.mainnet.irys.xyz/graphql'],
      documents: ['./src/app/cron-jobs/fetch-solutions-requests.ts'],
      extensions: {
        codegen: {
          ignoreNoDocuments: true,
          config: {
            namingConvention: 'change-case-all#camelCase',
          },
          generates: {
            './src/gql/solutions-requests/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
    responses: {
      schema: ['https://arweave.net/graphql'],
      documents: ['./src/app/cron-jobs/fetch-responses.ts'],
      extensions: {
        codegen: {
          ignoreNoDocuments: true,
          config: {
            namingConvention: 'change-case-all#camelCase',
          },
          generates: {
            './src/gql/responses/': {
              preset: 'client',
              plugins: [],
            },
          },
        },
      },
    },
  },
};
