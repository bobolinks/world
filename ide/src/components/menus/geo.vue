<template>
  <Menubar :disabled="!isEnabled" title="Geometry" :menus="menus" @select="onSelect" />
</template>
<script setup lang="ts">
import { Mesh, Object3D, Vector3, Euler, Matrix4 } from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import Menubar from '../elements/menubar.vue';
import { global } from '../../global';
import { Entity } from 'u3js/src/extends/three/entity';

const isEnabled = ref(false);
const menus = ref<{title: string; value: string}[]>([
  {value: 'position', title: 'Apply Position [Meta + Shift + p]'},
  {value: 'rotation', title: 'Apply Rotation [Meta + Shift + r]'},
  {value: 'scale', title: 'Apply Scale [Meta + Shift + s]'},
]);

function applyUpdate(names: Array<'position' | 'rotation' | 'scale'>) {
  const object: Mesh = global.world.selected as any;
  const old: Pick<Object3D, 'position' | 'rotation' | 'scale'> = {
    position: object.position.clone(),
    rotation: object.rotation.clone(),
    scale: object.scale.clone(),
  };
  const matrix = new Matrix4().identity();
  const newVars: any = {};
  if (names.includes('position')) {
    matrix.multiply(new Matrix4().makeTranslation(old.position));
    newVars.position = new Vector3(0, 0, 0);
  }
  if (names.includes('rotation')) {
    matrix.multiply(new Matrix4().makeRotationFromEuler(old.rotation));
    newVars.rotation = new Euler(0, 0, 0);
  }
  if (names.includes('scale')) {
    matrix.multiply(new Matrix4().makeScale(old.scale.x, old.scale.y, old.scale.z));
    newVars.scale = new Vector3(1, 1, 1);
  }
  const inverted = matrix.clone().invert();
  const redo = () => {
    if (object instanceof Entity) {
      object.applyGeoMatrix4(matrix);
    } else {
      object.geometry.applyMatrix4(matrix);
    }
    for (const [k, v] of Object.entries(newVars)) {
      (object as any)[k].copy(v);
    }
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
  };
  const undo = () => {
    if (object instanceof Entity) {
      object.applyGeoMatrix4(inverted);
    } else {
      object.geometry.applyMatrix4(inverted);
    }
    for (const k of Object.keys(newVars)) {
      (object as any)[k].copy((old as any)[k]);
    }
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
  };
  redo();
  global.history.push({
    tip: `Apply transform`,
    undo,
    redo,
  });
}

function onSelect(value: 'position' | 'rotation' | 'scale') {
  const object = global.world.selected;
  if (!object || !(object instanceof Mesh)) {
    return;
  }
  applyUpdate([value]);
}

const applyPosition = () => {
  const object = global.world.selected;
  if (!object || !(object instanceof Mesh)) {
    return;
  }
  applyUpdate(['position']);
}

const applyRotation = () => {
  const object = global.world.selected;
  if (!object || !(object instanceof Mesh)) {
    return;
  }
  applyUpdate(['rotation']);
}

const applyScale = () => {
  const object = global.world.selected;
  if (!object || !(object instanceof Mesh)) {
    return;
  }
  applyUpdate(['scale']);
}

function dectectObjectSelected() {
  if (!global.world) {
    isEnabled.value = false;
  } else {
    isEnabled.value = global.world.selected instanceof Mesh ? true : false;
  }
}

onMounted(() => {
  dectectObjectSelected();
  global.addEventListener('objectChanged', dectectObjectSelected);
  global.addKeyDownListener('meta+shift+p', applyPosition, 'Geometry Edit.Apply Position');
  global.addKeyDownListener('meta+shift+r', applyRotation, 'Geometry Edit.Apply Rotation');
  global.addKeyDownListener('meta+shift+s', applyScale, 'Geometry Edit.Apply Scale');
});

onUnmounted(() => {
  global.removeEventListener('objectChanged', dectectObjectSelected);
  global.removeKeyDownListener('meta+shift+p', applyPosition);
  global.removeKeyDownListener('meta+shift+r', applyRotation);
  global.removeKeyDownListener('meta+shift+s', applyScale);
});

</script>
<style scoped></style>