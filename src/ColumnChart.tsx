import { ApexOptions } from "apexcharts";
import Chart from "react-apexcharts";
import {ColumnChartInfo} from "./interfaces";

interface Props {
  chartInfo: ColumnChartInfo;
  series: ApexOptions ["series"];
}

function ColumnChart ({chartInfo,series}: Props) {
  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      stacked: true,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom',
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900
            }
          }
        }
      },
    },
    xaxis: {
      type: 'datetime',
      categories: chartInfo.categories,
    },
    title: {
        text: chartInfo.chartTitle,
        align: 'center'
      },
    legend: {
      position: 'right',
      offsetY: 40
    },
    fill: {
      opacity: 1
    }
  };

  return (
    <div>
      <Chart options={options} series={series} type="bar" height={350} width={750} />
    </div>
  );
};


export default ColumnChart;