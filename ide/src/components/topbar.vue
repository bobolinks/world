<template>
  <div style="align-items: stretch; display: flex; flex-direction: column;">
    <div class="topbar" style="align-items: stretch; display: flex; flex-direction: row; width: auto">
      <div class="leftside"
        style="align-items: center; display: flex; flex: 1 1 auto; flex-direction: row; font-size: 2rem; padding-left: 0.5rem">
        <i class="icon-egg" style="cursor: default; font-size: 3rem" />
        <el-dropdown split-button type="primary" @command="selectProject">
          <el-input v-model="inputValue" placeholder="Please input" :disabled="!isNameEditable" @change="renameProject" />
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item v-for="name in store.state.projects" :key="name" :command="name">
                {{ name
                }}
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <el-icon style="margin-left: 0.5em; transform: scaleX(-1);">
          <MagicStick @click="newProject" />
        </el-icon>
        <!-- <i class="icon-add" style="margin-left: 1em;" @click="newProject" /> -->
      </div>
      <div class="toolbar-center">
        <i class="icon-undo" action="undo" :disabled="!canUndo" @click="undo" />
        <i class="icon-redo" action="redo" :disabled="!canRedo" @click="redo" />
        <i class="icon-save" action="save" :disabled="!isDirty" @click="save" />
        <el-icon>
          <UploadFilled @click="uploaderModel.visible = !uploaderModel.visible" />
        </el-icon>
      </div>
      <div class="rightside topbtns" style="align-items: center; display: flex; flex-direction: row">
        <i class="icon-start" @click="run" />
        <p style="flex: 1 1 auto" />
        <i class="icon-chip" @click="pluginsModel.visible = !pluginsModel.visible" />
        <el-icon>
          <Setting @click="settingsModel.visible = !settingsModel.visible" />
        </el-icon>
        <el-popover trigger="click" :width="320" @show="updateKeys">
          <template #reference>
            <i class="icon-keyboard" />
          </template>
          <Keyboard />
        </el-popover>
        <i :class="store.state.isFloating ? 'icon-minimize' : 'icon-maximize'" action="maximize"
          @click="store.state.isFloating = !store.state.isFloating" />
      </div>
    </div>
    <Uploader v-model="uploaderModel.visible" title="Upload files" />
    <Settings v-model="settingsModel.visible" title="World settings" />
    <Plugings v-model="pluginsModel.visible" title="Plugins" />
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted, } from 'vue';
import { MagicStick, UploadFilled, Setting } from '@element-plus/icons-vue';
import { ElMessageBox } from 'element-plus';
import Keyboard, { updateKeys } from './keyboard.vue';
import Uploader from './popovers/uploader.vue';
import Settings from './popovers/settings.vue';
import Plugings from './popovers/plugings.vue';
import { store } from '../store';
import { local } from '../lang';
import apis from '../apis';
import shared from '../shared';
import { global } from '../global';
import { Project } from '../core/project';

let oldProjectName = store.state.projectName;
const revision = ref(0);
const inputValue = ref(store.state.projectName);
const isNameEditable = ref(store.state.projectName !== 'shared');
const isDirty = ref(false);
const canUndo = ref(false);
const canRedo = ref(false);
const uploaderModel = ref({
  visible: false,
});
const settingsModel = ref({
  visible: false,
});
const pluginsModel = ref({
  visible: false,
});

function reset() {
  revision.value = global.project.revision;
  inputValue.value = global.project.name;
  isNameEditable.value = global.project.name !== 'shared';
  isDirty.value = false;
}

async function renameProject(name: string) {
  if (!name || oldProjectName === name) {
    return;
  }
  try {
    await apis.renameProject(oldProjectName, name);
    oldProjectName = name;
    store.dispatch('renameProject', name);
  } catch (e) {
    console.log(e);
  }
}

async function selectProject(name: string) {
  if (oldProjectName === name) {
    return;
  }
  oldProjectName = name;
  inputValue.value = name;
  isNameEditable.value = name !== 'shared';
  global.project = new Project(name);
  await global.project.load();
  store.dispatch('selectProject', name);
}

