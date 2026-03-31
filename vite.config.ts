import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /^react-native$/,
        replacement: 'react-native-web',
      },
      {
        find: /^react-native-safe-area-context$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/react-native-safe-area-context/lib/module/index.js',
        ),
      },
      {
        find: /^react-native-svg$/,
        replacement: path.resolve(
          __dirname,
          'node_modules/react-native-svg/lib/module/index.js',
        ),
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.js',
      '.web.mjs',
      '.tsx',
      '.ts',
      '.web.jsx',
      '.mjs',
      '.jsx',
      '.js',
    ],
    mainFields: ['browser', 'module', 'jsnext:main', 'jsnext'],
  },
  define: {
    global: 'globalThis',
  },
});
