import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";


export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, 
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