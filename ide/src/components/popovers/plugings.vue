<template>
  <el-dialog v-model="modelVisibleValue" :title="title" width="30%" draggable align-center class="notPadding" @open="updateStatus" @close="modelVisibleValue = false">
    <el-table ref="multipleTableRef" :data="items" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column prop="path" label="Plugin Path">
        <template #default="scope">
          <div style="display: flex; align-items: center">
            <i class="icon-chip" />
            <span style="margin-left: 10px">{{ scope.row.path }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column property="checked" type="selection" width="55" />
    </el-table>
    <div class="table-foot">
      <div>
        <a class="restart" style="cursor: pointer" :disabled="!store.state.pluginsChanged" @click="reload()">Restart</a>
        is require for changes to take effect
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import { defineProps, defineModel, ref, onMounted, onUnmounted } from 'vue';
import apis from '../../apis';
import { global } from '../../global';
import { store } from '../../store';
import { ElTable } from 'element-plus';

type Item = { url: string; path: string; checked: boolean };

const multipleTableRef = ref<InstanceType<typeof ElTable>>();
const modelVisibleValue = defineModel();
const items = ref<Item[]>([]);

async function loadData() {
  const ls = await apis.getPlugins(global.project.name);
  items.value = ls.map((e) => {
    const path = e.url.replace(/^\/fs\/file\//, '').replace(/\.[^.]+$/, '');
    const checked = global.project.plugins.has(e.url);
    return { url: e.url, path: path, checked };
  });
  setTimeout(() => {
    updateStatus();
  });
}

function updateStatus() {
  const table = multipleTableRef.value;
  if (!table) {
    return;
  }
  for (const item of items.value) {
    if (!item.checked) continue;
    table.toggleRowSelection(item, true);
  }
}

function reload() {
  location.reload();
}

const handleSelectionChange = (val: Item[]) => {
  store.state.pluginsChanged = true;
  global.project.plugins.clear();
  val.forEach((e) => ((e.checked = true), global.project.plugins.add(e.url)));
  global.dispatchEvent({ type: 'projectSettingsChanged', soure: null as any, project: global.project });
};

defineProps({
  title: {
    type: String,
    default: '',
  },
});

onMounted(() => {
  global.addEventListener('assetsChanged', loadData);
  global.addEventListener('projectLoaded', loadData);
  loadData();
});

onUnmounted(() => {
  global.removeEventListener('assetsChanged', loadData);
  global.removeEventListener('projectLoaded', loadData);
});
</script>
<style>
.notPadding .el-dialog__body {
  padding: 0 !important;
}

.table-foot {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 1.2em;
}

.restart {
  color: red;
  font-weight: bold;
}

.restart[disabled='true'] {
  color: gray;
}
</style>
