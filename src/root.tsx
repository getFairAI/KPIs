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

import { ApolloProvider } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { AppThemeProvider } from "./context/theme";
import Layout from "./layout";
import { client } from "./queryAll";
import { Outlet } from "react-router";
import { ConfigurationProvider } from "./context/configuration";
import { SnackbarProvider } from "notistack";

export const Root = () => {
  return (
    <>
      <SnackbarProvider
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        maxSnack={4}
        style={{
          fontWeight: 700,
        }}
      />

      <ApolloProvider client={client}>
        <AppThemeProvider>
          <ConfigurationProvider>
            <CssBaseline />
            <Layout>
              <Outlet />
            </Layout>
          </ConfigurationProvider>
        </AppThemeProvider>
      </ApolloProvider>
    </>
  );
};

export default Root;
