import { Box, Typography, Button, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ShieldIcon from "@mui/icons-material/Shield";
import { Link } from "react-router-dom";

// Custom dark theme for the UI
const themeOptions = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3a86ff" },
    secondary: { main: "#ff006e" },
    background: {
      default: "#111111",
      paper: "#1c1c1c",
    },
    success: { main: "#00f5d4" },
  },
});

const HomePage = () => {
  return (
    <ThemeProvider theme={themeOptions}>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            py: 10,
          }}
        >
          <ShieldIcon
            sx={{
              fontSize: 60,
              color: "primary.main",
              filter: "drop-shadow(0px 4px 12px rgba(58, 134, 255, 0.4))",
              mb: 3,
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 700,
              background: "linear-gradient(135deg, #3a86ff 25%, #8338ec 80%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            Shielded Access
          </Typography>

          <Typography
            variant="subtitle1"
            sx={{
              mb: 6,
              color: "text.secondary",
              maxWidth: "420px",
            }}
          >
            Stay secure with intelligent mitigation against DDoS and high-volume cyber attacks.
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              component={Link}
              to="/dashboard"
              sx={{
                px: 5,
                py: 1.5,
                borderRadius: 3,
                fontSize: "1rem",
                textTransform: "capitalize",
                background: "linear-gradient(135deg, #3a86ff 20%, #8338ec 85%)",
                boxShadow: "0px 4px 8px rgba(58, 134, 255, 0.25)",
              }}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;
