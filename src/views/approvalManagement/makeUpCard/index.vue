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
      <a-col>
        <a-button :disabled="!hasSelected" color="error"> 删除 </a-button>
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
      :data-source="logsList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #action="{ record }">
        <span>
          <a-button type="link" color="success" class="mr-3"> 审批 </a-button>
          <a-button type="link" color="success" class="mr-3"> 修改 </a-button>
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
              v-has-permi="['system:notice:delete']"
            >
              删除
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 推窗 -->
    <a-drawer
      width="600px"
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
            <a-form-item label="标题" name="noticeTitle">
              <a-input
                v-model:value="formState.noticeTitle"
                placeholder="请输入标题"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="类型" name="noticeType">
              <a-select
                v-model:value="formState.noticeType"
                placeholder="请输入类型"
              >
                <a-select-option
                  v-for="item in typeOptions"
                  :key="item.id"
                  :value="item.dictValue"
                >
                  {{ item.dictLabel }}
                </a-select-option>
              </a-select>
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
            <a-form-item label="内容" name="noticeContent">
              <a-textarea
                :rows="3"
                v-model:value="formState.noticeContent"
                placeholder="请输入内容"
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
    title: '姓名',
    dataIndex: 'createdBy',
    key: 'createdBy',
    align: 'center',
  },
  {
    title: '补卡时间',
    dataIndex: 'method',
    key: 'method',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'method',
    key: 'method',
    align: 'center',
  },
  {
    title: '备注',
    dataIndex: 'method',
    key: 'method',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'method',
    key: 'method',
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
        label: '姓名',
        name: 'createdBy',
        value: '',
        placeholder: '请输入姓名',
      },
      {
        type: 'select',
        label: '状态',
        name: 'status',
        value: undefined,
        placeholder: '请选择类型',
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
