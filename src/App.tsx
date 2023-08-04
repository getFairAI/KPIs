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

import './App.css';
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
  modelsPerWeekPrepareData } from './kpisFunctions'
import { fetchAllTransactions } from './queryAll';
import { filterTransactionsIncludeTagNamesAndExcludeTags } from './utils/util'
import { tagsKpiUsers, 
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
  fairWallets,
} from './commonVars'

import { ChartData, ChartInfo, ChartInfoSimple } from './interfaces';

function App() {
  const [isExtraChartsEnabled, setExtraChartsEnabled] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date('2023-05-14'));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setLoading] = useState(true); 
  const [chartKpiNewUsersData, setChartKpiNewUsersData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiActiveUsersData, setChartKpiActiveUsersData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiUsersData, setChartKpiUsersData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiPaymentsData, setChartKpiPaymentsData] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);
  const [chartModelsUsedPerWeek,setChartKpiModelsUsedPerWeekData] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);
  const [chartFailedPaymentsModelsPerWeek,setChartKpiFailedPaymentsModelsPerWeekData] = useState<{ series: ChartData[]; chartInfo: ChartInfoSimple } | null>(null);

  // extra charts
  const [chartKpiNewModelsData, setChartKpiNewModelsData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiNewScriptsData, setChartKpiNewScriptsData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);
  const [chartKpiActiveOperatorsData, setChartKpiActiveOperatorsData] = useState<{ series: ChartData[]; chartInfo: ChartInfo } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {

        // TIME 
        const mondays = getMondayDateAndUnixTimeList(startDate,endDate);
        const mondaysMap = getMondayDateAndUnixTimeMap(startDate,endDate);

        // requests
        const requestsInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiUsers);
        const requestsInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(requestsInferenceTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude)
        const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(requestsInferenceTransactionsFiltered);
        
        const mapTxByWeekActiveUsers = createWeekTransactionsMap(requestsInferenceTransactionsFiltered,mondays);
        const mapWeekCountXActiveUsers = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,ACTIVE_USERS_PER_WEEK);

        
        const kpiActiveUsersPerWeek = generateChartInfoCountsXPerWeek('Week', 'Active users', 'Active users per week', 'Active users in this week',mapTxByWeekActiveUsers,mapWeekCountXActiveUsers,mondaysMap);
        const kpiNewUsersPerWeek = generateChartInfo('Week', 'New users', 'New users per week', 'Users in this week', mondays, uniqueOwnersScriptPayment);
        setChartKpiNewUsersData(kpiNewUsersPerWeek);

        setChartKpiActiveUsersData(kpiActiveUsersPerWeek);

        // Users per week (at least one prompt)
        const mapWeekCountXUsersPerWeek = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,USERS_PER_WEEK);
        const kpiUsersPerWeek = generateChartInfoCountsXPerWeek('Week', 'Users', 'Users per week', 'Users in this week',mapTxByWeekActiveUsers,mapWeekCountXUsersPerWeek,mondaysMap);
        setChartKpiUsersData(kpiUsersPerWeek);

        // this queries will be used for other charts besides of the ExtraCharts, so they are here
        // operators
        const activeOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorsRegistration);
        const activeOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(activeOperatorsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        const uploadModelsTransactionsRaw = await fetchAllTransactions(tagsKpiUploadModels);
        const uploadScriptsransactionsRaw = await fetchAllTransactions(tagsKpiUploadScripts);

      if(isExtraChartsEnabled) {
      
        // KPI NEW MODELS
        let kpiNewModelsPerWeek = [];
        const uploadModelsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewModels = createWeekNumberOfTransactionsMap(uploadModelsTransactionsFiltered,mondays);
        kpiNewModelsPerWeek = generateChartInfoTxsPerWeek('Week', 'new models per week', 'New models per week', 'New models this week',mapTxByWeekNewModels,mondaysMap);
        setChartKpiNewModelsData(kpiNewModelsPerWeek);


        // KPI NEW SCRIPTS 
        let kpiNewScriptsPerWeek = [];
        
        const uploadScriptsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewScripts = createWeekNumberOfTransactionsMap(uploadScriptsTransactionsFiltered,mondays);
        kpiNewScriptsPerWeek = generateChartInfoTxsPerWeek('Week', 'new scripts per week', 'New scripts per week', 'New scripts this week',mapTxByWeekNewScripts,mondaysMap);
        setChartKpiNewScriptsData(kpiNewScriptsPerWeek);


        // KPI ACTIVE OPERATORS
        let kpiActiveOperatorsPerWeek = [];
        
        
        const cancelOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorCancel);
        const cancelOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(cancelOperatorsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        
        // before using NFTs
        const responseInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiInferenceResponse);
        const responseInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(responseInferenceTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        // responses as NFTs
        const responseNFTInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiInferenceResponseNFTS);
        const responseNFTInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(responseNFTInferenceTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);

        //join both queries
        const combinedInferenceFilteredTransactions = [...responseInferenceTransactionsFiltered, ...responseNFTInferenceTransactionsFiltered,];
        const mapTxActiveOperatorsByWeek = operatorsPrepareData(requestsInferenceTransactionsFiltered, combinedInferenceFilteredTransactions, activeOperatorsTransactionsFiltered, cancelOperatorsTransactionsFiltered, mondays);
        kpiActiveOperatorsPerWeek = generateChartInfoTxsPerWeek('Week', 'active operators per week', 'Active operators per week', 'active operators this week',mapTxActiveOperatorsByWeek,mondaysMap);  
        setChartKpiActiveOperatorsData(kpiActiveOperatorsPerWeek);
      }

     // Payments
     
      const inferencePaymentTransactionsRaw = await fetchAllTransactions(tagsKpiInferencePayment);
      const inferencePaymentTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(inferencePaymentTransactionsRaw, [TAG_NAMES.appVersion],fairWallets,tagsToExclude);
      const scriptPaymentTransactionsRaw = await fetchAllTransactions(tagsKpiSciptPayment);
      const scriptPaymentTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(scriptPaymentTransactionsRaw, [TAG_NAMES.appVersion],fairWallets,tagsToExclude);

      const modelCreationPaymentTransactionsRaw = await fetchAllTransactions(tagsKpiModelCreationPayment); 
      const modelCreationTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(modelCreationPaymentTransactionsRaw, [TAG_NAMES.appVersion],fairWallets,tagsToExclude);
      const kpiPaymentsPerWeek = paymentsPrepareData(inferencePaymentTransactionsFiltered, modelCreationTransactionsFiltered, scriptPaymentTransactionsFiltered,activeOperatorsTransactionsFiltered,mondays, 'Payments per week');
      setChartKpiPaymentsData(kpiPaymentsPerWeek);


      //models per week
      const uploadModelsTransactionsFilteredExtended = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.appVersion],[],[...tagsToExclude,...tagsToExcludeForModels]);
      const uploadScriptTransactionsFilteredExtended = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.appVersion],[],tagsToExclude);
      setChartKpiModelsUsedPerWeekData(modelsPerWeekPrepareData(requestsInferenceTransactionsFiltered,uploadModelsTransactionsFilteredExtended,uploadScriptTransactionsFilteredExtended,inferencePaymentTransactionsFiltered,false,mondays,'Models used per week'));
  
      // failed payments per week

      setChartKpiFailedPaymentsModelsPerWeekData(modelsPerWeekPrepareData(requestsInferenceTransactionsFiltered,uploadModelsTransactionsFilteredExtended,uploadScriptTransactionsFilteredExtended,inferencePaymentTransactionsFiltered,true,mondays,'Failed payments per week by model'));


      setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    if (startDate && endDate){
      fetchData();
    }
        

  }, [startDate,endDate, isExtraChartsEnabled]);

  const handleDateChange = (start: Date, end: Date, isExtraEnabled: boolean) => {
    setExtraChartsEnabled(isExtraEnabled);
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="App">
      <div className="title">
        <h1>Fair Protocol KPIs</h1>
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
            <SidePanel onUpdatedCharts={handleDateChange} />
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
          {!isLoading && chartKpiPaymentsData && (
            <>
              <div className="chart-item">
                    <ColumnChart
                      chartInfo={chartKpiPaymentsData.chartInfo}
                      series={chartKpiPaymentsData.series}
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
          {isExtraChartsEnabled &&
            chartKpiNewModelsData &&
            chartKpiNewScriptsData &&
            chartKpiActiveOperatorsData && (
              <>
                <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiNewModelsData.chartInfo}
                    series={chartKpiNewModelsData.series}
                  />
                </div>
                <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiNewScriptsData.chartInfo}
                    series={chartKpiNewScriptsData.series}
                  />
                </div>
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

export default App;



