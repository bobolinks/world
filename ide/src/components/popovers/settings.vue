<template>
  <el-dialog v-model="modelVisibleValue" :title="title" width="500px" draggable align-center @close="modelVisibleValue = false">
    <World />
  </el-dialog>
</template>
<script lang="ts" setup>
import { defineProps, defineModel } from 'vue';
import World from '../panels/world.vue';

const modelVisibleValue = defineModel();

defineProps({
  title: {
    type: String,
    default: '',
  },
});

</script>

