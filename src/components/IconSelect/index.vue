<template>
  <div class="flex items-center">
    <a-select
      v-model:value="selected"
      style="width: 100%"
      placeholder="select one country"
      option-label-prop="label"
      @change="handleChange"
    >
      <template #suffixIcon>
        <svg-icon :name="selected" size="12" />
      </template>
      <a-select-option
        :value="icon"
        :label="icon"
        v-for="icon in icons"
        :key="icon"
      >
        <div class="flex items-center">
          <span class="mr-2">{{ icon }}</span>
          <svg-icon :name="icon" />
        </div>
      </a-select-option>
    </a-select>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from 'vue'
import icons from './requireIcon'
export default defineComponent({
  props: ['value'],
  setup(props) {
    console.log(icons)
    const selected = ref(props.value)

    const handleChange = (val) => {
      console.log(val)
    }
    return {
      icons,
      selected,
      handleChange,
    }
  },
})
</script>