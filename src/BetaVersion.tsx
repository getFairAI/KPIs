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

import "./styles.css";
import { useState, useEffect, useContext } from "react";
import LineChart from "./LineChart";
import ColumnChart from "./ColumnChart";
import { TAG_NAMES, ACTIVE_USERS_PER_WEEK, USERS_PER_WEEK } from "./constants";
import CircularProgress from "@mui/material/CircularProgress";
import {
  getMondayDateAndUnixTimeList,
  createOwnerUnixTimeMap,
  generateChartInfo,
  createWeekTransactionsMap,
  mapNumberTxsPerWeek,
  generateChartInfoCountsXPerWeek,
  getMondayDateAndUnixTimeMap,
  createWeekNumberOfTransactionsMap,
  operatorsPrepareData,
  generateChartInfoTxsPerWeek,
  paymentsPrepareData,
  modelsPerWeekPrepareData,
  AmountUTokenPaymentsPrepareData,
  calculateRetentionRateWithChartFormat,
  createWeekNumberOfUsersAccMap,
} from "./kpisFunctions";
import {
  fetchAllTransactions,
  fetchAllTransactionsToKPICacheAPI,
} from "./queryAll";
import {
  filterTransactionsIncludeTagNamesAndExcludeTags,
  getLabelByViewOption,
  getUPriceInUSD,
} from "./utils/util";
import {
  fairWallets,
  usersPerXDescription,
  activeUsersDescription,
  failedPaymentDescription,
  newScriptsDescription,
  retentionRateDescription,
  newModelsDescription,
  activeOperatorsDescription,
  paymentsDescription,
  subTitle,
} from "./commonVars";
import {
  tagsKpiUsers,
  tagsKpiUploadModels,
  tagsKpiUploadScripts,
  tagsKpiOperatorsRegistration,
  tagsToExclude,
  tagsToExcludeForModels,
  tagsKpiInferenceResponse,
  tagsKpiInferenceResponseNFTS,
  tagsKpiOperatorCancel,
  tagsKpiInferencePayment,
  tagsKpiSciptPayment,
  tagsKpiModelCreationPayment,
  uniqueWalletsAlpha,
} from "./betaCommonVars";
import { ChartData, ChartInfo, ChartInfoSimple } from "./interfaces";
import { ConfigurationContext } from "./context/configuration";
import { Backdrop, Box, Grid, Typography } from "@mui/material";

