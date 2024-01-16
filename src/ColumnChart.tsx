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
            ...(!!chartInfo.formatter && { formatter: chartInfo.formatter }),
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
    subtitle: {
        text: chartInfo.subTitle,
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
      <Chart options={options} series={series} type="bar" height={350} width={600} />
    </div>
  );
};


export default ColumnChart;