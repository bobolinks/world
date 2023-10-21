<template>
  <div class="panel-list">
    <div v-for="item in items" :key="item.name" class="panel-list-item" draggable="true" :style="{ width: itemWidth }"
      @dragstart="$emit('onItemDragstart', item, $event)">
      <div class="panel-list-slot">
        <i :class="item.icon" />
      </div>
      <label class="panel-list-name text-ellipsis" style="flex: 1 1 auto">{{ item.label || item.name }}</label>
    </div>
  </div>
</template>
<script lang='ts' setup>

type Item = {
  name: string;
  label?: string;
  icon?: string;
};

defineProps({
  items: {
    type: Array<Item>,
    default: [] as Array<Item>,
  },
  itemWidth: {
    type: String,
    default: '170px',
  }
});

defineEmits(['onItemDragstart'])

</script>
<style scoped>
.panel-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  font-size: 1rem;
}

.panel-list-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-radius: 16px;
  border: rgb(56, 148, 56);
  background: rgb(89, 192, 89);
  color: white;
  position: relative;
  height: 32px;
  box-sizing: content-box;
  margin: 8px 0;
  padding: 0 1px;
}

.panel-list-item i {
  color: black;
}

.panel-list-slot {
  min-width: 30px;
  height: 30px;
  padding: 0;
  background: white;
  border-radius: 15px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  margin-right: 0.5em;
}

.panel-list-slot[selected='true'] {
  background: greenyellow;
}

.panel-list-name {
  pointer-events: none;
}
</style>
