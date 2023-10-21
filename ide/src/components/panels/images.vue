<template>
  <div class="list">
    <div v-for="item in items" :key="item.name" class="item" draggable="true" @dragstart="onItemDragstart(item, $event)">
      <img :src="item.url">
      <label>{{ item.name }}</label>
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
  const filter = /\.jpg|\.jpeg|\.bmp|\.png$/i;
  const ls = (await apis.getMediaFiles(global.project.name)).filter(e => filter.test(e.url));
  items.value.length = 0;
  items.value.push(...defaultImages);
  items.value.push(...ls.map(e => {
    const name: string = e.url.split('/').pop() as any;
    return { url: e.url, name, size: e.size };
  }));
}

const defaultImages: Array<ItemInfo> = [];

function createDefaultImages() {
  const imageCanvas = document.createElement('canvas');
  const context = imageCanvas.getContext('2d');

  if (!context) {
    return;
  }

  imageCanvas.width = imageCanvas.height = 128;

  context.fillStyle = '#444';
  context.fillRect(0, 0, 128, 128);

  context.fillStyle = '#fff';
  context.fillRect(0, 0, 64, 64);
  context.fillRect(64, 64, 64, 64);

  const url = imageCanvas.toDataURL();

  defaultImages.push({ url, name: 'checker.png', size: 0 });
}

function onItemDragstart(item: ItemInfo, event: DragEvent) {
  fillDragParams(event, { type: 'dragFile', soure: null, path: item.url, mime: 'image/*' });
}

onMounted(() => {
  createDefaultImages();
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
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  padding: 12px;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 8px;
  padding: 4px;
  border-radius: 8px;
  background-color: #f2f2f2;
  cursor: pointer;
  box-shadow: 0px 0px 3px 1px #ccc;
}

.item img {
  margin: 0;
  border-radius: 8px;
  width: 142px;
  min-width: 142px;
  max-width: 142px;
  height: 142px;
  min-height: 142px;
  pointer-events: none;
}

.item label {
  position: relative;
  font-size: 1.2rem;
  font-weight: 300;
  max-width: 142px;
  pointer-events: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  direction: rtl;
}
</style>