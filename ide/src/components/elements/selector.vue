<template>
  <Popover body-class="popover-selector" :show-header="showHeader" :max-width="maxWidth" @on-blur="onBlur">
    <template #header>
      <label>{{ title }}</label>
    </template>
    <div class="popover-selector-body">
      <div v-for="it of values" :key="it.value" class="popover-selector-item" @click="select(it)">
        <label class="popover-selector-item-name">{{ it.name || 'unamed' }}</label>
        <label class="popover-selector-item-value">{{ it.value }}</label>
      </div>
    </div>
  </Popover>
</template>
<script setup lang="ts">
defineProps({
  icon: {
    type: String,
    default: "icon-egg",
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    default: "",
  },
  maxWidth: {
    type: String,
    default: "320px",
  },
  values: {
    type: Array<{ name: string; value: string }>,
    default: [],
  },
});

</script>
<script lang="ts">
import Popover, { showPopover } from './popover.vue';

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

export async function showSelector(el: HTMLElement) {
  if (wrap.element) {
    return;
  }
  wrap.element = el;
  const promise = new Promise((resolve, reject) => {
    wrap.resolve = resolve;
    wrap.reject = reject;
  })
  showPopover(el);
  return await promise;
}
</script>
<style>
.popover-selector {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.popover-selector-item {
  display: flex;
  flex-direction: row;
  height: 3em;
  align-items: center;
}

.popover-selector-item:hover {
  background-color: #e1f3d8;
  cursor: pointer;
}

.popover-selector-item-name {
  flex: 0 0 0%;
  min-width: 80px;
  width: 80px;
  padding: 0 0.5em;
  pointer-events: none;
}

.popover-selector-item-value {
  flex: 1 1 auto;
  padding: 0 0.5em;
  pointer-events: none;
}
</style>