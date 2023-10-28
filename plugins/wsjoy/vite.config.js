// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: [resolve(__dirname, 'src/wsjoy.ts'),],
      formats: ['es'],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['three', 'u3js'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          three: 'THREE',
          u3js: 'U3JS',
        },
      },
    },
  },
})
