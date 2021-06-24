<template>
  <div class="p-4">
    <a-row :gutter="15">
      <a-col :span="4">
        <a-input v-model:value="searchValue" placeholder="请输入部门名称">
          <template #prefix>
            <svg-icon name="search" class="text-[#d9d9d9]" />
          </template>
        </a-input>
        <a-tree
          :blockNode="true"
          :expandedKeys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          :replace-fields="replaceFields"
          :tree-data="gData"
          v-model:selectedKeys="selectedKeys"
          @expand="onExpand"
          @select="handleSelect"
        >
          <template #title="{ deptName }">
            <span v-if="deptName.indexOf(searchValue) > -1">
              {{ deptName.substr(0, deptName.indexOf(searchValue)) }}
              <span class="text-red-400">{{ searchValue }}</span>
              {{
                deptName.substr(
                  deptName.indexOf(searchValue) + searchValue.length
                )
              }}
            </span>
            <span v-else>{{ deptName }}</span>
          </template>
        </a-tree>
      </a-col>
      <a-col :span="20">
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
          <template #department="{ text }">
            <span>
              {{ text.department.deptName }}
            </span>
          </template>
          <template #action="{ record }">
            <span>
              <a-button type="link" color="success" class="mr-3">
                修改{{ record.name }}
              </a-button>
              <a-button type="link" color="success" class="mr-3">
                重置密码{{ record.name }}
              </a-button>
              <a-button type="link" color="error">删除</a-button>
            </span>
          </template>
        </a-table>
      </a-col>
    </a-row>

    <!-- 新增修改用户 -->
    <a-drawer
      width="50%"
      title="Basic Drawer"
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
        <a-form-item ref="name" label="Activity name" name="name">
          <a-input v-model:value="formState.name" />
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
  watch,
  UnwrapRef,
  toRaw,
  onMounted,
} from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { getDept } from '@/api/admin/system/dept'
import { listUser } from '@/api/admin/system/user'
import { handleTree } from '@/utils/tools'

interface FormState {
  name: string
}

const columns = [
  {
    title: '用户名',
    dataIndex: 'userName',
    key: 'userName',
    align: 'center',
  },
  {
    title: '昵称',
    dataIndex: 'nickName',
    key: 'nickName',
    align: 'center',
  },
  {
    title: '部门',
    key: 'department',
    align: 'center',
    slots: {
      customRender: 'department',
    },
  },
  {
    title: '手机号',
    key: 'mobile',
    dataIndex: 'mobile',
    align: 'center',
  },
  {
    title: '状态',
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
    // 树形控件操作
    const replaceFields = {
      children: 'children',
      title: 'deptName',
      key: 'deptId',
    }
    const selectedKeys = ref<string[]>([])
    const expandedKeys = ref<number[]>([])
    const searchValue = ref<string>('')
    const autoExpandParent = ref<boolean>(true)
    const gData = ref<TreeDataItem[]>([])
    const originalTreeLists = ref([])
    const onExpand = (keys: number[]) => {
      expandedKeys.value = keys
      autoExpandParent.value = false
    }

    const handleSelect = (keys: number[]) => {
      console.log(keys[0])
      queryParams.deptId = keys[0]
      handleQuery()
    }

    watch(searchValue, (value) => {
      const expanded = originalTreeLists.value
        .map((item: TreeDataItem) => {
          if ((item.deptName as string).indexOf(value) > -1) {
            return item.deptId
          }
          return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      expandedKeys.value = expanded as number[]
      searchValue.value = value
      autoExpandParent.value = true
    })
    watch(selectedKeys, () => {
      console.log('selectedKeys', selectedKeys)
    })

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

    // 新增修改表单操作
    const open = ref(false)
    const formRef = ref()
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
          message: 'Please input Activity name',
          trigger: 'blur',
        },
        { min: 3, max: 5, message: 'Length should be 3 to 5', trigger: 'blur' },
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

    const handleQuery = () => {
      getUserList(queryParams)
    }

    const getDeptList = () => {
      getDept().then((res) => {
        console.log(res)
        originalTreeLists.value = res.data.rows
        gData.value = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          0
        ).tree
        expandedKeys.value = originalTreeLists.value.map(
          (item: TreeDataItem) => item.deptId
        )
      })
    }

    const getUserList = (queryParams?: {}) => {
      listUser(queryParams).then((res) => {
        console.log(res)
        userList.value = res.data.rows
        pagination.total = res.data.count
      })
    }

    const init = () => {
      getDeptList()
      getUserList()
    }

    onMounted(() => {
      init()
    })

    return {
      replaceFields,
      selectedKeys,
      expandedKeys,
      searchValue,
      autoExpandParent,
      gData,
      onExpand,
      handleSelect,

      queryParams,
      handleQuery,
      userList,
      columns,
      pagination,
      open,

      formRef,
      labelCol: { span: 4 },
      wrapperCol: { span: 14 },
      other: '',
      formState,
      rules,
      onSubmit,
      resetForm,
    }
  },
})
</script>
