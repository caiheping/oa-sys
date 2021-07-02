<template>
  <div class="p-4">
    <div class="mb-3">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="字典名称">
          <a-select
            v-model:value="queryParams.dictType"
            placeholder="字典名称"
            style="width: 200px"
            @select="handleQuery"
          >
            <a-select-option
              v-for="item in typeOptions"
              :key="item.id"
              :value="item.dictType"
            >
              {{ item.dictName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="字典标签">
          <a-input
            allowClear="true"
            v-model:value="queryParams.dictLabel"
            placeholder="请输入字典标签"
          />
        </a-form-item>
        <a-form-item label="状态">
          <a-select
            allowClear="true"
            v-model:value="queryParams.status"
            placeholder="数据状态"
            style="width: 200px"
            @select="handleQuery"
          >
            <a-select-option
              v-for="dict in statusOptions"
              :key="dict.dictValue"
              :value="dict.dictValue"
            >
              {{ dict.dictLabel }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="handleQuery">搜索</a-button>
            <a-button>重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>
    <a-row :gutter="10" class="mb-2">
      <a-col>
        <a-button color="success" @click="handleAdd">新增</a-button>
      </a-col>
      <a-col>
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
      rowKey="id"
      :row-selection="{
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange,
      }"
      :columns="columns"
      :data-source="userList"
      :pagination="pagination"
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
            <a-button type="link" color="error">删除</a-button>
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
                name="menuType"
                :options="[
                  { label: '正常', value: '1' },
                  { label: '停用', value: '0' },
                ]"
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

interface FormState {
  id: null | number
  dictType: string | undefined
  dictValue: string
  dictLabel: string
  dictSort: number
  status: string
  remark: string
}

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
  setup() {
    const route = useRoute()
    const rules = {
      dictName: [
        { required: true, message: '字典名称不能为空', trigger: 'blur' },
      ],
      dictLabel: [
        { required: true, message: '字典类型不能为空', trigger: 'blur' },
      ],
      status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
    }
    console.log(route.params.id)
    // 查询表单操作
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      dictName: undefined,
      dictType: undefined,
      status: undefined,
    })
    // 表格操作
    const userList = ref([])
    const pagination = reactive({
      total: 0,
      current: 1,
      pageSize: 10,
    })
    const state = reactive({
      selectedRowKeys: [],
    })
    const hasSelected = computed(() => state.selectedRowKeys.length > 0)

    const handleQuery = () => {
      getList(queryParams)
    }
    const onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      state.selectedRowKeys = selectedRowKeys
    }

    const getList = (queryParams?: {}) => {
      listData(queryParams).then((res) => {
        console.log(res)
        userList.value = res.data.rows
        pagination.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    const typeOptions = ref()

    const init = () => {
      getType(route.params.id).then((res) => {
        queryParams.dictType = res.data.dictType
        console.log(queryParams)
        getList(queryParams)
      })
      listType().then((res) => {
        typeOptions.value = res.data.rows
      })
    }

    const formRef = ref()
    const formState: FormState = reactive({
      id: null,
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
      formState.id = null
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
              formState.id = null
              formRef.value.resetFields()
              open.value = false
              getList(queryParams)
            })
          } else {
            addData(formState).then((res) => {
              Message.success(res.message)
              formState.id = null
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
      console.log(99)
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

    const statusOptions = ref([])
    onMounted(async () => {
      console.log(queryParams)
      statusOptions.value = await getDict('sys_normal_disable')
      console.log(statusOptions)
      init()
    })

    return {
      queryParams,
      handleQuery,
      userList,
      columns,
      pagination,
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
    }
  },
})
</script>
