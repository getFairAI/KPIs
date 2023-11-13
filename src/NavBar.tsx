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

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link, NavLink } from 'react-router-dom';
import {
  useTheme,
  IconButton
} from '@mui/material';
import Logo from './logo';
import ConfigurationIcon from '@mui/icons-material/Settings';
import { Dispatch, SetStateAction, useCallback } from 'react';

const Navbar = ({
  isScrolled,
  openDrawer
}: {
  isScrolled: boolean;
  openDrawer: Dispatch<SetStateAction<boolean>>
}) => {
  const theme = useTheme();
  const extraIndex = 2; // number to add to zIndex to make sure it's above the drawer
  const zIndex = theme.zIndex.drawer + extraIndex; // add 2 to make sure it's above the drawer

  const appBarStyle = {
    zIndex,
    alignContent: 'center',
    padding: '10px 20px 10px 20px',
    ...(!isScrolled && { boxShadow: 'none' }),
  };
  const spaceBetween = 'space-between';
  const navbarLinkStyles = {
    fontWeight: 400,
    fontSize: '18px',
    lineHeight: '24px',
    display: { sm: 'none', md: 'flex' },
  };

  const handleSettingsClick = useCallback(() => openDrawer((previous) => !previous), [openDrawer]);

  return (
    <>
      <AppBar sx={appBarStyle} color='inherit'>
        <Toolbar sx={{ justifyContent: spaceBetween }}>
          <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
            <Link to='/'>
              <Logo />
            </Link>
            <Typography
              sx={{
                fontSize: '14px',
                mt: '-18px',
                ml: '8px',
                padding: '0px 8px',
                border: '0.5px solid',
                borderRadius: '8px',
              }}
            >
              EARLY
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} display={{ sm: 'none', lg: 'flex' }}>
            {' '}
          </Box>
          <Box
            className={'navbar-right-content'}
            sx={{
              justifyContent: { sm: 'flex-end', md: 'center' },
              gap: { sm: '16px', md: '34px' },
              flexGrow: { sm: 1, md: 0 },
            }}
          >
            <Typography
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
            </Typography>
            <IconButton onClick={handleSettingsClick}>
              <ConfigurationIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
};

export default Navbar;
