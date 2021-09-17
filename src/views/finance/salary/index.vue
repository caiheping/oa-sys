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
      <a-col>
        <a-button color="success" @click="handleAdd">
          {{ t('common.add') }}
        </a-button>
      </a-col>
      <a-col v-has-permi="['finance:salary:add']">
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
      <!-- <a-col>
        <a-button color="normal">{{ t('common.export') }}</a-button>
      </a-col> -->
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
      <template #yearAndMounth="{ record }">
        <span>{{ getMounth(record.yearAndMounth) }}</span>
      </template>
      <template #user="{ record }">
        <span>{{ record.user.nickName }}</span>
      </template>
      <template #currentSalary="{ record }">
        <span>{{ record.user.salary }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-button
            v-has-permi="['finance:salary:update']"
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
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
              v-has-permi="['finance:salary:delete']"
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
} from 'vue'
import {
  getSalary,
  delSalary,
  updateSalary,
  addSalary,
  getSalaryById,
} from '@/api/admin/finance/salary'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'
import BaseForm from '@/components/BaseForm/index.vue'
import moment from 'moment'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { ISalary } from '@/api/admin/finance/salary/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

type Pagination = TableState['pagination']

const columns = [
  {
    title: t('routes.salary.yearAndMounth'),
    key: 'yearAndMounth',
    align: 'center',
    slots: { customRender: 'yearAndMounth' },
  },
  {
    title: t('routes.salary.nickName'),
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: t('routes.salary.currentSalary'),
    key: 'currentSalary',
    align: 'center',
    slots: { customRender: 'currentSalary' },
  },
  {
    title: t('routes.salary.expectedAttendanceHours'),
    dataIndex: 'expectedAttendanceHours',
    key: 'expectedAttendanceHours',
    align: 'center',
  },
  {
    title: t('routes.salary.attendanceHours'),
    dataIndex: 'attendanceHours',
    key: 'attendanceHours',
    align: 'center',
  },
  {
    title: t('routes.salary.paidLeave'),
    dataIndex: 'paidLeave',
    key: 'paidLeave',
    align: 'center',
  },
  {
    title: t('routes.salary.unpaidLeave'),
    dataIndex: 'unpaidLeave',
    key: 'unpaidLeave',
    align: 'center',
  },
  {
    title: t('routes.salary.beLateAndLeaveEarly'),
    dataIndex: 'beLateAndLeaveEarly',
    key: 'beLateAndLeaveEarly',
    align: 'center',
  },
  {
    title: t('routes.salary.subsidy'),
    dataIndex: 'subsidy',
    key: 'subsidy',
    align: 'center',
  },
  {
    title: t('routes.salary.socialSecurityAndProvidentFund'),
    dataIndex: 'socialSecurityAndProvidentFund',
    key: 'socialSecurityAndProvidentFund',
    align: 'center',
  },
  {
    title: t('routes.salary.other'),
    dataIndex: 'other',
    key: 'other',
    align: 'center',
  },
  {
    title: t('routes.salary.total'),
    dataIndex: 'total',
    key: 'total',
    align: 'center',
  },
  {
    title: t('routes.salary.action'),
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' },
  },
]

interface FormState {
  id: undefined | number
  yearAndMounth: undefined | string
  expectedAttendanceHours: undefined | string
  attendanceHours: undefined | string
  paidLeave: undefined | string
  unpaidLeave: undefined | string
  beLateAndLeaveEarly: undefined | string
  subsidy: undefined | string
  socialSecurityAndProvidentFund: undefined | string
  other: undefined | string
}

