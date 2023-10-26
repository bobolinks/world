import { watch, } from "vue";
import { createStore } from "vuex";
import Theme from './utils/theme';
import type { UserNoticeLevel } from "u3js/src/types/types";

const state = {
  theme: localStorage.getItem('theme') || 'dark' as 'dark' | 'light',
  isLoading: true,
  isNetBusy: false,
  isWorldView: true,
  isFloating: false,
  projects: [] as Array<string>,
  projectName: localStorage.getItem('projectName') || 'shared',
  audioListeners: [] as Array<{ name: string; value: string }>,
  pluginsChanged: false,
  messages: [] as Array<{ type: UserNoticeLevel; time: Date, title: string; content: string; }>,
};

export const store = createStore({
  state,
  mutations: {
    selectProject(st, name: string) {
      st.projectName = name;
      st.isWorldView = true;
      localStorage.setItem('projectName', name);
    },
    createProject(st, name: string) {
      st.projects.push(name);
      st.projects = [...st.projects];
      st.projectName = name;
      st.isWorldView = true;
      localStorage.setItem('projectName', name);
    },
    renameProject(st, name: string) {
      const index = st.projects.indexOf(st.projectName);
      if (index !== -1) {
        st.projects.splice(index, 1, name);
      } else {
        st.projects.push(name);
      }
      st.projects = [...st.projects];
      st.projectName = name;
      localStorage.setItem('projectName', name);
    },
  },
  actions: {
    selectProject(context: any, params: any) {
      context.commit('selectProject', params);
    },
    createProject(context: any, params: any) {
      context.commit('renameProject', params);
    },
    renameProject(context: any, params: any) {
      context.commit('renameProject', params);
    },
  }
});

watch(() => store.state.theme, (v) => {
  localStorage.setItem('theme', v);
  Theme.setTheme(v);
});

watch(() => store.state.projectName, (v) => {
  localStorage.setItem('projectName', v);
});

export type Store = typeof state;
export default store.state;