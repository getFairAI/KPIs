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
import { TAG_NAMES, ACTIVE_USERS } from './constants';
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
   paymentsPrepareData } from './kpisFunctions'
import { fetchAllTransactions } from './queryAll';
import { filterTransactionsIncludeTagNamesAndExcludeTags } from './utils/util'
import { tagsKpiUsers, 
  tagsKpiUploadModels, 
  tagsKpiUploadScripts,
  tagsKpiOperatorsRegistration, 
  tagsToExclude, 
  tagsKpiInferenceResponse,
  tagsKpiOperatorCancel,
  tagsKpiInferencePayment,
  tagsKpiSciptPayment,
  tagsKpiModelCreationPayment,
  fairWallets,
} from './commonVars'

function App() {
  const [isExtraChartsEnabled, setExtraChartsEnabled] = useState(false);
  const [startDate, setStartDate] = useState<Date>(new Date('2023-05-14'));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isLoading, setLoading] = useState(true); 
  const [chartKpiNewUsersData, setChartKpiNewUsersData] = useState<{ series: any[]; chartInfo: any } | null>(null);
  const [chartKpiActiveUsersData, setChartKpiActiveUsersData] = useState<{ series: any[]; chartInfo: any } | null>(null);
  const [chartKpiNewModelsData, setChartKpiNewModelsData] = useState<{ series: any[]; chartInfo: any } | null>(null);
  const [chartKpiNewScriptsData, setChartKpiNewScriptsData] = useState<{ series: any[]; chartInfo: any } | null>(null);
  const [chartKpiActiveOperatorsData, setChartKpiActiveOperatorsData] = useState<{ series: any[]; chartInfo: any } | null>(null);
  const [chartKpiPaymentsData, setChartKpiPaymentsData] = useState<{ series: any[]; chartInfo: any } | null>(null);
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
        const mapWeekCountX = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,ACTIVE_USERS);

        const kpiActiveUsersPerWeek = generateChartInfoCountsXPerWeek('Week', 'Active users', 'Active users per week', 'Active users in this week',mapTxByWeekActiveUsers,mapWeekCountX,mondaysMap);
        const kpiNewUsersPerWeek = generateChartInfo('Week', 'New users', 'New users per week', 'Users in this week', mondays, uniqueOwnersScriptPayment);
        setChartKpiNewUsersData(kpiNewUsersPerWeek);

        setChartKpiActiveUsersData(kpiActiveUsersPerWeek);

        const activeOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorsRegistration);
        const activeOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(activeOperatorsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);

      if(isExtraChartsEnabled) {
      
        // KPI NEW MODELS
        let kpiNewModelsPerWeek = [];
        const uploadModelsTransactionsRaw = await fetchAllTransactions(tagsKpiUploadModels);
        const uploadModelsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewModels = createWeekNumberOfTransactionsMap(uploadModelsTransactionsFiltered,mondays);
        kpiNewModelsPerWeek = generateChartInfoTxsPerWeek('Week', 'new models per week', 'New models per week', 'New models this week',mapTxByWeekNewModels,mondaysMap);
        setChartKpiNewModelsData(kpiNewModelsPerWeek);


        // KPI NEW SCRIPTS 
        let kpiNewScriptsPerWeek = [];
        const uploadScriptsransactionsRaw = await fetchAllTransactions(tagsKpiUploadScripts);
        const uploadScriptsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        const mapTxByWeekNewScripts = createWeekNumberOfTransactionsMap(uploadScriptsTransactionsFiltered,mondays);
        kpiNewScriptsPerWeek = generateChartInfoTxsPerWeek('Week', 'new scripts per week', 'New scripts per week', 'New scripts this week',mapTxByWeekNewScripts,mondaysMap);
        setChartKpiNewScriptsData(kpiNewScriptsPerWeek);


        // KPI ACTIVE OPERATORS
        let kpiActiveOperatorsPerWeek = [];
        
        
        const cancelOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorCancel);
        const cancelOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(cancelOperatorsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
        
        const ResponseInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiInferenceResponse);
        const ResponseInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(ResponseInferenceTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);

        const mapTxActiveOperatorsByWeek = operatorsPrepareData(requestsInferenceTransactionsFiltered, ResponseInferenceTransactionsFiltered, activeOperatorsTransactionsFiltered, cancelOperatorsTransactionsFiltered, mondays);
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
     setLoading(false);
     console.log('fetched');
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
          {chartKpiNewUsersData &&
            chartKpiActiveUsersData &&
            chartKpiPaymentsData && (
              <>
                <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiNewUsersData.chartInfo}
                    series={chartKpiNewUsersData.series}
                  />
                </div>
                <div className="chart-item">
                  <ColumnChart
                    chartInfo={chartKpiPaymentsData.chartInfo}
                    series={chartKpiPaymentsData.series}
                  />
                </div>
                <div className="chart-item">
                  <LineChart
                    chartInfo={chartKpiActiveUsersData.chartInfo}
                    series={chartKpiActiveUsersData.series}
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



