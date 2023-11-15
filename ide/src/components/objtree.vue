<template>
  <el-tree class="otree" :default-expand-all="true" :data="treeData" :props="props" :expand-on-click-node="false" @current-change="change" @node-click="click" @node-contextmenu="contextmenu">
    <template #default="{ node, data }">
      <div class="label-round" draggable="true" :showTrash="isBuiltin(data.name)" :selected="current === data.uuid" @dragstart="onItemDragStart(data, $event)" @dragend="onItemDragEnd(data, $event)" @drop="onDrop(data, $event)">
        <i :class="toIconClass(data.type)" style="pointer-events: none; margin-left: -8px; margin-right: 6px" />
        <span class="prefix" :class="{ 'is-leaf': node.isLeaf }" style="pointer-events: none">{{ data.type }}</span>
      </div>
      <span class="text-ellipsis" ondblclick="this.contentEditable=true; this.focus();" @blur="updateContent($event, data)">
        {{ node.label || data.uuid }}
      </span>
    </template>
  </el-tree>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ElNotification } from 'element-plus';
import type { TreeNode, TreeNodeData } from 'element-plus/es/components/tree-v2/src/types';
import { Object3D, Scene } from 'three';
import { BuiltinObjectKeyHidden, clone } from 'u3js/src/index';
import { global } from '../global';
import { store } from '../store';
import icons from '../assets/font/iconfont.json';
import { local } from '../lang';
import { fillDragParams, parseDragParams } from '../core/drags';
import { showSelector } from './elements/selector.vue';
import { showMenu } from './elements/contextmenu.vue';

const props = {
  value: 'id',
  label: 'name',
  children: 'children',
};

function updateContent(e: Event, data: TreeNodeData) {
  (e as any).target.contentEditable = false;
  const value = (e as any).target.innerText;
  if (!/[a-z][0-9a-z]/i.test(value)) {
    console.error(value);
    return;
  }
  if (value === data.name) {
    return;
  }
  const object: Object3D = global.project.scene.getObjectById(data.id) as any;
  object.name = value;
  if (data.isScene) {
    global.dispatchEvent({ type: 'sceneChanged', soure: null as any, scene: global.project.scene });
  }
  global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object] });
}

const treeData = ref<Array<Scene>>([]);
const current = ref('');

function genTree() {
  const trav = function (object: Object3D) {
    const o: any = { id: object.id, uuid: object.uuid, name: object.name, type: object.type, children: [] };
    for (const child of object.children) {
      if ((child as any)[BuiltinObjectKeyHidden]) {
        continue;
      }
      o.children.push(trav(child));
    }
    return o;
  };
  return trav(global.project.scene);
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function reset({ detail }: any) {
  current.value = global.world.selected?.uuid || '';
  const tree: Array<Scene> = [genTree() as any];
  treeData.value = tree;
}

function toIconClass(name: string) {
  return icons.glyphs.find((e) => e.font_class === name) ? `icon-${name}` : 'icon-model3d';
}

function isBuiltin(name: string) {
  return !name || !/^\[/.test(name);
}

function change(data: TreeNodeData) {
  if (!global.world) {
    return;
  }
  const object: Object3D = global.project.scene.getObjectById(data.id) as any;
  global.world.selectObject(object);
  if (store.state.editorType === 'World' && store.state.worldViewMode === 'graph') {
    global.editor.setObject(object);
  }
}

async function onDrop(dataNode: TreeNodeData, event: DragEvent) {
  if (store.state.editorType === 'Geometry') {
    return;
  }
  const data = parseDragParams(event);
  if (!data) {
    return;
  }
  const newParent: Object3D = global.project.scene.getObjectById(dataNode.id) as any;
  if (data.type === 'dragObjectClass') {
    const params: any[] = [];
    if (data.name === 'PositionalAudio2') {
      const liss = global.project.scene.getObjectsByProperty('isAudioListener2', true) || [];
      if (liss.length === 0) {
        global.dispatchEvent({ type: 'userEventNotice', level: 'error', message: 'Not audio listener found' });
        return;
      } else if (liss.length === 1) {
        params.push({ listener: liss[0] });
      } else {
        store.state.audioListeners = liss.map((e) => ({ name: e.name, value: e.uuid }));
        const rs = await showSelector(document.querySelector('.mainLisSelector') as any);
        if (!rs) {
          return;
        }
        params.push({ listener: liss.find((e) => e.uuid === rs) });
      }
    }

    const object = global.project.addObjectByClass(data.name, newParent, params);
    global.history.push({
      tip: `Add object [class=${data.name}][uuid=${object.uuid}] to [uuid=${dataNode.uuid}]`,
      undo: () => {
        global.project.removeObject(object);
      },
      redo: () => {
        global.project.addObject(object, newParent);
      },
    });
  } else if (data.type === 'dragObject') {
    if (data.otype !== 'Object3D' || !(data.object instanceof Object3D)) {
      return;
    }
    if (isBuiltin(data.object.name)) {
      return;
    }
    const object = data.object;
    if (object.uuid === newParent.uuid) {
      return;
    }
    // can't be null
    const parent = object.parent as Object3D;
    global.project.addObject(object, newParent);
    global.dispatchEvent({ type: 'treeModified', soure: null as any, root: parent });
    global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object, parent, newParent] });
    global.history.push({
      tip: `Move object[${object.uuid}] from [${parent?.uuid}] to [uuid=${newParent.uuid}]`,
      undo: () => {
        global.project.addObject(object, parent);
        global.dispatchEvent({ type: 'treeModified', soure: null as any, root: parent });
        global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object, parent, newParent] });
      },
      redo: () => {
        global.project.addObject(object, newParent);
        global.dispatchEvent({ type: 'treeModified', soure: null as any, root: parent });
        global.dispatchEvent({ type: 'objectModified', soure: null as any, objects: [object, parent, newParent] });
      },
    });
  }
}

