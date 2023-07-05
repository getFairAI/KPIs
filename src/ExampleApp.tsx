import React from 'react';
import './App.css';
import LineChart from './LineChart';
import DonutChart from './DonutChart';
import { useQuery } from '@apollo/client';
import { QUERY_TXS_WITH } from './queries/queries';
import { TAG_NAMES, APP_NAME, SCRIPT_FEE_PAYMENT } from './constants'
import { getMondayDateAndUnixTimeList, createOwnerUnixTimeMap, generateChartInfo } from './kpisFunctions'
const chartInfo = {
  categories: ['May 15', 'May 22', 'May 29', 'Jun 5', 'Jun 12', 'Jun 19', 'Jun 26'],
  categoriesTitle: 'Month',
  yTitle: 'New users',
  chartTitle: 'New users per week',
};

const donutInfo = {
  labels: ['Script Fee', 'Operator fee', 'Random'],
  donutTitle: "Payments %",

}

const series2 = [8, 199, 13];

const series = [{
  name: "High - 2013",
  data: [8, 1, 1, 0, 3, 4, 0],
}];

const tagsKpiNewUsers = [
  {
    name: TAG_NAMES.appName,
    values: [APP_NAME],
  },
  {
  name: TAG_NAMES.operationName,
  values: [SCRIPT_FEE_PAYMENT],
},];

function App() {

  const { loading, error, data } = useQuery(QUERY_TXS_WITH,{
    variables: { tags: tagsKpiNewUsers, first: 100, after: null },
  });
  if (loading) {
    // Render a loading indicator or skeleton component
    return <div>Loading...</div>;
  }

  if (error) {
    // Render an error message or component
    return <div>Error: {error.message}</div>;
  }

  
  // Access the data returned by the query
  const { transactions: { edges } } = data;
  const uniqueOwnersScriptPayment = createOwnerUnixTimeMap(edges);
  console.log(edges);
  const mondays = getMondayDateAndUnixTimeList(new Date('2023-05-14'),new Date());
  const kpiNewUsersPerWeek = generateChartInfo('Day','New users','New users per week','Users in this week',mondays,uniqueOwnersScriptPayment);
  console.log('kpi',kpiNewUsersPerWeek);
  return (
    <div className="App">
     <LineChart chartInfo={kpiNewUsersPerWeek.chartInfo} series={kpiNewUsersPerWeek.series}/>
     <DonutChart donutInfo={donutInfo} series={series2}/>
    </div>
  );
}

export default App;
