/*
 * Fair Protocol - KPIs
 * Copyright (C) 2024 Fair Protocol
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

import { useContext, useEffect, useState } from "react";
import {
  fetchAllTransactionsBetweenDates,
  fetchAllValidActiveOperators,
  fetchAllValidActiveSolutions,
  fetchTotalRevenueByDateInterval,
  fetchSolutionRequestsByDateInterval,
} from "./queryAll";
import { ConfigurationContext } from "./context/configuration";
import {
  ChartData,
  ChartInfo,
  ChartInfoSimple,
  DateInfo,
  marketplaceRevenuePieChartDataEntry,
  solutionRequestsFromKPICache,
  solutionsFromKPICache,
  TransfersFromKPICache,
  validOperatorsFromKPICache,
} from "./interfaces";
import {
  AmountUTokenPaymentsPrepareData,
  getMondayDateAndUnixTimeList,
  createWeekTransactionsMap,
  generateChartInfoCountsXPerWeek,
  mapNumberTxsPerWeek,
  getMondayDateAndUnixTimeMap,
  generateChartInfo,
  createOwnerUnixTimeMap,
  operatorsPrepareData,
  generateChartInfoTxsPerWeek,
  newSolutionsPerWeek,
  generatePieChart,
  solutionRequestsPerWeek,
} from "./kpisFunctions_new";
import { Box } from "@mui/material";
import ColumnChart from "./ColumnChart";
import { getLabelByViewOption } from "./utils/util";
import {
  activeOperatorsDescription,
  activeUsersDescription,
  usersPerXDescription,
} from "./commonVars";
import { ACTIVE_USERS_PER_WEEK, USERS_PER_WEEK } from "./constants";
import { uniqueWalletsAlpha } from "./betaCommonVars";

function Test() {
  const [chartUPaymentsPerWeek, setChartUPaymentsPerWeek] = useState<{
    series: ChartData[];
    chartInfo: ChartInfoSimple;
  } | null>(null);
  const [chartKpiAllUsers, setChartKpiAllUsers] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiNewUsersData, setChartKpiNewUsersData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiActiveUsersData, setChartKpiActiveUsersData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiActiveOperatorsData, setChartKpiActiveOperatorsData] =
    useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartSolutionsData, setChartSolutionsData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartSolutionRequestsData, setChartSolutionRequestsData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);

  // pie charts
  const [pieChartRevenue, setPieChartRevenue] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);

  const [transfers, setTransfers] = useState<TransfersFromKPICache[]>([]);
  const [operators, setOperators] = useState<validOperatorsFromKPICache[]>([]);
  const [solutions, setSolutions] = useState<solutionsFromKPICache[]>([]);
  const [solutionRequests, setSolutionRequests] = useState<
    solutionRequestsFromKPICache[]
  >([]);
  const [revenuesArray, setRevenue] = useState<
    marketplaceRevenuePieChartDataEntry[]
  >([]);

  const { state: configState } = useContext(ConfigurationContext);
  const [mondays, setMondays] = useState<DateInfo[]>([]);
  const [mondaysMap, setMondaysMap] = useState<Map<number, Date>>();

  // get all async data from api
  useEffect(() => {
    (async () => {
      const result: TransfersFromKPICache[] =
        await fetchAllTransactionsBetweenDates(
          configState.startDate.getTime(),
          configState.endDate.getTime()
        );
      setTransfers(result);
    })();

    (async () => {
      const result: solutionRequestsFromKPICache[] =
        await fetchSolutionRequestsByDateInterval(
          configState.startDate.getTime(),
          configState.endDate.getTime()
        );
      setSolutionRequests(result);
    })();

    (async () => {
      const result: marketplaceRevenuePieChartDataEntry[] =
        await fetchTotalRevenueByDateInterval(
          configState.startDate.getTime(),
          configState.endDate.getTime()
        );
      setRevenue(result);
    })();
  }, [configState]);

  // get all from api
  useEffect(() => {
    (async () => {
      const result: solutionsFromKPICache[] =
        await fetchAllValidActiveSolutions();
      setSolutions(result);
    })();

    (async () => {
      const result: validOperatorsFromKPICache[] =
        await fetchAllValidActiveOperators();
      setOperators(result);
    })();
  }, []);

  useEffect(() => {
    const resultMondays = getMondayDateAndUnixTimeList(
      configState.startDate,
      configState.endDate,
      configState.view
    );

    const resultMondaysMap = getMondayDateAndUnixTimeMap(
      configState.startDate,
      configState.endDate,
      configState.view
    );

    setMondays(resultMondays);
    setMondaysMap(resultMondaysMap);
  }, [configState]);

  // update graphs with new data
  useEffect(() => {
    (async () => {
      const labelTime = getLabelByViewOption(configState.view);

      // transfers/payments
      const transfersPerWeek = await AmountUTokenPaymentsPrepareData(
        transfers,
        mondays,
        `Total Payments Per ${labelTime}`,
        "Total amount spent, in USD",
        configState.view,
        ""
      );

      setChartUPaymentsPerWeek(transfersPerWeek);

      // Users per week (at least one prompt)
      const mapTxByWeekActiveUsers = createWeekTransactionsMap(
        transfers,
        mondays,
        configState.view
      );

      const mapWeekCountXUsersPerWeek = mapNumberTxsPerWeek(
        mapTxByWeekActiveUsers,
        USERS_PER_WEEK
      );

      const mapWeekCountXActiveUsers = mapNumberTxsPerWeek(
        mapTxByWeekActiveUsers,
        ACTIVE_USERS_PER_WEEK
      );

      const kpiActiveUsersPerWeek = generateChartInfoCountsXPerWeek(
        labelTime,
        "Active users",
        `Active Users Per ${labelTime}`,
        activeUsersDescription,
        `Active users in this ${labelTime}`,
        mapTxByWeekActiveUsers,
        mapWeekCountXActiveUsers,
        mondaysMap!
      );
      setChartKpiActiveUsersData(kpiActiveUsersPerWeek);

      // new users ==============
      const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(
        transfers,
        uniqueWalletsAlpha
      );

      const kpiNewUsersPerWeek = generateChartInfo(
        labelTime,
        "New users",
        `New Users Per ${labelTime}`,
        "Users who made their first transaction in this period. Alpha phase users excluded.",
        `Users in ${labelTime}`,
        mondays,
        uniqueOwnersScriptPayment,
        configState.view
      );

      setChartKpiNewUsersData(kpiNewUsersPerWeek);

      // total users ==============

      const kpiUsersPerWeek = generateChartInfoCountsXPerWeek(
        labelTime,
        "Users",
        `Total Users Per ${labelTime}`,
        usersPerXDescription,
        `Users in this ${labelTime}`,
        mapTxByWeekActiveUsers,
        mapWeekCountXUsersPerWeek,
        mondaysMap!
      );
      setChartKpiAllUsers(kpiUsersPerWeek);

      // active operators
      const mapTxActiveOperatorsByWeek = operatorsPrepareData(
        transfers,
        operators,
        mondays,
        configState.view
      );
      setChartKpiActiveOperatorsData(
        generateChartInfoTxsPerWeek(
          labelTime,
          `active operators per ${labelTime}`,
          `Active Operators Per ${labelTime}`,
          activeOperatorsDescription,
          `active operators this ${labelTime}`,
          mapTxActiveOperatorsByWeek,
          mondaysMap!
        )
      );

      // solutions =========
      const mapSolutionsByWeek = newSolutionsPerWeek(
        solutions,
        mondays,
        configState.view
      );
      setChartSolutionsData(
        generateChartInfoTxsPerWeek(
          labelTime,
          `new solutions per ${labelTime}`,
          `New Solutions Per ${labelTime}`,
          "Newly created solutions.",
          `new solutions this ${labelTime}`,
          mapSolutionsByWeek,
          mondaysMap!
        )
      );

      // solutions requests =========
      const mapSolutionsRequestsByWeek = solutionRequestsPerWeek(
        solutionRequests,
        mondays,
        configState.view
      );
      setChartSolutionRequestsData(
        generateChartInfoTxsPerWeek(
          labelTime,
          `solution requests per ${labelTime}`,
          `Solution Requests Per ${labelTime}`,
          "",
          `solution requests this ${labelTime}`,
          mapSolutionsRequestsByWeek,
          mondaysMap!
        )
      );

      // revenue ==============
      setPieChartRevenue(
        generatePieChart(
          `New Solutions Per ${labelTime}`,
          "Newly created solutions.",
          `new solutions this ${labelTime}`,
          revenuesArray
        )
      );
    })();
  }, [transfers, mondays, configState]);

  return (
    <>
      <div className="w-full flex justify-center py-5 pb-10">
        <h1 style={{ fontSize: "20px" }}>
          <strong>
            Data visualization from {configState.startDate.toLocaleDateString()}{" "}
            to {configState.endDate.toLocaleDateString()}
          </strong>
          <span className="ml-1 text-sm"> (dd/mm/yyyy)</span>
        </h1>
      </div>

      <div className="w-[100vw] flex flex-wrap justify-center gap-10">
        {chartUPaymentsPerWeek && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartUPaymentsPerWeek.chartInfo}
              series={chartUPaymentsPerWeek.series}
              xAxisLabel="Time"
              yAxisLabel="Amount Spent ($)"
            />
          </div>
        )}

        {chartKpiAllUsers && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiAllUsers.chartInfo}
              series={chartKpiAllUsers.series}
              xAxisLabel="Time"
              yAxisLabel="Total Users"
            />
          </div>
        )}

        {chartKpiNewUsersData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiNewUsersData.chartInfo}
              series={chartKpiNewUsersData.series}
              xAxisLabel="Time"
              yAxisLabel="New Users"
            />
          </div>
        )}

        {chartKpiActiveUsersData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiActiveUsersData.chartInfo}
              series={chartKpiActiveUsersData.series}
              xAxisLabel="Time"
              yAxisLabel="Active Users"
            />
          </div>
        )}

        {chartKpiActiveOperatorsData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiActiveOperatorsData.chartInfo}
              series={chartKpiActiveOperatorsData.series}
              xAxisLabel="Time"
              yAxisLabel="Active Operators"
            />
          </div>
        )}

        {chartSolutionsData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartSolutionsData.chartInfo}
              series={chartSolutionsData.series}
              xAxisLabel="Time"
              yAxisLabel="New Solutions"
            />
          </div>
        )}

        {chartSolutionRequestsData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartSolutionRequestsData.chartInfo}
              series={chartSolutionRequestsData.series}
              xAxisLabel="Time"
              yAxisLabel="New Solutions"
            />
          </div>
        )}
      </div>

      <div className="w-full flex justify-center flex-wrap mt-5">
        {pieChartRevenue && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={pieChartRevenue.chartInfo}
              series={pieChartRevenue.series}
              xAxisLabel="Time"
              yAxisLabel="New Solutions"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Test;
