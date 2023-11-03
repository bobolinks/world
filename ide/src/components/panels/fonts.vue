<template>
  <el-table :data="fontsData" :show-header="false" style="width: 100%">
    <el-table-column prop="name" label="name">
      <template #default="scope">
        <div class="font-item" style="display: flex; align-items: center" draggable="true" @dragstart="onItemDragstart(scope.row, $event)">
          <el-icon>
            <Rank />
          </el-icon>
          <span style="margin-left: 10px">{{ scope.row.name }}</span>
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

const fontsData = ref<any[]>([]);

async function loadFontsInfo() {
  const ls = await apis.getFonts(global.project.name);
  fontsData.value = ls.map((e) => {
    const name: string = e.split('/').pop() as any;
    return { url: e, name };
  });
}

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragFile', soure: null, path: item.url, mime: 'font/*' });
}

onMounted(() => {
  global.addEventListener('assetsChanged', loadFontsInfo);
  loadFontsInfo();
});

onUnmounted(() => {
  global.removeEventListener('assetsChanged', loadFontsInfo);
});
</script>
<style scoped>
.font-item * {
  pointer-events: none;
}
</style>
