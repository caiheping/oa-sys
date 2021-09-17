<template>
  <div class="p-4">
    <div class="mb-3">
      <form-search
        :formFields="formFields"
        @search="handleQuery"
        @reset="handleQuery"
      />
    </div>
    <a-row :gutter="10" class="mb-2">
      <a-col v-has-permi="['system:dictType:add']">
        <a-button color="success" @click="handleAdd">{{
          t('common.add')
        }}</a-button>
      </a-col>
      <a-col v-has-permi="['system:dictType:delete']">
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
      :data-source="typeList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #dictType="{ record }">
        <router-link :to="'dictData/' + record.id">
          <span class="text-[#1890ff]">{{ record.dictType }}</span>
        </router-link>
      </template>
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
            v-has-permi="['system:dictType:update']"
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
              v-has-permi="['system:dictType:delete']"
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
            <a-form-item :label="t('routes.dict.dictName')" name="dictName">
              <a-input
                v-model:value="formState.dictName"
                :placeholder="t('routes.dict.dictNamePlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.dict.dictType')" name="dictType">
              <a-input
                v-model:value="formState.dictType"
                :placeholder="t('routes.dict.dictTypePlaceholder')"
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
              <a-button @click="handleClose">
                {{ t('common.cancelText') }}
              </a-button>
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
import {
  listType,
  getType,
  delType,
  addType,
  updateType,
} from '@/api/admin/system/dict/type'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import useDrawer from '@/hooks/useDrawer'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import { IType } from '@/api/admin/system/dict/type/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

interface FormState {
  id: undefined | number
  dictName: undefined | string
  dictType: undefined | number
  status: undefined | string
  remark: undefined | string
}
type Pagination = TableState['pagination']

const columns = [
  {
    title: t('routes.dict.dictName'),
    dataIndex: 'dictName',
    key: 'dictName',
    align: 'center',
  },
  {
    title: t('routes.dict.dictType'),
    dataIndex: 'dictType',
    key: 'dictType',
    align: 'center',
    slots: { customRender: 'dictType' },
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
      dictType: [
        {
          required: true,
          message: t('routes.dict.dictTypeCannotBeRmpty'),
          trigger: 'blur',
        },
      ],
      status: [
        {
          required: true,
          message: t('routes.dict.statusCannotBeRmpty'),
          trigger: 'change',
        },
      ],
    }
    const formFields = reactive([
      {
        type: 'input',
        label: t('routes.dict.dictName'),
        name: 'dictName',
        value: '',
        placeholder: '请输入字典名称',
      },
      {
        type: 'input',
        label: t('routes.dict.dictType'),
        name: 'dictType',
        value: '',
        placeholder: '请输入字典类型',
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
    // 查询表单操作
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      dictName: undefined || '',
      dictType: undefined || '',
      status: undefined || '',
    })

    const handleQuery = (query: {
      dictName: string
      dictType: string
      status: string
    }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.dictName = query.dictName
      queryParams.dictType = query.dictType
      queryParams.status = query.status
      getList(queryParams)
    }
    // 表格操作
    const typeList = ref<IType[]>([])
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
      listType(queryParams).then((res) => {
        console.log(res)
        typeList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    const init = () => {
      getList(queryParams)
    }

    const formRef = ref()
    const formState: FormState = reactive({
      id: undefined,
      dictName: undefined,
      dictType: undefined,
      status: '1',
      remark: undefined,
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
            updateType(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addType(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
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
      delType(ids).then(() => {
        if (
          (ids.length && ids.length === typeList.value.length) ||
          typeList.value.length === 1
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
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getType(row.id).then((res) => {
        open.value = true
        drawerTitle.value = t('common.update')
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
      })
    }

    onMounted(async () => {
      disableOptions.value = await getDict('sys_normal_disable')
      disableOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      statusOptions.value = await getDict('sys_normal_disable')
      console.log(statusOptions)
      init()
    })

    return {
      t,
      loading,
      queryParams,
      formFields,
      handleQuery,
      typeList,
      columns,
      pagination,
      handleTableChange,
      selectDictLabel,
      statusOptions,
      ...toRefs(state),
      hasSelected,
      onSelectChange,

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
