import { defineConfig } from 'vite';

export default defineConfig({
  root: 'src',
  build: {
    outDir: '../cpac-docs',
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
