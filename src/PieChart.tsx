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
    dataLabels: {
      enabled: true,
      style: {
        fontSize: "12px",
      },
      ...(!!chartInfo.formatter && { formatter: chartInfo.formatter }),
      background: {
        enabled: true,
        foreColor: "#000000",
      },
      dropShadow: {
        enabled: false, // this conflicts with the background enabled
      },
    },
    tooltip: {
      enabled: true,
      // pie chart uses Y values on the tooltip
      y: {
        ...(!!chartInfo.tooltipFormatter && {
          formatter: chartInfo.tooltipFormatter,
        }),
      },
      style: {
        fontSize: "13px",
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
      position: "bottom",
      offsetY: 0,
    },
    fill: {
      opacity: 1,
    },

    labels: labels,

    // options to switch to, when bellow a certain breakpoint in px
    responsive: [
      // {
      //   breakpoint: 500,
      //   options: {
      //     legend: {
      //       offsetY: 0,
      //     },
      //   },
      // },
    ],
  };

  return (
    <Chart
      options={options}
      series={series}
      type="pie"
      height={"100%"}
      width={"100%"}
    />
  );
}

export default PieChart;
