import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native/Libraries/Utilities/Platform': 'react-native-web/dist/exports/Platform',
      'react-native/Libraries/Components/View/ViewStylePropTypes': 'react-native-web/dist/exports/View',
    },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js']
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true)
  },
  server: {
    port: 3000,
    host: true
  }
});
