<template>
  <Menubar :disabled="!isEnabled" title="Animations" :menus="menus" @select="onSelect" />
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import Menubar from '../elements/menubar.vue';
import { global } from '../../global';
import { Character } from 'u3js/src/extends/three/character';

const isEnabled = ref(false);
const menus = ref<{title: string; value: string}[]>([]);

function onSelect(value: string) {
  const object = global.world.selected;
  if (!object || !(object instanceof Character)) {
    return;
  }
  const state = object.actions[value];
  if (!state) {
    return;
  }
  if (state.isPending) {
    object.stop(value);
  } else {
    object.act(value);
  }
}

function dectectObjectSelected() {
  menus.value = [];
  if (!global.world) {
    isEnabled.value = false;
  } else {
    const object: Character = global.world.selected as any;
    isEnabled.value = object instanceof Character ? true : false;
    if (isEnabled.value) {
      for(const k of Object.keys(object.actions)) {
        menus.value.push({title: `Start/Stop ${k}`, value: k});
      }
    }
  }
}

onMounted(() => {
  dectectObjectSelected();
  global.addEventListener('objectChanged', dectectObjectSelected);
});

onUnmounted(() => {
  global.removeEventListener('objectChanged', dectectObjectSelected);
});

</script>
<style scoped></style>