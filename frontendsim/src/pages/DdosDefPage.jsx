import React, { useState, useEffect, useRef } from "react";
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
import ShieldIcon from "@mui/icons-material/Shield";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Custom theme with altered palette and typography
const themeConfig = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3a86ff" },
    secondary: { main: "#ff006e" },
    background: { default: "#121212", paper: "#1e1e1e" },
    success: { main: "#00f5d4" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

const DdosDefPage = () => {
  const [trafficData, setTrafficData] = useState([]);
  const [ddosBlocked, setDdosBlocked] = useState(false);
  const [socketConnection, setSocketConnection] = useState(null);
  const [connected, setConnected] = useState(false);
  const listRef = useRef(null);

  // Initiate socket connection
  useEffect(() => {
    const activeSocket = io("http://localhost:5000", {
      query: { pageType: "ddosdef" },
    });
    setSocketConnection(activeSocket);

    return () => activeSocket.disconnect();
  }, []);

  // Handle socket events
  useEffect(() => {
    if (!socketConnection) return;

    const socket = socketConnection;

    socket.on("connect", () => {
      setConnected(true);
      fetch("http://localhost:5000/api/start-packets")
        .then((res) => res.json())
        .then((data) => console.log(data.message))
        .catch((err) => console.error("Fetch error:", err));
    });

    socket.on("packet", (data) => {
      setTrafficData((prev) => [...prev, data].slice(-20));
      setTimeout(() => {
        if (listRef.current) {
          listRef.current.scrollTop = listRef.current.scrollHeight;
        }
      }, 100);
    });

    socket.on("ddos-prevention-activated", () => {
      setDdosBlocked(true);
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.off("connect");
      socket.off("packet");
      socket.off("ddos-prevention-activated");
      socket.off("disconnect");
    };
  }, [socketConnection]);

  return (
    <ThemeProvider theme={themeConfig}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            py: 6,
          }}
        >
          <ShieldIcon
            sx={{
              fontSize: 60,
              color: "primary.main",
              mb: 2,
              filter: "drop-shadow(0px 4px 10px rgba(58,134,255,0.4))",
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: "linear-gradient(135deg, #3a86ff, #8338ec)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              mb: 3,
            }}
          >
            Real-Time DDoS Defense
          </Typography>

          {connected && !ddosBlocked && (
            <Alert
              severity="info"
              sx={{
                bgcolor: "background.paper",
                color: "#fff",
                borderRadius: 2,
                px: 3,
                py: 2,
              }}
            >
              Monitoring traffic... ({trafficData.length} packets logged)
            </Alert>
          )}

          {ddosBlocked && (
            <Box
              sx={{
                mt: 4,
                px: 4,
                py: 3,
                borderRadius: 4,
                textAlign: "center",
                bgcolor: "rgba(0, 245, 212, 0.1)",
                boxShadow: "0 0 15px rgba(0, 245, 212, 0.3)",
              }}
            >
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "success.main" }}
              >
                DDoS Prevention Engaged!
              </Typography>
              <Typography sx={{ color: "#fff", mt: 1 }}>
                Malicious traffic mitigated. Packet flow is now throttled.
              </Typography>
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: "success.main",
                  color: "#121212",
                }}
                href="/dashboard"
              >
                Go to Dashboard
              </Button>
            </Box>
          )}

          <Paper
            sx={{
              mt: 5,
              width: "100%",
              maxWidth: "600px",
              px: 3,
              py: 4,
              bgcolor: "background.paper",
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h5"
              sx={{ color: "primary.main", mb: 2, fontWeight: 500 }}
            >
              Incoming Packet History
            </Typography>

            {trafficData.length === 0 ? (
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", textAlign: "center" }}
              >
                No data captured yet.
              </Typography>
            ) : (
              <List
                ref={listRef}
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  pr: 1,
                  "&::-webkit-scrollbar": { display: "none" },
                }}
              >
                {trafficData.map((entry, idx) => (
                  <ListItem
                    key={idx}
                    sx={{
                      backgroundColor: "#1a1a1a",
                      mb: 1,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#fff",
                    }}
                  >
                    <Typography variant="body1">
                      <strong>Packet #{entry.id}</strong>
                    </Typography>
                    <Typography variant="body2">
                      Size: {entry.size} bytes
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

export default DdosDefPage;
