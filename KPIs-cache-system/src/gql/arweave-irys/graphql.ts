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
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values.BigInt can represent values between -(2^53) + 1 and 2^53 - 1. */
  BigInt: { input: any; output: any; }
};

export type approvalConnection = {
  __typename?: 'ApprovalConnection';
  edges?: Maybe<Array<Maybe<approvalEdge>>>;
  pageInfo?: Maybe<pageInfo>;
};

export type approvalEdge = {
  __typename?: 'ApprovalEdge';
  cursor: Scalars['String']['output'];
  node: paymentApproval;
};

export type pageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type paymentApproval = {
  __typename?: 'PaymentApproval';
  amount: Scalars['String']['output'];
  approvedAddress: Scalars['String']['output'];
  expiresBy?: Maybe<Scalars['BigInt']['output']>;
  payingAddress: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  token: Scalars['String']['output'];
};

export type query = {
  __typename?: 'Query';
  paymentApprovals?: Maybe<approvalConnection>;
  transactions?: Maybe<transactionConnection>;
};


export type querypaymentApprovalsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  approvedAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<sortOrder>;
  payingAddresses?: InputMaybe<Array<Scalars['String']['input']>>;
  tokens?: InputMaybe<Array<Scalars['String']['input']>>;
};


export type querytransactionsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  hasTags?: InputMaybe<Scalars['Boolean']['input']>;
  ids?: InputMaybe<Array<Scalars['String']['input']>>;
  order?: InputMaybe<sortOrder>;
  owners?: InputMaybe<Array<Scalars['String']['input']>>;
  tags?: InputMaybe<Array<tagFilter>>;
  timestamp?: InputMaybe<timestampFilter>;
  token?: InputMaybe<Scalars['String']['input']>;
};

export type receipt = {
  __typename?: 'Receipt';
  deadlineHeight: Scalars['BigInt']['output'];
  signature: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  version: Scalars['String']['output'];
};

export enum sortOrder {
  asc = 'ASC',
  desc = 'DESC'
}

export type tag = {
  __typename?: 'Tag';
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type tagFilter = {
  name: Scalars['String']['input'];
  values: Array<Scalars['String']['input']>;
};

export type timestampFilter = {
  /** Inclusive */
  from?: InputMaybe<Scalars['BigInt']['input']>;
  to?: InputMaybe<Scalars['BigInt']['input']>;
};

export type transaction = {
  __typename?: 'Transaction';
  address: Scalars['String']['output'];
  /** @deprecated use token instead */
  currency: Scalars['String']['output'];
  fee: Scalars['String']['output'];
  id: Scalars['String']['output'];
  receipt?: Maybe<receipt>;
  signature?: Maybe<Scalars['String']['output']>;
  size: Scalars['String']['output'];
  tags?: Maybe<Array<tag>>;
  timestamp: Scalars['BigInt']['output'];
  token: Scalars['String']['output'];
};

export type transactionConnection = {
  __typename?: 'TransactionConnection';
  edges?: Maybe<Array<Maybe<transactionEdge>>>;
  pageInfo?: Maybe<pageInfo>;
};

export type transactionEdge = {
  __typename?: 'TransactionEdge';
  cursor: Scalars['String']['output'];
  node: transaction;
};

export type findByTagsQueryVariables = Exact<{
  tags?: InputMaybe<Array<tagFilter> | tagFilter>;
  first: Scalars['Int']['input'];
  after?: InputMaybe<Scalars['String']['input']>;
  from?: InputMaybe<Scalars['BigInt']['input']>;
  to?: InputMaybe<Scalars['BigInt']['input']>;
}>;


export type findByTagsQuery = { __typename?: 'Query', transactions?: { __typename?: 'TransactionConnection', pageInfo?: { __typename?: 'PageInfo', hasNextPage: boolean } | null, edges?: Array<{ __typename?: 'TransactionEdge', cursor: string, node: { __typename?: 'Transaction', id: string, address: string, timestamp: any, tags?: Array<{ __typename?: 'Tag', name: string, value: string }> | null } } | null> | null } | null };


export const findByTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"findByTags"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tags"}},"type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TagFilter"}}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"to"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"BigInt"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactions"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tags"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tags"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"timestamp"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"ObjectField","name":{"kind":"Name","value":"to"},"value":{"kind":"Variable","name":{"kind":"Name","value":"to"}}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}},{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cursor"}},{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"value"}}]}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"timestamp"}}]}}]}}]}}]}}]} as unknown as DocumentNode<findByTagsQuery, findByTagsQueryVariables>;