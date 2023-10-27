<template>
  <div class="props-list">
    <!-- <label class="prop-title" data-title="Screen" /> -->
    <div class="prop-item">
      <label class="text-ellipsis prop-name">Resolution</label>
      <p style="flex: 1 1 auto" />
      <el-select v-model="screen.resolution" size="small" style="flex: 0 0 0%; min-width: 240px; margin-left: 1em;"
        @change="resolutionChanged">
        <el-option v-for="item in builtinResolutions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <!-- <label class="prop-title" data-title="View" /> -->
    <div class="prop-item">
      <label class="text-ellipsis prop-name">Show grid</label>
      <p style="flex: 1 1 auto" />
      <el-switch v-model="isGridShow" class="prop-value" @change="showGrid" />
    </div>
    <div class="prop-item">
      <label class="text-ellipsis prop-name">VR Enable</label>
      <p style="flex: 1 1 auto" />
      <el-switch v-model="isVREnable" class="prop-value" @change="switchVR" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { global } from '../../global';

const screen = ref({
  resolution: global.project.world.resolution,
});

const builtinResolutions = [
  { label: '4K (3840 X 2160)', value: '3840:2160' },
  { label: '2K (2560 X 1440)', value: '2560:1440' },
  { label: '1080p (1920 X 1080)', value: '1920:1080' },
  { label: '720p (1280 X 720)', value: '1280:720' },
  { label: 'Auto Resolution', value: 'auto' },
];

const isGridShow = ref(global.world?.gridHelper.visible);

function resolutionChanged(value: string | 'auto') {
  screen.value.resolution = value;
  global.project.world.resolution = value;
  global.dispatchEvent({ type: 'projectSettingsChanged', soure: null as any, project: global.project } );
  global.dispatchEvent({ type: 'worldSettingsModified', soure: null as any, settings: { resolution: value } });
}

function showGrid() {
  if (global.world) {
    global.world.gridHelper.visible = isGridShow.value;
    localStorage.setItem('isGridHelperVisible', isGridShow.value ? '1' : '0');
  }
}

const isVREnable = ref(global.project.world.vrEnable);

function switchVR() {
  global.project.world.vrEnable = isVREnable.value;
  global.dispatchEvent({ type: 'projectSettingsChanged', soure: null as any, project: global.project } );
}

function reset() {
  screen.value.resolution = global.project.world.resolution;
  isGridShow.value = global.world.gridHelper.visible;
  isVREnable.value = global.project.world.vrEnable;
}

onMounted(() => {
  if (global.world) {
    const isGridHelperVisible = Number.parseInt(localStorage.getItem('isGridHelperVisible') || '1');
    global.world.gridHelper.visible = !!isGridHelperVisible;
    isGridShow.value = global.world.gridHelper.visible;
  }
  global.addEventListener('projectLoaded', reset);
});

onUnmounted(() => {
  global.removeEventListener('projectLoaded', reset);
});

</script>
<style scoped>
.props-list {
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: stretch;
}

.prop-title {
  position: relative;
  width: 100%;
  height: 1px;
  border: none;
  border-top: 1px #aaa dashed;
  margin: 2em 0;
}

.prop-title::before {
  position: absolute;
  content: attr(data-title);
  font-size: 1.4em;
  font-weight: 500;
  background-color: white;
  padding: 0 0.5em;
  top: -0.7em;
  left: 0.4em;
}

.props-list .prop-item {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  margin-top: 4px;
  margin-bottom: 4px;
}

.prop-item .prop-name {
  max-width: 120px;
  min-width: 120px;
  flex: 0 0 0%;
}

.prop-item .prop-value {
  max-width: 60%;
  margin-right: 12px;
}
</style>