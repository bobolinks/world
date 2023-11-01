<template>
  <div ref="root" class="wrap" style="position: relative; height: 100%; height: 100%;">
    <canvas id="canvas" class="canvas" @drop="onDrop" />
    <div v-show="store.state.editorType==='Graph'" ref="graph" class="graph" />
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

function resizeCanvas() {
  const canvas = document.getElementById('canvas');
  if (!root.value || !canvas) {
    return;
  }
  let { width, height } = root.value.getBoundingClientRect();
  global.editor?.setSize(width, height);
  const screen = global.project.world;
  let pixelRatio = 1;
  if (screen.resolution === 'auto') {
    // do nothing
  } else {
    const [w,h] = screen.resolution.split(':').map(e => Number.parseInt(e));
    const aspect = w / h;
    if (aspect > 1) {
      pixelRatio = Math.max(1, Math.floor(w / width));
      height = width / aspect;
    } else {
      pixelRatio = Math.max(1, Math.floor(h / height));
      width = height * aspect;
    }
  }
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  global.world?.resize(width, height, pixelRatio);
}

watch(() => store.state.isFloating, () => {
  setTimeout(resizeCanvas, 0);
});

function onProjectLoaded() {
  global.world.setSelectedObjects(global.project.selectedObjects);
  resizeCanvas();
  updateScene();
}

function updateScene() {
  if (!global.world) {
    return;
  }
  global.world.setScene(global.project.scene);
  global.editor?.setScene(global.project.scene);
  global.history.setScene(global.project.scene);
}

watch(() => store.state.editorType, () => {
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
      global.editor = new GraphEditor(global.world.worldEditor, global.world.renderer, (global.world as any).composer, global.history);
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