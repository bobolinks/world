<template>
  <div class="menubar" :disabled="disabled">
    <el-dropdown size="small" :disabled="disabled">
      <label class="menu-title">{{ title }}</label>
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
});

const emit = defineEmits(['select']);

function select(item: MenuItem) {
  emit('select', item.value);
}
</script>
<style scoped>
.menubar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  align-content: flex-start;
  border: none;
  border-left: 1px dashed #777;
}

.menubar[disabled='true'] {
  pointer-events: none;
}

.menubar .menu-title {
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

.menubar[disabled='true'] .menu-title {
  background-color: #bbb;
  color: #555;
}
</style>
