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
          <a-col>
            <a-button color="warning">导入</a-button>
          </a-col>
          <a-col>
            <a-button color="normal">导出</a-button>
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
          :data-source="userList"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #department="{ record }">
            <span>
              {{ record.department.deptName }}
            </span>
          </template>
          <template #status="{ record }">
            <span>{{ selectDictLabel(statusOptions, record.status) }}</span>
          </template>
          <template #roles="{ record }">
            <span>{{ getRoles(record) }}</span>
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
              <a-button
                type="link"
                color="success"
                class="mr-3"
                @click="showModal(record)"
              >
                重置密码
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
      </a-col>
    </a-row>

    <!-- 新增修改用户 -->
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
          <a-col :span="12" v-show="formState.deptId !== 0">
            <a-form-item label="归属部门" name="deptId">
              <treeselect
                ref="treeRef"
                class="!mt-[3px]"
                v-model:value="formState.deptId"
                :normalizer="normalizer"
                placeholder="请选择归属部门"
                :options="deptOptions"
                @select="handleTreeSelect"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="昵称" name="nickName">
              <a-input
                v-model:value="formState.nickName"
                placeholder="请输入昵称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="!isUpdate">
            <a-form-item label="用户名" name="userName">
              <a-input
                v-model:value="formState.userName"
                placeholder="请输入用户名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="!isUpdate">
            <a-form-item label="密码" name="password">
              <a-input-password
                v-model:value="formState.password"
                placeholder="请输入密码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色" name="roleIds">
              <a-select
                mode="multiple"
                v-model:value="formState.roleIds"
                placeholder="请选择角色"
              >
                <a-select-option v-for="item in roleOptions" :key="item.id">
                  {{ item.roleName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="性别" name="sex">
              <a-radio-group
                v-model:value="formState.sex"
                name="menuType"
                :options="[
                  { label: '男', value: '1' },
                  { label: '女', value: '0' },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="手机号码" name="mobile">
              <a-input
                v-model:value="formState.mobile"
                placeholder="请输入手机号码"
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
            <a-form-item label="邮箱" name="email">
              <a-input
                v-model:value="formState.email"
                placeholder="请输入邮箱"
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

    <!-- 重置密码 -->
    <a-modal
      v-model:visible="visible"
      title="重置密码"
      @ok="handleResetPwd"
      @cancel="handleResetClose"
    >
      <div class="flex items-center">
        <span class="whitespace-nowrap">新密码：</span>
        <a-input-password
          v-model:value="newPassword"
          placeholder="请输入密码"
        />
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  onMounted,
  toRefs,
  computed,
  nextTick,
} from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { message as Message } from 'ant-design-vue'
import { getDept } from '@/api/admin/system/dept'
import {
  listUser,
  getUser,
  delUser,
  addUser,
  updateUser,
  // exportUser,
  resetUserPwd,
  // importTemplate,
} from '@/api/admin/system/user'
import { getRole } from '@/api/admin/system/role'
import { handleTree } from '@/utils/tools'
import useDrawer from '@/hooks/useDrawer'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useUserStore } from '@/store/modules/user'
import { formRules } from '@/utils/validate'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'

// 组件
import DeptSearch from '@/components/DeptSearch/index.vue'
import FormSearch from '@/components/FormSearch/index.vue'

interface FormState {
  id: undefined | number
  deptId: undefined | number
  nickName: undefined | string
  userName: undefined | string
  password: undefined | string
  sex: undefined | string
  roleIds: undefined | number[]
  mobile: undefined | number | string
  status: undefined | string
  email: undefined | string
  remark: undefined | string
}

