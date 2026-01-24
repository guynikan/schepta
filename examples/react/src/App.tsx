import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";
import { BasicFormPage } from "./basic-ui/pages/BasicFormPage";
import { ChakraFormPage } from "./chakra-ui/pages/ChakraFormPage";
import { MaterialFormPage } from "./material-ui/pages/MaterialFormPage";
import { FaReact } from "react-icons/fa";
import { SiChakraui, SiMui } from "react-icons/si";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Container,
  Tabs,
  Tab,
} from "@mui/material";
import { ScheptaProvider } from "@schepta/adapter-react";
import { components } from "./basic-ui/components/ComponentRegistry";

const navigationItems = [
  { path: "/basic", label: "Basic Examples", icon: <FaReact /> },
  { path: "/chakra-ui", label: "Chakra UI Examples", icon: <SiChakraui /> },
  { path: "/material-ui", label: "Material UI Examples", icon: <SiMui /> },
];

function Header() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <AppBar
      position="static"
      color="primary"
    >
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
            Schepta React Examples
          </Typography>

          <Box sx={{ flexGrow: 1 }}>
            <Tabs
              value={currentPath}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                "& .MuiTab-root": {
                  color: "rgba(255, 255, 255, 0.7)",
                  "&.Mui-selected": {
                    color: "white",
                  },
                },
              }}
            >
              {navigationItems.map((item) => (
                <Tab
                  key={item.path}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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

function App() {
  const labelMiddleware = (props: any) => {
    if (props.label) {
      return { ...props, label: `[Provider] ${props.label}` };
    }
    return props;
  };

  return (
    <ScheptaProvider components={components}
        middlewares={[labelMiddleware]}
        externalContext={{
          user: { id: 1, name: 'Provider User' },
          api: 'https://api.example.com',
        }}
    >
      <BrowserRouter>
        <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
          <Header />

          <Container
            maxWidth="lg"
            sx={{ py: 4 }}
          >
            <Routes>
              <Route
                path="/basic"
                element={<BasicFormPage />}
              />
              <Route
                path="/chakra-ui"
                element={<ChakraFormPage />}
              />
              <Route
                path="/material-ui"
                element={<MaterialFormPage />}
              />
              <Route
                path="/"
                element={<BasicFormPage />}
              />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ScheptaProvider>
  );
}

export default App;
