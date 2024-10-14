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

export interface ChartInfo {
  categories: string[];
  categoriesTitle: string;
  yTitle: string;
  subTitle: string;
  chartTitle: string;
  yMin: number;
  yMax: number;
}

export interface ColumnChartInfo {
  categories: string[];
  chartTitle: string;
  subTitle: string;
  formatter?: (val?: string, opts?: any) => string;
}

export interface PieChartInfo {
  chartTitle: string;
  subTitle: string;
  labels: string[];
  formatter?: (val: string | number, opts?: any) => string;
  tooltipFormatter?: (val: string | number, opts?: any) => string;
}

export interface DonutInfo {
  labels: string[];
  donutTitle: string;
  subTitle: string;
}

export interface DateInfo {
  date: Date;
  unixTime: number;
}

export interface OperatorTX {
  address: string;
  scriptTransaction: string;
  unixTime: number;
}

export interface Owner {
  address: string;
}

export interface Block {
  timestamp: number;
}

export interface Tag {
  name: string;
  value: string;
}

export interface Transaction {
  cursor: string;
  node: {
    fee: {
      ar: string;
    };
    id: string;
    owner: Owner;
    quantity: {
      ar: string;
      winston: string;
    };
    block: Block;
    tags: Tag[];
  };
}

export interface ChartData {
  name: string;
  data: number[];
}

export interface ChartInfoSimple {
  categories: string[];
  chartTitle: string;
  subTitle: string;
}

export interface CustomLinkProperties {
  to: string;
  children: React.ReactNode;
}

export interface TransfersFromKPICache {
  _id: string;
  relatedUserRequest: string | null;
  blockchainRequestId: string;
  blockchainBlockNumber: number;
  from: string;
  to: string;
  amount: number;
  type: string;
  timestamp: number;
}

export interface validOperatorsFromKPICache {
  _id: string;
  owner: string;
  relatedSolution: string | null;
  blockchainSolutionId: string;
  blockHeight: number;
  fee: number;
  timestamp: number;
  registrationId: string;
  operatorEvmAddress: string;
}

export interface solutionsFromKPICache {
  _id: string;
  solutionId: string;
  solutionName: string;
  solutionDescription: string;
  solutionOwner: string;
  relatedNewSolutionRequest?: string;
  originalSolutionRequest?: string;
  output: string;
  outputConfiguration?: string;
  rewardsAddress?: string;
  requestOwner: string;
  contractAddress?: string;
  allowFiles?: boolean;
  allowText?: boolean;
  rawData: string;
  blockHeight: number;
  timestamp: number;
}

export interface marketplaceRevenuePieChartDataEntry {
  value: number;
  count: number;
}

export interface marketplaceRevenueData {
  total: marketplaceRevenuePieChartDataEntry;
  requests: marketplaceRevenuePieChartDataEntry;
  registrations: marketplaceRevenuePieChartDataEntry;
  unknown: marketplaceRevenuePieChartDataEntry;
}

export interface solutionRequestsFromKPICache {
  _id: string;
  owner: string;
  timestamp: number;
}
