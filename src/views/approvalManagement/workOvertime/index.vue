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
      <a-col v-has-permi="['examineAndApprove:workOverTime:add']">
        <a-button color="success" @click="handleAdd"> 新增 </a-button>
      </a-col>
      <a-col v-has-permi="['examineAndApprove:workOverTime:delete']">
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
      <template #user="{ record }">
        <span>{{ record.user.nickName }}</span>
      </template>
      <template #status="{ record }">
        <span>{{
          selectDictLabel(examineAndApproveStatusOptions, record.status)
        }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-dropdown :trigger="['click']" @click="handleClickDropdown(record)">
            <span class="mr-3 text-[#faad14] cursor-pointer"> 审批 </span>
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
            v-has-permi="['examineAndApprove:workOverTime:update']"
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
              v-has-permi="['examineAndApprove:workOverTime:delete']"
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
  VNodeChild,
} from 'vue'
import {
  getWorkOvertime,
  delWorkOvertime,
  updateWorkOvertime,
  addWorkOvertime,
  getWorkOvertimeById,
} from '@/api/admin/examineAndApprove/workOverTime'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'

import FormSearch from '@/components/FormSearch/index.vue'
import BaseForm from '@/components/BaseForm/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { IWorkOvertime } from '@/api/admin/examineAndApprove/workOverTime/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { FormDataItem } from '@/components/BaseForm/type'

type Pagination = TableState['pagination']

interface MenuInfo {
  key: string
  keyPath: string[]
  item: VNodeChild
  domEvent: MouseEvent
}

interface FormState {
  id: undefined | number
  type: undefined | string
  time: any[]
  workOverTimeReason: undefined | string
  startTime: undefined | string
  endTime: undefined | string
  status?: undefined | string
}

const columns = [
  {
    title: '姓名',
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: '加班时长',
    dataIndex: 'workOverTimeDuration',
    key: 'workOverTimeDuration',
    align: 'center',
    slots: { customRender: 'workOverTimeDuration' },
  },
  {
    title: '加班原因',
    dataIndex: 'workOverTimeReason',
    key: 'workOverTimeReason',
    align: 'center',
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    key: 'startTime',
    align: 'center',
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    key: 'endTime',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: '审批状态',
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    align: 'center',
  },
  {
    title: '审批备注',
    dataIndex: 'remark',
    key: 'remark',
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
    BaseForm,
  },
  setup() {
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
        label: '姓名',
        name: 'nickName',
        value: '',
        placeholder: '请输入姓名',
      },
      {
        type: 'select',
        label: '审批状态',
        name: 'status',
        value: undefined,
        placeholder: '请选择审批状态',
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: examineAndApproveStatusOptions,
      },
    ])
    const handleQuery = (query: { nickName: string; status: string }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.nickName = query.nickName
      queryParams.status = query.status
      getList(queryParams)
    }
    /**
     * 表格操作
     */
    const tableList = ref<IWorkOvertime[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })
    const activeClickDropDownObj = ref<IWorkOvertime>()

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
        await getWorkOvertimeById(activeClickDropDownObj.value.id).then(
          (res) => {
            Object.keys(formState).forEach((key) => {
              formState[key] = res.data[key]
            })
          }
        )
        formState.status = key
        updateWorkOvertime(formState).then((res) => {
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
      getWorkOvertime(queryParams).then((res) => {
        console.log(res)
        tableList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      drawerTitle.value = '添加'
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getWorkOvertimeById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改'
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
      delWorkOvertime(ids).then(() => {
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
    const formState: FormState = reactive({
      id: undefined,
      type: undefined,
      workOverTimeReason: undefined,
      time: [],
      startTime: '',
      endTime: '',
    })
    const rules = reactive({
      time: [
        {
          required: true,
          message: '请选择加班时间',
        },
      ],
    })
    const onOkTime = (value) => {
      formState.startTime = value[0]
      formState.endTime = value[1]
    }
    const formDataObj = reactive<FormDataItem[]>([
      {
        name: 'time',
        label: '选择时间',
        type: 'range-picker',
        value: undefined,
        span: 24,
        props: {
          format: 'YYYY-MM-DD HH:mm',
          placeholder: ['开始时间', '结束时间'],
          valueFormat: 'YYYY-MM-DD HH:mm',
        },
        fn: {
          ok: onOkTime,
          change: onOkTime,
        },
      },
      {
        name: 'workOverTimeReason',
        label: '加班原因',
        type: 'textarea',
        value: undefined,
        span: 24,
        placeholder: '请输入加班原因',
      },
    ])
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      if (formState.id) {
        updateWorkOvertime(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      } else {
        addWorkOvertime(formState).then((res) => {
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
      examineAndApproveStatusOptions.value = await getDict(
        'sys_examineAndApprove_status'
      )
      examineAndApproveStatusOptions.value.forEach((item) => {
        item.value = item.dictValue
        item.lable = item.dictLabel
      })
      init()
    })

    return {
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
      examineAndApproveStatusOptions,
      formState,
      formDataObj,
      rules,
      handleClose,
      handleAdd,
      onOkTime,
      handleUpdate,
      handleSubmit,
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
