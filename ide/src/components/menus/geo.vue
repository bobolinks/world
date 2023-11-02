<template>
  <Menubar :disabled="!isEnabled" title="Geometry" :menus="menus" @select="onSelect" />
</template>
<script setup lang="ts">
import { Mesh, Object3D, Vector3, Euler, Matrix4, BufferGeometry } from 'three';
import { onMounted, onUnmounted, ref } from 'vue';
import Menubar from '../elements/menubar.vue';
import { global } from '../../global';
import { Entity } from 'u3js/src/extends/three/entity';
import store from '../../store';
import { BuiltinSceneSculptor } from '../../core/project';

type GeoOp = 'position' | 'rotation' | 'scale' | 'convert' | 'edit';

const isEnabled = ref(false);
const menus = ref<{title: string; value: GeoOp}[]>([
  {value: 'position', title: 'Apply Position [Meta + Shift + p]'},
  {value: 'rotation', title: 'Apply Rotation [Meta + Shift + r]'},
  {value: 'scale', title: 'Apply Scale [Meta + Shift + s]'},
  {value: 'convert', title: 'Convert to entity and edit'},
  {value: 'edit', title: 'Geometry edit'},
]);

function applyUpdate(names: Array<GeoOp>) {
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

async function onSelect(value: GeoOp) {
  const object = global.world.selected;
  if (!object || !(object instanceof Mesh)) {
    return;
  }
  if (['position' , 'rotation', 'scale'].includes(value)) {
    return applyUpdate([value]);
  } 
  if (value === 'convert') {
    //
  }
  store.editorType = 'Sculptor';
  const selectedObject = global.world.selected;
  const sceneName = global.project.scene.name;
  global.world.setEditor('Sculptor');
  global.project.setScene(BuiltinSceneSculptor, true);
  global.history.setScene(global.project.scene);
  const geoOld = (object as Mesh<BufferGeometry>).geometry.attributes.position.clone();
  const promise = global.world.openSculptor(object);
  global.dispatchEvent({ type: 'enterSculptor', soure: null as any, });  
  await promise;
  const hasChanged = global.history.canUndo();
  global.history.clear();
  store.editorType = 'Scene';
  global.world.setEditor('Scene');
  global.project.setScene(sceneName);
  // global.history.setScene(global.project.scene);
  global.world.selectObject(selectedObject);
  global.dispatchEvent({ type: 'leaveSculptor', soure: null as any, });  
  if (hasChanged) {
    const geoNew = (object as Mesh<BufferGeometry>).geometry.attributes.position;
    global.history.push({
      tip: 'Geometry edit',
      undo: ()=> {
        object.geometry.attributes.position = geoOld;
        global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
      },
      redo: () => {
        object.geometry.attributes.position = geoNew;
        global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
      },
    });
  }
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