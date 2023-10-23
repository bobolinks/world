/* eslint-disable @typescript-eslint/ban-ts-comment */
import { createApp, openBlock, resolveComponent, createBlock } from 'vue';
import { createRouter, createWebHashHistory, } from "vue-router";
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import 'u3js/src/browser';
import './assets/app.css';
import './assets/flow.css';
import './styles/index.less';
import appLifeCircle from './app';
import routes from './router';
import { store } from './store';

declare global {
  interface Window {
    setImmediate: any;
    $: (selector: string, doc: Document) => void;
    __store: any;
    __vue: any;
  }
}

if (!window.setImmediate) {
  window.setImmediate = window.setTimeout;
}

if (!window.$) {
  window.$ = (selector: string, doc: Document) => doc.querySelector(selector);
}

document.title = 'MASLIB';

const app = createApp({
  render: () => (openBlock(), createBlock(resolveComponent('router-view'))),
});

// @ts-ignore
window.__app = app;

// @ts-ignore
window.__store = store;

// setup store
app.use(store);

// setup router
const baseUrl = '/';
const history = createWebHashHistory(baseUrl);
const router = createRouter({
  history,
  routes
});
app.use(router);

app.use(ElementPlus);

async function main() {
  // disable service worker
  // await regService();

  await appLifeCircle.beforeLaunch(app, store, router);

  const vue = app.mount('#app');

  // @ts-ignore
  window.__vue = vue;

  vue.$nextTick(() => {
    appLifeCircle.onLaunched(app, store, router);
  });
}

main();
