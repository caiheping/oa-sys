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
        <a-button color="normal" @click="handleExportFile">{{
          t('common.export')
        }}</a-button>
      </a-col>
      <a-col v-has-permi="['system:logs:deleteAllLogs']">
        <a-button color="warning" @click="clearAll">{{
          t('common.clearAll')
        }}</a-button>
      </a-col>
      <a-col v-has-permi="['system:logs:delete']">
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
      :data-source="logsList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="showDetail(record)"
          >
            {{ t('common.detail') }}
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
              v-has-permi="['system:logs:delete']"
            >
              {{ t('common.delete') }}
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 推窗 -->
    <a-drawer
      width="50%"
      :title="drawerTitle"
      placement="right"
      v-model:visible="open"
      :maskClosable="false"
      @close="handleClose"
    >
      <div v-if="detailObj">
        <p class="mb-2">
          {{ t('routes.logs.createdBy') }}: {{ detailObj.createdBy }}
        </p>
        <p class="mb-2">{{ t('routes.logs.url') }}: {{ detailObj.url }}</p>
        <p class="mb-2">{{ t('routes.logs.ip') }}: {{ detailObj.ip }}</p>
        <p class="mb-2">
          {{ t('routes.logs.method') }}: {{ detailObj.method }}
        </p>
        <p class="mb-2">
          {{ t('routes.logs.status') }}: {{ detailObj.status }}
        </p>
        <p class="mb-2">{{ t('routes.logs.data') }}: {{ detailObj.data }}</p>
        <p class="mb-2">
          {{ t('routes.logs.createdAt') }}: {{ detailObj.createdAt }}
        </p>
      </div>
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
  toRefs,
} from 'vue'
import { getLogs, delLogs, delAllLogs } from '@/api/admin/system/logs'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { ILog } from '@/api/admin/system/logs/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { downLoad } from '@/utils/request'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

type Pagination = TableState['pagination']

interface DetailObj {
  createdBy: string
  url: string
  ip: string
  method: string
  status: string
  data: string
  createdAt: string
}

const columns = [
  {
    title: t('routes.logs.createdBy'),
    dataIndex: 'createdBy',
    key: 'createdBy',
    align: 'center',
  },
  {
    title: t('routes.logs.url'),
    dataIndex: 'url',
    key: 'url',
    align: 'center',
  },
  {
    title: t('routes.logs.method'),
    dataIndex: 'method',
    key: 'method',
    align: 'center',
  },
  {
    title: t('routes.logs.ip'),
    dataIndex: 'ip',
    key: 'ip',
    align: 'center',
  },
  {
    title: t('routes.logs.status'),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
  },
  {
    title: t('routes.logs.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.logs.action'),
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
    const appStore = useAppStore()
    const loading = computed(() => appStore.loading)
    const methodOptions = ref<IData[]>([])

    /**
     * 查询表单操作
     */
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      createdBy: undefined || '',
      method: undefined || '',
    })
    const formFields = reactive([
      {
        type: 'input',
        label: t('routes.logs.createdBy'),
        name: 'createdBy',
        value: '',
        placeholder: t('routes.logs.createdByPlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.logs.method'),
        name: 'method',
        value: undefined,
        placeholder: t('routes.logs.methodPlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: methodOptions,
      },
    ])
    const handleQuery = (query: { createdBy: string; method: string }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.createdBy = query.createdBy
      queryParams.method = query.method
      getList(queryParams)
    }
    /**
     * 表格操作
     */
    const logsList = ref<ILog[]>([])
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
      getLogs(queryParams).then((res) => {
        console.log(res)
        logsList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    const handleExportFile = () => {
      downLoad('/admin/system/logs/export', {}, `${t('routes.logs.logs')}.xlsx`)
    }

    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delLogs(ids).then(() => {
        if (
          (ids.length && ids.length === logsList.value.length) ||
          logsList.value.length === 1
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
    // 清空数据
    const clearAll = () => {
      delAllLogs().then(() => {
        getList(queryParams)
        Message.success(t('routes.logs.clearAllSuccess'))
      })
    }
    /**
     * 推窗操作
     */
    const { open, drawerTitle } = useDrawer()
    const detailObj = ref<DetailObj>()
    // 显示详情
    const showDetail = (record) => {
      open.value = true
      drawerTitle.value = t('common.detail')
      detailObj.value = record
      console.log(record)
    }
    // 关闭推窗
    const handleClose = () => {
      open.value = false
    }

    const init = () => {
      getList(queryParams)
    }

    onMounted(async () => {
      methodOptions.value = await getDict('sys_method_type')
      init()
    })

    return {
      t,
      loading,
      queryParams,
      formFields,
      handleQuery,

      logsList,
      columns,
      pagination,
      hasSelected,
      methodOptions,
      handleExportFile,
      clearAll,
      handleTableChange,
      selectDictLabel,
      confirm,
      cancel,
      onSelectChange,
      ...toRefs(state),

      open,
      drawerTitle,
      detailObj,
      handleClose,
      showDetail,
    }
  },
})
</script>
