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

import React from "react";
import ReactDOM from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import Root from "@/root";
import "@/styles/index.css";
import "@/styles/ui.css";
import "@/styles/main.css";
import "./styles.scss";
import Release1Version from "./release1Version";

const router = createHashRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      // {
      //   path: '',
      //   element: <Beta />,
      // },
      // {
      //   path: 'alpha',
      //   element:<Alpha />
      // },
      {
        path: "",
        element: <Release1Version />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
