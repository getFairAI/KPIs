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
  ChartInfoSimple,
  DateInfo,
  TransfersFromKPICache,
} from "./interfaces";
import {
  AmountUTokenPaymentsPrepareData,
  getMondayDateAndUnixTimeList,
} from "./kpisFunctions_new";
import { Box } from "@mui/material";
import ColumnChart from "./ColumnChart";

function Test() {
  const [chartUPaymentsPerWeek, setChartUPaymentsPerWeek] = useState<{
    series: ChartData[];
    chartInfo: ChartInfoSimple;
  } | null>(null);
  const { state: configState } = useContext(ConfigurationContext);
  const [transfers, setTransfers] = useState([]);
  const [mondays, setMondays] = useState<DateInfo[]>([]);

  useEffect(() => {
    (async () => {
      const result = await fetchAllTransactionsToKPICacheAPI();
      setTransfers(result);
    })();
  }, []);

  useEffect(() => {
    const resultMondays = getMondayDateAndUnixTimeList(
      configState.startDate,
      configState.endDate,
      configState.view
    );

    setMondays(resultMondays);
  }, [configState]);

  useEffect(() => {
    (async () => {
      const transfersPerWeek = await AmountUTokenPaymentsPrepareData(
        transfers,
        mondays,
        "whatever title",
        "asdasd",
        configState.view,
        ""
      );

      setChartUPaymentsPerWeek(transfersPerWeek);
    })();
  }, [transfers, mondays, configState]);

  return (
    <>
      {chartUPaymentsPerWeek && (
        <Box display={"flex"} justifyContent={"center"}>
          <ColumnChart
            chartInfo={chartUPaymentsPerWeek.chartInfo}
            series={chartUPaymentsPerWeek.series}
          />
        </Box>
      )}
    </>
  );
}

export default Test;