export default defineComponent({
  components: {
    FormSearch,
    BaseForm,
  },
  setup() {
    const loading = computed(() => useAppStore().loading)
    const BaseFormRef = ref()

    /**
     * 查询表单操作
     */
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      nickName: undefined || '',
      yearAndMounth: undefined || '',
    })
    const formFields = reactive([
      {
        type: 'input',
        label: t('routes.salary.nickName'),
        name: 'nickName',
        value: '',
        placeholder: t('routes.salary.nickNamePlaceholder'),
      },
      {
        type: 'month-picker',
        label: t('routes.salary.yearAndMounth'),
        name: 'yearAndMounth',
        value: '',
        placeholder: t('routes.salary.yearAndMounthPlaceholder'),
      },
    ])
    const handleQuery = (query: {
      nickName: string
      yearAndMounth: string
    }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.nickName = query.nickName
      queryParams.yearAndMounth = query.yearAndMounth
        ? moment(query.yearAndMounth).format('YYYY-MM')
        : ''
      getList(queryParams)
    }
    /**
     * 表格操作
     */
    const tableList = ref<ISalary[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })

    const state = reactive({
      selectedRowKeys: [],
    })

    const getMounth = (date: string) => {
      return moment(date).format('YYYY-MM')
    }

    const hasSelected = computed(() => state.selectedRowKeys.length > 0)
    // 表格选择框改变事件
    const onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      state.selectedRowKeys = selectedRowKeys
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
      getSalary(queryParams).then((res) => {
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
      getSalaryById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = t('common.update')
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
          console.log(formState)
        })
      })
    }
    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delSalary(ids).then(() => {
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
    const rules = reactive({
      yearAndMounth: [
        {
          required: true,
          message: t('routes.salary.yearAndMounthPlaceholder'),
        },
      ],
    })
    const formDataObj = reactive([
      {
        name: 'yearAndMounth',
        label: t('routes.salary.yearAndMounth'),
        type: 'month-picker',
        value: undefined,
        span: 24,
        labelCol: 8,
        placeholder: t('routes.salary.yearAndMounthPlaceholder'),
      },
      {
        name: 'expectedAttendanceHours',
        label: t('routes.salary.expectedAttendanceHours'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.expectedAttendanceHoursPlaceholder'),
      },
      {
        name: 'attendanceHours',
        label: t('routes.salary.attendanceHours'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.attendanceHoursPlaceholder'),
      },
      {
        name: 'paidLeave',
        label: t('routes.salary.paidLeave'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.paidLeavePlaceholder'),
      },
      {
        name: 'unpaidLeave',
        label: t('routes.salary.unpaidLeave'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.unpaidLeavePlaceholder'),
      },
      {
        name: 'beLateAndLeaveEarly',
        label: t('routes.salary.beLateAndLeaveEarly'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.beLateAndLeaveEarlyPlaceholder'),
      },
      {
        name: 'subsidy',
        label: t('routes.salary.subsidy'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.subsidyPlaceholder'),
        props: {
          precision: 2,
        },
      },
      {
        name: 'socialSecurityAndProvidentFund',
        label: t('routes.salary.socialSecurityAndProvidentFund'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t(
          'routes.salary.socialSecurityAndProvidentFundPlaceholder'
        ),
        props: {
          precision: 2,
        },
      },
      {
        name: 'other',
        label: t('routes.salary.other'),
        type: 'input-number',
        span: 24,
        labelCol: 8,
        value: undefined,
        placeholder: t('routes.salary.otherPlaceholder'),
        props: {
          precision: 2,
        },
      },
    ])
    const formState: FormState = reactive({
      id: undefined,
      yearAndMounth: undefined,
      expectedAttendanceHours: undefined,
      attendanceHours: undefined,
      paidLeave: undefined,
      unpaidLeave: undefined,
      beLateAndLeaveEarly: undefined,
      subsidy: undefined,
      socialSecurityAndProvidentFund: undefined,
      other: undefined,
    })
    // 表单提交
    const handleSubmit = () => {
      if (formState.id) {
        updateSalary(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      } else {
        addSalary(formState).then((res) => {
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
      getMounth,
      handleTableChange,
      confirm,
      cancel,
      onSelectChange,
      handleAdd,
      handleUpdate,
      ...toRefs(state),

      BaseFormRef,
      open,
      drawerTitle,
      formState,
      rules,
      formDataObj,
      handleClose,
      handleSubmit,
    }
  },
})
</script>
