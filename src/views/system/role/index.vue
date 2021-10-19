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
        <a-button color="success" @click="handleAdd">
          {{ t('common.add') }}
        </a-button>
      </a-col>
      <a-col v-has-permi="['system:role:delete']">
        <a-popconfirm
          :title="t('common.confirmDelete')"
          :ok-text="t('common.okText')"
          :cancel-text="t('common.cancelText')"
          @confirm="confirm"
          @cancel="cancel"
        >
          <a-button :disabled="!hasSelected" color="error">
            {{ t('common.delete') }}
          </a-button>
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
            {{ t('common.update') }}
          </a-button>
          <a-button
            type="link"
            color="warning"
            class="mr-3"
            @click="handleScopeOpen(record)"
            v-has-permi="['system:role:update']"
          >
            {{ t('routes.role.dataAuth') }}
          </a-button>
          <a-popconfirm
            :title="t('common.confirmDelete')"
            :ok-text="t('common.okText')"
            :cancel-text="t('common.cancelText')"
            @confirm="confirm(record)"
            @cancel="cancel"
          >
            <a-button
              type="link"
              color="error"
              v-has-permi="['system:role:delete']"
            >
              {{ t('common.delete') }}
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
            <a-form-item :label="t('routes.role.roleName')" name="roleName">
              <a-input
                v-model:value="formState.roleName"
                :placeholder="t('routes.role.roleNamePlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.roleKey')" name="roleKey">
              <a-input
                v-model:value="formState.roleKey"
                :placeholder="t('routes.role.roleKeyPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.roleSort')" name="roleSort">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.roleSort"
                :placeholder="t('routes.role.roleSortPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.status')" name="status">
              <a-radio-group
                v-model:value="formState.status"
                :options="disableOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.menuIds')" name="menuIds">
              <a-tree
                :blockNode="true"
                checkable
                checkStrictly
                :replace-fields="replaceFields"
                :tree-data="menuOptions"
                v-model:checkedKeys="checkedKeys"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.remark')" name="remark">
              <a-textarea
                :rows="3"
                v-model:value="formState.remark"
                :placeholder="t('routes.role.remarkPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" class="mr-3" @click="handleSubmit">
                {{ t('common.okText') }}
              </a-button>
              <a-button @click="handleClose">{{
                t('common.cancelText')
              }}</a-button>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-drawer>

    <!-- 数据权限推窗 -->
    <a-drawer
      width="540px"
      :title="t('routes.role.assignDataPermissions')"
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
            <a-form-item :label="t('routes.role.roleName')" name="roleName">
              <a-input
                :disabled="true"
                v-model:value="formScopeState.roleName"
                :placeholder="t('routes.role.roleNamePlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.roleKey')" name="roleKey">
              <a-input
                :disabled="true"
                v-model:value="formScopeState.roleKey"
                :placeholder="t('routes.role.roleKeyPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item :label="t('routes.role.dataScope')" name="dataScope">
              <a-select
                v-model:value="formScopeState.dataScope"
                :placeholder="t('routes.role.dataScopePlaceholder')"
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
                {{ t('common.okText') }}
              </a-button>
              <a-button @click="handleScopeClose">{{
                t('common.cancelText')
              }}</a-button>
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
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

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
    title: t('routes.role.roleName'),
    dataIndex: 'roleName',
    key: 'roleName',
    align: 'center',
  },
  {
    title: t('routes.role.roleKey'),
    dataIndex: 'roleKey',
    key: 'roleKey',
    align: 'center',
  },
  {
    title: t('routes.role.roleSort'),
    dataIndex: 'roleSort',
    key: 'roleSort',
    align: 'center',
  },
  {
    title: t('routes.role.status'),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: t('routes.role.createdBy'),
    dataIndex: 'createdBy',
    key: 'createdBy',
    align: 'center',
  },
  {
    title: t('routes.role.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.role.action'),
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
    const statusOptions = ref<IData[]>([])
    const disableOptions = ref<IData[]>([])
    const checkMenus = () => {
      if ([...checkedKeys.value.checked].length) {
        return Promise.resolve()
      } else {
        return Promise.reject(t('routes.role.menuPermissionIsEmpty'))
      }
    }
    const rules = {
      roleName: [
        {
          required: true,
          message: t('routes.role.roleNameIsEmpty'),
          trigger: 'blur',
        },
      ],
      roleKey: [
        {
          required: true,
          message: t('routes.role.roleKeyIsEmpty'),
          trigger: 'blur',
        },
      ],
      status: [
        {
          required: true,
          message: t('routes.role.statusIsEmpty'),
          trigger: 'change',
        },
      ],
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
        label: t('routes.role.roleName'),
        name: 'roleName',
        value: '',
        placeholder: t('routes.role.roleNamePlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.role.status'),
        name: 'status',
        value: undefined,
        placeholder: t('routes.role.statusPlaceholder'),
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
      checkedKeys.value.checked = []
      formState.id = undefined
      formRef.value.resetFields()
      console.log(formRef)
      open.value = false
    }
    // 表单提交
    const handleSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          formState.menuIds = [...checkedKeys.value.checked]
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
      const ids = row.id || state.selectedRowKeys
      delRole(ids).then(() => {
        if (
          (ids.length && ids.length === roleList.value.length) ||
          roleList.value.length === 1
        ) {
          if (
            Math.ceil(pagination.value.total / queryParams.pageSize) ===
              queryParams.pageNum &&
            queryParams.pageNum > 1
          ) {
            queryParams.pageNum--
          }
        }
        getList(queryParams)
        Message.success(t('common.deleteSuccess'))
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success(t('common.cancelDelete'))
    }

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      drawerTitle.value = t('common.add')
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getRoleById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = t('common.update')
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
          const obj = {
            checked: res.data.menus.map((list) => list.id),
            halfChecked: [],
          }
          checkedKeys.value = toRefs(obj)
        })
      })
    }

    /** 查询菜单树结构 */
    const menuOptions = ref<IMenu[]>([])
    const checkedKeys = ref<any>({
      checked: [],
    })
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
        label: t('routes.role.CurrentAndBelow'),
      },
      {
        value: '2',
        label: t('routes.role.current'),
      },
      {
        value: '3',
        label: t('routes.role.myself'),
      },
    ])
    const formScopeRef = ref()
    const dataScopeOpen = ref(false)
    const scopeRules = {
      dataScope: [
        {
          required: true,
          message: t('routes.role.menuIdsIsEmpty'),
          trigger: 'blur',
        },
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
      t,
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
