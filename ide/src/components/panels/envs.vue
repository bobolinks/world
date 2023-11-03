<template>
  <div class="list">
    <div v-for="item in items" :key="item.name" class="item" @click="setEnv(item)">
      <img :src="item.cover" />
      <label :data-name="item.name">{{ item.title }}</label>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Texture, CubeTextureLoader } from 'three';
import { HDRCubeTextureLoader } from 'three/examples/jsm/loaders/HDRCubeTextureLoader.js';
import apis, { EnvSceneInfo } from '../../apis';
import { global } from '../../global';

const items = ref<Array<EnvSceneInfo>>([]);

async function loadEnvs() {
  const ls = await apis.environments();
  items.value = [...ls, { name: 'Empty', title: 'Empty', cover: '/assets/images/blank.png', format: '' }];
}

function dettachTextureIfNoRef(textures: Array<Texture>) {
  for (const texture of textures) {
    if (!texture) continue;
    let inused = false;
    for (const scene of global.project.scenes) {
      if (scene.background instanceof Texture && scene.background.uuid === texture.uuid) {
        inused = true;
        break;
      }
    }
    if (!inused) {
      delete global.project.textures[texture.uuid];
    }
  }
}

async function setEnv(item: EnvSceneInfo) {
  // find it from project
  let texture: Texture | null | undefined = Object.values(global.project.textures).find((e) => e.userData.name === item.name);
  if (!texture && item.name !== 'Empty') {
    const loader = item.format === '.hdr' ? new HDRCubeTextureLoader() : new CubeTextureLoader();
    loader.setPath(`/fs/file/shared/environments/${item.name}/`);
    texture = await loader.loadAsync(['px', 'nx', 'py', 'ny', 'pz', 'nz'].map((e) => `${e}${item.format}`));
    texture.userData.name = item.name;
    global.project.textures[texture.uuid] = texture;
  }
  if (texture === undefined) texture = null as any;
  {
    const scene = global.project.scene;
    const oldBackground = scene.background;
    const oldEnvironment = scene.environment;
    scene.background = texture as any;
    scene.environment = texture as any;
    global.world.worldEditor.background = texture as any;
    global.world.worldEditor.environment = texture as any;
    dettachTextureIfNoRef([oldBackground, oldEnvironment] as any);
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [scene] });
    global.history.push({
      tip: `Set env[${item.name}] to current scene`,
      undo: () => {
        scene.background = oldBackground;
        scene.environment = oldEnvironment;
        global.world.worldEditor.background = oldBackground;
        global.world.worldEditor.environment = oldEnvironment;
      },
      redo: () => {
        scene.background = texture as any;
        scene.environment = texture as any;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        global.world.root.background = texture;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        global.world.root.environment = texture;
      },
    });
  }
}

onMounted(() => {
  loadEnvs();
});

onUnmounted(() => {});
</script>
<style scoped>
.list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
}

.item {
  display: flex;
  flex-direction: row;
  align-items: top;
  margin: 6px 2px;
  padding: 4px;
  border-radius: 8px;
  background-color: #f2f2f2;
  cursor: pointer;
  box-shadow: 0px 0px 3px 1px #ccc;
}

.item img {
  border-radius: 8px;
  width: 72px;
  height: 72px;
  margin-right: 1em;
  pointer-events: none;
}

.item label {
  position: relative;
  font-size: 1.2rem;
  margin-top: 2em;
  font-weight: 300;
  pointer-events: none;
}

.item label::before {
  position: absolute;
  top: -1.8em;
  content: attr(data-name);
  font-weight: 500;
}
</style>
