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
        <a-button color="success" @click="handleAdd">新增</a-button>
      </a-col>
      <a-col v-has-permi="['system:dictData:delete']">
        <a-popconfirm
          title="确定要删除选中数据吗？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="confirm"
          @cancel="cancel"
        >
          <a-button :disabled="!hasSelected" color="error"> 删除 </a-button>
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
            修改
          </a-button>
          <a-popconfirm
            title="确定要删除该数据吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="confirm(record)"
            @cancel="cancel"
          >
            <a-button
              type="link"
              color="error"
              v-has-permi="['system:dictData:delete']"
            >
              删除
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
            <a-form-item label="字典类型" name="dictType">
              <a-input
                disabled
                v-model:value="formState.dictType"
                placeholder="请输入字典类型"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="字典标签" name="dictLabel">
              <a-input
                v-model:value="formState.dictLabel"
                placeholder="请输入字典标签"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="字典键值" name="dictValue">
              <a-input
                v-model:value="formState.dictValue"
                placeholder="请输入字典键值"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="显示排序" name="dictSort">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.dictSort"
                placeholder="请输入显示排序"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="状态" name="status">
              <a-radio-group
                v-model:value="formState.status"
                :options="disableOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="备注" name="remark">
              <a-textarea
                :rows="3"
                v-model:value="formState.remark"
                placeholder="请输入备注"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" class="mr-3" @click="handleSubmit">
                确认
              </a-button>
              <a-button @click="handleClose">取消</a-button>
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
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import { IData } from '@/api/admin/system/dict/data/type'

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
    title: '字典标签',
    dataIndex: 'dictLabel',
    key: 'dictLabel',
    align: 'center',
  },
  {
    title: '字典键值',
    dataIndex: 'dictValue',
    key: 'dictValue',
    align: 'center',
  },
  {
    title: '字典排序',
    dataIndex: 'dictSort',
    key: 'dictSort',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: '操作',
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
    const route = useRoute()
    const typeOptions = ref()
    const disableOptions = ref<IData[]>([])
    const statusOptions = ref<IData[]>([])
    const rules = {
      dictName: [
        { required: true, message: '字典名称不能为空', trigger: 'blur' },
      ],
      dictLabel: [
        { required: true, message: '字典类型不能为空', trigger: 'blur' },
      ],
      status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
    }

    // 查询表单操作
    const formFields = reactive([
      {
        type: 'select',
        label: '字典类型',
        name: 'dictType',
        value: undefined,
        placeholder: '请选择字典类型',
        normalizer: {
          value: 'dictType',
          label: 'dictName',
        },
        options: typeOptions,
      },
      {
        type: 'input',
        label: '字典标签',
        name: 'dictLabel',
        value: '',
        placeholder: '请输入字典标签',
      },
      {
        type: 'select',
        label: '状态',
        name: 'status',
        value: undefined,
        placeholder: '请选择数据状态',
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
      const dictId = row.id || state.selectedRowKeys
      delData(dictId).then(() => {
        getList(queryParams)
        Message.success('删除成功')
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success('取消删除')
    }

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      drawerTitle.value = '添加字典'
      formState.dictType = queryParams.dictType
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getDataById(row.id).then((res) => {
        open.value = true

        formState.dictType = queryParams.dictType
        drawerTitle.value = '修改字典'
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
      disableOptions.value.forEach(item => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      console.log(statusOptions)
      init()
    })

    return {
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
      disableOptions
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
