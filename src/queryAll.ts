/*
 * Fair Protocol - KPIs
 * Copyright (C) 2023 Fair Protocol
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */

import { QUERY_TXS_WITH } from "./queries/queries";
import { ApolloClient, InMemoryCache } from "@apollo/client";

export const apiKPICacheSystemURL = "http://localhost:3005/kpis-cache/request";

export const client = new ApolloClient({
  uri: "https://arweave.net/graphql",
  cache: new InMemoryCache(),
});

// export const fetchAllTransactions2 = async (tagsKpiNewUsers: any) => {
//   const { loading, error, data } = await client.query({
//     query: QUERY_TXS_WITH,
//     variables: { tags: tagsKpiNewUsers, first: 100, after: null },
//   });

//   if (loading) {
//     throw new Error("Loading transactions...");
//   }

//   if (error) {
//     throw new Error(`Error fetching transactions: ${error.message}`);
//   }

//   const allTransactions = data.transactions.edges;
//   let hasNextPage = data.transactions.pageInfo.hasNextPage;
//   let after =
//     data.transactions.edges[data.transactions.edges.length - 1].cursor;

//   while (hasNextPage) {
//     const { data: nextPageData } = await client.query({
//       query: QUERY_TXS_WITH,
//       variables: { tags: tagsKpiNewUsers, first: 100, after },
//     });

//     const nextPageTransactions = nextPageData.transactions.edges;
//     allTransactions.push(...nextPageTransactions);
//     hasNextPage = nextPageData.transactions.pageInfo.hasNextPage;
//     after =
//       nextPageData.transactions.edges[
//         nextPageData.transactions.edges.length - 1
//       ].cursor;
//   }

//   return allTransactions;
// };

export const fetchAllTransactions = async (tagsKpiNewUsers: any) => {
  const { loading, error, data } = await client.query({
    query: QUERY_TXS_WITH,
    variables: { tags: tagsKpiNewUsers, first: 100, after: null },
  });

  if (loading) {
    throw new Error("Loading transactions...");
  }

  if (error) {
    throw new Error(`Error fetching transactions: ${error.message}`);
  }

  let allTransactions = data.transactions.edges;
  let hasNextPage = data.transactions.pageInfo.hasNextPage;
  let after =
    data.transactions.edges[data.transactions.edges.length - 1].cursor;

  while (hasNextPage) {
    const { data: nextPageData } = await client.query({
      query: QUERY_TXS_WITH,
      variables: { tags: tagsKpiNewUsers, first: 100, after },
    });

    const nextPageTransactions = nextPageData.transactions.edges;
    allTransactions = [...allTransactions, ...nextPageTransactions];
    hasNextPage = nextPageData.transactions.pageInfo.hasNextPage;
    after =
      nextPageData.transactions.edges[
        nextPageData.transactions.edges.length - 1
      ].cursor;
  }

  return allTransactions;
};

export const fetchAllTransactionsToKPICacheAPI = async () => {
  try {
    const response = await fetch(
      apiKPICacheSystemURL + "/arbitrum-transfers/get-all",
      { method: "GET" }
    );
    console.log(response);
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};
