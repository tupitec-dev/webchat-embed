import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),     // entrada do app principal
        embed: path.resolve(__dirname, 'src/embed.ts'),   // entrada do script embed
      },
      output: {
        entryFileNames: chunk => {
          return chunk.name === 'embed' ? 'embed.js' : 'assets/[name]-[hash].js';
        },
      },
    },
  },
});
