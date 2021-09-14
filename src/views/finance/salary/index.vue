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
        <a-button color="success" @click="handleAdd"> 新增 </a-button>
      </a-col>
      <a-col v-has-permi="['finance:salary:add']">
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
            修改
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
              v-has-permi="['finance:salary:delete']"
            >
              删除
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

type Pagination = TableState['pagination']

const columns = [
  {
    title: '年月',
    key: 'yearAndMounth',
    align: 'center',
    slots: { customRender: 'yearAndMounth' },
  },
  {
    title: '姓名',
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: '目前薪资',
    key: 'currentSalary',
    align: 'center',
    slots: { customRender: 'currentSalary' },
  },
  {
    title: '当月应出勤时长',
    dataIndex: 'expectedAttendanceHours',
    key: 'expectedAttendanceHours',
    align: 'center',
  },
  {
    title: '出勤时长',
    dataIndex: 'attendanceHours',
    key: 'attendanceHours',
    align: 'center',
  },
  {
    title: '带薪假期（小时）',
    dataIndex: 'paidLeave',
    key: 'paidLeave',
    align: 'center',
  },
  {
    title: '无薪假期（小时）',
    dataIndex: 'unpaidLeave',
    key: 'unpaidLeave',
    align: 'center',
  },
  {
    title: '迟到早退（次数）',
    dataIndex: 'beLateAndLeaveEarly',
    key: 'beLateAndLeaveEarly',
    align: 'center',
  },
  {
    title: '补贴',
    dataIndex: 'subsidy',
    key: 'subsidy',
    align: 'center',
  },
  {
    title: '社保/公积金',
    dataIndex: 'socialSecurityAndProvidentFund',
    key: 'socialSecurityAndProvidentFund',
    align: 'center',
  },
  {
    title: '其他',
    dataIndex: 'other',
    key: 'other',
    align: 'center',
  },
  {
    title: '总计（税前工资）',
    dataIndex: 'total',
    key: 'total',
    align: 'center',
  },
  {
    title: '操作',
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
        label: '姓名',
        name: 'nickName',
        value: '',
        placeholder: '请输入姓名',
      },
      {
        type: 'month-picker',
        label: '年月',
        name: 'yearAndMounth',
        value: '',
        placeholder: '请选择年月',
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
      drawerTitle.value = '添加打卡'
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getSalaryById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改打卡'
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
        Message.success('删除成功')
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success('取消删除')
    }
    /**
     * 推窗操作
     */
    const { open, drawerTitle } = useDrawer()
    const rules = reactive({
      yearAndMounth: [
        {
          required: true,
          message: '请选择年月',
        },
      ]
    })
    const formDataObj = reactive([
      {
        name: 'yearAndMounth',
        label: '年月',
        type: 'month-picker',
        value: undefined,
        span: 24,
        placeholder: '请选择年月',
      },
      {
        name: 'expectedAttendanceHours',
        label: '应出勤时长',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入应出勤时长',
      },
      {
        name: 'attendanceHours',
        label: '出勤时长',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入出勤时长',
      },
      {
        name: 'paidLeave',
        label: '带薪假期',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入带薪假期',
      },
      {
        name: 'unpaidLeave',
        label: '无薪假期',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入无薪假期',
      },
      {
        name: 'beLateAndLeaveEarly',
        label: '迟到早退',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入迟到早退次数',
      },
      {
        name: 'subsidy',
        label: '补贴',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入补贴',
        props: {
          precision: 2,
        },
      },
      {
        name: 'socialSecurityAndProvidentFund',
        label: '公积金/社保',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入公积金/社保',
        props: {
          precision: 2,
        },
      },
      {
        name: 'other',
        label: '其他',
        type: 'input-number',
        span: 24,
        value: undefined,
        placeholder: '请输入其他',
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
