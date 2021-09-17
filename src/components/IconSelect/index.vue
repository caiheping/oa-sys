<template>
  <div class="flex items-center">
    <a-select
      v-model:value="selected"
      style="width: 100%"
      :placeholder="t('common.resetText')"
      option-label-prop="label"
      @change="handleChange"
    >
      <template #suffixIcon>
        <svg-icon :name="selected" size="12" />
      </template>
      <a-select-option value="" :label="t('common.nothing')">{{
        t('common.nothing')
      }}</a-select-option>
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
import { ref, defineComponent, watchEffect } from 'vue'
import { useI18n } from '@/hooks/useI18n'
import icons from './requireIcon'
export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const selected = ref(props.value)
    const handleChange = (val) => {
      emit('change', val)
    }
    watchEffect(() => {
      selected.value = props.value
    })
    const reset = () => {
      selected.value = ''
    }
    return {
      t,
      icons,
      selected,
      handleChange,
      reset,
    }
  },
})
</script>