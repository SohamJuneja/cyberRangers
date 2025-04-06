import { defineConfig } from "vite";
import reactPlugin from "@vitejs/plugin-react";
import tailwindPlugin from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [reactPlugin(), tailwindPlugin()],
  server: {
    host: true, // Necessary for enabling the development tunnel
    proxy: {
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true
      },
      '/tunnel-url': {
        target: 'http://localhost:5000'
      }
    }
  }
});
