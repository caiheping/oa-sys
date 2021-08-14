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
      <a-col v-has-permi="['system:notice:delete']">
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
      <template #type="{ record }">
        <span>{{ selectDictLabel(clockInOptions, record.type) }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
          >
            审批
          </a-button>
          <a-button
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
            <a-form-item label="类型" name="type">
              <a-select v-model:value="formState.type" placeholder="请输入类型">
                <a-select-option
                  v-for="item in clockInOptions"
                  :key="item.id"
                  :value="item.dictValue"
                >
                  {{ item.dictLabel }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="打卡WiFi" name="wifi">
              <a-input
                v-model:value="formState.wifi"
                placeholder="请输入打卡WiFi"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="上班打卡地址" name="firstClockInAddr">
              <a-input
                v-model:value="formState.firstClockInAddr"
                placeholder="请输入上班打卡地址"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="上班打卡时间" name="firstClockInTime">
              <a-time-picker
                v-model:value="formState.firstClockInTime"
                valueFormat="YYYY-MM-DD HH:mm"
                placeholder="上班打卡时间"
                format="HH:mm"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="下班打卡地址" name="lastClockInAddr">
              <a-input
                v-model:value="formState.lastClockInAddr"
                placeholder="请输入下班打卡地址"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="下班打卡时间" name="lastClockInTime">
              <a-time-picker
                v-model:value="formState.lastClockInTime"
                valueFormat="YYYY-MM-DD HH:mm"
                placeholder="下班打卡时间"
                format="HH:mm"
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
  nextTick,
  toRefs,
} from 'vue'
import { getClockIn, delClockIn, updateClockIn, addClockIn, getClockInById } from '@/api/admin/baseInfo/clockIn'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { IClockIn } from '@/api/admin/baseInfo/clockIn/type'
import { IData } from '@/api/admin/system/dict/data/type'

type Pagination = TableState['pagination']

const columns = [
  {
    title: '姓名',
    key: 'user',
    align: 'center',
    slots: { customRender: 'user' },
  },
  {
    title: '日期',
    key: 'type',
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: '加班时长',
    dataIndex: 'wifi',
    key: 'wifi',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'firstClockInAddr',
    key: 'firstClockInAddr',
    align: 'center',
  },
  {
    title: '开始时间',
    dataIndex: 'firstClockInTime',
    key: 'firstClockInTime',
    align: 'center',
  },
  {
    title: '结束时间',
    dataIndex: 'lastClockInTime',
    key: 'lastClockInTime',
    align: 'center',
  },
  {
    title: '创建时间',
    dataIndex: 'lastClockInTime',
    key: 'lastClockInTime',
    align: 'center',
  },
  {
    title: '审批备注',
    dataIndex: 'lastClockInTime',
    key: 'lastClockInTime',
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
  id: undefined | number;
  type: undefined | string;
  wifi: undefined | string;
  firstClockInAddr: undefined | string;
  firstClockInTime: undefined | string;
  lastClockInAddr: undefined | string;
  lastClockInTime: undefined | string;
}

export default defineComponent({
  components: {
    FormSearch,
  },
  setup() {
    const clockInOptions = ref<IData[]>([])

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
        label: '姓名',
        name: 'nickName',
        value: '',
        placeholder: '请输入操作人员',
      },
      {
        type: 'select',
        label: '状态',
        name: 'status',
        value: undefined,
        placeholder: '请选择状态',
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
      drawerTitle.value = '添加打卡'
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getClockInById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改打卡'
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
      })
    }
    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delClockIn(ids).then(() => {
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
    const formRef = ref()
    const formState: FormState = reactive({
      id: undefined,
      type: '1',
      wifi: undefined,
      firstClockInAddr: undefined,
      firstClockInTime: undefined,
      lastClockInAddr: undefined,
      lastClockInTime: undefined,
    })
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateClockIn(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addClockIn(formState).then((res) => {
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
    // 关闭推窗
    const handleClose = () => {
      formState.id = undefined
      formRef.value.resetFields()
      open.value = false
    }

    const init = () => {
      getList(queryParams)
    }

    onMounted(async () => {
      clockInOptions.value = await getDict('sys_user_clock_in')
      clockInOptions.value.forEach(item => {
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

      open,
      formRef,
      drawerTitle,
      clockInOptions,
      formState,
      handleClose,
      handleAdd,
      handleUpdate,
      handleSubmit
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
