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

import './styles.css';
import { useState, useEffect, useContext } from 'react';
import LineChart from './LineChart';
import ColumnChart from './ColumnChart';
import { TAG_NAMES, ACTIVE_USERS_PER_WEEK, USERS_PER_WEEK } from './constants';
import CircularProgress from '@mui/material/CircularProgress';
import { getMondayDateAndUnixTimeList,
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
  createWeekNumberOfUsersAccMap} from './kpisFunctions'
import { fetchAllTransactions } from './queryAll';
import { filterTransactionsIncludeTagNamesAndExcludeTags, getLabelByViewOption } from './utils/util'
import { fairWallets } from './commonVars'
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
} from './alphaCommonVars'
import { ChartData, ChartInfo, ChartInfoSimple } from './interfaces';
import { ConfigurationContext } from './context/configuration';
import { Box, Grid } from '@mui/material';


function Alpha() {
  const { state: configState } = useContext(ConfigurationContext); 
  const [isLoading, setLoading] = useState(true); 
  const [chartKpiNewUsersData, setChartKpiNewUsersData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiActiveUsersData, setChartKpiActiveUsersData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiUsersData, setChartKpiUsersData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartModelsUsedPerWeek,setChartKpiModelsUsedPerWeekData] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);
  const [chartFailedPaymentsModelsPerWeek,setChartKpiFailedPaymentsModelsPerWeekData] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);
  const [chartUPaymentsPerWeek, setChartUPaymentsPerWeek] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);
  const [chartKpiRetentionWeekAcc, setChartKpiRetentionWeekAcc] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);

  // extra charts
  const [chartKpiPaymentsData, setChartKpiPaymentsData] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);
  const [chartKpiNewModelsData, setChartKpiNewModelsData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiNewScriptsData, setChartKpiNewScriptsData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiActiveOperatorsData, setChartKpiActiveOperatorsData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const labelTime = getLabelByViewOption(configState.view);
        // TIME 
        const mondays = getMondayDateAndUnixTimeList(configState.startDate, configState.endDate, configState.view);
        const mondaysMap = getMondayDateAndUnixTimeMap(configState.startDate, configState.endDate, configState.view);

        // requests
        const requestsInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiUsers);
        const requestsInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(requestsInferenceTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude)
        const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(requestsInferenceTransactionsFiltered);
        

        
        const mapTxByWeekActiveUsers = createWeekTransactionsMap(requestsInferenceTransactionsFiltered,mondays,configState.view);
        const mapWeekCountXActiveUsers = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,ACTIVE_USERS_PER_WEEK);

        
        const kpiActiveUsersPerWeek = generateChartInfoCountsXPerWeek(labelTime, 'Active users', `Active users ${labelTime}`, `Active users in this ${labelTime}`,mapTxByWeekActiveUsers,mapWeekCountXActiveUsers,mondaysMap);
        const kpiNewUsersPerWeek = generateChartInfo(labelTime, 'New users', `New users per ${labelTime}`, `Users in this ${labelTime}`, mondays, uniqueOwnersScriptPayment,configState.view);
        setChartKpiNewUsersData(kpiNewUsersPerWeek);

        setChartKpiActiveUsersData(kpiActiveUsersPerWeek);

        // Users per week (at least one prompt)
        const mapWeekCountXUsersPerWeek = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,USERS_PER_WEEK);
        const kpiUsersPerWeek = generateChartInfoCountsXPerWeek(labelTime, 'Users', `Users per ${labelTime}`, `Users in this ${labelTime}`,mapTxByWeekActiveUsers,mapWeekCountXUsersPerWeek,mondaysMap);
        setChartKpiUsersData(kpiUsersPerWeek);

        // Payments
     
      const inferencePaymentTransactionsRaw = await fetchAllTransactions(tagsKpiInferencePayment);
      const inferencePaymentTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(inferencePaymentTransactionsRaw, [TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
      const scriptPaymentTransactionsRaw = await fetchAllTransactions(tagsKpiSciptPayment);
      const scriptPaymentTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(scriptPaymentTransactionsRaw, [TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);

      const modelCreationPaymentTransactionsRaw = await fetchAllTransactions(tagsKpiModelCreationPayment); 
      const modelCreationTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(modelCreationPaymentTransactionsRaw, [TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);

        // this queries will be used for other charts besides of the ExtraCharts, so they are here
        // operators
        const activeOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorsRegistration);
        const activeOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(activeOperatorsTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        const uploadModelsTransactionsRaw = await fetchAllTransactions(tagsKpiUploadModels);
        const uploadScriptsransactionsRaw = await fetchAllTransactions(tagsKpiUploadScripts);

        // retention rate
        const mapNewUsersAccPerWeek = createWeekNumberOfUsersAccMap(mapTxByWeekActiveUsers);
        setChartKpiRetentionWeekAcc(calculateRetentionRateWithChartFormat(mapNewUsersAccPerWeek,kpiUsersPerWeek.series,kpiUsersPerWeek.chartInfo.categories, `Retention rate ${labelTime} by ${labelTime} - Acc`,false));

      if(configState.isExtraEnabled) {
      
        // KPI Payments

        setChartKpiPaymentsData(paymentsPrepareData(inferencePaymentTransactionsFiltered, modelCreationTransactionsFiltered, scriptPaymentTransactionsFiltered,activeOperatorsTransactionsFiltered,mondays, `Payments per ${labelTime}`, configState.view));


        // KPI NEW MODELS
        const uploadModelsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewModels = createWeekNumberOfTransactionsMap(uploadModelsTransactionsFiltered,mondays, configState.view);
        setChartKpiNewModelsData(generateChartInfoTxsPerWeek(labelTime, `new models per${labelTime}`, `New models per ${labelTime}`, `New models this ${labelTime}`,mapTxByWeekNewModels,mondaysMap));


        // KPI NEW SCRIPTS 
        
        const uploadScriptsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewScripts = createWeekNumberOfTransactionsMap(uploadScriptsTransactionsFiltered,mondays, configState.view);
        setChartKpiNewScriptsData(generateChartInfoTxsPerWeek(labelTime, `new scripts per ${labelTime}`, `New scripts per ${labelTime}`, `New scripts this ${labelTime}`,mapTxByWeekNewScripts,mondaysMap));


        // KPI ACTIVE OPERATORS
        
        const cancelOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorCancel);
        const cancelOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(cancelOperatorsTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        
        // before using NFTs
        const responseInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiInferenceResponse);
        const responseInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(responseInferenceTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        // responses as NFTs
        const responseNFTInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiInferenceResponseNFTS);
        const responseNFTInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(responseNFTInferenceTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);

        //join both queries
        const combinedInferenceFilteredTransactions = [...responseInferenceTransactionsFiltered, ...responseNFTInferenceTransactionsFiltered,];
        const mapTxActiveOperatorsByWeek = operatorsPrepareData(requestsInferenceTransactionsFiltered, combinedInferenceFilteredTransactions, activeOperatorsTransactionsFiltered, cancelOperatorsTransactionsFiltered, mondays, configState.view);
        setChartKpiActiveOperatorsData(generateChartInfoTxsPerWeek(labelTime, `active operators per ${labelTime}`, `Active operators per ${labelTime}`, `active operators this ${labelTime}`,mapTxActiveOperatorsByWeek,mondaysMap));
      }



      //models per week
      const uploadModelsTransactionsFilteredExtended = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.alphaAppVersion],[],[...tagsToExclude,...tagsToExcludeForModels]);
      const uploadScriptTransactionsFilteredExtended = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.alphaAppVersion],[],tagsToExclude);
      setChartKpiModelsUsedPerWeekData(modelsPerWeekPrepareData(requestsInferenceTransactionsFiltered,uploadModelsTransactionsFilteredExtended,uploadScriptTransactionsFilteredExtended,inferencePaymentTransactionsFiltered,mondays,`Models used per ${labelTime}`,configState.view, false));
  
      // U per week
      const allPayments = [...inferencePaymentTransactionsFiltered, ...modelCreationTransactionsFiltered, ...scriptPaymentTransactionsFiltered, ...activeOperatorsTransactionsFiltered];
      setChartUPaymentsPerWeek(AmountUTokenPaymentsPrepareData(allPayments,mondays,`$U per ${labelTime}`,configState.view,configState.walletsContent));

      // failed payments per week

      setChartKpiFailedPaymentsModelsPerWeekData(modelsPerWeekPrepareData(requestsInferenceTransactionsFiltered,uploadModelsTransactionsFilteredExtended,uploadScriptTransactionsFilteredExtended,inferencePaymentTransactionsFiltered,mondays,`Failed payments per ${labelTime} by model`,configState.view, true));


      setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    if (configState.startDate && configState.endDate){
      console.log(configState);
      fetchData();
    }
        

  }, [configState]);

  return (
    <div className="App">
      <div className="title">
        <h1>KPIs - Alpha</h1>
        </div>
      {isLoading && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "80vh",
          }}
        >
          <CircularProgress size={100} />
        </div>
      )}
       <Grid container spacing={2}>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiNewUsersData && (
            <Box display={'flex'} justifyContent={'center'}>
              <LineChart
                chartInfo={chartKpiNewUsersData.chartInfo}
                series={chartKpiNewUsersData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartModelsUsedPerWeek && (
            <Box display={'flex'} justifyContent={'center'}>
              <ColumnChart
                chartInfo={chartModelsUsedPerWeek.chartInfo}
                series={chartModelsUsedPerWeek.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartUPaymentsPerWeek && (
            <Box display={'flex'} justifyContent={'center'}>
              <ColumnChart
                chartInfo={chartUPaymentsPerWeek.chartInfo}
                series={chartUPaymentsPerWeek.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartFailedPaymentsModelsPerWeek && (
            <Box display={'flex'} justifyContent={'center'}>
              <ColumnChart
                chartInfo={chartFailedPaymentsModelsPerWeek.chartInfo}
                series={chartFailedPaymentsModelsPerWeek.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiActiveUsersData && (
            <Box display={'flex'} justifyContent={'center'}>
              <LineChart
                chartInfo={chartKpiActiveUsersData.chartInfo}
                series={chartKpiActiveUsersData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiUsersData && (
            <Box display={'flex'} justifyContent={'center'}>
              <LineChart
                chartInfo={chartKpiUsersData.chartInfo}
                series={chartKpiUsersData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {!isLoading && chartKpiRetentionWeekAcc && (
            <Box display={'flex'} justifyContent={'center'}>
              <LineChart
                chartInfo={chartKpiRetentionWeekAcc.chartInfo}
                series={chartKpiRetentionWeekAcc.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiPaymentsData && (
            <Box display={'flex'} justifyContent={'center'}>
              <ColumnChart
                chartInfo={chartKpiPaymentsData.chartInfo}
                series={chartKpiPaymentsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiNewModelsData && (
            <Box display={'flex'} justifyContent={'center'}>
              <LineChart
                chartInfo={chartKpiNewModelsData.chartInfo}
                series={chartKpiNewModelsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiNewScriptsData && (
            <Box display={'flex'} justifyContent={'center'}>
             <LineChart
                chartInfo={chartKpiNewScriptsData.chartInfo}
                series={chartKpiNewScriptsData.series}
              />
            </Box>
          )}
        </Grid>
        <Grid item md={12} lg={6}>
          {configState.isExtraEnabled && chartKpiActiveOperatorsData && (
            <Box display={'flex'} justifyContent={'center'}>
              <LineChart
                chartInfo={chartKpiActiveOperatorsData.chartInfo}
                series={chartKpiActiveOperatorsData.series}
              />
            </Box>
          )}
        </Grid>
      </Grid>
    </div>
  );
}

export default Alpha;