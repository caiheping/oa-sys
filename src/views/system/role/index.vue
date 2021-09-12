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
      <a-col v-has-permi="['system:role:add']">
        <a-button color="success" @click="handleAdd"> 新增 </a-button>
      </a-col>
      <a-col v-has-permi="['system:role:delete']">
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
      :data-source="roleList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #roleKey="{ record }">
        <router-link :to="'dictData/' + record.id">
          <span class="text-[#1890ff]">{{ record.roleKey }}</span>
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
            v-has-permi="['system:role:update']"
          >
            修改
          </a-button>
          <a-button
            type="link"
            color="warning"
            class="mr-3"
            @click="handleScopeOpen(record)"
            v-has-permi="['system:role:update']"
          >
            数据权限
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
              v-has-permi="['system:role:delete']"
            >
              删除
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 新增修改推窗 -->
    <a-drawer
      width="540px"
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
            <a-form-item label="角色名称" name="roleName">
              <a-input
                v-model:value="formState.roleName"
                placeholder="请输入角色名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="权限字符" name="roleKey">
              <a-input
                v-model:value="formState.roleKey"
                placeholder="请输入权限字符"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="显示排序" name="roleSort">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.roleSort"
                placeholder="请输入显示排序"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="状态" name="status">
              <a-radio-group
                v-model:value="formState.status"
                :options="disableOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="菜单权限" name="menuIds">
              <a-tree
                :blockNode="true"
                checkable
                :replace-fields="replaceFields"
                :tree-data="menuOptions"
                v-model:checkedKeys="checkedKeys"
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

    <!-- 数据权限推窗 -->
    <a-drawer
      width="540px"
      title="分配数据权限"
      placement="right"
      v-model:visible="dataScopeOpen"
      :maskClosable="false"
      @close="handleScopeClose"
    >
      <a-form
        v-if="dataScopeOpen"
        ref="formScopeRef"
        :model="formScopeState"
        :rules="scopeRules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-row>
          <a-col :span="24">
            <a-form-item label="角色名称" name="roleName">
              <a-input
                :disabled="true"
                v-model:value="formScopeState.roleName"
                placeholder="请输入角色名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="权限字符" name="roleKey">
              <a-input
                :disabled="true"
                v-model:value="formScopeState.roleKey"
                placeholder="请输入权限字符"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="权限范围" name="dataScope">
              <a-select
                v-model:value="formScopeState.dataScope"
                placeholder="请选择权限范围"
              >
                <a-select-option
                  v-for="item in dataScopeOptions"
                  :key="item.value"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" class="mr-3" @click="handleScopeSubmit">
                确认
              </a-button>
              <a-button @click="handleScopeClose">取消</a-button>
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
  getRole,
  getRoleById,
  addRole,
  updateRole,
  delRole,
} from '@/api/admin/system/role'
import { getMenu } from '@/api/admin/system/menu'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import useDrawer from '@/hooks/useDrawer'
import { useAppStore } from '@/store/modules/app'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { handleTree } from '@/utils/tools'
import { TableState } from 'ant-design-vue/es/table/interface'

import FormSearch from '@/components/FormSearch/index.vue'

import { IRole } from '@/api/admin/system/role/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { IMenu } from '@/api/admin/system/menu/type'

interface FormState {
  id: undefined | number
  roleName: undefined | string
  roleKey: undefined | string
  roleSort: undefined | number | string
  status: undefined | string
  menuIds: undefined | number[]
  remark: undefined | string
}

interface FormScopeState {
  id: undefined | number
  roleName: undefined | string
  roleKey: undefined | string
  roleSort: undefined | number | string
  status: undefined | string
  menuIds: undefined | number[]
  remark: undefined | string
  dataScope: undefined
}

