<template>
  <div class="flex items-center">
    <a-select
      v-model:value="selected"
      style="width: 100%"
      :placeholder="iconPlaceholder || t('common.resetText')"
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
import { ref, defineComponent, watchEffect, computed } from 'vue'
import { useI18n } from '@/hooks/useI18n'
import icons from './requireIcon'
export default defineComponent({
  props: {
    value: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
    }
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const selected = ref(props.value)
    const iconPlaceholder = ref(props.placeholder)
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
      iconPlaceholder,
      selected,
      handleChange,
      reset,
    }
  },
})
</script>
