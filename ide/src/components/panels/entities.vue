<template>
  <Grid :items="items" @on-item-dragstart="onItemDragstart" />
</template>
<script setup lang="ts">
import { fillDragParams } from '../../core/drags';
import Grid from './grid.vue';
import { clsExtends } from '../../core/u3js/extends/three/utils';

const items: Array<any> = [];

for (const [key, info] of Object.entries(clsExtends)) {
  if (!info.group) {
    continue;
  }
  if (!info.group.startsWith('Entities.') && !info.group.startsWith('Shapes.')) {
    continue;
  }
  const title = info.group.split('.').pop();
  items.push({
    name: key,
    label: title || key,
    icon: `icon-${info.icon || 'texture'}`,
  });
}

items.sort((a, b) => a.label.localeCompare(b.label));

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragObjectClass', soure: null, name: item.name });
}
</script>