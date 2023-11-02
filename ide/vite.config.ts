import { defineConfig, } from 'vite';
import vue from '@vitejs/plugin-vue';
import basicSsl from '@vitejs/plugin-basic-ssl';
import topLevelAwait from "vite-plugin-top-level-await";


// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: [{
      find: /^@\//,
      replacement: '/src/',
    }],
  },
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
      template: {
        compilerOptions: {
          isCustomElement: tagName => {
            return tagName === 'vue-advanced-chat' || tagName === 'emoji-picker'
          }
        }
      }
    }),
    basicSsl(),
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    }),
  ],
  base: '/',
  build: {
    outDir: '../dist/web',
    emptyOutDir: true,
    // only for debug
    minify: process.env.NODE_ENV === 'production',
  },
  assetsInclude: ['**/*.frag'],
  server: {
    proxy: {
      "/wsjoy": {
        target: 'http://192.168.31.21',
        changeOrigin: true,
        ws: true,
        secure: false,
      },
      "/tts": {
        target: 'http://localhost:8153',
        changeOrigin: true,
      },
      "/fs": {
        target: 'http://localhost:8152',
        changeOrigin: true,
      },
    }
  },
});
