<template>
  <el-popover trigger="click" width="320px" placement="bottom-end">
    <template #reference>
      <div class="panel-menu-bar-item">
        <i class="icon-slider" />
        <label class="title">Editor Options</label>
      </div>
    </template>
    <div class="props-list">
      <div class="prop-item">
        <label class="prop-name">wireframe</label>
        <el-checkbox v-model="data.wireframe" size="small" class="prop-value" />
      </div>
      <div class="prop-item">
        <label class="prop-name">helper</label>
        <el-checkbox v-model="data.showHelper" size="small" class="prop-value" />
      </div>
    </div>
  </el-popover>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { global } from '../../global';

const data = ref({
  wireframe: false,
  showHelper: false,
});

watch(
  () => data.value.wireframe,
  () => {
    Object.values(global.world.geometryEditors).forEach((e) => (e.wireframe = data.value.wireframe));
  },
);

watch(
  () => data.value.showHelper,
  () => {
    Object.values(global.world.geometryEditors).forEach((e) => (e.showHelper = data.value.showHelper));
  },
);

onMounted(() => {
  data.value.wireframe = global.world.geometryEditors.Vertex.wireframe;
  data.value.showHelper = global.world.geometryEditors.Vertex.showHelper;
});

onUnmounted(() => {});
</script>
<style scoped></style>
