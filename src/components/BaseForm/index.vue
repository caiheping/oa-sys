<template>
  <!-- 简单的表单封装 -->
  <!-- 操作推窗 -->
  <a-drawer
    width="50%"
    :title="title"
    placement="right"
    v-model:visible="isOpen"
    @close="handleCancel"
    :maskClosable="false"
  >
    <a-form
      ref="formRef"
      :labelCol="labelCol"
      :wrapperCol="wrapperCol"
      :model="formState"
      :rules="rules"
    >
      <a-row>
        <a-col
          :span="12"
          v-for="(item, index) in formDataList"
          :key="index"
          v-show="!item.hidden"
        >
          <a-form-item :label="item.label" :name="item.name">
            <a-input
              v-if="item.type === 'input'"
              v-model:value="item.value"
              :placeholder="item.placeholder"
            />
            <treeselect
              v-if="item.type === 'treeselect'"
              class="!mt-[3px]"
              v-model="item.value"
              :normalizer="item.normalizer ? item.normalizer : normalizer"
              :placeholder="item.placeholder"
              :options="item.options ? item.options : []"
            />
            <IconSelect
              v-if="item.type === 'IconSelect'"
              :value="item.value"
              :placeholder="item.placeholder"
            />
            <a-input-number
              v-else-if="item.type === 'input-number'"
              class="!w-[100%]"
              v-model:value="item.value"
              :placeholder="item.placeholder"
            />
            <a-cascader
              v-else-if="item.type === 'cascader'"
              :options="item.options ? item.options : []"
              v-model:value="item.value"
              :placeholder="item.placeholder"
            />
            <a-checkbox-group
              v-else-if="item.type === 'checkbox-group'"
              v-model:value="item.value"
              :name="item.name"
              :options="item.options ? item.options : []"
            />
            <a-radio-group
              v-else-if="item.type === 'radio-group'"
              v-model:value="item.value"
              :name="item.name"
              :options="item.options ? item.options : []"
              @change="item.fn?.change"
            />
            <a-date-picker
              v-else-if="item.type === 'date-picker'"
              v-model:value="item.value"
              :placeholder="item.placeholder"
            />
            <a-month-picker
              v-else-if="item.type === 'month-picker'"
              v-model:value="item.value"
              :placeholder="item.placeholder"
            />
            <a-range-picker
              v-else-if="item.type === 'range-picker'"
              v-model:value="item.value"
            />
            <a-week-picker
              v-else-if="item.type === 'week-picker'"
              v-model:value="item.value"
              :placeholder="item.placeholder"
            />
            <a-time-picker
              v-else-if="item.type === 'time-picker'"
              v-model:value="item.value"
              :format="item.format ? item.format : 'HH:mm'"
            />
            <a-rate
              v-else-if="item.type === 'rate'"
              v-model:value="item.value"
            />
            <a-select
              v-else-if="item.type === 'select'"
              :mode="item.mode ? item.mode : 'tags'"
              :placeholder="item.placeholder"
              v-model:value="item.value"
            >
              <a-select-option
                :value="list.value"
                v-for="(list, i) in item.options"
                :key="i"
              >
                {{ list.value }}
              </a-select-option>
            </a-select>
            <a-slider
              v-else-if="item.type === 'slider'"
              v-model:value="item.value"
              :min="item.min ? item.min : 0"
              :max="item.max ? item.max : 100"
            />
            <a-switch
              v-else-if="item.type === 'switch'"
              v-model:checked="item.value"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
    <div>
      <a-button type="primary" class="mr-3" @click="handleSubmit">
        确认
      </a-button>
      <a-button @click="handleCancel">取消</a-button>
    </div>
  </a-drawer>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import IconSelect from '@/components/IconSelect/index.vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'

export default defineComponent({
  components: {
    Treeselect,
    IconSelect,
  },
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    formData: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  emits: ['close', 'submit'],
  setup(props, { emit, attrs }) {
    console.log(props, emit, attrs)
    // 新增修改表单操作
    const formRef = ref()
    const obj = {}
    const formState = computed(() => {
      props.formData.forEach((list: any) => {
        obj[list.name] = list.value
      })
      return obj
    })
    console.log(formState)
    const rules = {
      name: [
        {
          required: true,
          message: '请输入角色名称',
          trigger: 'blur',
        },
      ],
    }

    const handleCancel = () => {
      console.log(formState.value, obj)
      emit('close')
    }

    const handleSubmit = () => {
      console.log(formRef)
      formRef.value
        .validate()
        .then(() => {
          emit('submit', formState.value)
          console.log('values', formState.value)
        })
        .catch((error: ValidateErrorEntity) => {
          console.log('error', error)
        })
    }

    const normalizer = (node) => {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.id,
        label: node.title,
        children: node.children,
      }
    }

    const isOpen = computed(() => props.open)

    const formDataList = computed(() => props.formData)

    return {
      isOpen,
      formDataList,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      rules,
      formState,
      formRef,
      handleCancel,
      handleSubmit,
      normalizer,
    }
  },
})
</script>