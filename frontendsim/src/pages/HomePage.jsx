import { Box, Typography, Button, Container } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Shield } from "lucide-react";
import ShieldIcon from "@mui/icons-material/Shield";
import { Link } from "react-router-dom";

// New dark theme with modified colors
const customDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#2196f3", // Changed primary color
    },
    secondary: {
      main: "#ff4081", // Changed secondary color
    },
    background: {
      default: "#0f0f0f", // Darkened background color
      paper: "#181818", // Changed paper color
    },
    success: {
      main: "#00e0b8", // Updated success color
    },
  },
});

const HomePage = () => {
  return (
    <ThemeProvider theme={customDarkTheme}>
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
            py: 8,
          }}
        >
          {/* Adjusted icon style */}
          <ShieldIcon
            sx={{
              fontSize: 64,
              color: "#2196f3", // Updated color
              filter: "drop-shadow(0px 4px 12px rgba(33, 150, 243, 0.5))", // Modified shadow
              mb: 2,
            }}
          />

          {/* Title with gradient */}
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(45deg, #2196f3 30%, #8e24aa 90%)", // Modified gradient
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 2,
            }}
          >
            DDoS Protection
          </Typography>

          {/* Updated subtitle */}
          <Typography
            variant="subtitle1"
            sx={{
              mb: 6,
              color: "text.secondary",
              maxWidth: "400px",
            }}
          >
            Safeguard your infrastructure with advanced DDoS defense mechanisms.
          </Typography>

          {/* Button style modifications */}
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              component={Link}
              to="/dashboard"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                background: "linear-gradient(45deg, #2196f3 30%, #8e24aa 90%)", // Updated gradient
                boxShadow: "0 3px 5px 2px rgba(33, 150, 243, 0.3)", // Updated shadow
              }}
            >
              Access Dashboard
            </Button>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default HomePage;
