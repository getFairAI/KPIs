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

import {
  TAG_NAMES,
  U_SUB_UNITS,
  U_TRANFER_FUNCTION,
  U_TOKEN,
  DECIMAL_PLACES,
} from "./constants";
import { targetUWallets } from "./commonVars";
import {
  DateInfo,
  Transaction,
  OperatorTX,
  TransfersFromKPICache,
  validOperatorsFromKPICache,
  solutionsFromKPICache,
  solutionRequestsFromKPICache,
  PieChartInfo,
  marketplaceRevenueData,
} from "./interfaces";
import { findTag, sumArraySlice, getSecondsByViewOption } from "./utils/util";
import { ViewOptions } from "./Enum";
import { act } from "react-dom/test-utils";

export const getMondayDateAndUnixTimeList = (
  startDate: Date,
  endDate: Date,
  view: string
): DateInfo[] => {
  const dateList: DateInfo[] = [];

  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    if (
      (view === ViewOptions.WEEKLY && currentDate.getDay() === 1) ||
      (view === ViewOptions.MONTHLY && currentDate.getDate() === 1) ||
      view === ViewOptions.DAILY
    ) {
      // Check if it's Monday (0: Sunday, 1: Monday, ...)
      const unixTime = Math.floor(currentDate.getTime() / 1000); // Convert milliseconds to seconds
      dateList.push({ date: new Date(currentDate), unixTime });
    }
    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dateList;
};

export const getMondayDateAndUnixTimeMap = (
  startDate: Date,
  endDate: Date,
  view: string
): Map<number, Date> => {
  const dateMap: Map<number, Date> = new Map();
  let currentDate = new Date(startDate);
  currentDate.setHours(0, 0, 0, 0);

  while (currentDate <= endDate) {
    if (
      (view === ViewOptions.WEEKLY && currentDate.getDay() === 1) ||
      (view === ViewOptions.MONTHLY && currentDate.getDate() === 1) ||
      view === ViewOptions.DAILY
    ) {
      // Check if it's Monday (0: Sunday, 1: Monday, ...)
      const unixTime = Math.floor(currentDate.getTime() / 1000); // Convert milliseconds to seconds
      dateMap.set(unixTime, new Date(currentDate));
    }

    currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
  }

  return dateMap;
};

export const createOwnerUnixTimeMapOld = (
  transactions: Transaction[]
): Map<string, number> => {
  const ownerUnixTimeMap: Map<string, number> = new Map();

  transactions.forEach((transaction) => {
    const tags = transaction.node.tags;
    const owner = transaction.node.owner.address;

    if (tags.length >= 8) {
      const tag = tags[7]; // Use the tag at position 7

      if (tag.name === "Unix-Time") {
        const unixTime = parseFloat(tag.value);
        if (!isNaN(unixTime) && !ownerUnixTimeMap.has(owner)) {
          ownerUnixTimeMap.set(owner, unixTime);
        }
      }
    }
  });

  return ownerUnixTimeMap;
};

export const createOwnerUnixTimeMap = (
  transactions: TransfersFromKPICache[],
  addressesFromDifferentVersions: string[] = []
): Map<string, number> => {
  const ownerUnixTimeMap: Map<string, number> = new Map();

  transactions.forEach((transaction) => {
    const { blockchainBlockNumber, timestamp, from } = transaction;

    if (blockchainBlockNumber && timestamp && from) {
      // avoid errors when there is no timestamp available
      const address = from;

      if (
        !isNaN(timestamp) &&
        !ownerUnixTimeMap.has(address) &&
        !addressesFromDifferentVersions.includes(address)
      ) {
        ownerUnixTimeMap.set(address, timestamp);
      }
    } else {
      // console.log(transaction);
    }
  });

  return ownerUnixTimeMap;
};

export const generateChartInfo = (
  categoriesTitle: string,
  yTitle: string,
  chartTitle: string,
  subTitle: string,
  seriesTitle: string,
  dates: DateInfo[],
  ownerUnixTimeMap: Map<string, number>,
  view: string
): any => {
  const series = [
    {
      name: seriesTitle,
      data: dates.map((date) => {
        const addressesInRange = Array.from(ownerUnixTimeMap.values()).filter(
          (unixTime) => {
            return (
              unixTime >= date.unixTime &&
              unixTime <= date.unixTime + getSecondsByViewOption(view)
            );
          }
        );
        return addressesInRange.length;
      }),
    },
  ];

  const chartInfo = {
    categories: dates.map((date) =>
      date.date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    ), // Convert dates to ISO string format
    categoriesTitle: categoriesTitle,
    yTitle: yTitle,
    chartTitle: chartTitle,
    subTitle: subTitle,
    yMin: Math.min(...series[0].data),
    yMax: Math.max(...series[0].data),
  };

  return {
    series,
    chartInfo,
  };
};

