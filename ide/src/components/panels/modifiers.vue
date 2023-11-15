<template>
  <div class="list">
    <div v-for="item in items" :key="item.name" class="item">
      <div class="header">
        <label class="title">{{ item.name }}</label>
        <div style="flex: 1 1 auto"></div>
        <div class="apply" @click="apply(item)">
          <i class="icon-apply" style="margin-left: -0.1em; margin-right: 0.1em"></i>
          <span style="pointer-events: none">Apply</span>
        </div>
      </div>
      <div class="item-props">
        <div v-for="(it, key) of item.props" :key="key" class="item-props-item">
          <label class="name">{{ it.descriptor || key }}</label>
          <div style="flex: 1 1 auto"></div>
          <el-input-number v-if="it.type === 'Number'" v-model="it.value" :min="it.limits?.min" :max="it.limits?.max" :step="it.limits?.step" size="small"></el-input-number>
          <el-switch v-else-if="it.type === 'Boolean'" v-model="it.value"></el-switch>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Mesh } from 'three';
import type { TypeInfo } from 'u3js/src/types/types';
import { SimplifyModifier } from 'three/examples/jsm/modifiers/SimplifyModifier.js';
import { LoopSubdivision, ModifyParams } from 'three-subdivide';
import { ref } from 'vue';
import { global } from '../../global';

type Modifier = {
  name: string;
  props: Record<string, TypeInfo & { value: any }>;
};

const items = ref<Array<Modifier>>([
  {
    name: 'Simplifier',
    props: {
      density: {
        type: 'Number',
        value: 0.5,
        limits: { min: 0.01, max: 1, step: 0.01 },
      },
    },
  },
  {
    name: 'Subdivision',
    props: {
      iterations: {
        type: 'Number',
        value: 4,
        limits: { min: 0, max: 5, step: 1 },
      },
      split: {
        type: 'Boolean',
        value: true,
      },
      uvSmooth: {
        type: 'Boolean',
        value: false,
      },
      preserveEdges: {
        type: 'Boolean',
        value: false,
      },
      flatOnly: {
        type: 'Boolean',
        value: false,
      },
      maxTriangles: {
        type: 'Number',
        value: 1000,
        limits: { min: 1, max: 100000 },
      },
    },
  },
]);

const modifiers = {
  Simplifier(props: Record<string, { value: any }>) {
    const object: Mesh = global.world.geometryEditors.Vertex.mesh;
    if (!object || !object.isMesh) {
      return;
    }

    const modifier = new SimplifyModifier();
    const count = Math.floor(object.geometry.attributes.position.count * props.density.value);
    const geometry = modifier.modify(object.geometry, count);

    global.world.geometryEditors.Vertex.replaceGeometry(geometry);
  },
  Subdivision(props: Record<string, { value: any }>) {
    const object: Mesh = global.world.geometryEditors.Vertex.mesh;
    if (!object || !object.isMesh) {
      return;
    }
    const params: ModifyParams = {
      split: props.split.value,
      uvSmooth: props.uvSmooth.value,
      preserveEdges: props.preserveEdges.value,
      flatOnly: props.flatOnly.value,
      maxTriangles: props.maxTriangles.value,
      // weight: props.weight.value,
    };
    const geometry = LoopSubdivision.modify(object.geometry, props.iterations.value, params);
    global.world.geometryEditors.Vertex.replaceGeometry(geometry);
  },
};

function apply(item: Modifier) {
  const func = modifiers[item.name as keyof typeof modifiers];
  func(item.props);
}
</script>
<style scoped>
.list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  width: 100%;
}

.item {
  display: flex;
  flex-direction: column;
  margin: 6px 2px;
  padding: 4px;
  border-radius: 8px;
  /* background-color: var(--background-color-toolbar); */
  background-color: #f2f2f2;
  box-shadow: 0px 0px 3px 1px #ccc;
}

.item .header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 0.2em;
  padding-bottom: 0.4em;
  font-size: 1.4rem;
}

.item .header i {
  font-size: 1.4rem;
}

.item .header .apply {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
  padding: 0.1em 0.5em;
  border-radius: 1em;
  font-size: 1rem;
  background-color: #aaa;
}

.item-props {
  display: flex;
  flex-direction: column;
  background-color: white;
}

.item-props-item {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  padding: 0.4em 1em;
}

.item-props-item .name {
  flex: 0 0 0%;
  min-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
</style>
