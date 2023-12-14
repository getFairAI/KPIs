import { useQuery } from "@apollo/client";
import { QUERY_TXS_WITH } from "./queries/queries";
import { OPERATOR_REGISTRATION_AR_FEE, TAG_NAMES, U_CONTRACT_ID, U_SUB_UNITS, VAULT_ADDRESS } from "./constants";
import { useContext, useEffect, useState } from "react";
import { commonUpdateQuery, findTag, getSecondsByViewOption } from "./utils/util";
import { ConfigurationContext } from "./context/configuration";
import { getMondayDateAndUnixTimeList } from "./kpisFunctions";
import { ChartData, ChartInfo, Tag, Transaction } from "./interfaces";
import { Box } from "@mui/material";
import LineChart from "./LineChart";

const OperatorsChart = () => {
  const operatorPaymentInputStr = JSON.stringify({
    function: 'transfer',
    target: VAULT_ADDRESS,
    qty: (parseFloat(OPERATOR_REGISTRATION_AR_FEE) * U_SUB_UNITS).toString(),
  });
  
  const operatorPaymentInputNumber = JSON.stringify({
    function: 'transfer',
    target: VAULT_ADDRESS,
    qty: parseFloat(OPERATOR_REGISTRATION_AR_FEE) * U_SUB_UNITS,
  });
  const OPERATOR_PAYMENT_TAGS = [
    { name: TAG_NAMES.operationName, values: [ 'Operator Registration' ] },
    { name: TAG_NAMES.contract, values: [U_CONTRACT_ID] },
    { name: TAG_NAMES.input, values: [operatorPaymentInputNumber, operatorPaymentInputStr] },
  ];

  const tags = [
    { name: 'Protocol-Name', values: [ 'Fair Protocol' ] },
    ...OPERATOR_PAYMENT_TAGS,
  ]

  const cancelTags = [
    { name: 'Protocol-Name', values: [ 'Fair Protocol' ] },
    { name: TAG_NAMES.operationName, values: [ 'Operator Cancellation' ] },
  ]
  const { state: configState } = useContext(ConfigurationContext);
  const [ chartData, setChartData ] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const { data, loading, error, fetchMore } = useQuery(QUERY_TXS_WITH, {
    variables: {
      tags,
      first: 100,
    },
    notifyOnNetworkStatusChange: true,
  });
  const { data: cancelData, loading: cancelLoading, fetchMore: cancelFetchMore } = useQuery(QUERY_TXS_WITH, {
    variables: {
      tags: cancelTags,
      first: 100,
    },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (data?.transactions?.pageInfo?.hasNextPage) {
      const after = data.transactions.edges[data.transactions.edges.length - 1].cursor;
      fetchMore({
        variables: {
          after,
        },
        updateQuery: commonUpdateQuery,
      })
    } else if (cancelData?.transactions?.pageInfo?.hasNextPage) {
      const after = cancelData.transactions.edges[cancelData.transactions.edges.length - 1].cursor;
      cancelFetchMore({
        variables: {
          after,
        },
        updateQuery: commonUpdateQuery,
      })
    } else if (data?.transactions?.edges && cancelData?.transactions?.edges) {
      const dates = getMondayDateAndUnixTimeList(configState.startDate, configState.endDate, configState.view)
      // parse data for chart
      const modelGroups = data.transactions.edges.reduce((acc: { [key: string]: Transaction[]}, curr: Transaction,) => {
        const scriptName = curr.node.tags.find((tag: Tag) => tag.name === TAG_NAMES.scriptName)?.value;

        if (scriptName && !acc[scriptName]) {
          acc[scriptName] = [ curr ];
        } else if (scriptName) {
          acc[scriptName].push(curr);
        }

        return acc;
      }, {});

      const series = /* Object.keys(modelGroups).map((scriptName) => { */
        [{
          name: 'Registrations',
          type: 'line',
          data: dates.map((date) => {
            const registrationsInRange = data.transactions.edges.filter((transaction: Transaction) => {
              // find cancellation
              const cancellation = cancelData.transactions.edges.find((cancelTransaction: Transaction) =>
                findTag(cancelTransaction.node.tags, 'Registration-Transaction')?.value === transaction.node.id);

              if (cancellation) {
                const cancellationTxTimestamp = parseInt(findTag(cancellation?.node.tags, 'Unix-Time')?.value ?? cancellation?.node.block.timestamp.toString());
                const txTimestamp = parseInt(findTag(transaction.node.tags, 'Unix-Time')?.value ?? transaction.node.block.timestamp.toString());
  
                return txTimestamp <= date.unixTime + (getSecondsByViewOption(configState.view)) && cancellationTxTimestamp > date.unixTime;
              } else {
                const txTimestamp = parseInt(findTag(transaction.node.tags, 'Unix-Time')?.value ?? transaction.node.block.timestamp.toString());
                return txTimestamp <= date.unixTime + (getSecondsByViewOption(configState.view));
              }
            });
            const ownerSet = new Set<string>(registrationsInRange.map((registration: Transaction) => findTag(registration.node.tags, 'Sequencer-Owner')?.value ?? ''));
            return ownerSet.size;
          }),
        }];

      const chartInfo = {
          categories: dates.map((date) => date.date.toLocaleString('en-US', { day: 'numeric', month: 'short' })), // Convert dates to ISO string format
          categoriesTitle: 'Week',
          yTitle: 'Unique Operators',
          chartTitle: 'Operators Count',
          series,
          yMin: 0,
          yMax: 10,
          stroke: {
            curve: 'smooth',
          },
        };
    
      setChartData({
        series,
        chartInfo,
      });
    }
  }, [ data, cancelData ]);

  if (loading) return <p>Loading...</p>;

  if (!chartData || error) return <p>Error loading data</p>;

  return <Box display={'flex'} justifyContent={'center'}>
    <LineChart
      chartInfo={chartData.chartInfo}
      series={chartData.series}
    />
  </Box>
};

export default OperatorsChart;