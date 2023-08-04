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

import { TAG_NAMES, SECONDS_PER_WEEK } from "./constants";
import { DateInfo, Transaction, OperatorTX } from "./interfaces";
import { findTag } from './utils/util';

export const getMondayDateAndUnixTimeList = (startDate: Date, endDate: Date): DateInfo[] => {
    const dateList: DateInfo[] = [];
  
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    while (currentDate <= endDate) {
      if (currentDate.getDay() === 1) { // Check if it's Monday (0: Sunday, 1: Monday, ...)
        const unixTime = Math.floor(currentDate.getTime() / 1000); // Convert milliseconds to seconds
        dateList.push({ date: new Date(currentDate), unixTime });
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    return dateList;
  };

  export const getMondayDateAndUnixTimeMap = (startDate: Date, endDate: Date): Map<number, Date> => {
    const dateMap: Map<number, Date> = new Map();
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);
  
    while (currentDate <= endDate) {
      if (currentDate.getDay() === 1) { // Check if it's Monday (0: Sunday, 1: Monday, ...)
        const unixTime = Math.floor(currentDate.getTime() / 1000); // Convert milliseconds to seconds
        dateMap.set(unixTime, new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    return dateMap;
  };
  

  export const createOwnerUnixTimeMapOld = (transactions: Transaction[]): Map<string, number> => {
    const ownerUnixTimeMap: Map<string, number> = new Map();
  
    transactions.forEach((transaction) => {
      const tags = transaction.node.tags;
      const owner = transaction.node.owner.address;
  
      if (tags.length >= 8) {
        const tag = tags[7]; // Use the tag at position 7
  
        if (tag.name === 'Unix-Time') {
          const unixTime = parseFloat(tag.value);
          if (!isNaN(unixTime) && !ownerUnixTimeMap.has(owner)) {
            ownerUnixTimeMap.set(owner, unixTime);
          }
        }
      }
    });
  
    return ownerUnixTimeMap;
  };

  export const createOwnerUnixTimeMap = (transactions: Transaction[]): Map<string, number> => {
    const ownerUnixTimeMap: Map<string, number> = new Map();
  
    transactions.forEach((transaction) => {
        const { block, owner } = transaction.node;
      
        if (block && block.timestamp && owner) { // avoid erros when there is no timestamp available
          const timestamp = block.timestamp;
          const address = owner.address;
      
          if (!isNaN(timestamp) && !ownerUnixTimeMap.has(address)) {
            ownerUnixTimeMap.set(address, timestamp);
          }
        }
        else {
            console.log(transaction);
        }
      });
      
    return ownerUnixTimeMap;
  };

  export const generateChartInfo = (categoriesTitle: string, yTitle: string, chartTitle: string, seriesTitle: string,  dates: DateInfo[], ownerUnixTimeMap: Map<string, number>): any => {
    
    const series = [{
      name: seriesTitle,
      data: dates.map((date) => {
        const addressesInRange = Array.from(ownerUnixTimeMap.values()).filter((unixTime) => {
          return unixTime >= date.unixTime && unixTime <= date.unixTime + (SECONDS_PER_WEEK);
        });
        return addressesInRange.length;
      }),
    }];

    const chartInfo = {
        categories: dates.map((date) => date.date.toLocaleString('en-US', { day: 'numeric', month: 'short' })), // Convert dates to ISO string format
        categoriesTitle: categoriesTitle,
        yTitle: yTitle,
        chartTitle: chartTitle,
        yMin: Math.min(...series[0].data),
        yMax: Math.max(...series[0].data),
      };
  
    return {
      series,
      chartInfo,
    };
  };



  export const createWeekTransactionsMap = (transactions: Transaction[], dateInfo: DateInfo[]): Map<number, Transaction[]> => {
    const weekUnixTransactionsMap: Map<number, Transaction[]> = new Map();
    
    dateInfo.forEach((week) => {
      weekUnixTransactionsMap.set(week.unixTime, []);
    });
  
    transactions.forEach((transaction) => {
      const { block, owner } = transaction.node;
  
      if (block && block.timestamp && owner) {
        const timestamp = block.timestamp;
        const week = findWeekByTimestamp(timestamp, dateInfo);
  
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

  export const createWeekNumberOfTransactionsMap = (
    transactions: Transaction[],
    dateInfo: DateInfo[]
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
        const week = findWeekByTimestamp(timestamp, dateInfo);
  
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
  
  
  
  const findWeekByTimestamp = (timestamp: number, dateInfo: DateInfo[]): DateInfo | undefined => {
    return dateInfo.find((week) => {
      const weekEndTimestamp = week.unixTime + (SECONDS_PER_WEEK);
      return timestamp >= week.unixTime && timestamp <= weekEndTimestamp;
    });
  };
  

  export const mapNumberTxsPerWeek = (weekUnixTransactionsMap: Map<number, Transaction[]>, threshold: number): Map<number, number> => {
    const distinctAddressCountMap: Map<number, number> = new Map();
    weekUnixTransactionsMap.forEach((transactions, weekTimestamp) => {
      const addressSet: Set<string> = new Set();
  
      transactions.forEach((transaction) => {
        const address = transaction.node.owner.address;
        addressSet.add(address);
      });
  
      const distinctAddressCount = Array.from(addressSet).filter((address) => {
        const addressTransactionCount = transactions.filter((transaction) => transaction.node.owner.address === address).length;
        return addressTransactionCount >= threshold;
      }).length;
  
      distinctAddressCountMap.set(weekTimestamp, distinctAddressCount);
    });
  
    return distinctAddressCountMap;
  };


  // aux functions
  export const extractOperatorRegistrationTx = (transactions: Transaction[]): OperatorTX[] => {
    const operatorTransactions: OperatorTX[] = [];
  
    transactions.forEach((transaction) => {
      const { block, tags } = transaction.node;
      const addressTag = tags.find((tag) => tag.name === TAG_NAMES.sequenceOwner);
      const scriptTx = tags.find((tag) => tag.name === TAG_NAMES.scriptTransaction);

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

  export const extractOperatorCancelTx = (transactions: Transaction[]): OperatorTX[] => {
    const operatorTransactions: OperatorTX[] = [];
  
    transactions.forEach((transaction) => {
        const { block, owner, tags } = transaction.node;
      const scriptTx = tags.find((tag) => tag.name === TAG_NAMES.scriptTransaction);
  
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
  ): any => {
    const transactionTypes = [
      { name: 'Inference Payment', transactions: inferenceTx },
      { name: 'Model Creation', transactions: modelCreationTx },
      { name: 'Script Creation', transactions: scriptCreationTx },
      { name: 'Operator Registration', transactions: operatorRegistrationTx },
    ];
  
    const series: { name: string; data: number[] }[] = [];
    const chartInfo = {
        categories: dateInfo.map((week) => week.date.toLocaleString('en-US', { day: 'numeric', month: 'short' })),
        chartTitle: chartTitle,
    }
  
    for (const type of transactionTypes) {
      const data: number[] = [];
      
      for (const week of dateInfo) {
        const weekStartTimestamp = week.unixTime;
        const weekEndTimestamp = week.unixTime + (SECONDS_PER_WEEK);
  
        const transactionsInWeek = type.transactions.filter((transaction) => {
          const timestamp = transaction.node.block?.timestamp;
          return timestamp && timestamp >= weekStartTimestamp && timestamp < weekEndTimestamp;
        });
  
        data.push(transactionsInWeek.length);
      }
  
      series.push({ name: type.name, data });
    }
  
    return { series, chartInfo };
  };
  

  export const operatorsPrepareData = (
    requestsTx: Transaction[],
    responsesTx: Transaction[],
    opRegistrationsTx: Transaction[],
    opCancelTx: Transaction[],
    dateInfo: DateInfo[],
  ): Map<number, number> => {
    const activeOperatorsMap: Map<number, number> = new Map();
    const registrationsOperatorTx = extractOperatorRegistrationTx(opRegistrationsTx);
    const cancelOperatorTx = extractOperatorCancelTx(opCancelTx);

    dateInfo.forEach((week) => {
      const weekTimeStamp = week.unixTime + (SECONDS_PER_WEEK); // Add one week duration
      const activeOperators = registrationsOperatorTx.filter((tx) => {
        const txTimeStamp = tx.unixTime;
        const cancelTx = cancelOperatorTx.find(
          (cancel) =>
            cancel.unixTime > txTimeStamp &&
            cancel.unixTime <= weekTimeStamp &&
            cancel.address === tx.address &&
            cancel.scriptTransaction === tx.scriptTransaction
        );
  
        // Check if there are requests made to the operator in the week
        const requestsToOperator = requestsTx.filter((request) => {
          const requestTimeStamp = request.node.block?.timestamp;
  
          // Check if the request has the operator address and script-transaction tags
          const hasOperatorAddress = request.node.tags.some((tag) => tag.name === 'Script-Operator' && tag.value === tx.address);
          const hasScriptTransaction = request.node.tags.some((tag) => tag.name === 'Script-Transaction' && tag.value === tx.scriptTransaction);
  
          return requestTimeStamp >= week.unixTime && requestTimeStamp <= weekTimeStamp && hasOperatorAddress && hasScriptTransaction;
        });
        // check answers
        const hasResponse = requestsToOperator.some((request) => {
            const requestId = request.node.id;
            return responsesTx.some((response) => response.node.tags.some((tag) => tag.name === 'Request-Transaction' && tag.value === requestId));
          });
        
        // Check if the operator registration is valid for the week
        return txTimeStamp <= weekTimeStamp && !cancelTx && (!requestsToOperator.length || hasResponse);
      });
  
      activeOperatorsMap.set(week.unixTime, activeOperators.length);
    });
  
    return activeOperatorsMap;
  };
  

  
  export const generateChartInfoCountsXPerWeek = (
    categoriesTitle: string,
    yTitle: string,
    chartTitle: string,
    seriesTitle: string,
    weekUnixTransactionsMap: Map<number, Transaction[]>,
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
      categories: Array.from(weekUnixTransactionsMap.keys()).map((unixTime) => unixToDateMap.get(unixTime)?.toLocaleString('en-US', { day: 'numeric', month: 'short' }) || ''),
      categoriesTitle: categoriesTitle,
      yTitle: yTitle,
      chartTitle: chartTitle,
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
      categories: Array.from(mapNumberTxsPerWeek.keys()).map((unixTime) =>
        unixToDateMap.get(unixTime)?.toLocaleString('en-US', { day: 'numeric', month: 'short' }) || ''
      ),
      categoriesTitle: categoriesTitle,
      yTitle: yTitle,
      chartTitle: chartTitle,
      yMin: Math.min(...series[0].data),
      yMax: Math.max(...series[0].data),
    };
  
    return {
      series,
      chartInfo,
    };
  };
  
  export const paymentsPrepareData = (
    mainTx: Transaction[],
    modelCreationTx: Transaction[],
    scriptCreationTx: Transaction[],
    operatorRegistrationTx: Transaction[],
    dateInfo: DateInfo[],
    chartTitle: string,
  ): any => {
    const transactionTypes = [
      { name: 'Inference Payment', transactions: mainTx, tagName: 'Inference-Transaction' },
      { name: 'Model Creation', transactions: modelCreationTx },
      { name: 'Script Creation', transactions: scriptCreationTx },
      { name: 'Operator Registration', transactions: operatorRegistrationTx },
    ];
  
    const series: { name: string; data: number[] }[] = [];
    const chartInfo = {
        categories: dateInfo.map((week) => week.date.toLocaleString('en-US', { day: 'numeric', month: 'short' })),
        chartTitle: chartTitle,
    }
    for (const type of transactionTypes) {
      const data: number[] = [];
  
      for (const week of dateInfo) {
        const weekStartTimestamp = week.unixTime;
        const weekEndTimestamp = week.unixTime + SECONDS_PER_WEEK;
  
        let uniqueTransactions: Set<string> = new Set();
  
        for (const transaction of type.transactions) {
          const timestamp = transaction.node.block?.timestamp;
          const tags = transaction.node.tags;
        
          if (timestamp && timestamp >= weekStartTimestamp && timestamp < weekEndTimestamp) {
            if (type.tagName) {
              const matchingTags = tags.filter((tag) => tag.name === type.tagName);
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
const createGenericTransactionMap = (transactions : Transaction[], tagToSearch: string): Map<string, string> => {
  const txMap: Map<string, string> = new Map();
  
  transactions.forEach((tx) => {
    const txID = tx.node?.id;

    if(txID && !txMap.has(txID)) {
      const tag = findTag(tx.node.tags,tagToSearch);
      if(tag) {
        txMap.set(txID,tag.value);
      }
    }

  });

  return txMap;
}

const createPaymentTxMap = (transactions : Transaction[], tagToSearch: string): Map<string, boolean> => {
  const txMap: Map<string, boolean> = new Map();

  transactions.forEach((tx) => {
    const tag = findTag(tx.node.tags,tagToSearch);
    if(tag && !txMap.has(tag.value)) {
      txMap.set(tag.value,true);
    }
  });

  return txMap;
}

export const modelsPerWeekPrepareData = (
  mainTx: Transaction[],
  modelCreationTx: Transaction[],
  scriptCreationTx: Transaction[],
  inferencePaymentTx: Transaction[],
  isToCalculateFailedPayments: boolean = false,
  dateInfo: DateInfo[],
  chartTitle: string,
): any => {
  const series: { name: string; data: number[] }[] = [];
  const chartInfo = {
      categories: dateInfo.map((week) => week.date.toLocaleString('en-US', { day: 'numeric', month: 'short' })),
      chartTitle: chartTitle,
  }
  const modelTxNameMap = createGenericTransactionMap(modelCreationTx,TAG_NAMES.modelName);
  const scriptTxModelTxMap = createGenericTransactionMap(scriptCreationTx,TAG_NAMES.modelTransaction);
  const inferenceTxMap = createPaymentTxMap(inferencePaymentTx,TAG_NAMES.inferenceTransaction);

  for (const [key, value] of modelTxNameMap) {
    const data: number[] = [];

    for (const week of dateInfo) {
      const weekStartTimestamp = week.unixTime;
      const weekEndTimestamp = week.unixTime + SECONDS_PER_WEEK;
      let numberOfRequests = 0;

      for (const transaction of mainTx) {
        const timestamp = transaction.node.block?.timestamp;
        const tags = transaction.node.tags;
        const txId = transaction.node.id;
      
        if (timestamp && timestamp >= weekStartTimestamp && timestamp < weekEndTimestamp) {
          const tag = findTag(tags,TAG_NAMES.scriptTransaction);
          if(tag && scriptTxModelTxMap.get(tag.value) === key && ((!isToCalculateFailedPayments && inferenceTxMap.has(txId)) || (isToCalculateFailedPayments && !inferenceTxMap.has(txId)) )) {
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