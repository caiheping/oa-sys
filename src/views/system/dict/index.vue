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
        <a-button color="success" @click="handleAdd">新增</a-button>
      </a-col>
      <a-col v-has-permi="['system:dictType:delete']">
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
              v-has-permi="['system:dictType:delete']"
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
            <a-form-item label="字典名称" name="dictName">
              <a-input
                v-model:value="formState.dictName"
                placeholder="请输入字典名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="字典类型" name="dictType">
              <a-input
                v-model:value="formState.dictType"
                placeholder="请输入字典类型"
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
    title: '字典名称',
    dataIndex: 'dictName',
    key: 'dictName',
    align: 'center',
  },
  {
    title: '字典类型',
    dataIndex: 'dictType',
    key: 'dictType',
    align: 'center',
    slots: { customRender: 'dictType' },
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
    const loading = computed(() => useAppStore().loading)
    const disableOptions = ref<IData[]>([])
    const statusOptions = ref<IData[]>([])
    const rules = {
      dictName: [
        { required: true, message: '字典名称不能为空', trigger: 'blur' },
      ],
      dictType: [
        { required: true, message: '字典类型不能为空', trigger: 'blur' },
      ],
      status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
    }
    const formFields = reactive([
      {
        type: 'input',
        label: '字典名称',
        name: 'dictName',
        value: '',
        placeholder: '请输入字典名称',
      },
      {
        type: 'input',
        label: '字典类型',
        name: 'dictType',
        value: '',
        placeholder: '请输入字典类型',
      },
      {
        type: 'select',
        label: '状态',
        name: 'status',
        value: undefined,
        placeholder: '请选择角色状态',
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
      const dictId = row.id || state.selectedRowKeys
      delType(dictId).then(() => {
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
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getType(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改字典'
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
