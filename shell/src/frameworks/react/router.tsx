// react/router.tsx
import {
  createRouter,
  createRoute,
  createRootRoute,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { BasicFormPage } from './basic-ui/pages/BasicFormPage';
import { ChakraFormPage } from './chakra-ui/pages/ChakraFormPage';
import { MaterialFormPage } from './material-ui/pages/MaterialFormPage';
import { RootLayout } from './RootLayout';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const reactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'react',
  component: RootLayout,
});

const reactIndexRoute = createRoute({
  getParentRoute: () => reactRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/react/basic' });
  },
});

const basicRoute = createRoute({
  getParentRoute: () => reactRoute,
  path: 'basic',
  component: BasicFormPage,
});

const chakraRoute = createRoute({
  getParentRoute: () => reactRoute,
  path: 'chakra-ui',
  component: ChakraFormPage,
});

const materialRoute = createRoute({
  getParentRoute: () => reactRoute,
  path: 'material-ui',
  component: MaterialFormPage,
});

const routeTree = rootRoute.addChildren([
  reactRoute.addChildren([
    reactIndexRoute,
    basicRoute,
    chakraRoute,
    materialRoute,
  ]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
