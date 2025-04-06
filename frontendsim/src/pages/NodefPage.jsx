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

// Create a custom dark theme
const customDarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#ff4081" }, // Slightly lighter shade of pink
    secondary: { main: "#ba68c8" }, // Light purple
    background: { default: "#121212", paper: "#1e1e1e" },
    error: { main: "#e91e63" }, // Deep red for error state
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

const NoDefPage = () => {
  const [packets, setPackets] = useState([]);
  const [isOverloaded, setIsOverloaded] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", { query: { pageType: "nodef" } });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setIsConnected(true);
    });

    socket.on("packet", (packet) => {
      setPackets((prev) => [...prev, packet].slice(-20));
    });

    socket.on("server-overload", () => {
      setIsOverloaded(true);
      setTimeout(() => {
        setFadeOut(true);
      }, 3000);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("packet");
      socket.off("server-overload");
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <ThemeProvider theme={customDarkTheme}>
      <CssBaseline />
      {isOverloaded && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: fadeOut ? "black" : "rgba(0, 0, 0, 0.85)",
            zIndex: 50,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: fadeOut ? "black" : "white",
            textAlign: "center",
            transition: "all 2s ease-in-out",
          }}
        >
          {!fadeOut && (
            <>
              <Typography variant="h2" sx={{ fontWeight: "bold", mb: 3 }}>
                Oh no! 😱
              </Typography>
              <Typography variant="h5" sx={{ mb: 3 }}>
                The server is overloaded due to too much traffic.
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
            py: 8,
            my: 4,
            transition: "all 0.5s ease-in-out",
          }}
        >
          <ReportProblemIcon sx={{ fontSize: 64, color: "#ff4081", mb: 2 }} />
          <Typography variant="h3" sx={{ fontWeight: "bold", mb: 2 }}>
            Basic Server <br />(No DDoS Protection)
          </Typography>

          {isConnected && (
            <Alert
              severity="info"
              sx={{
                backgroundColor: "#1e1e1e",
                borderRadius: "12px",
                color: "#fff",
                mt: 2,
              }}
            >
              Receiving packets... ({packets.length} received)
            </Alert>
          )}

          <Paper
            sx={{
              mt: 4,
              p: 3,
              borderRadius: "16px",
              width: "100%",
              maxWidth: "600px",
              backgroundColor: "#1e1e1e",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#3a86ff" }}>
              Packet Log
            </Typography>
            {packets.length === 0 ? (
              <Typography variant="body1" sx={{ color: "text.secondary", textAlign: "center" }}>
                No packets received yet...
              </Typography>
            ) : (
              <List
                sx={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  scrollbarWidth: "none",
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {packets.map((packet, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      my: 1,
                      p: 1.5,
                      borderRadius: "12px",
                      backgroundColor: "#1a1a1a",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body1">
                      <strong>Packet #{packet.id}</strong>
                    </Typography>
                    <Typography variant="body2">Size: {packet.size} bytes</Typography>
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
