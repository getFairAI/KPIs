/*
 * Fair Protocol, open source decentralised inference marketplace for artificial intelligence.
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

import { Box, Container, Drawer } from '@mui/material';
import { ReactElement, useCallback, useLayoutEffect, useRef, useState } from 'react';
import Navbar from './navbar';
import useWindowDimensions from '@/hooks/useWindowDimensions';
import useScroll from '@/hooks/useScroll';
import SidePanel from './sidePanel';

export default function Layout({ children }: { children: ReactElement }) {
  const [headerHeight, setHeaderHeight] = useState('64px');
  const scrollableRef = useRef<HTMLDivElement>(null);
  const { width, height } = useWindowDimensions();
  const { isScrolled } = useScroll(scrollableRef);
  const [ configurationDrawerOpen, setConfigurationDrawerOpen ] = useState<boolean>(false);

  useLayoutEffect(() => {
    const currHeaderHeight = document.querySelector('header')?.clientHeight;
    if (currHeaderHeight) {
      setHeaderHeight(`${currHeaderHeight}px`);
    }
  }, [width, height]);

  const handleClose = useCallback(() => setConfigurationDrawerOpen(false), [ setConfigurationDrawerOpen]);

  return (
    <>
      <Navbar isScrolled={isScrolled} openDrawer={setConfigurationDrawerOpen}/>
      <Container
        disableGutters
        sx={{
          width: '100%',
          height: `calc(100% - ${headerHeight})`,
          top: headerHeight,
          position: 'fixed',
        }}
        maxWidth={false}
      >
        <Box height={'100%'}>
        <Drawer
            variant='persistent'
            anchor='right'
            open={configurationDrawerOpen}
            sx={{
              '& .MuiDrawer-paper': {
                width: '30%',
                boxSizing: 'border-box',
                top: headerHeight,
                height: `calc(100% - ${headerHeight})`,
              },
            }}
            PaperProps={{
              elevation: 24,
            }}
          >
            <Box sx={{ height: '100%', display: 'flex' }}>
              <SidePanel handleClose={handleClose} />
            </Box>
          </Drawer>
          <main style={{ height: '100%' }} ref={scrollableRef}>
            {children}
          </main>
        </Box>
      </Container>
    </>
  );
}
