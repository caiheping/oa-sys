<template>
  <div class="p-4">
    <a-row :gutter="15">
      <a-col :span="4">
        <a-input
          allowClear="true"
          v-model:value="searchValue"
          placeholder="请输入部门名称"
        >
          <template #prefix>
            <svg-icon name="search" class="text-[#d9d9d9]" />
          </template>
        </a-input>
        <a-tree
          :blockNode="true"
          :expandedKeys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          :replace-fields="replaceFields"
          :tree-data="deptTreeOption"
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
                allowClear="true"
                v-model:value="queryParams.userName"
                placeholder="请输入用户名"
              />
            </a-form-item>
            <a-form-item label="角色">
              <a-select
                v-model:value="queryParams.role"
                placeholder="请选择角色"
                style="width: 200px"
                @select="handleQuery"
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
            <a-button color="success" @click="handleAdd">新增</a-button>
          </a-col>
          <a-col>
            <a-popconfirm
              title="确定要删除选中数据吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="confirm(record)"
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
          rowKey="id"
          :row-selection="{
            selectedRowKeys: selectedRowKeys,
            onChange: onSelectChange,
          }"
          :columns="columns"
          :data-source="userList"
          :pagination="pagination"
        >
          <template #department="{ text }">
            <span>
              {{ text.department.deptName }}
            </span>
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
              >
                修改
              </a-button>
              <a-button type="link" color="success" class="mr-3">
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
              <a-input
                v-model:value="formState.password"
                placeholder="请输入密码"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="角色" name="roleIds">
              <a-select
                mode="multiple"
                :size="size"
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
  </div>
</template>
<script lang="ts">
import {
  defineComponent,
  reactive,
  ref,
  watch,
  toRaw,
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
  // resetUserPwd,
  // importTemplate,
} from '@/api/admin/system/user'
import { getRole } from '@/api/admin/system/role'
import { handleTree } from '@/utils/tools'
import useDrawer from '@/hooks/useDrawer'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { useUserStore } from '@/store/modules/user'
import { formRules } from '@/utils/validate'

interface FormState {
  id: null | number
  deptId: null | number
  nickName: string
  userName: string
  password: string
  sex: string
  roleIds: number[]
  mobile: number | string
  status: string
  email: string
  remark: string
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
  },
  setup() {
    // 树形控件操作
    const replaceFields = {
      children: 'children',
      title: 'deptName',
      key: 'deptId',
    }
    const userStore = useUserStore()
    const treeRef = ref()
    const selectedKeys = ref<string[]>([])
    const expandedKeys = ref<number[]>([])
    const searchValue = ref<string>('')
    const autoExpandParent = ref<boolean>(true)
    const deptTreeOption = ref<TreeDataItem[]>([])
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
    // 获取部门树
    const deptOptions = ref([])
    // 上级部门选中事件
    const handleTreeSelect = (node) => {
      formState.deptId = node.deptId
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

    const roleOptions = ref([])

    // 新增修改表单操作
    const formRef = ref()
    const formState: FormState = reactive({
      id: null,
      deptId: null,
      nickName: '',
      userName: '',
      password: '',
      sex: '1',
      roleIds: [],
      mobile: '',
      status: '1',
      email: '',
      remark: '',
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
      roleIds: [{ required: true, message: '角色不能为空', trigger: 'change' }],
    }
    const isUpdate = ref(false)
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
      getList(queryParams)
    }

    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateUser(formState).then((res) => {
              Message.success(res.message)
              getList()
              formState.id = null
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addUser(formState).then((res) => {
              Message.success(res.message)
              getList()
              formState.id = null
              formRef.value.resetFields()
              open.value = false
            })
          }
        })
        .catch((error: ValidateErrorEntity) => {
          console.log('error', error)
        })
    }

    const getDeptList = () => {
      getDept().then((res) => {
        console.log(res)
        originalTreeLists.value = res.data.rows
        deptTreeOption.value = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          0
        ).tree
        expandedKeys.value = originalTreeLists.value.map(
          (item: TreeDataItem) => item.id
        )
      })
    }

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

    const state = reactive({
      selectedRowKeys: [],
    })
    const hasSelected = computed(() => state.selectedRowKeys.length > 0)
    const onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      state.selectedRowKeys = selectedRowKeys
    }

    const getList = (queryParams?: {}) => {
      listUser(queryParams).then((res) => {
        console.log(res)
        userList.value = res.data.rows
        pagination.total = res.data.count
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

    // 取消推窗
    const { open, drawerTitle } = useDrawer()
    const handleClose = () => {
      formState.id = null
      formState.deptId = null
      formRef.value.resetFields()
      console.log(formState)
      open.value = false
    }

    const init = () => {
      getDeptList()
      getList()
      getRole().then((res) => {
        roleOptions.value = res.data.rows
      })
    }

    // 确认删除
    const confirm = (row) => {
      const id = row.id || state.selectedRowKeys
      delUser(id).then(() => {
        getList()
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

    const statusOptions = ref([])

    onMounted(async () => {
      statusOptions.value = await getDict('sys_normal_disable')
      init()
    })

    return {
      replaceFields,
      selectedKeys,
      expandedKeys,
      searchValue,
      autoExpandParent,
      deptTreeOption,
      onExpand,
      handleSelect,
      selectDictLabel,
      statusOptions,
      confirm,
      cancel,
      handleAdd,
      handleUpdate,
      hasSelected,
      ...toRefs(state),
      onSelectChange,

      queryParams,
      handleQuery,
      userList,
      columns,
      pagination,

      isUpdate,
      formRef,
      open,
      deptOptions,
      normalizer,
      treeRef,
      drawerTitle,
      handleClose,
      handleSubmit,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      formState,
      rules,
      onSubmit,
      resetForm,
      roleOptions,
      handleTreeSelect,
    }
  },
})
</script>
