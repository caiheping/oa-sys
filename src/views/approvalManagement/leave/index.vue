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
      <a-col v-has-permi="['examineAndApprove:leave:add']">
        <a-button color="success" @click="handleAdd">
          {{ t('common.add') }}
        </a-button>
      </a-col>
      <a-col v-has-permi="['examineAndApprove:leave:delete']">
        <a-popconfirm
          :title="t('common.confirmDeleteSelect')"
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
      <a-col>
        <a-button color="normal">{{ t('common.export') }}</a-button>
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
      :data-source="tableList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #user="{ record }">
        <span>{{ record.user.nickName }}</span>
      </template>
      <template #type="{ record }">
        <span>{{ selectDictLabel(leaveTypeOptions, record.type) }}</span>
      </template>
      <template #status="{ record }">
        <span>{{
          selectDictLabel(examineAndApproveStatusOptions, record.status)
        }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-dropdown :trigger="['click']" @click="handleClickDropdown(record)">
            <span class="mr-3 text-[#faad14] cursor-pointer">
              {{ t('routes.leave.approve') }}
            </span>
            <template #overlay>
              <a-menu @click="handleExamineAndApprove">
                <a-menu-item
                  :disabled="item.dictValue === '0'"
                  v-for="item in examineAndApproveStatusOptions"
                  :key="item.dictValue"
                >
                  {{ item.dictLabel }}
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['examineAndApprove:leave:update']"
          >
            {{ t('common.update') }}
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
              v-has-permi="['examineAndApprove:leave:delete']"
            >
              {{ t('common.delete') }}
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 推窗 -->
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
  computed,
  nextTick,
  toRefs,
  VNodeChild,
} from 'vue'
import {
  getLeave,
  delLeave,
  updateLeave,
  addLeave,
  getLeaveById,
} from '@/api/admin/examineAndApprove/leave'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'

import FormSearch from '@/components/FormSearch/index.vue'
import BaseForm from '@/components/BaseForm/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { ILeave } from '@/api/admin/examineAndApprove/leave/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { FormDataItem } from '@/components/BaseForm/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

type Pagination = TableState['pagination']

interface MenuInfo {
  key: string
  keyPath: string[]
  item: VNodeChild
  domEvent: MouseEvent
}

interface FormState {
  id: undefined | number
  leaveDate: undefined | string
  type: undefined | string
  leaveReason: undefined | string
  time: any[]
  startTime: undefined | string
  endTime: undefined | string
  status?: undefined | string
}

const columns = [
  {
    title: t('routes.leave.nickName'),
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: t('routes.leave.leaveType'),
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: t('routes.leave.duration'),
    dataIndex: 'leaveDuration',
    key: 'leaveDuration',
    align: 'center',
  },
  {
    title: t('routes.leave.leaveReason'),
    dataIndex: 'leaveReason',
    key: 'leaveReason',
    align: 'center',
  },
  {
    title: t('routes.leave.startTime'),
    dataIndex: 'startTime',
    key: 'startTime',
    align: 'center',
  },
  {
    title: t('routes.leave.endTime'),
    dataIndex: 'endTime',
    key: 'endTime',
    align: 'center',
  },
  {
    title: t('routes.leave.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.leave.status'),
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    align: 'center',
  },
  {
    title: t('routes.leave.remark'),
    dataIndex: 'remark',
    key: 'remark',
    align: 'center',
  },
  {
    title: t('routes.leave.action'),
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' },
  },
]

