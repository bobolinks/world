<template>
  <Grid :items="items" @on-item-dragstart="onItemDragstart" />
</template>
<script setup lang="ts">
import { fillDragParams } from '../../core/drags';
import { protos } from '../../core/u3js/extends/helper/clslib';
import Grid from './grid.vue';

const items: Array<any> = [];

for (const [key, creator] of Object.entries(protos)) {
  if (!creator.group.startsWith('Scripts.')) {
    continue;
  }
  const title = creator.group.split('.').pop();
  items.push({
    name: key,
    label: title || key,
    icon: `ti ti-${creator.icon || 'brand-javascript'}`,
  });
}

items.sort((a, b) => a.label.localeCompare(b.label));

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragNodeClass', soure: null, name: item.name });
}
</script>