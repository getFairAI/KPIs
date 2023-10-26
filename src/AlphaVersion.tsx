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
import { useState, useEffect } from 'react';
import LineChart from './LineChart';
import ColumnChart from './ColumnChart';
import SidePanel from './sidePanel';
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
import { ViewOptions } from './Enum';
import { ChartData, ChartInfo, ChartInfoSimple } from './interfaces';

function Alpha() {
  const [isExtraChartsEnabled, setExtraChartsEnabled] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date('2023-04-25'));
  const [endDate, setEndDate] = useState<Date>(new Date('2023-09-17'));
  const [walletsContent, setWalletsContent] = useState<string>('');
  const [viewOption, setViewOption] = useState(ViewOptions.WEEKLY);
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
        const labelTime = getLabelByViewOption(viewOption);
        // TIME 
        const mondays = getMondayDateAndUnixTimeList(startDate,endDate,viewOption);
        const mondaysMap = getMondayDateAndUnixTimeMap(startDate,endDate, viewOption);

        // requests
        const requestsInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiUsers);
        const requestsInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(requestsInferenceTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude)
        const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(requestsInferenceTransactionsFiltered);
        

        
        const mapTxByWeekActiveUsers = createWeekTransactionsMap(requestsInferenceTransactionsFiltered,mondays,viewOption);
        const mapWeekCountXActiveUsers = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,ACTIVE_USERS_PER_WEEK);

        
        const kpiActiveUsersPerWeek = generateChartInfoCountsXPerWeek(labelTime, 'Active users', `Active users ${labelTime}`, `Active users in this ${labelTime}`,mapTxByWeekActiveUsers,mapWeekCountXActiveUsers,mondaysMap);
        const kpiNewUsersPerWeek = generateChartInfo(labelTime, 'New users', `New users per ${labelTime}`, `Users in this ${labelTime}`, mondays, uniqueOwnersScriptPayment,viewOption);
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

      if(isExtraChartsEnabled) {
      
        // KPI Payments

        setChartKpiPaymentsData(paymentsPrepareData(inferencePaymentTransactionsFiltered, modelCreationTransactionsFiltered, scriptPaymentTransactionsFiltered,activeOperatorsTransactionsFiltered,mondays, `Payments per ${labelTime}`, viewOption));


        // KPI NEW MODELS
        const uploadModelsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewModels = createWeekNumberOfTransactionsMap(uploadModelsTransactionsFiltered,mondays, viewOption);
        setChartKpiNewModelsData(generateChartInfoTxsPerWeek(labelTime, `new models per${labelTime}`, `New models per ${labelTime}`, `New models this ${labelTime}`,mapTxByWeekNewModels,mondaysMap));


        // KPI NEW SCRIPTS 
        
        const uploadScriptsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.alphaAppVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewScripts = createWeekNumberOfTransactionsMap(uploadScriptsTransactionsFiltered,mondays, viewOption);
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
        const mapTxActiveOperatorsByWeek = operatorsPrepareData(requestsInferenceTransactionsFiltered, combinedInferenceFilteredTransactions, activeOperatorsTransactionsFiltered, cancelOperatorsTransactionsFiltered, mondays, viewOption);
        setChartKpiActiveOperatorsData(generateChartInfoTxsPerWeek(labelTime, `active operators per ${labelTime}`, `Active operators per ${labelTime}`, `active operators this ${labelTime}`,mapTxActiveOperatorsByWeek,mondaysMap));
      }



      //models per week
      const uploadModelsTransactionsFilteredExtended = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.alphaAppVersion],[],[...tagsToExclude,...tagsToExcludeForModels]);
      const uploadScriptTransactionsFilteredExtended = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.alphaAppVersion],[],tagsToExclude);
      setChartKpiModelsUsedPerWeekData(modelsPerWeekPrepareData(requestsInferenceTransactionsFiltered,uploadModelsTransactionsFilteredExtended,uploadScriptTransactionsFilteredExtended,inferencePaymentTransactionsFiltered,mondays,`Models used per ${labelTime}`,viewOption, false));
  
      // U per week
      const allPayments = [...inferencePaymentTransactionsFiltered, ...modelCreationTransactionsFiltered, ...scriptPaymentTransactionsFiltered, ...activeOperatorsTransactionsFiltered];
      setChartUPaymentsPerWeek(AmountUTokenPaymentsPrepareData(allPayments,mondays,`$U per ${labelTime}`,viewOption,walletsContent));

      // failed payments per week

      setChartKpiFailedPaymentsModelsPerWeekData(modelsPerWeekPrepareData(requestsInferenceTransactionsFiltered,uploadModelsTransactionsFilteredExtended,uploadScriptTransactionsFilteredExtended,inferencePaymentTransactionsFiltered,mondays,`Failed payments per ${labelTime} by model`,viewOption, true));


      setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    if (startDate && endDate){
      fetchData();
    }
        

  }, [startDate, endDate, isExtraChartsEnabled, walletsContent, viewOption]);

  const handleDateChange = (start: Date, end: Date, isExtraEnabled: boolean, walletsContentText: string, view: string) => {
    setExtraChartsEnabled(isExtraEnabled);
    setStartDate(start);
    setEndDate(end);
    setWalletsContent(walletsContentText);
    setViewOption(view);
  };

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
      <div className="content-container">
        {!isLoading && (
          <div className="side-panel">
            <SidePanel initialDate={startDate} finalDate={endDate} onUpdatedCharts={handleDateChange} />
          </div>
        )}
        <div className="chart-grid">
          {!isLoading && chartKpiNewUsersData && (
            <>
              <div className="chart-item">
                    <LineChart
                      chartInfo={chartKpiNewUsersData.chartInfo}
                      series={chartKpiNewUsersData.series}
                    />
                  </div>
            </>
          )}
          {!isLoading && chartModelsUsedPerWeek && (
            <>
              <div className="chart-item">
                    <ColumnChart
                      chartInfo={chartModelsUsedPerWeek.chartInfo}
                      series={chartModelsUsedPerWeek.series}
                    />
                  </div>
            </>
          )}
          {!isLoading && chartUPaymentsPerWeek && (
            <>
              <div className="chart-item">
                    <ColumnChart
                      chartInfo={chartUPaymentsPerWeek.chartInfo}
                      series={chartUPaymentsPerWeek.series}
                    />
                  </div>
            </>
          )}
           {!isLoading && chartFailedPaymentsModelsPerWeek && (
            <>
              <div className="chart-item">
                    <ColumnChart
                      chartInfo={chartFailedPaymentsModelsPerWeek.chartInfo}
                      series={chartFailedPaymentsModelsPerWeek.series}
                    />
                  </div>
            </>
          )}
          {!isLoading && chartKpiActiveUsersData && (
            <>
              <div className="chart-item">
                    <LineChart
                      chartInfo={chartKpiActiveUsersData.chartInfo}
                      series={chartKpiActiveUsersData.series}
                    />
                  </div>
            </>
          )}
          {!isLoading && chartKpiUsersData && (
            <>
              <div className="chart-item">
                    <LineChart
                      chartInfo={chartKpiUsersData.chartInfo}
                      series={chartKpiUsersData.series}
                    />
                  </div>
            </>
          )}
          {!isLoading && chartKpiRetentionWeekAcc && (
            <>
              <div className="chart-item">
                    <LineChart
                      chartInfo={chartKpiRetentionWeekAcc.chartInfo}
                      series={chartKpiRetentionWeekAcc.series}
                    />
                  </div>
            </>
          )}
          {isExtraChartsEnabled && chartKpiPaymentsData && (
            <>
              <div className="chart-item">
                    <ColumnChart
                      chartInfo={chartKpiPaymentsData.chartInfo}
                      series={chartKpiPaymentsData.series}
                    />
                  </div>
            </>
          )}
          {isExtraChartsEnabled && chartKpiNewModelsData && (
            <>
            <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiNewModelsData.chartInfo}
                    series={chartKpiNewModelsData.series}
                  />
                </div>
            </>
          )}
          {isExtraChartsEnabled && chartKpiNewScriptsData && (
            <>
            <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiNewScriptsData.chartInfo}
                    series={chartKpiNewScriptsData.series}
                  />
                </div>
            </>
          )}
          {isExtraChartsEnabled && chartKpiActiveOperatorsData && (
            <>
            <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiActiveOperatorsData.chartInfo}
                    series={chartKpiActiveOperatorsData.series}
                  />
                </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Alpha;