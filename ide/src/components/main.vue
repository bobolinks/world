<template>
  <div ref="root" class="wrap" style="position: relative; height: 100%; height: 100%;">
    <canvas id="canvas" class="canvas" :width="canvasWidth" :height="canvasHeight" @drop="onDrop" />
    <div v-show="!store.state.isWorldView" ref="graph" class="graph" />
    <Selector class="mainLisSelector" :values="store.state.audioListeners" max-width="420px"
      title="Please select audio listener" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { Scene } from 'three';
import Selector, { showSelector } from './elements/selector.vue';
import { global } from '../global';
import { World } from '../core/world';
import { store } from '../store';
import { GraphEditor } from '../core/nodes/GraphEditor';
import { parseDragParams } from '../core/drags';

declare global {
  interface Window {
    monaco: any;
  }
}

defineProps({
  iso: {
    type: Boolean,
    default: false
  },
});

const root = ref<HTMLDivElement>();
const graph = ref<HTMLDivElement>();

const canvasWidth = ref(3840);
const canvasHeight = ref(2160);

function resizeCanvas() {
  if (!root.value) {
    return;
  }
  const canvas = root.value.children[0] as HTMLCanvasElement;
  let { width, height } = root.value.getBoundingClientRect();
  global.editor?.setSize(width, height);
  const screen = global.project.world;
  if (screen.aspect === 'auto') {
    // do nothing
  } else if (screen.aspect > 1) {
    height = width / screen.aspect;
  } else {
    width = height * screen.aspect;
  }
  canvasWidth.value = width * window.devicePixelRatio;
  canvasHeight.value = height * window.devicePixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  global.world?.resize(canvasWidth.value, canvasHeight.value);
}

watch(() => store.state.isFloating, () => {
  setTimeout(resizeCanvas, 0);
});

function onProjectLoaded() {
  resizeCanvas();
  updateScene();
}

function updateScene() {
  if (!global.world) {
    return;
  }
  global.world.setScene(global.project.scene);
  global.editor.setScene(global.project.scene);
  global.history.setScene(global.project.scene);
}

watch(() => store.state.isWorldView, () => {
  updateScene();
});

function waitForMonaco() {
  window.removeEventListener('monacoReady', waitForMonaco)
  global.editor = new GraphEditor(new Scene(), (global.world as any).renderer, (global.world as any).composer, global.history);
  (graph.value as any).append(global.editor.domElement);
  resizeCanvas();
}

onMounted(() => {
  if (!global.world) {
    global.world = new World(document.getElementById('canvas') as any, global.history);

    if (window.monaco) {
      global.editor = new GraphEditor(global.world.root, global.world.renderer, (global.world as any).composer, global.history);
      (graph.value as any).append(global.editor.domElement);
    } else {
      window.addEventListener('monacoReady', waitForMonaco)
    }

    global.world.run();
  }

  resizeCanvas();

  window.addEventListener('resize', resizeCanvas)
  global.addEventListener('projectLoaded', onProjectLoaded);
  global.addEventListener('worldSettingsModified', resizeCanvas);
  global.addEventListener('sceneChanged', updateScene);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas);
  global.removeEventListener('projectLoaded', onProjectLoaded);
  global.removeEventListener('worldSettingsModified', resizeCanvas);
  global.removeEventListener('sceneChanged', updateScene);
});

async function onDrop(event: DragEvent) {
  const data = parseDragParams(event);
  if (!data || data.type !== 'dragObjectClass') {
    return;
  }
  event.stopPropagation();
  const params: any[] = [];
  if (data.name === 'PositionalAudio2') {
    const liss = global.project.scene.getObjectsByProperty('isAudioListener2', true) || [];
    if (liss.length === 0) {
      global.dispatchEvent({ type: 'userEventNotice', level: 'error', message: 'Not audio listener found' });
      return;
    } else if (liss.length === 1) {
      params.push({ listener: liss[0] });
    } else {
      store.state.audioListeners = liss.map(e => ({ name: e.name, value: e.uuid }));
      const rs = await showSelector(document.querySelector('.mainLisSelector') as any);
      if (!rs) {
        return;
      }
      params.push({ listener: liss.find(e => e.uuid === rs) });
    }
  }
  const object = global.project.addObjectByClass(data.name, undefined, params);
  global.history.push({
    tip: `Add object [class=${data.name}][uuid=${object.uuid}]`,
    undo: () => {
      global.project.removeObject(object);
    },
    redo: () => {
      global.project.addObject(object);
    },
  });
}

</script>
<style scoped>
.wrap {
  position: relative;
  background: black;
  display: flex;
  justify-content: center;
}

.wrap .canvas {
  margin: auto;
  background: white;
}

.wrap .graph {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 0;
  z-index: 100;
  /* background-color: white; */
  opacity: 0.95;
  overflow: hidden;
}
</style>