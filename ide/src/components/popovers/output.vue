<!-- eslint-disable vue/no-v-html -->
<template>
  <el-dialog v-model="modelVisibleValue" :title="title" width="60%" draggable align-center @close="modelVisibleValue = false">
    <div v-if="store.messages.length" class="log-container">
      <i class="icon-clear" @click="clear" />
      <pre v-for="(item, index) in store.messages" :key="'log' + index" :data-type="item.type" v-html="item.time + '&nbsp;' + (item.content || item.title)" />
      <div id="dynamic-anchor-div" style="overflow-anchor: auto; height: 1px" />
    </div>
    <label v-else>No Messages</label>
  </el-dialog>
</template>
<script lang="ts" setup>
import { defineProps, defineModel, onMounted } from 'vue';
import store from '../../store';

const modelVisibleValue = defineModel();

defineProps({
  title: {
    type: String,
    default: '',
  },
});

function clear() {
  store.messages.length = 0;
}

onMounted(() => {
  const el = document.getElementById('dynamic-anchor-div');
  if (el) el.scrollIntoView();
});
</script>
<style scoped>
.icon-clear {
  position: absolute;
  top: 0.65em;
  right: 2em;
  cursor: pointer;
  color: #ff9900;
  margin-right: 8px;
}

.log-container {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  max-height: 60vh;
  overflow: scroll;
  font-size: 1rem;
  margin: -1.5rem;
}

.log-container pre {
  margin: 0;
  padding: 0.4rem 0;
  border-bottom: 1px solid #f2f2f2;
  color: #555;
}

.log-container pre[data-type='warning'] {
  color: #ff9900;
}

.log-container pre[data-type='error'] {
  color: red;
}
</style>
