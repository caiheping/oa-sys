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
      <a-col v-has-permi="['examineAndApprove:evection:add']">
        <a-button color="success" @click="handleAdd">
          {{ t('common.add') }}
        </a-button>
      </a-col>
      <a-col v-has-permi="['examineAndApprove:evection:delete']">
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
        <span>{{ selectDictLabel(evectionTypeOptions, record.type) }}</span>
      </template>
      <template #status="{ record }">
        <span>{{
          selectDictLabel(examineAndApproveStatusOptions, record.status)
        }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-dropdown
            :trigger="['click']"
            @click="handleClickDropdown(record)"
            v-has-permi="['examineAndApprove:evection:update']"
          >
            <span class="mr-3 text-[#faad14] cursor-pointer">
              {{ t('routes.evection.approve') }}
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
            v-has-permi="['examineAndApprove:evection:update']"
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
              v-has-permi="['examineAndApprove:evection:delete']"
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
  getEvection,
  delEvection,
  updateEvection,
  addEvection,
  getEvectionById,
} from '@/api/admin/examineAndApprove/evection'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'
import BaseForm from '@/components/BaseForm/index.vue'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { IEvection } from '@/api/admin/examineAndApprove/evection/type'
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
  evectionDate: undefined | string
  type: undefined | string
  evectionReason: undefined | string
  time: any[]
  startTime: undefined | string
  endTime: undefined | string
  status?: undefined | string
}

const columns = [
  {
    title: t('routes.evection.nickName'),
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: t('routes.evection.evectionType'),
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: t('routes.evection.evectionDuration'),
    dataIndex: 'evectionDuration',
    key: 'evectionDuration',
    align: 'center',
  },
  {
    title: t('routes.evection.evectionReason'),
    dataIndex: 'evectionReason',
    key: 'evectionReason',
    align: 'center',
  },
  {
    title: t('routes.evection.startTime'),
    dataIndex: 'startTime',
    key: 'startTime',
    align: 'center',
  },
  {
    title: t('routes.evection.endTime'),
    dataIndex: 'endTime',
    key: 'endTime',
    align: 'center',
  },
  {
    title: t('routes.evection.status'),
    dataIndex: 'status',
    key: 'status',
    slots: { customRender: 'status' },
    align: 'center',
  },
  {
    title: t('routes.evection.remark'),
    dataIndex: 'remark',
    key: 'remark',
    align: 'center',
  },
  {
    title: t('routes.evection.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.evection.action'),
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
    const evectionTypeOptions = ref<IData[]>([])
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
        label: t('routes.evection.nickName'),
        name: 'nickName',
        value: '',
        placeholder: t('routes.evection.nickNamePlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.evection.status'),
        name: 'status',
        value: undefined,
        placeholder: t('routes.evection.statusPlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: examineAndApproveStatusOptions,
      },
      {
        type: 'select',
        label: t('routes.evection.evectionType'),
        name: 'type',
        value: undefined,
        placeholder: t('routes.evection.evectionTypePlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: evectionTypeOptions,
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
    const tableList = ref<IEvection[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })
    const activeClickDropDownObj = ref<IEvection>()

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
    // 审批
    const handleExamineAndApprove = async ({ key }: MenuInfo) => {
      if (activeClickDropDownObj.value) {
        await getEvectionById(activeClickDropDownObj.value.id).then((res) => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
        formState.status = key
        updateEvection(formState).then((res) => {
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
      getEvection(queryParams).then((res) => {
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
      getEvectionById(row.id).then((res) => {
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
      delEvection(ids).then(() => {
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
      evectionDate: '',
      type: undefined,
      evectionReason: undefined,
      time: [],
      startTime: '',
      endTime: '',
    })
    const rules = reactive({
      time: [
        {
          required: true,
          message: t('routes.evection.evectionDurationPlaceholder'),
        },
      ],
      type: [
        {
          required: true,
          message: t('routes.evection.evectionTypePlaceholder'),
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
        label: t('routes.evection.selectTime'),
        type: 'range-picker',
        value: undefined,
        span: 24,
        props: {
          format: 'YYYY-MM-DD HH:mm',
          placeholder: [
            t('routes.evection.startTime'),
            t('routes.evection.endTime'),
          ],
          valueFormat: 'YYYY-MM-DD HH:mm',
        },
        fn: {
          ok: onOkTime,
          change: onOkTime,
        },
      },
      {
        name: 'type',
        label: t('routes.evection.evectionType'),
        type: 'select',
        value: undefined,
        span: 24,
        placeholder: t('routes.evection.evectionTypePlaceholder'),
        options: evectionTypeOptions,
        serialize: {
          value: 'dictValue',
          label: 'dictLabel',
        },
      },
      {
        name: 'evectionReason',
        label: t('routes.evection.evectionReason'),
        type: 'textarea',
        value: undefined,
        span: 24,
        placeholder: t('routes.evection.evectionReasonPlaceholder'),
      },
    ])
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      if (formState.id) {
        updateEvection(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      } else {
        addEvection(formState).then((res) => {
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
      open.value = false
      BaseFormRef.value.resetFields()
    }

    const init = () => {
      getList(queryParams)
    }

    onMounted(async () => {
      evectionTypeOptions.value = await getDict('sys_evection_type')
      examineAndApproveStatusOptions.value = await getDict(
        'sys_examineAndApprove_status'
      )

      evectionTypeOptions.value.forEach((item) => {
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
      evectionTypeOptions,
      examineAndApproveStatusOptions,
      formState,
      formDataObj,
      rules,
      handleClose,
      onOkTime,
      handleAdd,
      handleUpdate,
      handleSubmit,
    }
  },
})
</script>
