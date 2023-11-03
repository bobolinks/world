<template>
  <Grid :items="items" @on-item-dragstart="onItemDragstart" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { protos } from 'u3js/src/extends/helper/clslib';
import { fillDragParams } from '../../core/drags';
import Grid from './grid.vue';
import { global } from '../../global';

const items = ref<Array<any>>([]);

function updateSource() {
  items.value.length = 0;

  for (const [key, creator] of Object.entries(protos)) {
    if (!creator.group.startsWith('Effects.')) {
      continue;
    }
    const title = creator.group.split('.').pop();
    items.value.push({
      name: key,
      label: title || key,
      icon: `ti ti-${creator.icon || 'brand-javascript'}`,
    });
  }

  items.value.sort((a, b) => a.label.localeCompare(b.label));
}

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragNodeClass', soure: null, name: item.name });
}

onMounted(() => {
  updateSource();
  global.addEventListener('projectLoaded', updateSource);
});

onUnmounted(() => {
  global.removeEventListener('projectLoaded', updateSource);
});
</script>
