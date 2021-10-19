<template>
  <div class="p-4">
    <div class="mb-3">
      <form-search
        :formFields="formFields"
        @search="handleQuery"
        @reset="handleReset"
      />
    </div>
    <a-row :gutter="10" class="mb-2">
      <a-col v-has-permi="['system:dictData:add']">
        <a-button color="success" @click="handleAdd">{{
          t('common.add')
        }}</a-button>
      </a-col>
      <a-col v-has-permi="['system:dictData:delete']">
        <a-popconfirm
          :title="t('common.confirmDelete')"
          :ok-text="t('common.okText')"
          :cancel-text="t('common.cancelText')"
          @confirm="confirm"
          @cancel="cancel"
        >
          <a-button :disabled="!hasSelected" color="error">
            {{ t('common.delete') }}
          </a-button>
        </a-popconfirm>
      </a-col>
    </a-row>

    <a-table
      :loading="loading"
      rowKey="id"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
      }"
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #status="{ record }">
        <span>{{ selectDictLabel(statusOptions, record.status) }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['system:dictData:update']"
          >
            {{ t('common.update') }}
          </a-button>
          <a-popconfirm
            :title="t('common.confirmDelete')"
            :ok-text="t('common.okText')"
            :cancel-text="t('common.cancelText')"
            @confirm="confirm(record)"
            @cancel="cancel"
          >
            <a-button
              type="link"
              color="error"
              v-has-permi="['system:dictData:delete']"
            >
              {{ t('common.delete') }}
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 新增修改推窗 -->
    <a-drawer
      width="50%"
      :title="drawerTitle"
      placement="right"
      v-model:visible="open"
      :maskClosable="false"
      @close="handleClose"
    >
      <a-form
        v-if="open"
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.dictName')" name="dictType">
              <a-input
                disabled
                v-model:value="formState.dictType"
                :placeholder="t('routes.dict.dictTypePlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.dictLabel')" name="dictLabel">
              <a-input
                v-model:value="formState.dictLabel"
                :placeholder="t('routes.dict.dictLabelPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.dictValue')" name="dictValue">
              <a-input
                v-model:value="formState.dictValue"
                :placeholder="t('routes.dict.dictValuePlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.dictSort')" name="dictSort">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.dictSort"
                :placeholder="t('routes.dict.dictSortPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.status')" name="status">
              <a-radio-group
                v-model:value="formState.status"
                :options="disableOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.remark')" name="remark">
              <a-textarea
                :rows="3"
                v-model:value="formState.remark"
                :placeholder="t('routes.dict.remarkPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" class="mr-3" @click="handleSubmit">
                {{ t('common.okText') }}
              </a-button>
              <a-button @click="handleClose">{{
                t('common.cancelText')
              }}</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-drawer>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  nextTick,
  toRefs,
  computed,
} from 'vue'
import { listType, getType } from '@/api/admin/system/dict/type'
import {
  listData,
  getDataById,
  delData,
  addData,
  updateData,
} from '@/api/admin/system/dict/data'
import { useRoute } from 'vue-router'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import useDrawer from '@/hooks/useDrawer'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import { IData } from '@/api/admin/system/dict/data/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

interface FormState {
  id: undefined | number
  dictType: string | undefined
  dictValue: string
  dictLabel: string
  dictSort: number
  status: string
  remark: string
}
type Pagination = TableState['pagination']

const columns = [
  {
    title: t('routes.dict.dictLabel'),
    dataIndex: 'dictLabel',
    key: 'dictLabel',
    align: 'center',
  },
  {
    title: t('routes.dict.dictValue'),
    dataIndex: 'dictValue',
    key: 'dictValue',
    align: 'center',
  },
  {
    title: t('routes.dict.dictSort'),
    dataIndex: 'dictSort',
    key: 'dictSort',
    align: 'center',
  },
  {
    title: t('routes.dict.status'),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: t('routes.dict.remark'),
    dataIndex: 'remark',
    key: 'remark',
    align: 'center',
  },
  {
    title: t('routes.dict.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.dict.action'),
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' },
  },
]

