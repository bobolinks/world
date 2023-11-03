<template>
  <el-popover :disabled="!isEnabled" title="Editor Options" trigger="click">
    <template #reference>
      <div>
        <i class="icon-vec2" style="margin-left: 0.5em; margin-right: 0.5em; cursor: default" />
        <label>Editor Options</label>
      </div>
    </template>
    <div>
      <label>asd</label>
    </div>
  </el-popover>
</template>
<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
// import { global } from '../../global';

const isEnabled = ref(false);

onMounted(() => {});

onUnmounted(() => {});
</script>
<style scoped>
.popver-menu[disabled='true'] {
  pointer-events: none;
}

.popver-menu .menu-title {
  height: 2rem;
  line-height: 2rem;
  font-size: 1rem;
  text-align: center;
  vertical-align: middle;
  background-color: #777;
  color: #eee;
  overflow: hidden;
  border-radius: 0.5em;
  margin: 0px 1em;
  padding: 0px 0.8em;
}

.popver-menu[disabled='true'] .menu-title {
  background-color: #bbb;
  color: #555;
}
</style>
