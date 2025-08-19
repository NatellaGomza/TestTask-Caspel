import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteMockServe } from 'vite-plugin-mock';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    plugins: [
      react(),
      viteMockServe({
        mockPath: 'mock',
        enable: isDev, // enable only in dev mode
        watchFiles: true, // optional: auto reload mocks on change
      }),
    ],
  };
});

