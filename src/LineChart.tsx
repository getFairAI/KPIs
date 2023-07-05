import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import {ChartInfo} from "./interfaces";

interface Props {
  chartInfo: ChartInfo;
  series: ApexOptions ["series"];
}

function LineChart ({chartInfo,series}: Props) {
  const options: ApexOptions = {
    chart: {
      height: 350,
      type: 'line',
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 18,
        left: 7,
        blur: 10,
        opacity: 0.2
      },
      toolbar: {
        show: false
      }
    },
    colors: ['#77B6EA', '#545454'],
    dataLabels: {
      enabled: true,
    },
    stroke: {
      curve: 'smooth'
    },
    title: {
      text: chartInfo.chartTitle,
      align: 'center'
    },
    grid: {
      borderColor: '#e7e7e7',
      row: {
        colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
        opacity: 0.5
      },
    },
    markers: {
      size: 1
    },
    xaxis: {
      categories: chartInfo.categories,
      title: {
        text: chartInfo.categoriesTitle
      }
    },
    yaxis: {
      title: {
        text: chartInfo.yTitle
      },
      min: chartInfo.yMin,
      max: chartInfo.yMax
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right',
      floating: true,
      offsetY: -25,
      offsetX: -5
    }
  };

  return (
    <div>
      <Chart options={options} series={series} type="line" width="500" />
    </div>
  );
};


export default LineChart;