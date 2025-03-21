
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Optimize for smaller builds and better compatibility with Termux
    minify: 'esbuild',
    target: 'es2018', // More compatible target
    cssMinify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks for better caching
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-toast', '@radix-ui/react-tooltip']
        }
      }
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2018', // Ensure dependencies are also built for compatible targets
    }
  },
  plugins: [
    react({
      // Use SWC for faster builds
      jsxImportSource: 'react',
      plugins: []
    }),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
