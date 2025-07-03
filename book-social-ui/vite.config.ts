import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // Configuraciones del servidor de desarrollo
    host: 'localhost',
    port: 4200,
    // Configuraciones para manejar headers grandes (Error 431)
    hmr: {
      overlay: false
    },
    // Configuraciones para manejar contenido grande
    fs: {
      // Permitir servir archivos fuera del workspace
      strict: false
    }
  },
  // Optimizaciones para desarrollo
  optimizeDeps: {
    include: ['@angular/common', '@angular/core', '@angular/platform-browser']
  },
  // Configuraciones para el build
  build: {
    // Aumentar el límite de chunk warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Configuraciones para manejar assets grandes
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
