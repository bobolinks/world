<template>
  <Menubar :disabled="!idObjectSelected" title="Object Align" :menus="menus" @select="applyUpdate" />
</template>
<script setup lang="ts">
import { Box3, Mesh, Vector3 } from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import Menubar from '../elements/menubar.vue';
import { global } from '../../global';

type ValueType = 'toFloor' | 'toWorldCenter' | 'toX0' | 'toY0' | 'toZ0';

const idObjectSelected = ref(false);
const menus = ref<{title: string; value: ValueType}[]>([
  {value: 'toFloor', title: 'Align to parent [Meta + Shift + f]'},
  {value: 'toX0', title: 'Align to X axis [Meta + Shift + x]'},
  {value: 'toY0', title: 'Align to Y axis [Meta + Shift + y]'},
  {value: 'toZ0', title: 'Align to Z axis'},
  {value: 'toWorldCenter', title: 'Move to world center [Meta + Shift + c]'},
]);

function applyUpdate(action: ValueType) {
  const object: Mesh = global.world.selected as any;
  if (!object || !(object instanceof Mesh)) {
    return;
  }

  const oldValue = object.position.clone();
  const newValue = new Vector3();
  if (action === 'toFloor') {
    newValue.copy(oldValue);
    const box3 = new Box3().setFromObject(object, false);
    newValue.y -= box3.min.y;
  } else if (action === 'toX0') {
    newValue.copy(oldValue);
    newValue.x = 0;
  } else if (action === 'toY0') {
    newValue.copy(oldValue);
    newValue.y = 0;
  } else if (action === 'toZ0') {
    newValue.copy(oldValue);
    newValue.z = 0;
  }

  const redo = () => {
    object.position.copy(newValue);
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
  };
  const undo = () => {
    object.position.copy(oldValue);
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
  };
  redo();
  global.history.push({
    tip: `Align position`,
    undo,
    redo,
  });
}

const alignToFloor = applyUpdate.bind(undefined, 'toFloor');
const moveToWorldCenter = applyUpdate.bind(undefined, 'toWorldCenter');
const moveToXAxis = applyUpdate.bind(undefined, 'toX0');
const moveToYAxis = applyUpdate.bind(undefined, 'toY0');
// const moveToZAxis = applyUpdate.bind(undefined, 'toZ0');

function dectectObjectSelected() {
  idObjectSelected.value = global.world?.selected ? true : false;
}

onMounted(() => {
  dectectObjectSelected();
  global.addEventListener('objectChanged', dectectObjectSelected);
  global.addKeyDownListener('meta+shift+f', alignToFloor, 'Object Align.Align to base line of parent');
  global.addKeyDownListener('meta+shift+x', moveToXAxis, 'Object Align.Align to X axis');
  global.addKeyDownListener('meta+shift+y', moveToYAxis, 'Object Align.Align to Y axis');
  // global.addKeyDownListener('meta+shift+z', moveToZAxis, 'Object Align.Align to Z axis');
  global.addKeyDownListener('meta+shift+c', moveToWorldCenter, 'Object Align.Move to center of the world');
});

onUnmounted(() => {
  global.removeEventListener('objectChanged', dectectObjectSelected);
  global.removeKeyDownListener('meta+shift+f', alignToFloor);
  global.removeKeyDownListener('meta+shift+c', moveToWorldCenter);
  global.removeKeyDownListener('meta+shift+x', moveToXAxis);
  global.removeKeyDownListener('meta+shift+y', moveToYAxis);
  // global.removeKeyDownListener('meta+shift+z', moveToZAxis);
});

</script>
<style scoped></style>