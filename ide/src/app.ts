/* eslint-disable @typescript-eslint/no-unused-vars */
import { App } from 'vue';
import { Router, } from "vue-router";
import { Store } from 'vuex';
import state, { store } from './store';
import apis from './apis';
import shared from './shared';
import { Project } from './core/project';
import { global } from './global';

export default {
  async beforeLaunch(app: App, store: Store<typeof state>, router: Router) {
  },
  async onLaunched(app: App, store: Store<typeof state>, router: Router) {
    const ls = await apis.projects();
    store.state.projects = ls;
    await this.load();
    store.state.isLoading = false;
  },
  async load() {
    await shared.load();
    if (store.state.projectName !== 'shared') {
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
    global.dispatchEvent({ type: 'projectLoaded', soure: null as any, project: shared })
  }
};
