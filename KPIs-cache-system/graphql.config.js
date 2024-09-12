/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    prj1: {
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
    prj2: {
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
  },
};
