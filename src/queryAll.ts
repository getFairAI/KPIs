import { useQuery } from '@apollo/client';
import { QUERY_TXS_WITH } from './queries/queries';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';


export const client = new ApolloClient({
    uri: 'https://arweave.net/graphql',
    cache: new InMemoryCache()
  })

export const fetchAllTransactions2 = async (tagsKpiNewUsers: any) => {
  const { loading, error, data } = await client.query({
    query: QUERY_TXS_WITH,
    variables: { tags: tagsKpiNewUsers, first: 100, after: null },
  });

  if (loading) {
    throw new Error('Loading transactions...');
  }

  if (error) {
    throw new Error(`Error fetching transactions: ${error.message}`);
  }

  const allTransactions = data.transactions.edges;
  let hasNextPage = data.transactions.pageInfo.hasNextPage;
  let after = data.transactions.edges[data.transactions.edges.length - 1].cursor;

  while (hasNextPage) {
    const { data: nextPageData } = await client.query({
      query: QUERY_TXS_WITH,
      variables: { tags: tagsKpiNewUsers, first: 100, after },
    });

    const nextPageTransactions = nextPageData.transactions.edges;
    allTransactions.push(...nextPageTransactions);
    hasNextPage = nextPageData.transactions.pageInfo.hasNextPage;
    after = nextPageData.transactions.edges[nextPageData.transactions.edges.length - 1].cursor;
  }

  return allTransactions;
};
export const fetchAllTransactions = async (tagsKpiNewUsers: any) => {
    const { loading, error, data } = await client.query({
      query: QUERY_TXS_WITH,
      variables: { tags: tagsKpiNewUsers, first: 100, after: null },
    });
  
    if (loading) {
      throw new Error('Loading transactions...');
    }
  
    if (error) {
      throw new Error(`Error fetching transactions: ${error.message}`);
    }
  
    let allTransactions = data.transactions.edges;
    let hasNextPage = data.transactions.pageInfo.hasNextPage;
    let after = data.transactions.edges[data.transactions.edges.length - 1].cursor;
  
    while (hasNextPage) {
      const { data: nextPageData } = await client.query({
        query: QUERY_TXS_WITH,
        variables: { tags: tagsKpiNewUsers, first: 100, after },
      });
  
      const nextPageTransactions = nextPageData.transactions.edges;
      allTransactions = [...allTransactions, ...nextPageTransactions];
      hasNextPage = nextPageData.transactions.pageInfo.hasNextPage;
      after = nextPageData.transactions.edges[nextPageData.transactions.edges.length - 1].cursor;
    }
  
    return allTransactions;
  };
  
