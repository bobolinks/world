<template>
  <el-tabs class="picker full-height" type="border-card" style="flex: 1 1 auto">
    <el-tab-pane v-if="store.state.editorType==='Scene'">
      <template #label>
        <div class="picker-label">
          <i class="icon-cube" />
          <label class="fullname">Units</label>
        </div>
      </template>
      <Units />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType!=='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-model3d" />
          <label class="fullname">Entities</label>
        </div>
      </template>
      <Entities />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-fireworks" />
          <label class="shortname">F</label>
        </div>
      </template>
      <EffectNodes />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Scene'">
      <template #label>
        <div class="picker-label">
          <i class="icon-fireworks" />
          <label class="fullname">Effects</label>
        </div>
      </template>
      <Effects />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Scene'">
      <template #label>
        <div class="picker-label">
          <i class="icon-scene" />
          <label class="fullname">Scenes</label>
        </div>
      </template>
      <Envs />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-brush" />
          <label class="shortname">M</label>
        </div>
      </template>
      <Materials />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-json" />
          <label class="shortname">S</label>
        </div>
      </template>
      <Scripts />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-model3d" />
          <label class="shortname">O</label>
        </div>
      </template>
      <Models />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-font" />
          <label class="shortname">F</label>
        </div>
      </template>
      <Fonts />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-image" />
          <label class="shortname">I</label>
        </div>
      </template>
      <Images />
    </el-tab-pane>
    <el-tab-pane v-if="store.state.editorType==='Graph'">
      <template #label>
        <div class="picker-label">
          <i class="icon-audio" />
          <label class="shortname">A</label>
        </div>
      </template>
      <Sounds />
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import { store } from '../store';
import Scripts from './panels/scripts.vue';
import Materials from './panels/materials.vue';
// import MathPanel from './panels/Math.vue';
import Units from './panels/units.vue';
import Envs from './panels/envs.vue';
import Images from './panels/images.vue';
import Sounds from './panels/sounds.vue';
import Fonts from './panels/fonts.vue';
import EffectNodes from './panels/effectNodes.vue';
import Effects from './panels/effects.vue';
import Models from './panels/models.vue';
import Entities from './panels/entities.vue';
// import Shapes from './panels/shapes.vue';
import apis from '../apis';
import { onMounted } from 'vue';

async function onDrop(e: DragEvent) {
  debugger;
  if (!e.dataTransfer || !e.dataTransfer.files || e.dataTransfer.files.length === 0) {
    return;
  }
  e.stopPropagation();
  const len = e.dataTransfer.files.length;
  for (let i = 0; i < len; i++) {
    const file = e.dataTransfer.files[i];
    apis.uploadFile(file);
  }
}

onMounted(() => {
  const sd = document.querySelector('.picker') as any;
  sd.ondrop = onDrop;
});

</script>
<style>
.picker {
  overflow: hidden;
}

.picker .el-tab-pane {
  max-height: calc(100vh - 550px) !important;
  min-height: calc(100vh - 550px) !important;
  overflow: scroll;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  box-sizing: border-box;
}

.picker-label {
  align-items: center;
  display: flex;
  flex-direction: row;
}

.picker-label * {
  cursor: pointer;
}

.picker-label i {
  font-size: 1.6em;
}

.shortname {
  font-family: LongCang;
  font-size: 1.6rem;
  margin-left: 0.1em;
}

.fullname {
  font-size: 1.4rem;
  font-weight: 400;
  font-family: unset;
  margin-left: 0.1em;
}
</style>