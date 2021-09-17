<template>
  <!-- 简单的查询表单封装 -->
  <a-form ref="formRef" layout="inline" :model="formState">
    <a-form-item
      v-for="(item, index) in formDataList"
      :key="index"
      :label="item.label"
      :name="item.name"
    >
      <a-input
        :allowClear="true"
        v-if="item.type === 'input'"
        v-model:value="formState[item.name]"
        :placeholder="item.placeholder"
      />
      <a-cascader
        v-else-if="item.type === 'cascader'"
        :options="item.options ? item.options : []"
        v-model:value="formState[item.name]"
        :placeholder="item.placeholder"
      />
      <a-date-picker
        v-else-if="item.type === 'date-picker'"
        v-model:value="formState[item.name]"
        :placeholder="item.placeholder"
      />
      <a-month-picker
        v-else-if="item.type === 'month-picker'"
        v-model:value="formState[item.name]"
        :placeholder="item.placeholder"
      />
      <a-range-picker
        v-else-if="item.type === 'range-picker'"
        v-model:value="formState[item.name]"
      />
      <a-week-picker
        v-else-if="item.type === 'week-picker'"
        v-model:value="formState[item.name]"
        :placeholder="item.placeholder"
      />
      <a-time-picker
        v-else-if="item.type === 'time-picker'"
        v-model:value="formState[item.name]"
        :format="item.format ? item.format : 'HH:mm'"
      />
      <a-select
        v-else-if="item.type === 'select'"
        :placeholder="item.placeholder"
        style="width: 200px"
        v-model:value="formState[item.name]"
      >
        <a-select-option
          :value="list[item.normalizer ? item.normalizer.value : 'value']"
          v-for="(list, i) in item.options"
          :key="i"
        >
          {{ list[item.normalizer ? item.normalizer.label : 'label'] }}
        </a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item>
      <a-space>
        <a-button type="primary" @click="handleQuery">{{
          t('common.searchText')
        }}</a-button>
        <a-button @click="handleReset">{{ t('common.resetText') }}</a-button>
      </a-space>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from 'vue'
import { useI18n } from '@/hooks/useI18n'
import { FormDataItem } from './type'

export default defineComponent({
  props: {
    formFields: {
      type: Array,
      required: true,
    },
  },
  emits: ['search', 'reset'],
  setup(props, { emit, attrs }) {
    const { t } = useI18n()
    console.log(props, emit, attrs)
    // 新增修改表单操作
    const formRef = ref()
    const obj = {}

    props.formFields.forEach((list: any) => {
      obj[list.name] = list.value
    })
    const formState = ref(obj)

    watch(
      props.formFields,
      () => {
        props.formFields.forEach((list: any) => {
          formState.value[list.name] = list.value
        })
      },
      { deep: true }
    )
    const formDataList = computed<FormDataItem[] | any>(() => props.formFields)

    const handleQuery = () => {
      emit('search', formState.value)
    }
    const handleReset = () => {
      formRef.value.resetFields()
      emit('reset', formState.value)
    }

    return {
      t,
      formDataList,
      formState,
      formRef,
      handleQuery,
      handleReset,
    }
  },
})
</script>