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
import { fetchAllTransactionsToKPICacheAPI } from "./queryAll";
import { ConfigurationContext } from "./context/configuration";
import {
  ChartData,
  ChartInfo,
  ChartInfoSimple,
  DateInfo,
  TransfersFromKPICache,
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
} from "./kpisFunctions_new";
import { Box } from "@mui/material";
import ColumnChart from "./ColumnChart";
import { getLabelByViewOption } from "./utils/util";
import { activeUsersDescription, usersPerXDescription } from "./commonVars";
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
  const { state: configState } = useContext(ConfigurationContext);
  const [transfers, setTransfers] = useState<TransfersFromKPICache[]>([]);
  const [mondays, setMondays] = useState<DateInfo[]>([]);
  const [mondaysMap, setMondaysMap] = useState<Map<number, Date>>();

  useEffect(() => {
    (async () => {
      const result: TransfersFromKPICache[] =
        await fetchAllTransactionsToKPICacheAPI();
      setTransfers(result);
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
    })();
  }, [transfers, mondays, configState]);

  return (
    <>
      <div className="w-[100vw] flex flex-wrap justify-center gap-10">
        {chartUPaymentsPerWeek && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartUPaymentsPerWeek.chartInfo}
              series={chartUPaymentsPerWeek.series}
              yAxisLabel="asd"
            />
          </div>
        )}

        {chartKpiAllUsers && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiAllUsers.chartInfo}
              series={chartKpiAllUsers.series}
              yAxisLabel="asd"
            />
          </div>
        )}

        {chartKpiNewUsersData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiNewUsersData.chartInfo}
              series={chartKpiNewUsersData.series}
              yAxisLabel="asd"
            />
          </div>
        )}

        {chartKpiActiveUsersData && (
          <div className="w-full max-w-[600px] p-3">
            <ColumnChart
              chartInfo={chartKpiActiveUsersData.chartInfo}
              series={chartKpiActiveUsersData.series}
              yAxisLabel="asd"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default Test;
