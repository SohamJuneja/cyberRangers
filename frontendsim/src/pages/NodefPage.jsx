"use client";

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import {
  Container,
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  Alert,
  Button,
} from "@mui/material";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff006e" },
    secondary: { main: "#8338ec" },
    background: { default: "#131313", paper: "#1d1d1d" },
    error: { main: "#e63946" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

const NoDefPage = () => {
  const [logs, setLogs] = useState([]);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [connection, setConnection] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const activeConnection = io("http://localhost:5000", {
      query: { pageType: "nodef" },
    });
    setConnection(activeConnection);

    return () => {
      activeConnection.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!connection) return;

    connection.on("connect", () => {
      setIsConnected(true);
    });

    connection.on("packet", (data) => {
      setLogs((prev) => [...prev, data].slice(-20));
    });

    connection.on("server-overload", () => {
      setIsOverloaded(true);
      setTimeout(() => setFadeOut(true), 3000);
    });

    connection.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      connection.off("connect");
      connection.off("packet");
      connection.off("server-overload");
      connection.off("disconnect");
    };
  }, [connection]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {isOverloaded && (
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            backgroundColor: fadeOut ? "#000" : "rgba(0, 0, 0, 0.92)",
            zIndex: 99,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: fadeOut ? "transparent" : "#fff",
            textAlign: "center",
            transition: "all 2s ease",
          }}
        >
          {!fadeOut && (
            <>
              <Typography variant="h2" sx={{ fontWeight: "bold", mb: 3 }}>
                Server Down 💥
              </Typography>
              <Typography variant="h5">
                Too much traffic has taken the server offline.
              </Typography>
            </>
          )}
        </Box>
      )}

      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            py: 10,
            my: 4,
          }}
        >
          <ReportProblemIcon
            sx={{ fontSize: 64, color: "primary.main", mb: 3 }}
          />
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 1 }}>
            Unprotected Server Instance
          </Typography>

          {isConnected && (
            <Alert
              severity="info"
              sx={{
                backgroundColor: "background.paper",
                borderRadius: 2,
                color: "#fff",
                mt: 3,
              }}
            >
              Data incoming... ({logs.length} logs captured)
            </Alert>
          )}

          <Paper
            sx={{
              mt: 5,
              p: 3,
              borderRadius: 4,
              width: "100%",
              maxWidth: 600,
              backgroundColor: "background.paper",
            }}
          >
            <Typography
              variant="h5"
              sx={{ mb: 2, color: "primary.main", fontWeight: 500 }}
            >
              Packet Activity Stream
            </Typography>

            {logs.length === 0 ? (
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", textAlign: "center" }}
              >
                Waiting for packet activity...
              </Typography>
            ) : (
              <List
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {logs.map((pkt, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      backgroundColor: "#1a1a1a",
                      color: "#fff",
                      my: 1,
                      py: 1.5,
                      px: 2,
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body1">
                      <strong>Packet #{pkt.id}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Size: {pkt.size} bytes
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default NoDefPage;
