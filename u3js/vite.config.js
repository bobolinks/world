// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
// import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'U3JS',
      // the proper extensions will be added
      fileName: 'u3js',
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['three'],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          three: 'THREE',
        },
      },
    },
  },
  // plugins: [dts({ rollupTypes: true })],
})
