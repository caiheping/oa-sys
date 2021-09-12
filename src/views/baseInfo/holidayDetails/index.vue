<template>
  <div class="p-4">
    <a-row :gutter="15">
      <a-col :span="4">
        <dept-search
          ref="deptSearchRef"
          :original="originalTree"
          :data="deptTreeOption"
          :baseFields="replaceFields"
          @select="handleSelect"
        />
      </a-col>
      <a-col :span="20">
        <div class="mb-3">
          <form-search
            :formFields="formFields"
            @search="handleQuery"
            @reset="handleQuery"
          />
        </div>
        <a-row :gutter="10" class="mb-2">
          <a-col>
            <a-button color="normal">导出</a-button>
          </a-col>
        </a-row>

        <a-table
          :loading="loading"
          rowKey="id"
          :columns="columns"
          :data-source="userList"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #department="{ record }">
            <span>
              {{ record.department.deptName }}
            </span>
          </template>
          <template #roles="{ record }">
            <span>{{ getRoles(record) }}</span>
          </template>
          <template #position="{ record }">
            <span>{{ selectDictLabel(positionOptions, record.position) }}</span>
          </template>
          <template #action="{ record }">
            <span>
              <a-button
                type="link"
                color="success"
                class="mr-3"
                @click="handleUpdate(record)"
                v-has-permi="['system:user:update']"
              >
                修改
              </a-button>
            </span>
          </template>
        </a-table>
      </a-col>
    </a-row>

    <!-- 新增修改用户 -->
    <a-drawer
      width="540px"
      :title="drawerTitle"
      placement="right"
      v-model:visible="open"
      :maskClosable="false"
      @close="handleClose"
    >
      <BaseForm
        ref="BaseFormRef"
        :formData="formDataObj"
        :data="formState"
        :rules="rules"
        @submit="handleSubmit"
        @close="handleClose"
      />
    </a-drawer>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  toRefs,
  nextTick,
  computed,
} from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { message as Message } from 'ant-design-vue'
import { getDept } from '@/api/admin/system/dept'
import {
  listUser,
  getUser,
  addUser,
  updateUser,
  // exportUser,
  resetUserPwd,
  // importTemplate,
} from '@/api/admin/system/user'
import { getRole } from '@/api/admin/system/role'
import { handleTree } from '@/utils/tools'
import useDrawer from '@/hooks/useDrawer'
import { useUserStore } from '@/store/modules/user'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'

// 组件
import DeptSearch from '@/components/DeptSearch/index.vue'
import BaseForm from '@/components/BaseForm/index.vue'
import FormSearch from '@/components/FormSearch/index.vue'
import { IUser } from '@/api/admin/system/user/type'
import { IRole } from '@/api/admin/system/role/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { IDept } from '@/api/admin/system/dept/type'

interface FormState {
  id: undefined | number
  annualLeave: undefined | number
  compensatoryLeave: undefined | number
  roleIds?: undefined | number[]
}

type Pagination = TableState['pagination']

