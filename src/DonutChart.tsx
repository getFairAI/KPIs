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