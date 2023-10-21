<template>
  <div class="grid-list">
    <div v-for="item in items" :key="item.name" class="grid-item" draggable="true" :style="{ width: itemWidth }"
      @dragstart="$emit('onItemDragstart', item, $event)">
      <div class="grid-slot">
        <i :class="item.icon" />
      </div>
      <label class="grid-name text-ellipsis" style="flex: 1 1 auto">{{ item.label || item.name }}</label>
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
.grid-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  font-size: 1rem;
}

.grid-item {
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
  margin: 2px 0;
  padding: 0 1px;
}

.grid-item i {
  color: black;
}

.grid-slot {
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
}

.grid-slot[selected='true'] {
  background: greenyellow;
}

.grid-type {
  color: #888;
}

.grid-name {
  color: #fff;
  margin: 0 0.2em;
  pointer-events: none;
  min-width: 6em;
  padding: 0 0.5em;
}

.grid-value {
  color: #888;
  direction: rtl;
}
</style>
