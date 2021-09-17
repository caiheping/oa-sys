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
      <a-col v-has-permi="['baseInfo:clockIn:add']">
        <a-button color="success" @click="handleAdd">
          {{ t('common.add') }}
        </a-button>
      </a-col>
      <a-col v-has-permi="['baseInfo:clockIn:delete']">
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
      <template #user="{ record }">
        <span>{{ record.user.nickName }}</span>
      </template>
      <template #type="{ record }">
        <span>{{ selectDictLabel(clockInOptions, record.type) }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-button
            v-has-permi="['baseInfo:clockIn:update']"
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
              v-has-permi="['baseInfo:clockIn:delete']"
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
  getClockIn,
  delClockIn,
  updateClockIn,
  addClockIn,
  getClockInById,
} from '@/api/admin/baseInfo/clockIn'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'
import BaseForm from '@/components/BaseForm/index.vue'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { IClockIn } from '@/api/admin/baseInfo/clockIn/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

type Pagination = TableState['pagination']

const columns = [
  {
    title: t('routes.clockIn.nickName'),
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: t('routes.clockIn.clockInType'),
    key: 'type',
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: t('routes.clockIn.clockInWiFi'),
    dataIndex: 'wifiBefore',
    key: 'wifiBefore',
    align: 'center',
  },
  {
    title: t('routes.clockIn.clockInAddr'),
    dataIndex: 'firstClockInAddr',
    key: 'firstClockInAddr',
    align: 'center',
  },
  {
    title: t('routes.clockIn.clockInTime'),
    dataIndex: 'firstClockInTime',
    key: 'firstClockInTime',
    align: 'center',
  },
  {
    title: t('routes.clockIn.clockOutWiFi'),
    dataIndex: 'wifiNext',
    key: 'wifiNext',
    align: 'center',
  },
  {
    title: t('routes.clockIn.clockOutAddr'),
    dataIndex: 'lastClockInAddr',
    key: 'lastClockInAddr',
    align: 'center',
  },
  {
    title: t('routes.clockIn.clockOutTime'),
    dataIndex: 'lastClockInTime',
    key: 'lastClockInTime',
    align: 'center',
  },
  {
    title: t('routes.clockIn.action'),
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' },
  },
]

interface FormState {
  id: undefined | number
  type: undefined | string
  wifiBefore: undefined | string
  firstClockInAddr: undefined | string
  firstClockInTime: undefined | string
  wifiNext: undefined | string
  lastClockInAddr: undefined | string
  lastClockInTime: undefined | string
}

export default defineComponent({
  components: {
    FormSearch,
    BaseForm,
  },
  setup() {
    const loading = computed(() => useAppStore().loading)
    const clockInOptions = ref<IData[]>([])
    const BaseFormRef = ref()

    /**
     * 查询表单操作
     */
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      nickName: undefined || '',
      type: undefined || '',
    })
    const formFields = reactive([
      {
        type: 'input',
        label: t('routes.clockIn.nickName'),
        name: 'nickName',
        value: '',
        placeholder: t('routes.clockIn.nickNamePlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.clockIn.clockInType'),
        name: 'type',
        value: undefined,
        placeholder: t('routes.clockIn.clockInTypePlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: clockInOptions,
      },
    ])
    const handleQuery = (query: { nickName: string; type: string }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.nickName = query.nickName
      queryParams.type = query.type
      getList(queryParams)
    }
    /**
     * 表格操作
     */
    const tableList = ref<IClockIn[]>([])
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
      getClockIn(queryParams).then((res) => {
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
      getClockInById(row.id).then((res) => {
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
      delClockIn(ids).then(() => {
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
      type: [
        {
          required: true,
          message: t('routes.clockIn.clockInTypePlaceholder'),
        },
      ],
    })
    const formDataObj = reactive([
      {
        name: 'type',
        label: t('routes.clockIn.clockInType'),
        type: 'select',
        value: undefined,
        span: 24,
        placeholder: t('routes.clockIn.clockInTypePlaceholder'),
        options: clockInOptions,
        serialize: {
          value: 'dictValue',
          label: 'dictLabel',
        },
      },
      {
        name: 'wifiBefore',
        label: t('routes.clockIn.clockInWiFi'),
        type: 'input',
        value: undefined,
        span: 24,
        placeholder: t('routes.clockIn.clockInWiFiPlaceholder'),
      },
      {
        name: 'firstClockInAddr',
        label: t('routes.clockIn.clockInAddr'),
        type: 'input',
        span: 24,
        value: undefined,
        placeholder: t('routes.clockIn.clockInAddrPlaceholder'),
      },
      {
        name: 'firstClockInTime',
        label: t('routes.clockIn.clockInTime'),
        type: 'time-picker',
        span: 24,
        value: undefined,
        placeholder: t('routes.clockIn.clockInTime'),
        props: {
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'HH:mm',
        },
      },
      {
        name: 'wifiNext',
        label: t('routes.clockIn.clockOutWiFi'),
        type: 'input',
        value: undefined,
        span: 24,
        placeholder: t('routes.clockIn.clockOutWiFiPlaceholder'),
      },
      {
        name: 'lastClockInAddr',
        label: t('routes.clockIn.clockOutAddr'),
        type: 'input',
        span: 24,
        value: undefined,
        placeholder: t('routes.clockIn.clockOutAddrPlaceholder'),
      },
      {
        name: 'lastClockInTime',
        label: t('routes.clockIn.clockOutTime'),
        type: 'time-picker',
        span: 24,
        value: undefined,
        placeholder: t('routes.clockIn.clockOutTime'),
        props: {
          valueFormat: 'YYYY-MM-DD HH:mm',
          format: 'HH:mm',
        },
      },
    ])
    const formState: FormState = reactive({
      id: undefined,
      type: '1',
      wifiBefore: undefined,
      firstClockInAddr: undefined,
      firstClockInTime: undefined,
      wifiNext: undefined,
      lastClockInAddr: undefined,
      lastClockInTime: undefined,
    })
    // 表单提交
    const handleSubmit = () => {
      if (formState.id) {
        updateClockIn(formState).then((res) => {
          Message.success(res.message)
          getList(queryParams)
          formState.id = undefined
          BaseFormRef.value.resetFields()
          open.value = false
        })
      } else {
        addClockIn(formState).then((res) => {
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
      clockInOptions.value = await getDict('sys_clock_in_type')
      clockInOptions.value.forEach((item) => {
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
      handleAdd,
      handleUpdate,
      ...toRefs(state),

      BaseFormRef,
      open,
      drawerTitle,
      clockInOptions,
      formState,
      rules,
      formDataObj,
      handleClose,
      handleSubmit,
    }
  },
})
</script>
