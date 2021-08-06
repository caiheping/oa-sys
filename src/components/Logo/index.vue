<template>
  <div
    class="
      flex
      text-white text-center
      flex-wrap
      h-12
      overflow-hidden
      justify-center
      pl-3
      pr-3
    "
  >
    <span class="flex h-12 items-center p-1">logo</span>
    <span class="flex h-12 items-center p-1 font-bold text-size-16px">{{
      settings.title
    }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import settings from "@/settings"
export default defineComponent({
  setup() {
    return {
      settings,
    }
  },
})
</script>
