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
      <a-col v-has-permi="['system:systemConfig:add']">
        <a-button color="success" @click="handleAdd">新增</a-button>
      </a-col>
      <a-col v-has-permi="['system:systemConfig:delete']">
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
      :data-source="systemConfigList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['system:systemConfig:update']"
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
              v-has-permi="['system:systemConfig:delete']"
            >
              删除
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 新增修改推窗 -->
    <a-drawer
      width="600px"
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
          <a-col :span="24">
            <a-form-item label="参数名称" name="name">
              <a-input
                v-model:value="formState.name"
                placeholder="请输入参数名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="参数键名" name="keyName">
              <a-input
                v-model:value="formState.keyName"
                placeholder="请输入参数键名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="参数键值" name="key">
              <a-input
                v-model:value="formState.key"
                placeholder="请输入参数键值"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
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
  getSystemConfig,
  getSystemConfigById,
  delSystemConfig,
  addSystemConfig,
  updateSystemConfig,
} from '@/api/admin/system/systemConfig'
import { selectDictLabel } from '@/utils/dictFormat'
import useDrawer from '@/hooks/useDrawer'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import { ISystemConfig } from '@/api/admin/system/systemConfig/type'

interface FormState {
  id: undefined | number
  name: undefined | string
  keyName: undefined | number
  key: undefined | string
  status: undefined | string
}
type Pagination = TableState['pagination']

const columns = [
  {
    title: '参数名称',
    dataIndex: 'name',
    key: 'name',
    align: 'center',
  },
  {
    title: '参数键名',
    dataIndex: 'keyName',
    key: 'keyName',
    align: 'center',
  },
  {
    title: '参数键值',
    dataIndex: 'key',
    key: 'key',
    align: 'center',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    key: 'remark',
    align: 'center',
  },
  {
    title: '创建者',
    dataIndex: 'createdBy',
    key: 'createdBy',
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
    const rules = {
      name: [{ required: true, message: '参数名称不能为空', trigger: 'blur' }],
      keyName: [
        { required: true, message: '参数键名不能为空', trigger: 'blur' },
      ],
      key: [{ required: true, message: '参数键值不能为空', trigger: 'change' }],
    }
    const formFields = reactive([
      {
        type: 'input',
        label: '参数名称',
        name: 'name',
        value: '',
        placeholder: '请输入参数名称',
      },
    ])
    // 查询表单操作
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      name: undefined || '',
      keyName: undefined || '',
      status: undefined || '',
    })

    const handleQuery = (query: {
      name: string
      keyName: string
      status: string
    }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.name = query.name
      queryParams.keyName = query.keyName
      queryParams.status = query.status
      getList(queryParams)
    }
    // 表格操作
    const systemConfigList = ref<ISystemConfig[]>([])
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
      getSystemConfig(queryParams).then((res) => {
        console.log(res)
        systemConfigList.value = res.data.rows
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
      name: undefined,
      keyName: undefined,
      status: '1',
      key: undefined,
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
            updateSystemConfig(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addSystemConfig(formState).then((res) => {
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
      delSystemConfig(dictId).then(() => {
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
      drawerTitle.value = '添加配置'
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getSystemConfigById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改配置'
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
      })
    }

    onMounted(async () => {
      init()
    })

    return {
      queryParams,
      formFields,
      handleQuery,
      systemConfigList,
      columns,
      pagination,
      handleTableChange,
      selectDictLabel,
      ...toRefs(state),
      hasSelected,
      onSelectChange,

      open,
      drawerTitle,
      formState,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      rules,
      formRef,
      handleClose,
      handleSubmit,
      confirm,
      cancel,
      handleAdd,
      handleUpdate,
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
