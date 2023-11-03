<template>
  <Popover body-class="popover-context-menu" :show-header="false" :max-width="maxWidth" @on-blur="onBlur">
    <div v-for="it of menus" :key="it.value" class="popover-context-menu-item" @click="select(it)">
      <label class="popover-context-menu-item-label">{{ it.name || 'unamed' }}</label>
    </div>
  </Popover>
</template>
<script setup lang="ts">
defineProps({
  maxWidth: {
    type: String,
    default: '320px',
  },
});
</script>
<script lang="ts">
import { ref } from 'vue';
import Popover, { showPopover } from './popover.vue';

type MenuItem = { name: string; value: string };

const menus = ref<Array<MenuItem>>([]);

const wrap = {
  element: null as any as HTMLElement,
  resolve: null as any,
  reject: null as any,
};

function onBlur() {
  if (wrap.resolve) {
    wrap.resolve(undefined);
    wrap.resolve = null;
    wrap.reject = null;
    wrap.element = null as any;
  }
}

function select(it: any) {
  wrap.resolve(it.value);
  wrap.resolve = null;
  wrap.reject = null;
  wrap.element.style.display = 'none';
  wrap.element = null as any;
}

export async function showMenu(el: HTMLElement, ev: Event, items: Array<MenuItem>) {
  if (wrap.element) {
    return;
  }
  menus.value.length = 0;
  menus.value.push(...items);
  wrap.element = el;
  const promise = new Promise((resolve, reject) => {
    wrap.resolve = resolve;
    wrap.reject = reject;
  });
  showPopover(el, ev);
  return await promise;
}
</script>
<style>
.popover-context-menu {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 4px;
  background-color: var(--background-color-toolbar) !important;
}

.popover-context-menu-item {
  display: flex;
  flex-direction: row;
  height: 3em;
  align-items: center;
  background-color: #dddddd;
  overflow: hidden;
  /* border-radius: 4px; */
}

.popover-context-menu-item:nth-child(2) {
  background-color: #d0d0d0;
}

.popover-context-menu-item:hover {
  background-color: #e1f3d8;
  cursor: pointer;
}

.popover-context-menu-item-label {
  flex: 0 0 0%;
  min-width: 80px;
  width: 80px;
  padding: 0 0.5em;
  pointer-events: none;
}
</style>