function Beta() {
  const { state: configState } = useContext(ConfigurationContext);
  const [isLoading, setLoading] = useState(true);
  const [chartKpiNewUsersData, setChartKpiNewUsersData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiActiveUsersData, setChartKpiActiveUsersData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiUsersData, setChartKpiUsersData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartModelsUsedPerWeek, setChartKpiModelsUsedPerWeekData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfoSimple;
  } | null>(null);
  const [
    chartFailedPaymentsModelsPerWeek,
    setChartKpiFailedPaymentsModelsPerWeekData,
  ] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(
    null
  );
  const [chartUPaymentsPerWeek, setChartUPaymentsPerWeek] = useState<{
    series: ChartData[];
    chartInfo: ChartInfoSimple;
  } | null>(null);
  const [chartKpiRetentionWeekAcc, setChartKpiRetentionWeekAcc] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);

  // extra charts
  const [chartKpiPaymentsData, setChartKpiPaymentsData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfoSimple;
  } | null>(null);
  const [chartKpiNewModelsData, setChartKpiNewModelsData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiNewScriptsData, setChartKpiNewScriptsData] = useState<{
    series: ChartData[];
    chartInfo: ChartInfo;
  } | null>(null);
  const [chartKpiActiveOperatorsData, setChartKpiActiveOperatorsData] =
    useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labelTime = getLabelByViewOption(configState.view);
        // TIME
        const mondays = getMondayDateAndUnixTimeList(
          configState.startDate,
          configState.endDate,
          configState.view
        );
        const mondaysMap = getMondayDateAndUnixTimeMap(
          configState.startDate,
          configState.endDate,
          configState.view
        );

        // requests
        const requestsInferenceTransactionsRaw =
          await fetchAllTransactionsToKPICacheAPI();
        // const requestsInferenceTransactionsFiltered =
        //   filterTransactionsIncludeTagNamesAndExcludeTags(
        //     requestsInferenceTransactionsRaw,
        //     [TAG_NAMES.appVersion],
        //     fairWallets,
        //     tagsToExclude
        //   );
        const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(
          requestsInferenceTransactionsRaw,
          uniqueWalletsAlpha
        );

        const mapTxByWeekActiveUsers = createWeekTransactionsMap(
          requestsInferenceTransactionsFiltered,
          mondays,
          configState.view
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
          mondaysMap
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

        setChartKpiActiveUsersData(kpiActiveUsersPerWeek);

        // Users per week (at least one prompt)
        const mapWeekCountXUsersPerWeek = mapNumberTxsPerWeek(
          mapTxByWeekActiveUsers,
          USERS_PER_WEEK
        );
        const kpiUsersPerWeek = generateChartInfoCountsXPerWeek(
          labelTime,
          "Users",
          `Users Per ${labelTime}`,
          usersPerXDescription,
          `Users in this ${labelTime}`,
          mapTxByWeekActiveUsers,
          mapWeekCountXUsersPerWeek,
          mondaysMap
        );
        setChartKpiUsersData(kpiUsersPerWeek);

        // Payments

        const inferencePaymentTransactionsRaw = await fetchAllTransactions(
          tagsKpiInferencePayment
        );
        const inferencePaymentTransactionsFiltered =
          filterTransactionsIncludeTagNamesAndExcludeTags(
            inferencePaymentTransactionsRaw,
            [TAG_NAMES.appVersion],
            fairWallets,
            tagsToExclude
          );
        const scriptPaymentTransactionsRaw = await fetchAllTransactions(
          tagsKpiSciptPayment
        );
        const scriptPaymentTransactionsFiltered =
          filterTransactionsIncludeTagNamesAndExcludeTags(
            scriptPaymentTransactionsRaw,
            [TAG_NAMES.appVersion],
            fairWallets,
            tagsToExclude
          );

        const modelCreationPaymentTransactionsRaw = await fetchAllTransactions(
          tagsKpiModelCreationPayment
        );
        const modelCreationTransactionsFiltered =
          filterTransactionsIncludeTagNamesAndExcludeTags(
            modelCreationPaymentTransactionsRaw,
            [TAG_NAMES.appVersion],
            fairWallets,
            tagsToExclude
          );

        // this queries will be used for other charts besides of the ExtraCharts, so they are here
        // operators
        const activeOperatorsTransactionsRaw = await fetchAllTransactions(
          tagsKpiOperatorsRegistration
        );
        const activeOperatorsTransactionsFiltered =
          filterTransactionsIncludeTagNamesAndExcludeTags(
            activeOperatorsTransactionsRaw,
            [TAG_NAMES.appVersion],
            fairWallets,
            tagsToExclude
          );
        const uploadModelsTransactionsRaw = await fetchAllTransactions(
          tagsKpiUploadModels
        );
        const uploadScriptsransactionsRaw = await fetchAllTransactions(
          tagsKpiUploadScripts
        );

        // retention rate
        const mapNewUsersAccPerWeek = createWeekNumberOfUsersAccMap(
          mapTxByWeekActiveUsers
        );
        setChartKpiRetentionWeekAcc(
          calculateRetentionRateWithChartFormat(
            mapNewUsersAccPerWeek,
            kpiUsersPerWeek.series,
            kpiUsersPerWeek.chartInfo.categories,
            `Retention Rate ${labelTime} By ${labelTime} - Acc`,
            retentionRateDescription,
            false
          )
        );

        //models per week
        const uploadModelsTransactionsFilteredExtended =
          filterTransactionsIncludeTagNamesAndExcludeTags(
            uploadModelsTransactionsRaw,
            [TAG_NAMES.appVersion],
            [],
            [...tagsToExclude, ...tagsToExcludeForModels]
          );
        const uploadScriptTransactionsFilteredExtended =
          filterTransactionsIncludeTagNamesAndExcludeTags(
            uploadScriptsransactionsRaw,
            [TAG_NAMES.appVersion],
            [],
            tagsToExclude
          );
        setChartKpiModelsUsedPerWeekData(
          modelsPerWeekPrepareData(
            requestsInferenceTransactionsFiltered,
            uploadModelsTransactionsFilteredExtended,
            uploadScriptTransactionsFilteredExtended,
            inferencePaymentTransactionsFiltered,
            mondays,
            `Models Used Per ${labelTime}`,
            paymentsDescription,
            configState.view,
            false
          )
        );

        // U per week
        const allPayments = [
          ...inferencePaymentTransactionsFiltered,
          ...modelCreationTransactionsFiltered,
          ...scriptPaymentTransactionsFiltered,
          ...activeOperatorsTransactionsFiltered,
        ];
        const uPrice = await getUPriceInUSD();
        const revenueSubtitle = `Current $U Price: $${uPrice.toFixed(
          2
        )} USD (Source: https://app.redstone.finance/#/app/token/U`;
        setChartUPaymentsPerWeek(
          AmountUTokenPaymentsPrepareData(
            allPayments,
            mondays,
            `$U per ${labelTime}`,
            revenueSubtitle,
            configState.view,
            configState.walletsContent,
            uPrice
          )
        );

        if (configState.isExtraEnabled) {
          // KPI Payments

          setChartKpiPaymentsData(
            paymentsPrepareData(
              inferencePaymentTransactionsFiltered,
              modelCreationTransactionsFiltered,
              scriptPaymentTransactionsFiltered,
              activeOperatorsTransactionsFiltered,
              mondays,
              `Payments Per ${labelTime}`,
              paymentsDescription,
              configState.view
            )
          );

          // KPI NEW MODELS
          const uploadModelsTransactionsFiltered =
            filterTransactionsIncludeTagNamesAndExcludeTags(
              uploadModelsTransactionsRaw,
              [TAG_NAMES.appVersion],
              fairWallets,
              tagsToExclude
            );
          const mapTxByWeekNewModels = createWeekNumberOfTransactionsMap(
            uploadModelsTransactionsFiltered,
            mondays,
            configState.view
          );
          setChartKpiNewModelsData(
            generateChartInfoTxsPerWeek(
              labelTime,
              `new models per ${labelTime}`,
              `New Models Per ${labelTime}`,
              newModelsDescription,
              `New models this ${labelTime}`,
              mapTxByWeekNewModels,
              mondaysMap
            )
          );

          // KPI NEW SCRIPTS

          const uploadScriptsTransactionsFiltered =
            filterTransactionsIncludeTagNamesAndExcludeTags(
              uploadScriptsransactionsRaw,
              [TAG_NAMES.appVersion],
              fairWallets,
              tagsToExclude
            );
          const mapTxByWeekNewScripts = createWeekNumberOfTransactionsMap(
            uploadScriptsTransactionsFiltered,
            mondays,
            configState.view
          );
          setChartKpiNewScriptsData(
            generateChartInfoTxsPerWeek(
              labelTime,
              `new scripts per ${labelTime}`,
              `New Scripts Per ${labelTime}`,
              newScriptsDescription,
              `New scripts this ${labelTime}`,
              mapTxByWeekNewScripts,
              mondaysMap
            )
          );

          // KPI ACTIVE OPERATORS

          const cancelOperatorsTransactionsRaw = await fetchAllTransactions(
            tagsKpiOperatorCancel
          );
          const cancelOperatorsTransactionsFiltered =
            filterTransactionsIncludeTagNamesAndExcludeTags(
              cancelOperatorsTransactionsRaw,
              [TAG_NAMES.appVersion],
              fairWallets,
              tagsToExclude
            );

          // before using NFTs
          const responseInferenceTransactionsRaw = await fetchAllTransactions(
            tagsKpiInferenceResponse
          );
          const responseInferenceTransactionsFiltered =
            filterTransactionsIncludeTagNamesAndExcludeTags(
              responseInferenceTransactionsRaw,
              [TAG_NAMES.appVersion],
              fairWallets,
              tagsToExclude
            );
          // responses as NFTs
          const responseNFTInferenceTransactionsRaw =
            await fetchAllTransactions(tagsKpiInferenceResponseNFTS);
          const responseNFTInferenceTransactionsFiltered =
            filterTransactionsIncludeTagNamesAndExcludeTags(
              responseNFTInferenceTransactionsRaw,
              [TAG_NAMES.appVersion],
              fairWallets,
              tagsToExclude
            );

          //join both queries
          const combinedInferenceFilteredTransactions = [
            ...responseInferenceTransactionsFiltered,
            ...responseNFTInferenceTransactionsFiltered,
          ];
          const mapTxActiveOperatorsByWeek = operatorsPrepareData(
            requestsInferenceTransactionsFiltered,
            combinedInferenceFilteredTransactions,
            activeOperatorsTransactionsFiltered,
            cancelOperatorsTransactionsFiltered,
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
              mondaysMap
            )
          );

          // failed payments per week
          setChartKpiFailedPaymentsModelsPerWeekData(
            modelsPerWeekPrepareData(
              requestsInferenceTransactionsFiltered,
              uploadModelsTransactionsFilteredExtended,
              uploadScriptTransactionsFilteredExtended,
              inferencePaymentTransactionsFiltered,
              mondays,
              `Failed Payments Per ${labelTime} By Model`,
              failedPaymentDescription,
              configState.view,
              true
            )
          );
        }

        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    if (configState.startDate && configState.endDate) {
      // console.log(configState);
      fetchData();
    }
  }, [configState]);

  /**
   * This useEffect is used to add a link to the subtitle of the u payments chart
   * It will run on every render, but it will only change the subtitle once
   */
  useEffect(() => {
    const uChartSubtitle = document.querySelectorAll(
      ".apexcharts-subtitle-text"
    )[2];
    if (uChartSubtitle && uChartSubtitle.innerHTML.includes("(Source:")) {
      const [text, link] = uChartSubtitle.innerHTML.split("(Source:");
      uChartSubtitle.innerHTML = `${text} <a href=${link} target="_blank" style="TEXT-DECORATION: underline">(source)</a>`;
    }
  });

  return (
    <div className="App">
      <div className="title">
        <h1 style={{ display: "inline-block", verticalAlign: "middle" }}>
          KPIs - Beta
        </h1>
        <h3
          style={{
            display: "inline-block",
            verticalAlign: "middle",
            marginLeft: "10px",
          }}
        >
          (2023-09-17 until now)
        </h3>
        <h4 style={{ marginTop: "10px", marginBottom: "20px" }}>
          {" "}
          {subTitle}{" "}
        </h4>
      </div>
      {isLoading && (
        <Backdrop
          sx={{
            position: "absolute",
            backdropFilter: "blur(50px)",
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            justifyContent: "center",
          }}
          open={true}
        >
          <CircularProgress size={100} />
          <Typography
            variant="h2"
            fontWeight={500}
            ml={"32px"}
            mr={"32px"}
            textAlign={"center"}
            width={"60%"}
          >
            {" "}
            The Website is loading and processing multiple transactions. This
            operation usually takes around 3 minutes. Please be patient...
          </Typography>
        </Backdrop>
      )}
      <Grid container spacing={2}>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiNewUsersData && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiNewUsersData.chartInfo}
                series={chartKpiNewUsersData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartModelsUsedPerWeek && (
            <Box display={"flex"} justifyContent={"center"}>
              <ColumnChart
                chartInfo={chartModelsUsedPerWeek.chartInfo}
                series={chartModelsUsedPerWeek.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartUPaymentsPerWeek && (
            <Box display={"flex"} justifyContent={"center"}>
              <ColumnChart
                chartInfo={chartUPaymentsPerWeek.chartInfo}
                series={chartUPaymentsPerWeek.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiActiveUsersData && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiActiveUsersData.chartInfo}
                series={chartKpiActiveUsersData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiUsersData && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiUsersData.chartInfo}
                series={chartKpiUsersData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiRetentionWeekAcc && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiRetentionWeekAcc.chartInfo}
                series={chartKpiRetentionWeekAcc.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiPaymentsData && (
            <Box display={"flex"} justifyContent={"center"}>
              <ColumnChart
                chartInfo={chartKpiPaymentsData.chartInfo}
                series={chartKpiPaymentsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiNewModelsData && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiNewModelsData.chartInfo}
                series={chartKpiNewModelsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiNewScriptsData && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiNewScriptsData.chartInfo}
                series={chartKpiNewScriptsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiActiveOperatorsData && (
            <Box display={"flex"} justifyContent={"center"}>
              <LineChart
                chartInfo={chartKpiActiveOperatorsData.chartInfo}
                series={chartKpiActiveOperatorsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartFailedPaymentsModelsPerWeek && (
            <Box display={"flex"} justifyContent={"center"}>
              <ColumnChart
                chartInfo={chartFailedPaymentsModelsPerWeek.chartInfo}
                series={chartFailedPaymentsModelsPerWeek.series}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default Beta;