export const createWeekTransactionsMap = (
  transactions: TransfersFromKPICache[],
  dateInfo: DateInfo[],
  view: string
): Map<number, TransfersFromKPICache[]> => {
  const weekUnixTransactionsMap: Map<number, TransfersFromKPICache[]> =
    new Map();

  dateInfo.forEach((week) => {
    weekUnixTransactionsMap.set(week.unixTime, []);
  });

  transactions.forEach((transaction: TransfersFromKPICache) => {
    const { blockchainBlockNumber, from, timestamp } = transaction;

    if (blockchainBlockNumber && timestamp && from) {
      const week = findWeekByTimestamp(timestamp, dateInfo, view);
      if (week) {
        if (!weekUnixTransactionsMap.has(week.unixTime)) {
          weekUnixTransactionsMap.set(week.unixTime, []);
        }

        const weekTransactions = weekUnixTransactionsMap.get(week.unixTime);
        if (weekTransactions) {
          weekTransactions.push(transaction);
        }
      }
    }
  });

  return weekUnixTransactionsMap;
};

// calculate new users Acc - users with transactions this week that dont have transactions in the previous week but can have in the other ones behind
export const createWeekNumberOfUsersAccMap = (
  weekUnixTransactionsMap: Map<number, Transaction[]>
): number[] => {
  const uniqueOwnersPerWeek: number[] = [];
  const uniqueOwnersByWeek: Map<number, Set<string>> = new Map();

  const keys = Array.from(weekUnixTransactionsMap.keys());

  // Initialize the map with empty sets for each key
  keys.forEach((key) => {
    uniqueOwnersByWeek.set(key, new Set());
  });

  for (let i = 0; i < keys.length; i++) {
    const txsWeek = weekUnixTransactionsMap.get(keys[i]);

    txsWeek?.forEach((tx) => {
      const owner = tx.node.owner?.address;
      if (owner) {
        uniqueOwnersByWeek.get(keys[i])?.add(owner);
      }
    });
  }

  // first week we dont need to calculate the new users
  const firstPositionSize = uniqueOwnersByWeek.get(keys[0])?.size ?? 0;
  uniqueOwnersPerWeek.push(firstPositionSize);

  for (let i = 1; i < keys.length; i++) {
    const currentSet = uniqueOwnersByWeek.get(keys[i]);
    const previousSet = uniqueOwnersByWeek.get(keys[i - 1]);

    const difference =
      currentSet && previousSet
        ? new Set([...currentSet].filter((x) => !previousSet.has(x)))
        : new Set();
    const sizeOfDifference = difference.size;
    uniqueOwnersPerWeek.push(sizeOfDifference);
  }
  return uniqueOwnersPerWeek;
};

export const createWeekNumberOfTransactionsMap = (
  transactions: Transaction[],
  dateInfo: DateInfo[],
  view: string
): Map<number, number> => {
  const weekTransactionCountMap: Map<number, number> = new Map();

  // Initialize the map with all weeks from dateInfo
  dateInfo.forEach((week) => {
    weekTransactionCountMap.set(week.unixTime, 0);
  });

  transactions.forEach((transaction) => {
    const { block, owner } = transaction.node;

    if (block && block.timestamp && owner) {
      const timestamp = block.timestamp;
      const week = findWeekByTimestamp(timestamp, dateInfo, view);

      if (week) {
        const count = weekTransactionCountMap.get(week.unixTime);
        if (count !== undefined) {
          weekTransactionCountMap.set(week.unixTime, count + 1);
        }
      }
    }
  });

  return weekTransactionCountMap;
};

const findWeekByTimestamp = (
  timestamp: number,
  dateInfo: DateInfo[],
  view: string
): DateInfo | undefined => {
  return dateInfo.find((week) => {
    const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);
    return timestamp >= week.unixTime && timestamp <= weekEndTimestamp;
  });
};

