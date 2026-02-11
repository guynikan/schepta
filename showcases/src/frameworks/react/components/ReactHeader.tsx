import React from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Tabs,
  Tab,
} from '@mui/material';
import { FaReact } from 'react-icons/fa';
import { SiChakraui, SiMui } from 'react-icons/si';

const base = '/react';
const navigationItems = [
  { path: `${base}/basic`, label: 'Basic UI', icon: <FaReact /> },
  { path: `${base}/chakra-ui`, label: 'Chakra UI', icon: <SiChakraui /> },
  { path: `${base}/material-ui`, label: 'Material UI', icon: <SiMui /> },
];

export function ReactHeader() {
  const router = useRouterState();
  const currentPath = router.location.pathname;

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 0,
              mr: 4,
              fontWeight: 700,
            }}
          >
            Schepta React Showcases
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <Tabs
              value={currentPath}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                '& .MuiTab-root': {
                  color: 'rgba(255, 255, 255, 0.7)',
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
              }}
            >
              {navigationItems.map((item) => (
                <Tab
                  key={item.path}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {item.label}
                      {item.icon}
                    </Box>
                  }
                  value={item.path}
                  component={Link}
                  to={item.path}
                />
              ))}
            </Tabs>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}