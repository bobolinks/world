<template>
  <div class="list">
    <div v-for="(group, key) of keys" :key="key" class="group">
      <label class="title" :data-title="key" />
      <div v-for="(it, k) of group.keys" :key="k" class="item">
        <label>{{ it }}</label>
        <label>{{ k }}</label>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  updateKeys();
});
</script>
<script lang="ts">
import { ref } from 'vue';
import { global, KeyGroup } from '../global';

const keys = ref<Record<string, KeyGroup>>({});
const worldViewEdit: KeyGroup = {
  enabled: true,
  keys: {
    w: 'Switch to translate mode',
    e: 'Switch to rotate mode',
    r: 'Switch to scale mode',
    q: 'Switch to World/Local space',
    x: 'Toggle X',
    y: 'Toggle Y',
    z: 'Toggle Z',
    Space: 'Toggle enabled',
  },
};

export function updateKeys() {
  keys.value = { ...global.keyGroups, 'World Editor': worldViewEdit };
}
</script>
<style>
.list {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.list .group {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.list .group .item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.list .group .title {
  position: relative;
  width: 100%;
  height: 1px;
  border: none;
  border-top: 1px #aaa dashed;
  margin: 1.2em 0;
}

.list .group .title::before {
  position: absolute;
  content: attr(data-title);
  font-size: 1.4em;
  font-weight: 500;
  background-color: white;
  padding: 0 0.5em;
  top: -0.7em;
  left: 0.4em;
}
</style>