type Pagination = TableState['pagination']

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
    title: '角色',
    key: 'roles',
    align: 'center',
    slots: {
      customRender: 'roles',
    },
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
    slots: { customRender: 'status' },
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
    Treeselect,
    DeptSearch,
    FormSearch,
  },
  setup() {
    const userStore = useUserStore()
    const roleOptions = ref([])
    /**
     * 左侧树形控件操作
     */
    const deptSearchRef = ref()
    const originalTree = ref([])
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
      userName: undefined || '',
      deptId: 0,
      role: undefined || '',
      pageNum: 1,
      pageSize: 10,
    })
    const formFields = reactive([
      {
        type: 'input',
        label: '用户名',
        name: 'userName',
        value: undefined,
        placeholder: '请输入用户名',
      },
      {
        type: 'select',
        label: '角色',
        name: 'role',
        value: undefined,
        placeholder: '请选择角色',
        normalizer: {
          value: 'id',
          label: 'roleName',
        },
        options: roleOptions,
      },
    ])

    const handleQuery = (query: { userName: string; role: string }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.userName = query.userName
      queryParams.role = query.role
      getList(queryParams)
    }

    /**
     * 表格操作
     */
    const statusOptions = ref([])
    const state = reactive({
      selectedRowKeys: [],
    })
    const userList = ref([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      // showTotal: () => `共 ${pagination.value.total} 条`,
    })

    const handleTableChange = (page: Pagination) => {
      (pagination.value as Pagination) = page
      queryParams.pageNum = pagination.value.current
      queryParams.pageSize = pagination.value.pageSize
      getList(queryParams)
    }
    // 判断删除按钮是否可点击
    const hasSelected = computed(() => state.selectedRowKeys.length > 0)
    // 多选框选择操作
    const onSelectChange = (selectedRowKeys) => {
      state.selectedRowKeys = selectedRowKeys
    }

    // 格式角色
    const getRoles = (record) => {
      return record.roles.map((list) => list.roleName).join(',')
    }

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      isUpdate.value = false
      drawerTitle.value = '添加字典'
    }

    // 更新按钮操作
    const handleUpdate = (row) => {
      getUser(row.id).then((res) => {
        open.value = true
        isUpdate.value = true
        drawerTitle.value = '修改字典'
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

    // 确认删除
    const confirm = (row) => {
      const id = row.id || state.selectedRowKeys
      console.log(id)
      delUser(id).then(() => {
        getList(queryParams)
        Message.success('删除成功')
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success('取消删除')
    }
    // 部门树选项
    const deptOptions = ref([])

    // 获取表格数据
    const getList = (queryParams?: {}) => {
      listUser(queryParams).then((res) => {
        console.log(res)
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
      remark: undefined,
    })
    const rules = {
      deptId: [
        {
          required: true,
          validator: formRules.number,
          message: '归属部门不能为空',
          trigger: 'change',
        },
      ],
      nickName: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
      userName: [
        { required: true, message: '用户名不能为空', trigger: 'blur' },
      ],
      password: [{ required: true, message: '密码不能为空', trigger: 'blur' }],
      roleIds: [
        {
          required: true,
          validator: formRules.checkRoleLength,
          trigger: 'change',
        },
      ],
    }
    const { open, drawerTitle } = useDrawer()
    // 是否更新操作
    const isUpdate = ref(false)
    // 上级部门选中事件
    const handleTreeSelect = (node) => {
      formState.deptId = node.deptId
    }

    // 新增修改表单操作
    const formRef = ref()

    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateUser(formState).then((res) => {
              Message.success(res.message)
              formState.id = undefined
              formState.roleIds = undefined
              formRef.value.resetFields()
              open.value = false
              getList(queryParams)
            })
          } else {
            addUser(formState).then((res) => {
              Message.success(res.message)
              formState.id = undefined
              formState.roleIds = undefined
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

    // 关闭推窗
    const handleClose = () => {
      formState.id = undefined
      formState.deptId = undefined
      formRef.value.resetFields()
      console.log(formState)
      open.value = false
    }

    /**
     * 重置密码操作
     */
    const visible = ref<boolean>(false)
    const resetformState = reactive({
      id: 0,
      newPassword: '',
    })
    const showModal = (row) => {
      resetformState.id = row.id
      visible.value = true
    }
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
      init()
    })

    return {
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
      ...toRefs(state),
      userList,
      pagination,
      handleTableChange,
      selectDictLabel,
      hasSelected,
      onSelectChange,
      getRoles,
      confirm,
      cancel,
      handleAdd,
      handleUpdate,

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
      handleTreeSelect,

      visible,
      ...toRefs(resetformState),
      handleResetPwd,
      handleResetClose,
      showModal,
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
