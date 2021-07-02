<template>
  <div v-if="!item.hidden">
    <a-sub-menu v-if="item.children && item.children.length" class="subMenu">
      <template #title>
        <span v-if="item?.meta?.icon" class="anticon anticon-pie-chart">
          <svg-icon :name="item?.meta?.icon" />
        </span>
        <span>{{ item?.meta?.title }}</span>
      </template>
      <SidebarItem
        v-for="list in item.children"
        :key="list.name"
        :item="list"
      />
    </a-sub-menu>
    <a-menu-item v-else class="subMenu">
      <span v-if="item?.meta?.icon" class="anticon anticon-pie-chart">
        <svg-icon :name="item?.meta?.icon" />
      </span>
      <span>{{ item?.meta?.title }}</span>
    </a-menu-item>
  </div>
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
