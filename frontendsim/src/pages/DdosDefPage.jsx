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
  Button
} from "@mui/material";
import ShieldIcon from "@mui/icons-material/Shield";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

// Slightly tweaked theme palette for uniqueness
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#2979ff" },
    secondary: { main: "#f50057" },
    background: { default: "#101010", paper: "#1a1a1a" },
    success: { main: "#00e5b4" },
  },
  typography: {
    fontFamily: "'Segoe UI', sans-serif",
  },
});

const DdosDefPage = () => {
  const [packets, setPackets] = useState([]);
  const [isProtected, setIsProtected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const packetListRef = useRef(null);

  useEffect(() => {
    const activeSocket = io("http://localhost:5000", {
      query: { pageType: "ddosdef" },
    });
    setSocket(activeSocket);

    return () => {
      activeSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      setIsConnected(true);
      fetch("http://localhost:5000/api/start-packets")
        .then((res) => res.json())
        .then((data) => console.info(data.message))
        .catch((error) => console.error("Startup error:", error));
    });

    socket.on("packet", (packet) => {
      setPackets((prev) => [...prev, packet].slice(-20));
      setTimeout(() => {
        packetListRef.current?.scrollTo({ top: packetListRef.current.scrollHeight, behavior: "smooth" });
      }, 120);
    });

    socket.on("ddos-prevention-activated", () => {
      setIsProtected(true);
    });

    socket.on("disconnect", () => setIsConnected(false));

    return () => {
      socket.off("connect");
      socket.off("packet");
      socket.off("ddos-prevention-activated");
      socket.off("disconnect");
    };
  }, [socket]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md">
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            py: 10,
          }}
        >
          <ShieldIcon
            sx={{
              fontSize: 64,
              color: "#2979ff",
              mb: 2,
              filter: "drop-shadow(0px 5px 12px rgba(41, 121, 255, 0.5))",
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: "700",
              background: "linear-gradient(to right, #2979ff, #651fff)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 3,
            }}
          >
            Server Guarded<br />(DDoS Active Defense)
          </Typography>

          {isConnected && !isProtected && (
            <Alert
              severity="info"
              sx={{
                backgroundColor: "#222",
                borderRadius: "10px",
                color: "#ffffff",
              }}
            >
              Incoming packets detected ({packets.length})
            </Alert>
          )}

          {isProtected && (
            <Box
              sx={{
                backgroundColor: "rgba(0, 229, 180, 0.15)",
                p: 4,
                mt: 4,
                borderRadius: "14px",
                boxShadow: "0px 5px 14px rgba(0, 229, 180, 0.5)",
                textAlign: "center",
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#00e5b4" }}>
                Protection Mode Enabled
              </Typography>
              <Typography sx={{ color: "#eee", mt: 1 }}>
                Heavy traffic detected. Defense mechanisms activated.
              </Typography>
              <Button
                variant="contained"
                href="/dashboard"
                sx={{ mt: 3, backgroundColor: "#00e5b4", color: "#111" }}
              >
                Back to Dashboard
              </Button>
            </Box>
          )}

          <Paper
            sx={{
              mt: 5,
              p: 3,
              width: "100%",
              borderRadius: "16px",
              maxWidth: "620px",
              backgroundColor: "#1a1a1a",
            }}
          >
            <Typography variant="h5" sx={{ mb: 2, color: "#2979ff" }}>
              Latest Packet Feed
            </Typography>
            {packets.length === 0 ? (
              <Typography
                variant="body1"
                sx={{ color: "text.secondary", textAlign: "center" }}
              >
                Waiting for packet activity...
              </Typography>
            ) : (
              <List
                ref={packetListRef}
                sx={{
                  maxHeight: "300px",
                  overflowY: "auto",
                  "&::-webkit-scrollbar": { display: "none" },
                  scrollbarWidth: "none",
                }}
              >
                {packets.map((packet, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      p: 1.5,
                      my: 1,
                      borderRadius: "10px",
                      backgroundColor: "#111",
                      color: "#fff",
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body1">
                      <strong>Packet #{packet.id}</strong>
                    </Typography>
                    <Typography variant="body2">
                      {packet.size} bytes
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