export default defineComponent({
  components: {
    FormSearch,
  },
  setup() {
    const loading = computed(() => useAppStore().loading)
    const route = useRoute()
    const typeOptions = ref()
    const disableOptions = ref<IData[]>([])
    const statusOptions = ref<IData[]>([])
    const rules = {
      dictName: [
        {
          required: true,
          message: t('routes.dict.dictNameCannotBeRmpty'),
          trigger: 'blur',
        },
      ],
      dictLabel: [
        {
          required: true,
          message: t('routes.dict.dictTypeCannotBeRmpty'),
          trigger: 'blur',
        },
      ],
      status: [
        {
          required: true,
          message: t('routes.dict.状态不能为空'),
          trigger: 'change',
        },
      ],
    }

    // 查询表单操作
    const formFields = reactive([
      {
        type: 'select',
        label: t('routes.dict.dictType'),
        name: 'dictType',
        value: undefined,
        placeholder: t('routes.dict.dictTypePlaceholder'),
        normalizer: {
          value: 'dictType',
          label: 'dictName',
        },
        options: typeOptions,
      },
      {
        type: 'input',
        label: t('routes.dict.dictLabel'),
        name: 'dictLabel',
        value: '',
        placeholder: t('routes.dict.dictLabelPlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.dict.status'),
        name: 'status',
        value: undefined,
        placeholder: t('routes.dict.statusPlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: statusOptions,
      },
    ])
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      dictLabel: undefined || '',
      dictType: undefined || '',
      status: undefined || '',
    })
    const handleQuery = (query: {
      dictType: string
      dictLabel: string
      status: string
    }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.dictType = query.dictType
      queryParams.dictLabel = query.dictLabel
      queryParams.status = query.status
      getList(queryParams)
    }
    const handleReset = (query: {
      dictType: string
      dictLabel: string
      status: string
    }) => {
      formFields[0].value = undefined
      nextTick(() => {
        queryParams.dictLabel = query.dictLabel
        queryParams.status = query.status
        formFields[0].value = queryParams.dictType
        getList(queryParams)
      })
    }
    // 表格操作
    const dataList = ref<IData[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })
    const handleTableChange = (page: Pagination) => {
      (pagination.value as Pagination) = page
      queryParams.pageNum = pagination.value.current
      queryParams.pageSize = pagination.value.pageSize
      getList(queryParams)
    }
    const state = reactive({
      selectedRowKeys: [],
    })
    const hasSelected = computed(() => state.selectedRowKeys.length > 0)

    const onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      state.selectedRowKeys = selectedRowKeys
    }

    const getList = (queryParams?: {}) => {
      listData(queryParams).then((res) => {
        console.log(res)
        dataList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    const init = () => {
      getType(route.params.id).then((res) => {
        queryParams.dictType = res.data.dictType
        formFields[0].value = res.data.dictType
        console.log(queryParams)
        getList(queryParams)
      })
      listType().then((res) => {
        typeOptions.value = res.data.rows
      })
    }

    const formRef = ref()
    const formState: FormState = reactive({
      id: undefined,
      dictType: '',
      dictLabel: '',
      dictValue: '',
      dictSort: 1,
      status: '1',
      remark: '',
    })
    const { open, drawerTitle } = useDrawer()
    console.log(open)
    const handleClose = () => {
      formState.id = undefined
      formRef.value.resetFields()
      console.log(formRef)
      open.value = false
    }
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateData(formState).then((res) => {
              Message.success(res.message)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
              getList(queryParams)
            })
          } else {
            addData(formState).then((res) => {
              Message.success(res.message)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
              getList(queryParams)
            })
          }
        })
        .catch((error: ValidateErrorEntity) => {
          console.log('error', error)
        })
    }
    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delData(ids).then(() => {
        if (
          (ids.length && ids.length === dataList.value.length) ||
          dataList.value.length === 1
        ) {
          if (
            Math.ceil(pagination.value.total / queryParams.pageSize) ===
              queryParams.pageNum &&
            queryParams.pageNum > 1
          ) {
            queryParams.pageNum--
          }
        }
        getList(queryParams)
        Message.success(t('common.deleteSuccess'))
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success(t('common.cancelDelete'))
    }

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      drawerTitle.value = t('common.add')
      formState.dictType = queryParams.dictType
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getDataById(row.id).then((res) => {
        open.value = true

        formState.dictType = queryParams.dictType
        drawerTitle.value = t('common.update')
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
      })
    }

    onMounted(async () => {
      console.log(queryParams)
      statusOptions.value = await getDict('sys_normal_disable')
      disableOptions.value = await getDict('sys_normal_disable')
      disableOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      console.log(statusOptions)
      init()
    })

    return {
      t,
      loading,
      queryParams,
      formFields,
      handleQuery,
      handleReset,
      dataList,
      columns,
      pagination,
      handleTableChange,
      selectDictLabel,
      statusOptions,
      ...toRefs(state),
      hasSelected,
      onSelectChange,
      typeOptions,

      open,
      drawerTitle,
      formState,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      rules,
      formRef,
      handleClose,
      handleSubmit,
      confirm,
      cancel,
      handleAdd,
      handleUpdate,
      disableOptions,
    }
  },
})
</script>