export const mapNumberTxsPerWeek = (
  weekUnixTransactionsMap: Map<number, TransfersFromKPICache[]>,
  threshold: number
): Map<number, number> => {
  const distinctAddressCountMap: Map<number, number> = new Map();
  weekUnixTransactionsMap.forEach((transactions, weekTimestamp) => {
    const addressSet: Set<string> = new Set();

    transactions.forEach((transaction) => {
      const address = transaction.from;
      addressSet.add(address);
    });

    const distinctAddressCount = Array.from(addressSet).filter((address) => {
      const addressTransactionCount = transactions.filter(
        (transaction) => transaction.from === address
      ).length;
      return addressTransactionCount >= threshold;
    }).length;

    distinctAddressCountMap.set(weekTimestamp, distinctAddressCount);
  });

  return distinctAddressCountMap;
};

// aux functions
export const extractOperatorRegistrationTx = (
  transactions: Transaction[]
): OperatorTX[] => {
  const operatorTransactions: OperatorTX[] = [];

  transactions.forEach((transaction) => {
    const { block, tags } = transaction.node;
    const addressTag = tags.find((tag) => tag.name === TAG_NAMES.sequenceOwner);
    const scriptTx = tags.find(
      (tag) => tag.name === TAG_NAMES.scriptTransaction
    );

    if (block && addressTag && scriptTx) {
      const operatorTx: OperatorTX = {
        address: addressTag.value,
        scriptTransaction: scriptTx.value,
        unixTime: block.timestamp,
      };

      operatorTransactions.push(operatorTx);
    }
  });

  return operatorTransactions;
};

export const extractOperatorCancelTx = (
  transactions: Transaction[]
): OperatorTX[] => {
  const operatorTransactions: OperatorTX[] = [];

  transactions.forEach((transaction) => {
    const { block, owner, tags } = transaction.node;
    const scriptTx = tags.find(
      (tag) => tag.name === TAG_NAMES.scriptTransaction
    );

    if (block && owner && scriptTx) {
      const operatorTx: OperatorTX = {
        address: owner.address,
        scriptTransaction: scriptTx.value,
        unixTime: block.timestamp,
      };

      operatorTransactions.push(operatorTx);
    }
  });

  return operatorTransactions;
};

export const paymentsPrepareDataOld = (
  inferenceTx: Transaction[],
  modelCreationTx: Transaction[],
  scriptCreationTx: Transaction[],
  operatorRegistrationTx: Transaction[],
  dateInfo: DateInfo[],
  chartTitle: string,
  subTitle: string,
  view: string
): any => {
  const transactionTypes = [
    { name: "Inference Payment", transactions: inferenceTx },
    { name: "Model Creation", transactions: modelCreationTx },
    { name: "Script Creation", transactions: scriptCreationTx },
    { name: "Operator Registration", transactions: operatorRegistrationTx },
  ];

  const series: { name: string; data: number[] }[] = [];
  const chartInfo = {
    categories: dateInfo.map((week) =>
      week.date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    ),
    chartTitle: chartTitle,
    subTitle: subTitle,
  };

  for (const type of transactionTypes) {
    const data: number[] = [];

    for (const week of dateInfo) {
      const weekStartTimestamp = week.unixTime;
      const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);

      const transactionsInWeek = type.transactions.filter((transaction) => {
        const timestamp = transaction.node.block?.timestamp;
        return (
          timestamp &&
          timestamp >= weekStartTimestamp &&
          timestamp < weekEndTimestamp
        );
      });

      data.push(transactionsInWeek.length);
    }

    series.push({ name: type.name, data });
  }

  return { series, chartInfo };
};

// active operators - only show operators that have at least one use per week
export const operatorsPrepareData = (
  transfersTx: TransfersFromKPICache[],
  operatorsList: validOperatorsFromKPICache[],
  dateInfo: DateInfo[],
  view: string
): Map<number, number> => {
  const activeOperatorsMap: Map<number, number> = new Map();

  dateInfo.forEach((week) => {
    const weekTimeStamp = week.unixTime + getSecondsByViewOption(view); // Add one week duration
    const activeOperators = operatorsList.filter((operatorTx) => {
      const txTimeStamp = operatorTx.timestamp;

      // Check if there are requests made to the operator in the week
      // we use find because only 1 is enough to consider it active
      const requestToOperator = transfersTx.find((request) => {
        const requestTimeStamp = request.timestamp;

        // Check if the request has the operator address and script-transaction tags
        const sameOperatorAddress =
          request.to === operatorTx.operatorEvmAddress;
        return (
          requestTimeStamp >= week.unixTime &&
          requestTimeStamp <= weekTimeStamp &&
          sameOperatorAddress
        );
      });

      // Check if the operator registration is valid for the week
      return txTimeStamp <= weekTimeStamp && requestToOperator;
    });

    activeOperatorsMap.set(week.unixTime, activeOperators.length);
  });

  return activeOperatorsMap;
};

