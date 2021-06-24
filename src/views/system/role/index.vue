<template>
  <div class="p-4">
    <div class="mb-3">
      <a-form layout="inline" :model="queryParams">
        <a-form-item label="用户名">
          <a-input
            v-model:value="queryParams.userName"
            placeholder="请输入用户名"
          />
        </a-form-item>
        <a-form-item label="角色">
          <a-select
            v-model:value="queryParams.role"
            placeholder="请选择角色"
            style="width: 200px"
          >
            <a-select-option value="0">超级管理员</a-select-option>
            <a-select-option value="1">员工</a-select-option>
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
        <a-button color="success" @click="open = !open">新增</a-button>
      </a-col>
      <a-col>
        <a-button color="error">删除</a-button>
      </a-col>
      <a-col>
        <a-button color="warning">导入</a-button>
      </a-col>
      <a-col>
        <a-button color="normal">导出</a-button>
      </a-col>
    </a-row>

    <a-table
      rowKey="id"
      :columns="columns"
      :data-source="userList"
      :pagination="pagination"
    >
      <template #action="{ record }">
        <span>
          <a-button type="link" color="success" class="mr-3">
            修改{{ record.name }}
          </a-button>
          <a-button type="link" color="success" class="mr-3">
            数据权限{{ record.name }}
          </a-button>
          <a-button type="link" color="error">删除</a-button>
        </span>
      </template>
    </a-table>

    <!-- 操作推窗 -->
    <a-drawer
      width="50%"
      title="新增角色"
      placement="right"
      v-model:visible="open"
      :maskClosable="false"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item label="角色名称" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="请输入角色名称"
          />
        </a-form-item>
        <a-form-item label="权限字符" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="请输入权限字符"
          />
        </a-form-item>
        <a-form-item label="显示顺序" name="name">
          <a-input-number v-model:value="formState.name" :min="1" :max="999" />
        </a-form-item>
        <a-form-item label="状态" name="name">
          <a-input v-model:value="formState.name" />
        </a-form-item>
        <a-form-item label="菜单权限" name="name">
          <a-tree
            checkable
            :tree-data="treeData"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
          />
        </a-form-item>
        <a-form-item label="备注" name="name">
          <a-textarea
            v-model:value="formState.name"
            placeholder="请输入备注"
            :rows="4"
          />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" class="mr-3">确认</a-button>
          <a-button>取消</a-button>
        </a-form-item>
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
  UnwrapRef,
  toRaw,
} from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { getRole } from '@/api/admin/system/role'

interface FormState {
  name: string
}

const treeData: TreeDataItem[] = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [],
  },
  {
    title: 'parent 1',
    key: '0-1',
    children: [
      {
        title: 'parent 1-1',
        key: '0-1-1',
        children: [{ key: '0-1-1-0', title: 'title0010' }],
      },
    ],
  },
]

const columns = [
  {
    title: '角色名称',
    dataIndex: 'roleName',
    key: 'roleName',
    align: 'center',
  },
  {
    title: '权限字符',
    dataIndex: 'roleKey',
    key: 'roleKey',
    align: 'center',
  },
  {
    title: '显示顺序',
    dataIndex: 'roleSort',
    key: 'roleSort',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
  },
  {
    title: '创建人',
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
  setup() {
    // 查询表单操作
    const queryParams = reactive({
      userName: undefined,
      deptId: 0,
      role: undefined,
    })
    // 表格操作
    const userList = ref([])
    const pagination = reactive({
      total: 0,
      current: 1,
      pageSize: 10,
    })

    const handleQuery = () => {
      getRoleList(queryParams)
    }

    const getRoleList = (queryParams?: {}) => {
      getRole(queryParams).then((res) => {
        console.log(res)
        userList.value = res.data.rows
        pagination.total = res.data.count
      })
    }

    // 新增修改表单操作
    const open = ref(false)
    const formRef = ref()
    const checkedKeys = ref<string[]>([])
    const selectedKeys = ref<string[]>([])
    const formState: UnwrapRef<FormState> = reactive({
      name: '',
      region: undefined,
      date1: undefined,
      delivery: false,
      type: [],
      resource: '',
      desc: '',
    })
    const rules = {
      name: [
        {
          required: true,
          message: '请输入角色名称',
          trigger: 'blur',
        },
      ],
      region: [
        {
          required: true,
          message: 'Please select Activity zone',
          trigger: 'change',
        },
      ],
      date1: [
        {
          required: true,
          message: 'Please pick a date',
          trigger: 'change',
          type: 'object',
        },
      ],
      type: [
        {
          type: 'array',
          required: true,
          message: 'Please select at least one activity type',
          trigger: 'change',
        },
      ],
      resource: [
        {
          required: true,
          message: 'Please select activity resource',
          trigger: 'change',
        },
      ],
      desc: [
        {
          required: true,
          message: 'Please input activity form',
          trigger: 'blur',
        },
      ],
    }
    const onSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          console.log('values', formState, toRaw(formState))
        })
        .catch((error: ValidateErrorEntity<FormState>) => {
          console.log('error', error)
        })
    }
    const resetForm = () => {
      formRef.value.resetFields()
    }

    const init = () => {
      getRoleList()
    }

    onMounted(() => {
      init()
    })

    return {
      queryParams,
      handleQuery,
      userList,
      columns,
      pagination,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },

      open,
      rules,
      formState,
      treeData,
      checkedKeys,
      selectedKeys,
      onSubmit,
      resetForm,
    }
  },
})
</script>
