import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../dist',
    emptyOutDir: true
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'public/latest/assets/*',
          dest: 'assets',
        },
      ],
    }),
  ],
  server: {
    headers: {
      'Cache-Control': 'no-store'
    },
    port: 5173
  }
});