export const generateChartInfoCountsXPerWeek = (
  categoriesTitle: string,
  yTitle: string,
  chartTitle: string,
  subTitle: string,
  seriesTitle: string,
  weekUnixTransactionsMap: Map<number, TransfersFromKPICache[]>,
  mapNumberTxsPerWeek: Map<number, number>,
  unixToDateMap: Map<number, Date>
): any => {
  const series = [
    {
      name: seriesTitle,
      data: Array.from(weekUnixTransactionsMap.keys()).map((unixTime) => {
        return mapNumberTxsPerWeek.get(unixTime) || 0;
      }),
    },
  ];

  const chartInfo = {
    categories: Array.from(weekUnixTransactionsMap.keys()).map(
      (unixTime) =>
        unixToDateMap.get(unixTime)?.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? ""
    ),
    categoriesTitle: categoriesTitle,
    yTitle: yTitle,
    chartTitle: chartTitle,
    subTitle: subTitle,
    yMin: Math.min(...series[0].data),
    yMax: Math.max(...series[0].data),
  };

  return {
    series,
    chartInfo,
  };
};

export const generateChartInfoTxsPerWeek = (
  categoriesTitle: string,
  yTitle: string,
  chartTitle: string,
  subTitle: string,
  seriesTitle: string,
  mapNumberTxsPerWeek: Map<number, number>,
  unixToDateMap: Map<number, Date>
): any => {
  const series = [
    {
      name: seriesTitle,
      data: Array.from(mapNumberTxsPerWeek.values()),
    },
  ];

  const chartInfo = {
    categories: Array.from(mapNumberTxsPerWeek.keys()).map(
      (unixTime) =>
        unixToDateMap.get(unixTime)?.toLocaleString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }) ?? ""
    ),
    categoriesTitle: categoriesTitle,
    yTitle: yTitle,
    chartTitle: chartTitle,
    subTitle: subTitle,
    yMin: Math.min(...series[0].data),
    yMax: Math.max(...series[0].data),
  };

  return {
    series,
    chartInfo,
  };
};

export const generatePieChartRevenue = (
  chartTitle: string,
  subTitle: string,
  revenueData: marketplaceRevenueData
): any => {
  const chartLabels = ["Requests", "Registrations", "Other"]; // we manually define the order of the items

  const chartInfo: PieChartInfo = {
    chartTitle: chartTitle,
    subTitle: subTitle,
    labels: chartLabels,
    formatter: (val: string | number) => `$ ${Number(val).toFixed(2)}`,
    tooltipFormatter: (val: string | number) => `US$ ${Number(val).toFixed(2)}`,
  };

  let dataPreparationSeries: number[] = new Array();

  // we ignore the 'count' for now
  // the total is not to be added to the graph!
  dataPreparationSeries.push(
    +(
      parseFloat(revenueData?.requests?.value.toString() ?? "0").toFixed(2) ?? 0
    )
  );
  dataPreparationSeries.push(
    +(
      parseFloat(revenueData?.registrations?.value.toString() ?? "0").toFixed(
        2
      ) ?? 0
    )
  );
  dataPreparationSeries.push(
    +(parseFloat(revenueData?.unknown?.value.toString() ?? "0").toFixed(2) ?? 0)
  );

  return {
    series: dataPreparationSeries,
    chartInfo: chartInfo,
    labels: chartLabels,
  };
};

