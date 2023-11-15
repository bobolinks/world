<template>
  <Grid :items="items" @on-item-dragstart="onItemDragstart" />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { fillDragParams } from '../../core/drags';
import Grid from './grid.vue';

const items = ref<Array<any>>([
  { name: 'Box', label: 'box', icon: 'icon-box' },
  { name: 'Capsule', label: 'Capsule', icon: 'icon-capsule' },
  { name: 'Cone', label: 'Cone', icon: 'icon-cone' },
  { name: 'Cylinder', label: 'Cylinder', icon: 'icon-cylinder' },
  { name: 'Sphere', label: 'Sphere', icon: 'icon-sphere' },
]);

function onItemDragstart(item: any, event: DragEvent) {
  fillDragParams(event, { type: 'dragObjectClass', soure: null, name: item.name });
}
</script>
