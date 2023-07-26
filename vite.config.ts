import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react(), tsconfigPaths(), nodePolyfills({ protocolImports: true }), svgr() ],
  optimizeDeps: {disabled: false},
  build: {
    commonjsOptions: { include: [] }
  },
});