export const paymentsPrepareData = (
  mainTx: Transaction[],
  modelCreationTx: Transaction[],
  scriptCreationTx: Transaction[],
  operatorRegistrationTx: Transaction[],
  dateInfo: DateInfo[],
  chartTitle: string,
  subTitle: string,
  view: string
): any => {
  const transactionTypes = [
    {
      name: "Inference Payment",
      transactions: mainTx,
      tagName: "Inference-Transaction",
    },
    { name: "Model Creation", transactions: modelCreationTx },
    { name: "Script Creation", transactions: scriptCreationTx },
    { name: "Operator Registration", transactions: operatorRegistrationTx },
  ];

  const series: { name: string; data: number[] }[] = [];
  const chartInfo = {
    categories: dateInfo.map((week) =>
      week.date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    ),
    chartTitle: chartTitle,
    subTitle: subTitle,
  };
  for (const type of transactionTypes) {
    const data: number[] = [];

    for (const week of dateInfo) {
      const weekStartTimestamp = week.unixTime;
      const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);

      let uniqueTransactions: Set<string> = new Set();

      for (const transaction of type.transactions) {
        const timestamp = transaction.node.block?.timestamp;
        const tags = transaction.node.tags;

        if (
          timestamp &&
          timestamp >= weekStartTimestamp &&
          timestamp < weekEndTimestamp
        ) {
          if (type.tagName) {
            const matchingTags = tags.filter(
              (tag) => tag.name === type.tagName
            );
            if (matchingTags.length > 0) {
              uniqueTransactions.add(matchingTags[0].value);
            }
          } else {
            uniqueTransactions.add(transaction.node.id);
          }
        }
      }

      data.push(uniqueTransactions.size);
    }

    series.push({ name: type.name, data });
  }

  return { series, chartInfo };
};

// models used per week
const createGenericTransactionMap = (
  transactions: Transaction[],
  tagToSearch: string
): Map<string, string> => {
  const txMap: Map<string, string> = new Map();

  transactions.forEach((tx) => {
    const txID = tx.node?.id;

    if (txID && !txMap.has(txID)) {
      const tag = findTag(tx.node.tags, tagToSearch);
      if (tag) {
        txMap.set(txID, tag.value);
      }
    }
  });

  return txMap;
};

const createPaymentTxMap = (
  transactions: Transaction[],
  tagToSearch: string
): Map<string, boolean> => {
  const txMap: Map<string, boolean> = new Map();

  transactions.forEach((tx) => {
    const tag = findTag(tx.node.tags, tagToSearch);
    if (tag && !txMap.has(tag.value)) {
      txMap.set(tag.value, true);
    }
  });

  return txMap;
};

export const modelsPerWeekPrepareData = (
  mainTx: Transaction[],
  modelCreationTx: Transaction[],
  scriptCreationTx: Transaction[],
  inferencePaymentTx: Transaction[],
  dateInfo: DateInfo[],
  chartTitle: string,
  subTitle: string,
  view: string,
  isToCalculateFailedPayments: boolean = false
): any => {
  const series: { name: string; data: number[] }[] = [];
  const chartInfo = {
    categories: dateInfo.map((week) =>
      week.date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    ),
    chartTitle: chartTitle,
    subTitle: subTitle,
  };

  const modelTxNameMap = createGenericTransactionMap(
    modelCreationTx,
    TAG_NAMES.modelName
  );
  const scriptTxModelTxMap = createGenericTransactionMap(
    scriptCreationTx,
    TAG_NAMES.modelTransaction
  );
  const inferenceTxMap = createPaymentTxMap(
    inferencePaymentTx,
    TAG_NAMES.inferenceTransaction
  );

  for (const [key, value] of modelTxNameMap) {
    const data: number[] = [];

    for (const week of dateInfo) {
      const weekStartTimestamp = week.unixTime;
      const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);
      let numberOfRequests = 0;

      for (const transaction of mainTx) {
        const timestamp = transaction.node.block?.timestamp;
        const tags = transaction.node.tags;
        const txId = transaction.node.id;

        if (
          timestamp &&
          timestamp >= weekStartTimestamp &&
          timestamp < weekEndTimestamp
        ) {
          const tag = findTag(tags, TAG_NAMES.scriptTransaction);
          if (
            tag &&
            scriptTxModelTxMap.get(tag.value) === key &&
            ((!isToCalculateFailedPayments && inferenceTxMap.has(txId)) ||
              (isToCalculateFailedPayments && !inferenceTxMap.has(txId)))
          ) {
            numberOfRequests++;
          }
        }
      }

      data.push(numberOfRequests);
    }

    series.push({ name: value, data });
  }

  return { series, chartInfo };
};

// U Payments

