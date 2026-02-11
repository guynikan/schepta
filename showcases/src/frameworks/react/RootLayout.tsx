// react/RootLayout.tsx
import React from 'react';
import { Outlet } from '@tanstack/react-router';
import { ScheptaProvider } from '@schepta/adapter-react';
import { components } from './basic-ui/components/ComponentRegistry';
import { Box, Container } from '@mui/material';
import { ReactHeader } from './components/ReactHeader';

export function RootLayout() {
  const labelMiddleware = (props: any) => {
    if (props.label) {
      return { ...props, label: `[Provider] ${props.label}` };
    }
    return props;
  };

  return (
    <ScheptaProvider
      components={components}
      middlewares={[labelMiddleware]}
      externalContext={{
        user: { id: 1, name: 'Provider User' },
        api: 'https://api.example.com',
      }}
    >
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <ReactHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </ScheptaProvider>
  );
}