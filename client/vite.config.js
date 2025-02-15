import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      // Set protocolImports to true if needed for specific imports
      protocolImports: true,
    }),
    react(),
  ],
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills({
          // Add any additional configuration here if needed
          protocolImports: true,
        }),
      ],
    },
  },
  resolve: {
    alias: {
      // Ensure any specific aliases are correctly set
      // Example: '@': '/src'
    },
  },
});
