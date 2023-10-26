/* eslint-disable @typescript-eslint/no-unused-vars */
import { App } from 'vue';
import { Router, } from "vue-router";
import { Store } from 'vuex';
import state, { store } from './store';
import apis from './apis';
import shared from './shared';
import { Project } from './core/project';
import { global } from './global';
import { setConsole } from 'u3js/src/extends/helper/logger';

export default {
  async beforeLaunch(app: App, store: Store<typeof state>, router: Router) {
    setConsole({
      debug(...args: any[]) {
        state.messages.push({ type: 'notice', content: `${args}`, title: 'DEBUG', time: new Date });
      },
      info(...args: any[]) {
        state.messages.push({ type: 'notice', content: `${args}`, title: 'INFO', time: new Date });
      },
      warn(...args: any[]) {
        state.messages.push({ type: 'warning', content: `${args}`, title: 'WARN', time: new Date });
      },
      error(...args: any[]) {
        state.messages.push({ type: 'error', content: `${args}`, title: 'ERROR', time: new Date });
      },
    });
  },
  async onLaunched(app: App, store: Store<typeof state>, router: Router) {
    const ls = await apis.projects();
    store.state.projects = ls;
    await this.load();
    store.state.isLoading = false;
  },
  async load() {
    await shared.load();
    if (store.state.projectName && store.state.projectName !== 'shared') {
      const project = new Project(store.state.projectName);
      try {
        await project.load(true);
        global.project = project;
      } catch (e) {
        console.error(e);
        global.project = shared;
      }
    } else {
      global.project = shared;
    }
    global.dispatchEvent({ type: 'projectLoaded', soure: null as any, project: global.project })
  }
};
