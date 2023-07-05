import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import {DonutInfo} from "./interfaces";

interface Props {
  donutInfo: DonutInfo;
  series: number [];
}

function DonutChart ({donutInfo,series}: Props) {
  const options: ApexOptions = {
    chart: {
      type: 'donut',
    },
    title: {
        text: donutInfo.donutTitle
    },
    labels: donutInfo.labels,
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };

  return (
    <div>
      <Chart options={options} series={series} type="donut" width="500" />
    </div>
  );
};


export default DonutChart;