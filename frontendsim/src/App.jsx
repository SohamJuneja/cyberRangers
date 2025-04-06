import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import NodefPage from "./pages/NodefPage";
import DdosDefPage from "./pages/DdosDefPage";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import ShootingStar from "./components/ShootingStar";

const themeConfig = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3a86ff" },
    secondary: { main: "#ff007f" },
    background: {
      default: "#131313",
      paper: "#1c1c1c",
    },
    success: {
      main: "#00f5d4",
      dark: "#083a34",
      contrastText: "#fff",
    },
    info: { main: "#7b2cbf" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: "hidden",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />
      <Router>
        <ShootingStar />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/no-protection" element={<NodefPage />} />
          <Route path="/ddos-protection" element={<DdosDefPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