type Pagination = TableState['pagination']

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
    slots: { customRender: 'status' },
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
  components: {
    FormSearch,
  },
  setup() {
    const { loading } = useAppStore()
    const statusOptions = ref<IData[]>([])
    const disableOptions = ref<IData[]>([])
    const checkMenus = () => {
      if (checkedKeys.value.length) {
        return Promise.resolve()
      } else {
        return Promise.reject('菜单权限为空')
      }
    }
    const rules = {
      roleName: [
        { required: true, message: '角色名称不能为空', trigger: 'blur' },
      ],
      roleKey: [
        { required: true, message: '权限字符不能为空', trigger: 'blur' },
      ],
      status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
      menuIds: [
        {
          required: true,
          validator: checkMenus,
          trigger: 'change',
        },
      ],
    }

    // 查询表单操作
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      roleName: undefined || '',
      status: undefined || '',
    })
    const formFields = reactive([
      {
        type: 'input',
        label: '角色名称',
        name: 'roleName',
        value: '',
        placeholder: '请输入角色名称',
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
    const handleQuery = (query: { roleName: string; status: string }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.roleName = query.roleName
      queryParams.status = query.status
      getList(queryParams)
    }
    // 表格操作
    const roleList = ref<IRole[]>([])
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
      getRole(queryParams).then((res) => {
        console.log(res)
        roleList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
        roleList.value.forEach((list) => {
          if (list.status === '1') {
            list.checked = true
          } else {
            list.checked = false
          }
        })
      })
    }

    const init = () => {
      getList(queryParams)
      getMenuTreeselect()
    }

    const formRef = ref()
    const formState: FormState = reactive({
      id: undefined,
      roleName: undefined,
      roleKey: undefined,
      roleSort: 1,
      status: '1',
      menuIds: undefined,
      remark: undefined,
    })
    const { open, drawerTitle } = useDrawer()
    const handleClose = () => {
      formState.id = undefined
      checkedKeys.value = []
      formRef.value.resetFields()
      console.log(formRef)
      open.value = false
    }
    // 表单提交
    const handleSubmit = () => {
      console.log(formState, checkedKeys)
      formRef.value
        .validate()
        .then(() => {
          formState.menuIds = checkedKeys.value
          if (formState.id) {
            updateRole(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addRole(formState).then((res) => {
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
      delRole(dictId).then(() => {
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
      drawerTitle.value = '添加角色'
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getRoleById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改角色'
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
          checkedKeys.value = res.data.menus.map((list) => list.id)
        })
      })
    }

    /** 查询菜单树结构 */
    const menuOptions = ref<IMenu[]>([])
    const checkedKeys = ref([])
    // 树形控件操作
    const replaceFields = {
      children: 'children',
      title: 'title',
      key: 'id',
    }
    const getMenuTreeselect = () => {
      getMenu().then((res) => {
        menuOptions.value = handleTree(res.data.rows, 'id', 'parentId').tree
      })
    }

    // 数据范围选项
    const dataScopeOptions = reactive([
      {
        value: '1',
        label: '本部门及以下数据权限',
      },
      {
        value: '2',
        label: '本部门数据权限',
      },
      {
        value: '3',
        label: '仅本人数据权限',
      },
    ])
    const formScopeRef = ref()
    const dataScopeOpen = ref(false)
    const scopeRules = {
      dataScope: [
        { required: true, message: '权限范围不能为空', trigger: 'blur' },
      ],
    }
    const formScopeState: FormScopeState = reactive({
      id: undefined,
      roleName: undefined || '',
      roleKey: undefined || '',
      roleSort: undefined,
      status: undefined,
      menuIds: undefined,
      remark: undefined,
      dataScope: undefined,
    })

    const handleScopeOpen = (row) => {
      getRoleById(row.id).then((res) => {
        dataScopeOpen.value = true
        nextTick(() => {
          Object.keys(formScopeState).forEach((key) => {
            formScopeState[key] = res.data[key]
          })
          formScopeState.menuIds = res.data.menus.map((list) => list.id)
        })
      })
    }
    const handleScopeClose = () => {
      dataScopeOpen.value = false
    }

    const handleScopeSubmit = () => {
      formScopeRef.value
        .validate()
        .then(() => {
          console.log('ok')
          updateRole(formScopeState).then((res) => {
            Message.success(res.message)
            dataScopeOpen.value = false
            getList(queryParams)
          })
        })
        .catch((error: ValidateErrorEntity) => {
          console.log('error', error)
        })
    }

    onMounted(async () => {
      statusOptions.value = await getDict('sys_normal_disable')
      disableOptions.value = await getDict('sys_normal_disable')
      disableOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      init()
    })

    return {
      loading,
      queryParams,
      formFields,
      handleQuery,
      roleList,
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
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      rules,
      formRef,
      handleClose,
      handleSubmit,
      confirm,
      cancel,
      handleAdd,
      handleUpdate,
      menuOptions,
      checkedKeys,
      replaceFields,
      disableOptions,

      dataScopeOptions,
      formScopeRef,
      dataScopeOpen,
      formScopeState,
      scopeRules,
      handleScopeOpen,
      handleScopeClose,
      handleScopeSubmit,
    }
  },
})
</script>
