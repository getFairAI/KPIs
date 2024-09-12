/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** Representation of a value transfer between wallets, in both winson and ar. */
export type amount = {
  __typename?: 'Amount';
  /** Amount as an AR string e.g. \`"0.000000000001"\`. */
  ar: Scalars['String']['output'];
  /** Amount as a winston string e.g. \`"1000000000000"\`. */
  winston: Scalars['String']['output'];
};

export type block = {
  __typename?: 'Block';
  /** The block height. */
  height: Scalars['Int']['output'];
  /** The block ID. */
  id: Scalars['ID']['output'];
  /** The previous block ID. */
  previous: Scalars['ID']['output'];
  /** The block timestamp (UTC). */
  timestamp: Scalars['Int']['output'];
};

/**
 * Paginated result set using the GraphQL cursor spec,
 * see: https://relay.dev/graphql/connections.htm.
 */
export type blockConnection = {
  __typename?: 'BlockConnection';
  edges: Array<blockEdge>;
  pageInfo: pageInfo;
};

/** Paginated result set using the GraphQL cursor spec. */
export type blockEdge = {
  __typename?: 'BlockEdge';
  /**
   * The cursor value for fetching the next page.
   *
   * Pass this to the \`after\` parameter in \`blocks(after: $cursor)\`, the next page will start from the next item after this.
   */
  cursor: Scalars['String']['output'];
  /** A block object. */
  node: block;
};

/** Find blocks within a given range */
export type blockFilter = {
  /** Maximum block height to filter to */
  max?: InputMaybe<Scalars['Int']['input']>;
  /** Minimum block height to filter from */
  min?: InputMaybe<Scalars['Int']['input']>;
};

/**
 * The data bundle containing the current data item.
 * See: https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-104.md.
 */
export type bundle = {
  __typename?: 'Bundle';
  /** ID of the containing data bundle. */
  id: Scalars['ID']['output'];
};

/** Basic metadata about the transaction data payload. */
export type metaData = {
  __typename?: 'MetaData';
  /** Size of the associated data in bytes. */
  size: Scalars['String']['output'];
  /** Type is derrived from the \`content-type\` tag on a transaction. */
  type?: Maybe<Scalars['String']['output']>;
};

/** Representation of a transaction owner. */
export type owner = {
  __typename?: 'Owner';
  /** The owner's wallet address. */
  address: Scalars['String']['output'];
  /** The owner's public key as a base64url encoded string. */
  key: Scalars['String']['output'];
};

/** Paginated page info using the GraphQL cursor spec. */
export type pageInfo = {
  __typename?: 'PageInfo';
  hasNextPage: Scalars['Boolean']['output'];
};

/**
 * The parent transaction for bundled transactions,
 * see: https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-102.md.
 */
export type parent = {
  __typename?: 'Parent';
  id: Scalars['ID']['output'];
};

/**
 * Arweave Gateway
 * Copyright (C) 2022 Permanent Data Solutions, Inc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type query = {
  __typename?: 'Query';
  block?: Maybe<block>;
  blocks: blockConnection;
  /** Get a transaction by its id */
  transaction?: Maybe<transaction>;
  /** Get a paginated set of matching transactions using filters. */
  transactions: transactionConnection;
};


/**
 * Arweave Gateway
 * Copyright (C) 2022 Permanent Data Solutions, Inc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type queryblockArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};


/**
 * Arweave Gateway
 * Copyright (C) 2022 Permanent Data Solutions, Inc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type queryblocksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<blockFilter>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  sort?: InputMaybe<sortOrder>;
};


/**
 * Arweave Gateway
 * Copyright (C) 2022 Permanent Data Solutions, Inc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type querytransactionArgs = {
  id: Scalars['ID']['input'];
};


/**
 * Arweave Gateway
 * Copyright (C) 2022 Permanent Data Solutions, Inc
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
export type querytransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  block?: InputMaybe<blockFilter>;
  bundledIn?: InputMaybe<Array<Scalars['ID']['input']>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  ids?: InputMaybe<Array<Scalars['ID']['input']>>;
  owners?: InputMaybe<Array<Scalars['String']['input']>>;
  recipients?: InputMaybe<Array<Scalars['String']['input']>>;
  sort?: InputMaybe<sortOrder>;
  tags?: InputMaybe<Array<tagFilter>>;
};

/** Optionally reverse the result sort order from `HEIGHT_DESC` (default) to `HEIGHT_ASC`. */
export enum sortOrder {
  /** Results are sorted by the transaction block height in ascending order, with the oldest transactions appearing first, and the most recent and pending/unconfirmed appearing last. */
  heightAsc = 'HEIGHT_ASC',
  /** Results are sorted by the transaction block height in descending order, with the most recent and unconfirmed/pending transactions appearing first. */
  heightDesc = 'HEIGHT_DESC'
}

