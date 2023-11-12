import { ApolloProvider } from "@apollo/client";
import { CssBaseline } from "@mui/material";
import { AppThemeProvider } from "./context/theme";
import Layout from "./layout";
import { client } from './queryAll';
import { Outlet } from "react-router";

export const Root = () => {
  return (
    <ApolloProvider client={client}>
      <AppThemeProvider>
        <CssBaseline />
        <Layout>
          <Outlet />
        </Layout>
      </AppThemeProvider>
    </ApolloProvider>
  );
};

export default Root;