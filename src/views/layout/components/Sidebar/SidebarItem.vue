<template>
  <a-sub-menu
    :key="item?.name"
    v-if="item.children && item.children.length && !item.hidden"
  >
    <template #icon>
      <span v-if="item?.meta?.icon" class="anticon anticon-pie-chart">
        <svg-icon :name="item?.meta?.icon" />
      </span>
    </template>
    <template #title>{{ item?.meta?.title }}</template>
    <SidebarItem v-for="list in item.children" :key="list.name" :item="list" />
  </a-sub-menu>
  <a-menu-item
    :key="item?.name"
    v-if="!(item.children && item.children.length) && !item.hidden"
  >
    <span v-if="item?.meta?.icon" class="anticon anticon-pie-chart">
      <svg-icon :name="item?.meta?.icon" />
    </span>
    <span>{{ item?.meta?.title }}</span>
  </a-menu-item>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  name: 'SidebarItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  setup() {
    return {}
  },
})
</script>
