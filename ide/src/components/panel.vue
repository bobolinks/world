<template>
  <div class="panel">
    <div v-if="showHeader" class="header">
      <i :class="icon" />
      <slot name="header" />
    </div>
    <slot />
  </div>
</template>
<script lang="ts" setup>
defineProps({
  icon: {
    type: String,
    default: 'icon-egg',
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
});
</script>
<style scoped>
.panel {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  border-radius: 6px;
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 12%), 0 0 6px 0 rgb(0 0 0 / 4%);
  background: white;
  overflow: hidden;
}

.header {
  position: relative;
  display: flex;
  flex-direction: row;
  justify-content: center;
  min-height: 32px;
  max-height: 32px;
  background-color: #f2f3f5;
}

.header i {
  position: absolute;
  font-size: 18px;
  left: 0.5em;
  top: 6px;
  color: #409eff;
  pointer-events: none;
}
</style>