export type tag = {
  __typename?: 'Tag';
  /** UTF-8 tag name */
  name: Scalars['String']['output'];
  /** UTF-8 tag value */
  value: Scalars['String']['output'];
};

/** Find transactions with the folowing tag name and value */
export type tagFilter = {
  /** The tag name */
  name: Scalars['String']['input'];
  /** The operator to apply to to the tag filter. Defaults to EQ (equal). */
  op?: InputMaybe<tagOperator>;
  /**
   * An array of values to match against. If multiple values are passed then transactions with _any_ matching tag value from the set will be returned.
   *
   * e.g.
   *
   * \`{name: "app-name", values: ["app-1"]}\`
   *
   * Returns all transactions where the \`app-name\` tag has a value of \`app-1\`.
   *
   * \`{name: "app-name", values: ["app-1", "app-2", "app-3"]}\`
   *
   * Returns all transactions where the \`app-name\` tag has a value of either \`app-1\` _or_ \`app-2\` _or_ \`app-3\`.
   */
  values: Array<Scalars['String']['input']>;
};

/** The operator to apply to a tag value. */
export enum tagOperator {
  /** Equal */
  eq = 'EQ',
  /** Not equal */
  neq = 'NEQ'
}

export type transaction = {
  __typename?: 'Transaction';
  anchor: Scalars['String']['output'];
  /** Transactions with a null block are recent and unconfirmed, if they aren't mined into a block within 60 minutes they will be removed from results. */
  block?: Maybe<block>;
  /**
   * For bundled data items this references the containing bundle ID.
   * See: https://github.com/ArweaveTeam/arweave-standards/blob/master/ans/ANS-104.md
   */
  bundledIn?: Maybe<bundle>;
  data: metaData;
  fee: amount;
  id: Scalars['ID']['output'];
  owner: owner;
  /**
   * @deprecated Don't use, kept for backwards compatability only!
   * @deprecated Use `bundledIn`
   */
  parent?: Maybe<parent>;
  quantity: amount;
  recipient: Scalars['String']['output'];
  signature: Scalars['String']['output'];
  tags: Array<tag>;
};

/**
 * Paginated result set using the GraphQL cursor spec,
 * see: https://relay.dev/graphql/connections.htm.
 */
export type transactionConnection = {
  __typename?: 'TransactionConnection';
  edges: Array<transactionEdge>;
  pageInfo: pageInfo;
};

/** Paginated result set using the GraphQL cursor spec. */
export type transactionEdge = {
  __typename?: 'TransactionEdge';
  /**
   * The cursor value for fetching the next page.
   *
   * Pass this to the \`after\` parameter in \`transactions(after: $cursor)\`, the next page will start from the next item after this.
   */
  cursor: Scalars['String']['output'];
  /** A transaction object. */
  node: transaction;
};

export type findByTagsQueryVariables = Exact<{
  tags?: InputMaybe<Array<tagFilter> | tagFilter>;
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  block?: InputMaybe<blockFilter>;
}>;


export type findByTagsQuery = { __typename?: 'Query', transactions: { __typename?: 'TransactionConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean }, edges: Array<{ __typename?: 'TransactionEdge', cursor: string, node: { __typename?: 'Transaction', id: string, tags: Array<{ __typename?: 'Tag', name: string, value: string }>, owner: { __typename?: 'Owner', address: string }, block?: { __typename?: 'Block', height: number } | null } }> } };


export const findByTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findByTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tags"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TagFilter"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"block"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BlockFilter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tags"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"block"},"value":{"kind":"Variable","name":{"kind":"Name","value":"block"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"owner"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"address"}}]}},{"kind":"Field","name":{"kind":"Name","value":"block"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"height"}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<findByTagsQuery, findByTagsQueryVariables>;