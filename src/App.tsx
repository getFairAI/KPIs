import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import LineChart from './LineChart';
import DonutChart from './DonutChart';
import ColumnChart from './ColumnChart';
import { TAG_NAMES } from './constants'
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

const donutInfo = {
  labels: ['Script Fee', 'Operator fee', 'Random'],
  donutTitle: "Payments %",

}


function App() {
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
        const mondays = getMondayDateAndUnixTimeList(new Date('2023-05-14'), new Date());
        const mondaysMap = getMondayDateAndUnixTimeMap(new Date('2023-05-14'), new Date());

        // requests
        const requestsInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiUsers);
        const requestsInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(requestsInferenceTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude)
        const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(requestsInferenceTransactionsFiltered);
        
        const mapTxByWeekActiveUsers = createWeekTransactionsMap(requestsInferenceTransactionsFiltered,mondays);
        const mapWeekCountX = mapNumberTxsPerWeek(mapTxByWeekActiveUsers,5);

        const kpiActiveUsersPerWeek = generateChartInfoCountsXPerWeek('Week', 'Active users', 'Active users per week', 'Active users in this week',mapTxByWeekActiveUsers,mapWeekCountX,mondaysMap);
        const kpiNewUsersPerWeek = generateChartInfo('Week', 'New users', 'New users per week', 'Users in this week', mondays, uniqueOwnersScriptPayment);
        setChartKpiNewUsersData(kpiNewUsersPerWeek);

        setChartKpiActiveUsersData(kpiActiveUsersPerWeek);


      // KPI NEW MODELS
      const uploadModelsTransactionsRaw = await fetchAllTransactions(tagsKpiUploadModels);
      const uploadModelsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadModelsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
      const mapTxByWeekNewModels = createWeekNumberOfTransactionsMap(uploadModelsTransactionsFiltered,mondays);
      const kpiNewModelsPerWeek = generateChartInfoTxsPerWeek('Week', 'new models per week', 'New models per week', 'New models this week',mapTxByWeekNewModels,mondaysMap);
      setChartKpiNewModelsData(kpiNewModelsPerWeek);


      // KPI NEW SCRIPTS 
      const uploadScriptsransactionsRaw = await fetchAllTransactions(tagsKpiUploadScripts);
      const uploadScriptsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(uploadScriptsransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
      const mapTxByWeekNewScripts = createWeekNumberOfTransactionsMap(uploadScriptsTransactionsFiltered,mondays);
      const kpiNewScriptsPerWeek = generateChartInfoTxsPerWeek('Week', 'new scripts per week', 'New scripts per week', 'New scripts this week',mapTxByWeekNewScripts,mondaysMap);
      setChartKpiNewScriptsData(kpiNewScriptsPerWeek);


      // KPI ACTIVE OPERATORS

      const activeOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorsRegistration);
      const activeOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(activeOperatorsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
      
      const cancelOperatorsTransactionsRaw = await fetchAllTransactions(tagsKpiOperatorCancel);
      const cancelOperatorsTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(cancelOperatorsTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);
      
      const ResponseInferenceTransactionsRaw = await fetchAllTransactions(tagsKpiInferenceResponse);
      const ResponseInferenceTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(ResponseInferenceTransactionsRaw,[TAG_NAMES.appVersion],fairWallets,tagsToExclude);

      const mapTxActiveOperatorsByWeek = operatorsPrepareData(requestsInferenceTransactionsFiltered, ResponseInferenceTransactionsFiltered, activeOperatorsTransactionsFiltered, cancelOperatorsTransactionsFiltered, mondays);
      const kpiActiveOperatorsPerWeek = generateChartInfoTxsPerWeek('Week', 'active operators per week', 'Active operators per week', 'active operators this week',mapTxActiveOperatorsByWeek,mondaysMap);  
      setChartKpiActiveOperatorsData(kpiActiveOperatorsPerWeek);

     // Payments
     
     const inferencePaymentTransactionsRaw = await fetchAllTransactions(tagsKpiInferencePayment);
     const inferencePaymentTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(inferencePaymentTransactionsRaw, [TAG_NAMES.appVersion],fairWallets,tagsToExclude);
     const scriptPaymentTransactionsRaw = await fetchAllTransactions(tagsKpiSciptPayment);
     const scriptPaymentTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(scriptPaymentTransactionsRaw, [TAG_NAMES.appVersion],fairWallets,tagsToExclude);

     const modelCreationPaymentTransactionsRaw = await fetchAllTransactions(tagsKpiModelCreationPayment); 
     const modelCreationTransactionsFiltered = filterTransactionsIncludeTagNamesAndExcludeTags(modelCreationPaymentTransactionsRaw, [TAG_NAMES.appVersion],fairWallets,tagsToExclude);
     const kpiPaymentsPerWeek = paymentsPrepareData(inferencePaymentTransactionsFiltered, modelCreationTransactionsFiltered, scriptPaymentTransactionsFiltered,activeOperatorsTransactionsFiltered,mondays, 'Payments per week');
     setChartKpiPaymentsData(kpiPaymentsPerWeek);

      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="App">
      <h1>Fair Protocol KPIs</h1>
      <div className='chart-grid'>
      {chartKpiNewUsersData && chartKpiActiveUsersData && chartKpiNewModelsData && 
       chartKpiNewScriptsData && chartKpiActiveOperatorsData && chartKpiPaymentsData &&( 
        <>
            <div className="chart-item">
              <LineChart chartInfo={chartKpiNewUsersData.chartInfo} series={chartKpiNewUsersData.series} />
            </div>
            <div className="chart-item">
              <LineChart chartInfo={chartKpiActiveUsersData.chartInfo} series={chartKpiActiveUsersData.series} />
            </div>
            <div className="chart-item">
              <LineChart chartInfo={chartKpiNewModelsData.chartInfo} series={chartKpiNewModelsData.series} />
            </div>
            <div className="chart-item">
              <LineChart chartInfo={chartKpiNewScriptsData.chartInfo} series={chartKpiNewScriptsData.series} />
            </div>
            <div className="chart-item">
              <LineChart chartInfo={chartKpiActiveOperatorsData.chartInfo} series={chartKpiActiveOperatorsData.series} />
            </div>
            <div className="chart-item">
              <ColumnChart chartInfo={chartKpiPaymentsData.chartInfo} series={chartKpiPaymentsData.series} />
            </div>
          </>
      )}
      </div>
    </div>
  );
}

export default App;