async function newProject() {
  const { action, value } = (await ElMessageBox.prompt(local('tips.inpjname'), local('tips.new'), {
    confirmButtonText: local('tips.ok'),
    cancelButtonText: local('tips.cancel'),
    inputPattern: /\w{1,30}/,
    inputErrorMessage: local('tips.invalidName'),
  })) as any;
  if (action === 'confirm' && value) {
    await apis.createProject(value);
    global.project = shared.createDefault(value);
    await save();
    store.dispatch('createProject', value);
    global.dispatchEvent({ type: 'projectLoaded', soure: global.project, project: global.project });
    oldProjectName = value;
    inputValue.value = value;
  }
}

async function save() {
  if (revision.value === global.project.revision) {
    return;
  }
  await global.project.flush();
  revision.value = global.project.revision;
  updateDirty();
}

function resetHistoryInfo() {
  canRedo.value = global.history.canRedo();
  canUndo.value = global.history.canUndo();
}

function undo() {
  if (global.history.canUndo()) {
    global.history.undo();
  }
}

function redo() {
  if (global.history.canRedo()) {
    global.history.redo();
  }
}

function updateDirty() {
  isDirty.value = revision.value !== global.project.revision;
}

function onProjectDirty(e: any) {
  if (e.source !== global.project) {
    global.project.increaseRevision();
  }
  updateDirty();
}

function onSceneChanged() {
  updateDirty();
  resetHistoryInfo();
}

function run() {
  const jsonFile = `/fs/file/${global.project.name}/index.json`;
  const url = `/preview/web/preview.html?url=${encodeURIComponent(jsonFile)}`;
  window.open(url, 'simulator');
}

onMounted(() => {
  global.addEventListener('projectLoaded', reset);
  global.addEventListener('projectDirty', onProjectDirty);
  global.addEventListener('sceneChanged', onSceneChanged);
  global.addEventListener('historyChanged', resetHistoryInfo);
  global.addKeyDownListener('meta+s', save, 'Global.Save');
  global.addKeyDownListener('meta+z', undo, 'Global.Undo');
  global.addKeyDownListener('meta+shift+z', redo, 'Global.Redo');
  global.addKeyDownListener('meta+r', run, 'Global.Run');
});

onUnmounted(() => {
  global.removeEventListener('projectLoaded', reset);
  global.removeEventListener('projectDirty', onProjectDirty);
  global.removeEventListener('sceneChanged', onSceneChanged);
  global.removeEventListener('historyChanged', resetHistoryInfo);
  global.removeKeyDownListener('meta+s', save);
  global.removeKeyDownListener('meta+z', undo);
  global.removeKeyDownListener('meta+shift+z', redo);
  global.removeKeyDownListener('meta+r', run);
});

</script>

<style>
.el-button-group .el-button {
  background-color: unset !important;
}
</style>

<style scoped='true'>
.topbar {
  padding: 0;
  color: hsla(0, 100%, 100%, 1);
  background-color: hsla(215, 100%, 65%, 1);
  user-select: none;
  position: relative;
  min-height: 48px;
  max-height: 48px;
}

.topbar i {
  font-size: 2rem;
}


.topbtns i {
  font-size: 2rem;
  margin-left: 0.75rem;
  margin-right: 0.75rem;
  cursor: pointer;
}

i {
  cursor: pointer;
}

.topbar i {
  color: white;
}

.topbar .icon-minimize {
  color: #ff9900;
  z-index: 1000;
}

i[disabled='true'] {
  cursor: default;
  color: #ccc;
  pointer-events: none;
}

.toolbar-center {
  flex: 1 1 auto;
  align-items: center;
  display: flex;
  flex-direction: row;
  justify-content: center;
}

.toolbar-center i {
  margin: 0px 8px;
}

.icon-start[disabled='false'] {
  color: greenyellow;
}

.icon-stop[disabled='false'] {
  color: red;
}

.icon-egg {
  color: #ffcc88;
}

.icon-trash[disabled='false'] {
  color: red;
}

.icon-loading {
  color: #ff9900;
  animation: rotate 1s infinite linear;
}
</style>