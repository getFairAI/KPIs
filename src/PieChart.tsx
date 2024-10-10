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
import { PieChartInfo } from "./interfaces";

interface Props {
  chartInfo: PieChartInfo;
  series: ApexOptions["series"];
  labels: string[];
}

function PieChart({ chartInfo, series, labels }: Props) {
  const options: ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      stacked: true,
      toolbar: {
        show: true,
      },
      zoom: {
        enabled: true,
      },
    },
    title: {
      text: chartInfo.chartTitle,
      align: "center",
    },
    subtitle: {
      text: chartInfo.subTitle,
      align: "center",
    },
    legend: {
      position: "right",
      offsetY: 40,
    },
    fill: {
      opacity: 1,
    },

    labels: labels,

    // options to switch to, when bellow a certain breakpoint in px
    responsive: [
      {
        breakpoint: 500,
        options: {
          legend: {
            position: "bottom",
            offsetX: -10,
            offsetY: 0,
          },
        },
      },
    ],
  };

  return (
    <div>
      <Chart
        options={options}
        series={series}
        type="pie"
        height={350}
        width={"100%"}
      />
    </div>
  );
}

export default PieChart;
