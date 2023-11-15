<template>
  <div class="menubar" :disabled="disabled">
    <el-dropdown size="small" :disabled="disabled">
      <div class="panel-menu-bar-item" :disabled="disabled">
        <i v-if="icon" :class="icon" />
        <label class="title">{{ title }}</label>
      </div>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item v-for="item of menus" :key="item.value" @click="select(item)">
            {{ item.title }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>
<script setup lang="ts">
type MenuItem = { value: string; title: string; disabled?: boolean };

defineProps({
  title: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  menus: {
    type: Array<MenuItem>,
    default: [],
  },
  icon: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['select']);

function select(item: MenuItem) {
  emit('select', item.value);
}
</script>
<style scoped>
.menubar {
  border: none;
  border-left: 1px dashed #777;
}

.menubar[disabled='true'] {
  pointer-events: none;
}
</style>
