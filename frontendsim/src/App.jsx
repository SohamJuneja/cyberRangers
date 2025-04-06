import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Navbar from './components/Navbar';
import ShootingStar from './components/ShootingStar';
import HomePage from './pages/HomePage';
import NodefPage from './pages/NodefPage';
import DdosDefPage from './pages/DdosDefPage';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#3a86ff' },
    secondary: { main: '#ff006e' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    success: {
      main: '#00f5d4',
      dark: '#0a2e2a',
      contrastText: '#ffffff',
    },
    info: { main: '#8338ec' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: 'hidden',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE/Edge
          '&::-webkit-scrollbar': {
            display: 'none', // Chrome, Safari, Edge
          },
        },
      },
    },
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
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
};

export default App;