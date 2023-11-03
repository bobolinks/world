<template>
  <Grid :items="items" @on-item-dragstart="onItemDragstart" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { clsExtends } from 'u3js/src/extends/three/utils';
import { fillDragParams } from '../../core/drags';
import Grid from './grid.vue';
import { global } from '../../global';

const items = ref<Array<any>>([]);

function updateSource() {
  items.value.length = 0;

  for (const [key, info] of Object.entries(clsExtends)) {
    if (!info.group) {
      continue;
    }
    if (info.group.startsWith('Scenes.') || info.group.startsWith('Entities.') || info.group.startsWith('Shapes.') || info.group.startsWith('Effects.')) {
      continue;
    }
    const title = info.group.split('.').pop();
    items.value.push({
      name: key,
      label: title || key,
      group: info.group,
      icon: `icon-${info.icon || 'texture'}`,
    });
  }

  items.value.sort((a, b) => a.group.localeCompare(b.group));
}

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragObjectClass', soure: null, name: item.name });
}

onMounted(() => {
  updateSource();
  global.addEventListener('projectLoaded', updateSource);
});

onUnmounted(() => {
  global.removeEventListener('projectLoaded', updateSource);
});
</script>