export const AmountUTokenPaymentsPrepareData = (
  paymentsTx: TransfersFromKPICache[],
  dateInfo: DateInfo[],
  chartTitle: string,
  subTitle: string,
  view: string,
  extraWalletsToCheck: string = ""
): any => {
  if (!paymentsTx) {
    return;
  }

  const series: { name: string; data: number[] }[] = [];
  const chartInfo = {
    categories: dateInfo.map((week) =>
      week.date.toLocaleString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    ),
    chartTitle: chartTitle,
    subTitle: subTitle,
    formatter: (val: string) => `~ $${Number(val).toFixed(2)}`,
  };

  const data: number[] = [];

  for (const week of dateInfo) {
    const weekStartTimestamp = week.unixTime;
    const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);
    let amountU = 0;

    for (const transaction of paymentsTx) {
      const timestamp = transaction.timestamp;

      if (
        timestamp &&
        timestamp >= weekStartTimestamp &&
        timestamp < weekEndTimestamp
      ) {
        // amountU = Number(amount / 1e6);
        amountU += Number(BigInt(transaction.amount)) / 10 ** 6;
      }
    }

    data.push(Number(amountU.toFixed(DECIMAL_PLACES)));
  }
  series.push({ name: "US$", data });
  return { series, chartInfo };
};

export const calculateRetentionRateWithChartFormat = (
  newUsersData: number[],
  existingUsersSeries: Array<{
    name: string;
    data: number[];
    categoriesTitle: string;
  }>,
  categories: string[],
  chartTitle: string,
  subTitle: string,
  isToCalculateAll: boolean = false
) => {
  if (newUsersData.length !== existingUsersSeries[0].data.length) {
    throw new Error(
      "Series lengths must match for calculating retention rate."
    );
  }

  const retentionRates: number[] = [];
  retentionRates.push(0); // add first week -> 0

  const existingUsersData = existingUsersSeries[0].data;

  for (let i = 1; i < existingUsersData.length; i++) {
    const existingUsersDataCurrentWeek = isToCalculateAll
      ? sumArraySlice(newUsersData, 0, i - 1)
      : existingUsersData[i - 1];

    if (existingUsersDataCurrentWeek !== 0) {
      const retainedCount = (
        ((existingUsersData[i] - newUsersData[i]) /
          existingUsersDataCurrentWeek) *
        100
      ).toFixed(DECIMAL_PLACES);

      retentionRates.push(Number(retainedCount));
    } else {
      retentionRates.push(0);
    }
  }

  const categoriesTitle = existingUsersSeries[0].categoriesTitle;
  const yTitle = "Retention Rate (%)";

  const chartInfo = {
    categories,
    categoriesTitle,
    yTitle,
    chartTitle,
    subTitle,
    yMin: 0,
    yMax: 100,
  };

  const series = [
    {
      name: "Retention Rate",
      data: retentionRates,
    },
  ];

  return {
    series,
    chartInfo,
  };
};

// new solutions per week
export const newSolutionsPerWeek = (
  solutions: solutionsFromKPICache[],
  dateInfo: DateInfo[],
  view: string
): Map<number, number> => {
  let solutionsFinal: Map<number, number> = new Map();

  for (const week of dateInfo) {
    const weekStartTimestamp = week.unixTime;
    const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);
    let totalSolutions = 0;

    solutions.forEach((solution) => {
      if (solution.timestamp) {
        if (solution.timestamp >= weekStartTimestamp) {
          totalSolutions++;
        }
      }
    });

    solutionsFinal.set(week.unixTime, totalSolutions);
  }

  return solutionsFinal;
};

// solutions requests per week
export const solutionRequestsPerWeek = (
  solutionRequests: solutionRequestsFromKPICache[],
  dateInfo: DateInfo[],
  view: string
): Map<number, number> => {
  let solutionsFinal: Map<number, number> = new Map();

  for (const week of dateInfo) {
    const weekStartTimestamp = week.unixTime;
    const weekEndTimestamp = week.unixTime + getSecondsByViewOption(view);
    let solutionRequestsThisWeek = 0;

    if (solutionRequests?.length) {
      solutionRequests.forEach((request) => {
        if (request.timestamp) {
          if (
            request.timestamp / 1000 >= weekStartTimestamp &&
            request.timestamp / 1000 <= weekEndTimestamp
          ) {
            solutionRequestsThisWeek++;
          }
        }
      });
    }

    solutionsFinal.set(week.unixTime, solutionRequestsThisWeek);
  }

  return solutionsFinal;
};
