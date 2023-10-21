<template>
  <div class="list">
    <div v-for="item in items" :key="item.name" class="item" draggable="true" @dragstart="onItemDragstart(item, $event)">
      <audio controls :src="item.url" style="height: 24px;" />
      <div
        style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; margin: 0 1.6em;">
        <label>{{ item.name }}</label>
        <span style="font-size: 1rem;">{{ item.size }} Bytes</span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref, } from 'vue';
import apis from '../../apis';
import { global } from '../../global';
import { fillDragParams } from '../../core/drags';

type ItemInfo = { url: string; name: string; size: number; };

const items = ref<Array<ItemInfo>>([]);

async function loadFiles() {
  const filter = /\.wav|\.mp3|\.acc$/i;
  const ls = (await apis.getMediaFiles(global.project.name)).filter(e => filter.test(e.url));
  items.value.length = 0;
  items.value.push(...defaultImages);
  items.value.push(...ls.map(e => {
    const name: string = e.url.split('/').pop() as any;
    return { url: e.url, name, size: e.size };
  }));
}

const defaultImages: Array<ItemInfo> = [];

function onItemDragstart(item: ItemInfo, event: DragEvent) {
  fillDragParams(event, { type: 'dragFile', soure: null, path: item.url, mime: 'audio/*' });
}

onMounted(() => {
  global.addEventListener('assetsChanged', loadFiles);
  loadFiles();
});

onUnmounted(() => {
  global.removeEventListener('assetsChanged', loadFiles);
});


</script>

<style scoped>
.list {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  width: 100%;
  padding-bottom: 40px;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 6px 2px;
  padding: 4px;
  border-radius: 8px;
  background-color: #f2f2f2;
  cursor: pointer;
  box-shadow: 0px 0px 3px 1px #ccc;
}

.item>* {
  position: relative;
  font-size: 1.2rem;
  font-weight: 300;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>