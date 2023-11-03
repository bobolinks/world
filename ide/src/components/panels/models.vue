<template>
  <el-table :data="data" :show-header="false" style="width: 100%">
    <el-table-column prop="name" label="name">
      <template #default="scope">
        <div class="font-item" style="display: flex; align-items: center" draggable="true" @dragstart="onItemDragstart(scope.row, $event)">
          <el-icon>
            <Rank />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.name }}</span>
          <div style="flex: 1 1 auto" />
          <span style="margin-right: 10px; font-size: 1rem; color: #777">{{ scope.row.size }} Bytes</span>
        </div>
      </template>
    </el-table-column>
  </el-table>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { Rank } from '@element-plus/icons-vue';
import { fillDragParams } from '../../core/drags';
import apis from '../../apis';
import { global } from '../../global';

const data = ref<any[]>([]);

async function loadModelsInfo() {
  const ls = await apis.getModelFiles(global.project.name);
  data.value = ls.map((e) => {
    const name: string = e.url.split('/').pop() as any;
    return { url: e.url, name, size: e.size };
  });
}

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragFile', soure: null, path: item.url, mime: 'model/*' });
}

onMounted(() => {
  global.addEventListener('assetsChanged', loadModelsInfo);
  loadModelsInfo();
});

onUnmounted(() => {
  global.removeEventListener('assetsChanged', loadModelsInfo);
});
</script>
<style scoped>
.font-item * {
  pointer-events: none;
}
</style>