const columns = [
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
    title: '岗位',
    key: 'position',
    align: 'center',
    slots: {
      customRender: 'position',
    },
  },
  {
    title: '年假（天）',
    key: 'annualLeave',
    dataIndex: 'annualLeave',
    align: 'center',
  },
  {
    title: '调休假（天）',
    dataIndex: 'compensatoryLeave',
    key: 'compensatoryLeave',
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
    BaseForm,
    DeptSearch,
    FormSearch,
  },
  setup() {
    const userStore = useUserStore()
    const loading = computed(() => useAppStore().loading)
    const BaseFormRef = ref()
    const roleOptions = ref<IRole[]>([])
    const statusOptions = ref<IData[]>([])
    const positionOptions = ref<IData[]>([])
    const educationOptions = ref<IData[]>([])
    const disableOptions = ref<IData[]>([])
    const sexOptions = ref<IData[]>([])
    /**
     * 左侧树形控件操作
     */
    const deptSearchRef = ref()
    const originalTree = ref<IDept[]>([])
    const replaceFields = {
      children: 'children',
      title: 'deptName',
      key: 'deptId',
    }
    const deptTreeOption = ref<TreeDataItem[]>([])
    const handleSelect = (keys: number[]) => {
      queryParams.deptId = keys[0]
      handleQuery(queryParams)
    }

    // 查询表单操作
    const queryRef = ref()
    const queryParams = reactive({
      nickName: undefined || '',
      deptId: 0,
      pageNum: 1,
      pageSize: 10,
    })
    const formFields = reactive([
      {
        type: 'input',
        label: '昵称',
        name: 'nickName',
        value: undefined,
        placeholder: '请输入昵称',
      },
    ])

    const handleQuery = (query: { nickName: string }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.nickName = query.nickName
      getList(queryParams)
    }

    /**
     * 表格操作
     */
    const userList = ref<IUser[]>([])
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

    // 格式角色
    const getRoles = (record) => {
      return record.roles.map((list) => list.roleName).join(',')
    }

    // 更新按钮操作
    const handleUpdate = (row) => {
      getUser(row.id).then((res) => {
        open.value = true
        isUpdate.value = true
        drawerTitle.value = '修改'
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
          formState.roleIds = res.data.roles.map((list) => list.id)
          treeRef.value.forest.selectedNodeIds.push(res.data.deptId)
          console.log(formState)
        })
      })
    }

    // 部门树选项
    const deptOptions = ref<IDept[]>([])

    // 获取表格数据
    const getList = (queryParams?: {}) => {
      listUser(queryParams).then((res) => {
        userList.value = res.data.rows
        pagination.value.total = res.data.count
      })

      getDept().then((res) => {
        // 获取菜单树
        const children = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          userStore.userInfo.deptId
        ).tree
        const parent = res.data.rows.filter(
          (item) => item.deptId === userStore.userInfo.deptId
        )
        parent[0].children = children
        deptOptions.value = parent
        console.log(deptOptions)
      })
    }

    /**
     * 推窗表单操作
     */
    // 获取部门树
    const treeRef = ref()
    const formDataObj = reactive([
      {
        name: 'annualLeave',
        label: '年假',
        type: 'input-number',
        value: undefined,
        span: 24,
        placeholder: '请输入年假',
      },
      {
        name: 'compensatoryLeave',
        label: '调休假',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入调休假',
      },
    ])
    const formState: FormState = reactive({
      id: undefined,
      deptId: undefined,
      nickName: undefined,
      userName: undefined,
      password: undefined,
      sex: '1',
      roleIds: undefined || [],
      mobile: undefined,
      status: '1',
      email: undefined,
      salary: undefined,
      position: '1',
      entryTime: '',
      birthday: '',
      education: undefined,
      annualLeave: undefined,
      compensatoryLeave: undefined,
      remark: undefined,
    })
    const rules = {}
    const { open, drawerTitle } = useDrawer()
    // 是否更新操作
    const isUpdate = ref(false)

    // 新增修改表单操作
    const formRef = ref()

    // 表单提交
    // 表单提交
    const handleSubmit = () => {
      if (formState.id) {
        updateUser(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      } else {
        addUser(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      }
    }
    // 关闭推窗
    const handleClose = () => {
      formState.id = undefined
      BaseFormRef.value.resetFields()
      open.value = false
    }

    // 序列化部门
    const normalizer = (node) => {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      }
    }

    /**
     * 重置密码操作
     */
    const visible = ref<boolean>(false)
    const resetformState = reactive({
      id: 0,
      newPassword: '',
    })
    // 重置密码
    const handleResetPwd = () => {
      if (!resetformState.newPassword) {
        Message.error('新密码不能为空')
        return
      }
      resetUserPwd(resetformState.id, {
        newPassword: resetformState.newPassword,
      }).then((res) => {
        Message.success(res.message)
        resetformState.newPassword = ''
        visible.value = false
      })
    }
    // 取消重置密码
    const handleResetClose = () => {
      resetformState.newPassword = ''
      visible.value = false
    }

    // 获取部门数据
    const getDeptList = () => {
      getDept().then((res) => {
        originalTree.value = res.data.rows
        deptTreeOption.value = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          0
        ).tree
        deptSearchRef.value.expandedKeys.value = originalTree.value.map(
          (item: TreeDataItem) => item.id
        )
      })
    }

    const init = () => {
      getDeptList()
      getList(queryParams)
      getRole().then((res) => {
        roleOptions.value = res.data.rows
      })
    }

    onMounted(async () => {
      statusOptions.value = await getDict('sys_normal_disable')
      positionOptions.value = await getDict('sys_user_position')
      educationOptions.value = await getDict('sys_user_education')
      disableOptions.value = await getDict('sys_normal_disable')
      sexOptions.value = await getDict('sys_user_sex')
      disableOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      sexOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      init()
    })

    return {
      loading,
      replaceFields,
      deptSearchRef,
      originalTree,
      deptTreeOption,
      handleSelect,

      queryRef,
      queryParams,
      formFields,
      handleQuery,

      statusOptions,
      columns,
      userList,
      pagination,
      handleTableChange,
      selectDictLabel,
      getRoles,
      handleUpdate,

      BaseFormRef,
      formDataObj,
      treeRef,
      formRef,
      rules,
      isUpdate,
      open,
      drawerTitle,
      deptOptions,
      normalizer,
      handleClose,
      handleSubmit,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      formState,
      roleOptions,
      positionOptions,
      educationOptions,
      disableOptions,
      sexOptions,

      visible,
      ...toRefs(resetformState),
      handleResetPwd,
      handleResetClose,
    }
  },
})
</script>