export default defineComponent({
  components: {
    FormSearch,
    BaseForm,
  },
  setup() {
    const loading = computed(() => useAppStore().loading)
    const leaveTypeOptions = ref<IData[]>([])
    const examineAndApproveStatusOptions = ref<IData[]>([])
    const BaseFormRef = ref()

    /**
     * 查询表单操作
     */
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      nickName: undefined || '',
      type: undefined || '',
      status: undefined || '',
    })
    const formFields = reactive([
      {
        type: 'input',
        label: t('routes.leave.nickName'),
        name: 'nickName',
        value: '',
        placeholder: t('routes.leave.nickNamePlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.leave.status'),
        name: 'status',
        value: undefined,
        placeholder: t('routes.leave.statusPlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: examineAndApproveStatusOptions,
      },
      {
        type: 'select',
        label: t('routes.leave.leaveType'),
        name: 'type',
        value: undefined,
        placeholder: t('routes.leave.leaveTypePlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: leaveTypeOptions,
      },
    ])
    const handleQuery = (query: {
      nickName: string
      type: string
      status: string
    }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.nickName = query.nickName
      queryParams.type = query.type
      queryParams.status = query.status
      getList(queryParams)
    }
    /**
     * 表格操作
     */
    const tableList = ref<ILeave[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })
    const activeClickDropDownObj = ref<ILeave>()

    const state = reactive({
      selectedRowKeys: [],
    })

    const hasSelected = computed(() => state.selectedRowKeys.length > 0)
    // 表格选择框改变事件
    const onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      state.selectedRowKeys = selectedRowKeys
    }
    const handleClickDropdown = (row) => {
      activeClickDropDownObj.value = row
    }
    const handleExamineAndApprove = async ({ key }: MenuInfo) => {
      console.log(key, activeClickDropDownObj)
      if (activeClickDropDownObj.value) {
        await getLeaveById(activeClickDropDownObj.value.id).then((res) => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
        formState.status = key
        updateLeave(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
        })
      }
    }
    // 表格改变事件，页码改变，条数改变
    const handleTableChange = (page: Pagination) => {
      (pagination.value as Pagination) = page
      queryParams.pageNum = pagination.value.current
      queryParams.pageSize = pagination.value.pageSize
      getList(queryParams)
    }
    // 获取表格数据
    const getList = (queryParams?: {}) => {
      getLeave(queryParams).then((res) => {
        console.log(res)
        tableList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      drawerTitle.value = t('common.add')
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getLeaveById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = t('common.update')
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
            formState.time = ['', '']
            if (key === 'startTime') {
              nextTick(() => {
                formState.time[0] = res.data[key]
              })
            }
            if (key === 'endTime') {
              nextTick(() => {
                formState.time[1] = res.data[key]
              })
            }
          })
        })
      })
    }
    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delLeave(ids).then(() => {
        if (
          (ids.length && ids.length === tableList.value.length) ||
          tableList.value.length === 1
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
    /**
     * 推窗操作
     */
    const { open, drawerTitle } = useDrawer()
    const formState: FormState = reactive({
      id: undefined,
      leaveDate: '',
      type: undefined,
      leaveReason: undefined,
      time: [],
      startTime: '',
      endTime: '',
    })

    const onOkTime = (value) => {
      formState.startTime = value[0]
      formState.endTime = value[1]
    }
    const rules = reactive({
      time: [
        {
          required: true,
          message: t('routes.leave.startTimePlaceholder'),
        },
      ],
      type: [
        {
          required: true,
          message: t('routes.leave.endTimePlaceholder'),
        },
      ],
    })
    const formDataObj = reactive<FormDataItem[]>([
      {
        name: 'time',
        label: t('routes.leave.selectTime'),
        type: 'range-picker',
        value: undefined,
        span: 24,
        props: {
          format: 'YYYY-MM-DD HH:mm',
          placeholder: [t('routes.leave.startTime'), t('routes.leave.endTime')],
          valueFormat: 'YYYY-MM-DD HH:mm',
        },
        fn: {
          ok: onOkTime,
          change: onOkTime,
        },
      },
      {
        name: 'type',
        label: t('routes.leave.leaveType'),
        type: 'select',
        value: undefined,
        span: 24,
        placeholder: t('routes.leave.leaveTypePlaceholder'),
        options: leaveTypeOptions,
        serialize: {
          value: 'dictValue',
          label: 'dictLabel',
        },
      },
      {
        name: 'leaveReason',
        label: t('routes.leave.leaveReason'),
        type: 'textarea',
        value: undefined,
        span: 24,
        placeholder: t('routes.leave.leaveReasonPlaceholder'),
      },
    ])
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      if (formState.id) {
        updateLeave(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      } else {
        addLeave(formState).then((res) => {
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

    const init = () => {
      getList(queryParams)
    }

    onMounted(async () => {
      leaveTypeOptions.value = await getDict('sys_leave_type')
      examineAndApproveStatusOptions.value = await getDict(
        'sys_examineAndApprove_status'
      )

      leaveTypeOptions.value.forEach((item) => {
        item.value = item.dictValue
        item.lable = item.dictLabel
      })
      examineAndApproveStatusOptions.value.forEach((item) => {
        item.value = item.dictValue
        item.lable = item.dictLabel
      })
      init()
    })

    return {
      t,
      loading,
      queryParams,
      formFields,
      handleQuery,

      tableList,
      columns,
      pagination,
      hasSelected,
      handleTableChange,
      selectDictLabel,
      confirm,
      cancel,
      onSelectChange,
      ...toRefs(state),
      handleExamineAndApprove,
      handleClickDropdown,

      BaseFormRef,
      open,
      drawerTitle,
      leaveTypeOptions,
      examineAndApproveStatusOptions,
      formState,
      rules,
      formDataObj,
      handleClose,
      onOkTime,
      handleAdd,
      handleUpdate,
      handleSubmit,
    }
  },
})
</script>
