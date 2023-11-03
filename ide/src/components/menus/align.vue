<template>
  <Menubar :disabled="!idObjectSelected" title="Object Align" :menus="menus" @select="applyUpdate" />
</template>
<script setup lang="ts">
import { Box3, Vector3 } from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import Menubar from '../elements/menubar.vue';
import { global } from '../../global';
import { Object3D } from 'three';

type ValueType = 'toFloor' | 'toWorldCenter' | 'toX0' | 'toX+' | 'toX-' | 'toY0' | 'toY+' | 'toY-' | 'toZ0' | 'toZ+' | 'toZ-' | 'disX' | 'disY' | 'disZ';

const idObjectSelected = ref(false);
const menus = ref<{ title: string; value: ValueType }[]>([
  { value: 'toFloor', title: 'Align to parent [Meta + Shift + f]' },
  { value: 'toX0', title: 'Align to X axis [Meta + Shift + x]' },
  { value: 'toY0', title: 'Align to Y axis [Meta + Shift + y]' },
  { value: 'toZ0', title: 'Align to Z axis' },
  { value: 'toWorldCenter', title: 'Move to world center [Meta + Shift + c]' },
  { value: 'toX+', title: 'Align objects to Max(X)' },
  { value: 'toX-', title: 'Align objects to Min(X)' },
  { value: 'toY+', title: 'Align objects to Max(Y)' },
  { value: 'toY-', title: 'Align objects to Min(Y)' },
  { value: 'toZ+', title: 'Align objects to Max(Z)' },
  { value: 'toZ-', title: 'Align objects to Min(Z)' },
  { value: 'disX', title: 'Distribute objects to X axis' },
  { value: 'disY', title: 'Distribute objects to Y axis' },
  { value: 'disZ', title: 'Distribute objects to Z axis' },
]);

function applyUpdate(action: ValueType) {
  const objects = [...global.world.selectedObjects];
  if (!objects.length) {
    return;
  }

  const oldValues = new WeakMap<Object3D, Vector3>();
  objects.forEach((e) => oldValues.set(e, e.position.clone()));
  const newValues = new WeakMap<Object3D, Vector3>();
  if (action === 'toFloor') {
    const box3 = new Box3();
    objects.forEach((o) => {
      box3.setFromObject(o, false);
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.y -= box3.min.y;
      newValues.set(o, newValue);
    });
  } else if (action === 'toX0') {
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.x = 0;
      newValues.set(o, newValue);
    });
  } else if (action === 'toX+') {
    const value = Math.max(...objects.map((e) => e.position.x));
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.x = value;
      newValues.set(o, newValue);
    });
  } else if (action === 'toX-') {
    const value = Math.min(...objects.map((e) => e.position.x));
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.x = value;
      newValues.set(o, newValue);
    });
  } else if (action === 'toY0') {
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.y = 0;
      newValues.set(o, newValue);
    });
  } else if (action === 'toY+') {
    const value = Math.max(...objects.map((e) => e.position.y));
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.y = value;
      newValues.set(o, newValue);
    });
  } else if (action === 'toY-') {
    const value = Math.min(...objects.map((e) => e.position.y));
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.y = value;
      newValues.set(o, newValue);
    });
  } else if (action === 'toZ0') {
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.z = 0;
      newValues.set(o, newValue);
    });
  } else if (action === 'toZ+') {
    const value = Math.max(...objects.map((e) => e.position.z));
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.z = value;
      newValues.set(o, newValue);
    });
  } else if (action === 'toZ-') {
    const value = Math.min(...objects.map((e) => e.position.z));
    objects.forEach((o) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.z = value;
      newValues.set(o, newValue);
    });
  } else if (action === 'disX') {
    const max = Math.max(...objects.map((e) => e.position.x));
    const min = Math.min(...objects.map((e) => e.position.x));
    const step = objects.length > 1 ? (max - min) / (objects.length - 1) : 0;
    objects.forEach((o, i) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.x = min + step * i;
      newValues.set(o, newValue);
    });
  } else if (action === 'disY') {
    const max = Math.max(...objects.map((e) => e.position.y));
    const min = Math.min(...objects.map((e) => e.position.y));
    const step = objects.length > 1 ? (max - min) / (objects.length - 1) : 0;
    objects.forEach((o, i) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.y = min + step * i;
      newValues.set(o, newValue);
    });
  } else if (action === 'disZ') {
    const max = Math.max(...objects.map((e) => e.position.z));
    const min = Math.min(...objects.map((e) => e.position.z));
    const step = objects.length > 1 ? (max - min) / (objects.length - 1) : 0;
    objects.forEach((o, i) => {
      const oldValue = oldValues.get(o);
      const newValue = oldValue!.clone();
      newValue.z = min + step * i;
      newValues.set(o, newValue);
    });
  }

  const redo = () => {
    objects.forEach((e) => e.position.copy(newValues.get(e) as any));
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects });
  };
  const undo = () => {
    objects.forEach((e) => e.position.copy(oldValues.get(e) as any));
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects });
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
  idObjectSelected.value = global.world?.selectedObjects.length ? true : false;
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
