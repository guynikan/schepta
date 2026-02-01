import {
  AppBar,
  Box,
  Container,
  Link,
  Toolbar,
  Typography,
} from "@mui/material";

export function Header() {
  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Container maxWidth="lg">
        <Toolbar
          disableGutters
          sx={{
            justifyContent: "space-between",
            py: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 500,
            }}
          >
            Single-SPA + Vite Experiment
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
            }}
          >
            <Link
              href="/"
              color="inherit"
              underline="none"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Home
            </Link>
            <Link
              href="/react"
              color="inherit"
              underline="none"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              React
            </Link>
            <Link
              href="/vue"
              color="inherit"
              underline="none"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Vue
            </Link>
            <Link
              href="/vanilla"
              color="inherit"
              underline="none"
              sx={{
                px: 2,
                py: 1,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Vanilla
            </Link>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
