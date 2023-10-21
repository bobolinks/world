<template>
  <div class="props-list">
    <label class="prop-title" data-title="Screen" />
    <div class="prop-item">
      <label class="text-ellipsis prop-name">Aspect</label>
      <p style="flex: 1 1 auto" />
      <el-input v-model="screen.aspect" size="small" style="flex: 0 0 0%; min-width: 60px;" @change="aspectChanged" />
      <el-select v-model="screen.aspect" size="small" style="flex: 0 0 0%; min-width: 120px; margin-left: 1em;"
        @change="aspectChanged">
        <el-option v-for="item in builtinAspects" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
    </div>
    <label class="prop-title" data-title="View" />
    <div class="props">
      <div class="prop-item">
        <label class="text-ellipsis prop-name">Show grid</label>
        <p style="flex: 1 1 auto" />
        <el-switch v-model="isGridShow" class="prop-value" @change="showGrid" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { global } from '../../global';

const screen = ref({
  aspect: global.project.world.aspect,
});

const builtinAspects = [
  { label: '16 : 9', value: 16 / 9 },
  { label: '16 : 10', value: 1.6 },
  { label: '3840 :2160', value: 3840 / 2160 },
  { label: 'auto', value: 'auto' },
];

const isGridShow = ref(global.world?.gridHelper.visible);

function aspectChanged(value: number | 'auto') {
  screen.value.aspect = value;
  global.project.world.aspect = value;
  global.dispatchEvent({ type: 'worldSettingsModified', soure: null as any, settings: { aspect: value } });
}

function showGrid() {
  if (global.world) {
    global.world.gridHelper.visible = isGridShow.value;
    localStorage.setItem('isGridHelperVisible', isGridShow.value ? '1' : '0');
  }
}

function reset() {
  screen.value.aspect = global.project.world.aspect;
  isGridShow.value = global.world.gridHelper.visible;
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