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
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, onMounted } from 'vue'
import { listUser } from '@/api/admin/system/user'
const columns = [
  {
    title: '字典名称',
    dataIndex: 'userName',
    key: 'userName',
    align: 'center',
  },
  {
    title: '字典裂隙',
    dataIndex: 'nickName',
    key: 'nickName',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
  },
  {
    title: '备注',
    dataIndex: 'status',
    key: 'status',
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
      getUserList(queryParams)
    }

    const getUserList = (queryParams?: {}) => {
      listUser(queryParams).then((res) => {
        console.log(res)
        userList.value = res.data.rows
        pagination.total = res.data.count
      })
    }

    const init = () => {
      getUserList()
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
    }
  },
})
</script>
