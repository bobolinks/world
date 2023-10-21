<template>
  <div ref="root" class="popover">
    <div class="popover-container" :class="bodyClass" :style="{ width: maxWidth, 'max-width': maxWidth }">
      <div v-if="showHeader" class="popover-header" @click.stop>
        <slot name="header" />
     </div>
      <slot />
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from 'vue';

defineProps({
  maxWidth: {
    type: String,
    default: "320px",
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  bodyClass: {
    type: String,
    default: '',
  },
});

const root = ref<HTMLDivElement>(null as any);

const emits = defineEmits(['onBlur'])

const onBlur = () => {
  root.value.style.display = "none";
  emits('onBlur');
};

onMounted(() => {
  root.value.addEventListener("click", onBlur);
  root.value.parentElement?.removeChild(root.value);
  document.body.appendChild(root.value);
});

onUnmounted(() => {
  if (root.value) {
    root.value.removeEventListener("click", onBlur);
    document.body.removeChild(root.value);
  }
});
</script>
<script lang="ts">
export function showPopover(el: HTMLElement) {
  document.querySelectorAll('.popover').forEach((e: any) => {
    if (e !== el) {
      e.style.display = 'none';
    }
  });
  el.style.display = 'flex';
}
</script>

<style scoped>
.popover {
  position: absolute;
  background: transparent;
  overflow: visible;
  z-index: 9999;
  transition: all 0.3s ease-out;
  display: none;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}

.popover .popover-container {
  margin: auto;
  z-index: -1;
  min-width: 20px;
  min-height: 20px;
  background: var(--background-color-pane-body);
  border-radius: 4px;
  border: 1px solid var(--border-color-default);
  pointer-events: all;
}

.popover-container .popover-header {
  position: relative;
  flex: 0 0 0%;
  min-height: 32px;
  max-height: 60vh;
  overflow: scroll;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  background-color: #f2f3f5;
  color: #222;
  font-size: 1.6rem;
}

</style>