const clickEventSave = {
  offsetX: 0,
  offsetY: 0,
  timeStamp: 0,
};

function click(data: TreeNodeData, node: TreeNode, e: MouseEvent) {
  const diff = e.timeStamp - clickEventSave.timeStamp;
  if (clickEventSave.offsetX === e.offsetX && clickEventSave.offsetY === e.offsetY && diff <= 300) {
    // double click
    store.state.worldViewMode = 'graph';
    if (global.world.selected) {
      global.editor.setObject(global.world.selected);
    }
    clickEventSave.offsetX = 0;
    clickEventSave.offsetY = 0;
    clickEventSave.timeStamp = 0;
  } else {
    clickEventSave.offsetX = e.offsetX;
    clickEventSave.offsetY = e.offsetY;
    clickEventSave.timeStamp = e.timeStamp;
  }
}

async function contextmenu(e: PointerEvent, data: TreeNodeData) {
  const object: Object3D = global.project.scene.getObjectById(data.id) as any;
  if ((object as any).isScene) {
    return;
  }
  const action: 'DeeplyClone' | 'Clone' = (await showMenu(document.querySelector('.mainContextMenu') as any, e, [
    { name: 'Clone Deeply', value: 'DeeplyClone' },
    { name: 'Clone', value: 'Clone' },
  ])) as any;
  if (!action) {
    return;
  }
  const parent = object.parent as Object3D;
  const cloned: Object3D = action === 'DeeplyClone' ? clone(object, true) : object.clone(false);
  global.history.push({
    tip: `Duplicate object from [uuid=${object.uuid}]`,
    undo: () => {
      global.project.removeObject(cloned);
    },
    redo: () => {
      global.project.addObject(cloned, parent);
    },
  });
  global.project.addObject(cloned, parent);
}

function onItemDragStart(data: TreeNodeData, ev: DragEvent) {
  const object: Object3D = global.project.scene.getObjectById(data.id) as any;
  fillDragParams(ev, { type: 'dragObject', soure: null, object, otype: 'Object3D' });
}

function onItemDragEnd(data: TreeNodeData, ev: DragEvent) {
  const object: Object3D = global.project.scene.getObjectById(data.id) as any;
  if (ev.dataTransfer?.getData('selfRemove')) {
    removeObject(object);
    if (global.world.selected === object) {
      global.world.selectObject(undefined);
    }
  }
}

function removeObject(object: any) {
  if (object.isScene) {
    if (!global.project.removeScene(object)) {
      ElNotification({
        title: local('Error'),
        message: local('It is the last scene!'),
        type: 'error',
      });
      return;
    }
  } else {
    const parent = object.parent;
    if (!global.project.removeObject(object)) {
      ElNotification({
        title: local('Error'),
        message: local('Failed to remove object!'),
        type: 'error',
      });
      return;
    }
    global.history.push({
      tip: `Remove object [uuid=${object.uuid}]`,
      undo: () => {
        global.project.addObject(object, parent);
      },
      redo: () => {
        global.project.removeObject(object);
      },
    });
    if (object === global.world.selected) {
      global.world.selectObject();
    }
  }
}

onMounted(() => {
  reset({});
  global.addEventListener('projectLoaded', reset);
  global.addEventListener('sceneChanged', reset);
  global.addEventListener('objectChanged', reset);
  global.addEventListener('treeModified', reset);
  global.addEventListener('enterGeoEditor', reset);
  global.addEventListener('leaveGeoEditor', reset);
});

onUnmounted(() => {
  global.removeEventListener('projectLoaded', reset);
  global.removeEventListener('sceneChanged', reset);
  global.removeEventListener('objectChanged', reset);
  global.removeEventListener('treeModified', reset);
  global.removeEventListener('enterGeoEditor', reset);
  global.removeEventListener('leaveGeoEditor', reset);
});
</script>
<style scoped>
.otree {
  min-height: 400px;
  max-height: 400px;
  overflow: scroll;
  padding-bottom: 2rem;
}

.prefix {
  color: var(--el-color-primary);
  margin-right: 10px;
}

.prefix.is-leaf {
  color: var(--el-color-success);
}

.label-round {
  position: relative;
  border-radius: 0.6em;
  overflow: hidden;
  color: gray;
  background-color: #f2f3f5;
  display: flex;
  justify-content: left;
  align-items: center;
  padding: 0.1em;
  padding-left: 1em;
  padding-right: 1em;
  margin-right: 1em;
}

.label-round[selected='true'] {
  background-color: #ff9900;
  color: white;
}

.label-round[selected='true'] .prefix.is-leaf {
  color: white;
}
</style>
