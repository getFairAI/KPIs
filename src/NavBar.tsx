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

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { Link, NavLink } from "react-router-dom";
import { useTheme, IconButton } from "@mui/material";
import Logo from "./logo";
import ConfigurationIcon from "@mui/icons-material/Settings";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import { Dispatch, SetStateAction, useCallback } from "react";

const Navbar = ({
  isScrolled,
  openDrawer,
}: {
  isScrolled: boolean;
  openDrawer: Dispatch<SetStateAction<boolean>>;
}) => {
  const theme = useTheme();
  const extraIndex = 2; // number to add to zIndex to make sure it's above the drawer
  const zIndex = theme.zIndex.drawer + extraIndex; // add 2 to make sure it's above the drawer

  const appBarStyle = {
    zIndex,
    alignContent: "center",
    padding: "0px 20px",
    backgroundColor: "rgba(255,255,255,0.6) !important",
    boxShadow: "0px 0px 6px rgba(0,0,0,0.2) !important",
    // ...(!isScrolled && { boxShadow: "none" }),
  };
  // const navbarLinkStyles = {
  //   fontWeight: 400,
  //   fontSize: "18px",
  //   lineHeight: "24px",
  //   display: { sm: "none", md: "flex" },
  // };

  const handleSettingsClick = useCallback(
    () => openDrawer((previous) => !previous),
    [openDrawer]
  );

  return (
    <>
      <AppBar sx={appBarStyle} color="inherit" className="blurred-backdrop">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display={"flex"} flexDirection={"row"} alignItems={"center"}>
            <Link to="/">
              <Logo />
            </Link>
            <Typography
              sx={{
                fontSize: "10px",
                mt: "-18px",
                ml: "10px",
                padding: "0px 5px",
                border: "1px solid",
                borderRadius: "6px",
              }}
            >
              EARLY
            </Typography>

            <Typography
              sx={{
                fontSize: "28px",
                fontWeight: 700,
                ml: "20px",
              }}
            >
              KPIs
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} display={{ sm: "none", lg: "flex" }}>
            {" "}
          </Box>
          <Box
            className={"navbar-right-content"}
            sx={{
              justifyContent: { sm: "flex-end", md: "center" },
              gap: { sm: "16px", md: "20px" },
              flexGrow: { sm: 1, md: 0 },
            }}
          >
            {/* <Typography
              component={NavLink}
              to='/alpha'
              className='navbar-links'
              sx={navbarLinkStyles}
            >
              Alpha
            </Typography>
            <Typography
              component={NavLink}
              to='/'
              className='navbar-links'
              sx={navbarLinkStyles}
            >
              Beta
            </Typography> */}

            <button
              onClick={handleSettingsClick}
              className="styled-fairai-button gradient-bg"
            >
              <img
                src="./public/fair-protocol-face.svg"
                style={{ width: "28px" }}
              />
              FairAI Main App
            </button>

            <button
              onClick={handleSettingsClick}
              className="styled-fairai-button secondary"
            >
              <ConfigurationIcon />
              Configure Graphs
            </button>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default Navbar;
