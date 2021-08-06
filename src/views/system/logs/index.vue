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
        <a-button color="normal">导出</a-button>
      </a-col>
      <a-col v-has-permi="['system:logs:deleteAllLogs']">
        <a-button color="warning" @click="clearAll">清空</a-button>
      </a-col>
      <a-col v-has-permi="['system:logs:delete']">
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
            详细
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
              v-has-permi="['system:logs:delete']"
            >
              删除
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
        <p class="mb-2">操作人员: {{ detailObj.createdBy }}</p>
        <p class="mb-2">接口地址: {{ detailObj.url }}</p>
        <p class="mb-2">ip地址: {{ detailObj.ip }}</p>
        <p class="mb-2">请求方式: {{ detailObj.method }}</p>
        <p class="mb-2">http状态码: {{ detailObj.status }}</p>
        <p class="mb-2">请求参数: {{ detailObj.data }}</p>
        <p class="mb-2">创建时间: {{ detailObj.createdAt }}</p>
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
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { ILog } from '@/api/admin/system/logs/type'
import { IData } from '@/api/admin/system/dict/data/type'

type Pagination = TableState['pagination']

const columns = [
  {
    title: '操作人员',
    dataIndex: 'createdBy',
    key: 'createdBy',
    align: 'center',
  },
  {
    title: '接口地址',
    dataIndex: 'url',
    key: 'url',
    align: 'center',
  },
  {
    title: '请求方式',
    dataIndex: 'method',
    key: 'method',
    align: 'center',
  },
  {
    title: 'ip地址',
    dataIndex: 'ip',
    key: 'ip',
    align: 'center',
  },
  {
    title: 'http状态码',
    dataIndex: 'status',
    key: 'status',
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
        label: '操作人员',
        name: 'createdBy',
        value: '',
        placeholder: '请输入操作人员',
      },
      {
        type: 'select',
        label: '请求方式',
        name: 'method',
        value: undefined,
        placeholder: '请选择请求方式',
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

    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delLogs(ids).then(() => {
        getList(queryParams)
        Message.success('删除成功')
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success('取消删除')
    }
    // 清空数据
    const clearAll = () => {
      delAllLogs().then(() => {
        getList(queryParams)
        Message.success('清除成功')
      })
    }
    /**
     * 推窗操作
     */
    const { open, drawerTitle } = useDrawer()
    const detailObj = ref(null)
    // 显示详情
    const showDetail = (record) => {
      open.value = true
      drawerTitle.value = '详细信息'
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
      queryParams,
      formFields,
      handleQuery,

      logsList,
      columns,
      pagination,
      hasSelected,
      methodOptions,
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
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
