<template>
  <div v-loading="store.state.isLoading" class="container">
    <TopBar />
    <div class="body-panels">
      <Panel class="frame main" icon="icon-vec3" :floating="store.state.isFloating">
        <template #header>
          <div v-if="store.state.editorType !== 'Sculptor'" class="hd-row">
            <Align />
            <Geo />
            <Animation />
            <div style="flex: 1 1 auto;" />
            <el-select v-model="currentCamera" placeholder="Select" size="small">
              <el-option v-for="item in cameras" :key="item" :label="item" :value="item" />
            </el-select>
            <i class="icon-video-camera" style="margin-left: 0.5em; margin-right:0.5em;" @click="reposCamera" />
            <div style="align-items: center; display: flex; flex-direction: row; justify-content: center; margin: 0 4px;">
              <el-switch v-model="editorSwitch" size="large" width="60" inline-prompt
                :active-action-icon="DataBoard" :inactive-action-icon="SetUp"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff9900" :disabled="isViewTypeDisabled" />
            </div>
          </div>
          <div v-else class="hd-row">
            <label>asd</label>
          </div>
        </template>
        <Main />
      </Panel>
      <div class="ctrl-bar rightside">
        <Panel class="objtree frame" icon="icon-logic">
          <template #header>
            <div v-if="store.state.editorType !== 'Sculptor'" class="hd-row">
              <el-select v-model="currentScene" placeholder="Select" size="small">
                <el-option v-for="item in list" :key="item" :label="item" :value="item" />
              </el-select>
              <i class="icon-add" style="margin-left: 0.5em; margin-right:0.5em;" @click="newScene" />
            </div>
          </template>
          <ObjTree />
        </Panel>
        <Panels class="frame" style="border-radius: 6px; overflow: hidden;" />
      </div>
    </div>
    <Contextmenu class="mainContextMenu" max-width="160px" />
    <!-- <canvas id="canvas" class="canvas" width="3840" height="2160"></canvas> -->
  </div>
</template>
<script lang="ts" setup>
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { SetUp, DataBoard } from '@element-plus/icons-vue';
import TopBar from '../components/topbar.vue';
import Main from '../components/main.vue';
import Panel from '../components/panel.vue';
import ObjTree from '../components/objtree.vue';
import Panels from '../components/panels.vue';
import Geo from '../components/menus/geo.vue';
import { store } from '../store';
import { global } from '../global';
import { Dragable } from '../utils/dragable';
import Align from '../components/menus/align.vue';
import Animation from '../components/menus/animation.vue';
import Contextmenu from '../components/elements/contextmenu.vue';

const currentScene = ref(global.project.scene.name);
const list = ref<string[]>(global.project.scenes.map(e => e.name));
const currentCamera = ref('Perspective');
const cameras = ref<Array<string>>(['Perspective', 'Orthographic']);
const isViewTypeDisabled = ref(true);
const editorSwitch = ref(true);

watch(editorSwitch, ()=> {
  store.state.editorType = editorSwitch.value ? 'Scene' : 'Graph';
});

watch(currentScene, () => {
  store.state.editorType = 'Scene';
  global.project.setScene(currentScene.value);
  resetCamers();
});

watch(currentCamera, () => {
  if (!global.world) {
    return;
  }
  const camera = [global.world.cameraPersp, global.world.cameraOrtho, ...global.project.cameras].find(e => e.name === currentCamera.value);
  if (!camera) {
    return;
  }
  global.world.setCamera(camera);
});

function newScene() {
  global.project.newScene();
  currentScene.value = global.project.scene.name;
  list.value = global.project.scenes.map(e => e.name);
  store.state.editorType = 'Scene';
  reset();
}

function reset() {
  resetScenes();
  resetCamers();
  isViewTypeDisabled.value = true;
}

function resetScenes() {
  currentScene.value = global.project.scene.name;
  list.value = global.project.scenes.map(e => e.name);
}
function resetCamers() {
  currentCamera.value = 'Perspective';
  cameras.value = ['Perspective', 'Orthographic', ...global.project.cameras.map(e => e.name)];
  if (global.world) {
    global.world.setCamera(global.world.cameraPersp);
  }
}
function reposCamera() {
  global.world.reposCamera();
}

function dectectObjectSelected() {
  isViewTypeDisabled.value = global.world?.selected ? false : true;
}

function handleSceneNameChanged({ objects }: any) {
  // is scene modified
  for (const object of objects) {
    if (object.uuid === global.project.scene.uuid) {
      resetScenes();
    } else if (object.isCamera) {
      resetCamers();
    }
  }
}

function switchViewMode() {
  if (!global.world?.selected || store.state.editorType === 'Sculptor') {
    return;
  }
  editorSwitch.value = !editorSwitch.value;
  if (store.state.editorType === 'Graph') {
    global.editor.setObject(global.world.selected);
  }
}

onMounted(() => {
  if (!global.dragable) {
    global.dragable = new Dragable(document.body);
  }
  global.addEventListener('projectLoaded', reset);
  global.addEventListener('sceneChanged', reset);
  global.addEventListener('treeModified', resetCamers);
  global.addEventListener('objectModified', handleSceneNameChanged);
  global.addEventListener('objectChanged', dectectObjectSelected);
  global.addKeyDownListener('meta+e', switchViewMode, 'Global.Switch to View/Graph Mode');
});

onUnmounted(() => {
  global.removeEventListener('projectLoaded', reset);
  global.removeEventListener('sceneChanged', reset);
  global.removeEventListener('treeModified', resetCamers);
  global.removeEventListener('objectModified', handleSceneNameChanged);
  global.removeEventListener('objectChanged', dectectObjectSelected);
  global.removeKeyDownListener('e', switchViewMode);
})

</script>
<style scoped='true'>
.container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background: black;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  background-color: hsla(215, 100%, 95%, 1);
}

.body-panels {
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  overflow: scroll;
  min-height: calc(100vh - 48px);
  max-height: calc(100vh - 48px);
}

.hd-row {
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  justify-content: right;
  align-items: center;
  align-self: stretch;
  padding-left: 2em;
}

.hd-row .tip {
  flex: 1 1 auto;
  margin-left: 4em;
  margin-right: 2em;
  text-align: center;
  font-size: 1rem;
  color: #555;
}

.hd-row .icon-video-camera {
  transform: rotateY(180deg);
}

.frame {
  margin: 6px;
}

.main {
  flex: 1 1 auto;
  font-size: 1.4rem;
  position: relative;
}

.ctrl-bar {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  margin-left: -6px;
}

.objtree {
  min-height: 400px;
  flex-direction: 0 0 none;
  margin-bottom: 0;
}

.main[floating='true'] {
  position: absolute;
  top: -4rem;
  right: 0;
  left: 0;
  width: 100vw;
  height: unset;
  bottom: 0;
  margin: 0;
  border-radius: 0;
  z-index: 999;
}
</style>
