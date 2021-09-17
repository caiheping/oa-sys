<template>
  <a-form :model="formState">
    <a-row>
      <a-col
        v-for="(item, index) in formDataList"
        :key="index"
        :span="item.span ? item.span : 12"
        v-show="!item.hidden"
      >
        <a-form-item
          :label="item.label"
          :labelCol="item.labelCol ? item.labelCol : labelCol"
          v-bind="validateInfos[item.name]"
        >
          <a-input
            v-if="item.type === 'input'"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-textarea
            v-if="item.type === 'textarea'"
            :rows="3"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-input-number
            v-else-if="item.type === 'input-number'"
            class="!w-[100%]"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-cascader
            v-else-if="item.type === 'cascader'"
            :options="item.options ? item.options : []"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-checkbox-group
            v-else-if="item.type === 'checkbox-group'"
            v-model:value="formState[item.name]"
            :name="item.name"
            :options="item.options ? item.options : []"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-radio-group
            v-else-if="item.type === 'radio-group'"
            v-model:value="formState[item.name]"
            :name="item.name"
            :options="item.options ? item.options : []"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-date-picker
            v-else-if="item.type === 'date-picker'"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-month-picker
            v-else-if="item.type === 'month-picker'"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-range-picker
            v-else-if="item.type === 'range-picker'"
            v-model:value="formState[item.name]"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-week-picker
            v-else-if="item.type === 'week-picker'"
            v-model:value="formState[item.name]"
            :placeholder="item.placeholder"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-time-picker
            v-else-if="item.type === 'time-picker'"
            v-model:value="formState[item.name]"
            :format="item.format ? item.format : 'HH:mm'"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-rate
            v-else-if="item.type === 'rate'"
            v-model:value="formState[item.name]"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-select
            v-else-if="item.type === 'select'"
            :placeholder="item.placeholder"
            v-model:value="formState[item.name]"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          >
            <a-select-option
              :value="list[item.serialize?.value || 'value']"
              v-for="(list, i) in item.options"
              :key="i"
            >
              {{ list[item.serialize?.label || 'label'] }}
            </a-select-option>
          </a-select>
          <a-slider
            v-else-if="item.type === 'slider'"
            v-model:value="formState[item.name]"
            :min="item.min ? item.min : 0"
            :max="item.max ? item.max : 100"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
          <a-switch
            v-else-if="item.type === 'switch'"
            v-model:checked="formState[item.name]"
            v-bind="item.props"
            v-on="item.fn ? item.fn : {}"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <slot>
      <a-button type="primary" @click.prevent="handleSubmit">{{
        t('common.okText')
      }}</a-button>
      <a-button class="ml-3" @click="handleCancel">{{
        t('common.cancelText')
      }}</a-button>
    </slot>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useI18n } from '@/hooks/useI18n'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { Form } from 'ant-design-vue'

import { FormDataItem } from './type'

const useForm = Form.useForm

export default defineComponent({
  props: {
    formData: {
      type: Array,
      required: true,
    },
    data: {
      type: Object,
      required: true,
      default: () => {
        return {}
      },
    },
    rules: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const formDataList = computed(
      (): FormDataItem[] => props.formData as FormDataItem[]
    )
    const formState = computed(() => props.data)
    const rulesRef = computed(() => props.rules)

    const { resetFields, validate, validateInfos } = useForm(
      formState,
      rulesRef
    )

    const handleCancel = () => {
      emit('close')
      // resetFields()
    }

    const handleSubmit = () => {
      validate()
        .then(() => {
          console.log('data', formState.value)
          emit('submit')
          // resetFields()
        })
        .catch((error: ValidateErrorEntity) => {
          console.log('error', error)
        })
    }

    return {
      t,
      formDataList,
      formState,
      labelCol: { span: 6 },
      validateInfos,
      handleCancel,
      handleSubmit,
      resetFields,
    }
  },
})
</script>
