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
      <template #clock_in="{ record }">
        <span>{{ record.clock_in?.createdAt }}</span>
      </template>
      <template #type="{ record }">
        <span>{{ selectDictLabel(makeUpCardTypeOptions, record.type) }}</span>
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
            <a-form-item label="打卡id" name="clockInId">
              <a-input
                v-model:value="formState.clockInId"
                placeholder="请输入打卡id"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="补卡类型" name="type">
              <a-select
                v-model:value="formState.type"
                placeholder="请输入补卡类型"
              >
                <a-select-option
                  v-for="item in makeUpCardTypeOptions"
                  :key="item.id"
                  :value="item.dictValue"
                >
                  {{ item.dictLabel }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item label="补卡原因" name="makeUpCardReason">
              <a-textarea
                :rows="3"
                v-model:value="formState.makeUpCardReason"
                placeholder="请输入补卡原因"
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
  VNodeChild,
} from 'vue'
import {
  getMakeUpCard,
  delMakeUpCard,
  updateMakeUpCard,
  addMakeUpCard,
  getMakeUpCardById,
} from '@/api/admin/examineAndApprove/makeUpCard'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'
import { TableState } from 'ant-design-vue/es/table/interface'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import useDrawer from '@/hooks/useDrawer'
import { IMakeUpCard } from '@/api/admin/examineAndApprove/makeUpCard/type'
import { IData } from '@/api/admin/system/dict/data/type'

type Pagination = TableState['pagination']

interface MenuInfo {
  key: string
  keyPath: string[]
  item: VNodeChild
  domEvent: MouseEvent
}

interface FormState {
  id: undefined | number
  clockInId: undefined | number
  type: undefined | string
  makeUpCardReason: undefined | string
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
    title: '待补卡日期',
    key: 'clock_in',
    align: 'center',
    slots: { customRender: 'clock_in' },
  },
  {
    title: '补卡类型',
    dataIndex: 'type',
    key: 'type',
    align: 'center',
    slots: { customRender: 'type' },
  },
  {
    title: '补卡原因',
    dataIndex: 'makeUpCardReason',
    key: 'makeUpCardReason',
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
  },
  setup() {
    const examineAndApproveStatusOptions = ref<IData[]>([])
    const makeUpCardTypeOptions = ref<IData[]>([])

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
        placeholder: '请输入操作人员',
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
    const tableList = ref<IMakeUpCard[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })
    const activeClickDropDownObj = ref<IMakeUpCard>()

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
        await getMakeUpCardById(activeClickDropDownObj.value.id).then((res) => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
        formState.status = key
        updateMakeUpCard(formState).then((res) => {
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
      getMakeUpCard(queryParams).then((res) => {
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
      getMakeUpCardById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = '修改'
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
      delMakeUpCard(ids).then(() => {
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
      clockInId: undefined,
      type: undefined,
      makeUpCardReason: undefined,
    })
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateMakeUpCard(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addMakeUpCard(formState).then((res) => {
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
      examineAndApproveStatusOptions.value = await getDict(
        'sys_examineAndApprove_status'
      )
      makeUpCardTypeOptions.value = await getDict('sys_makeUpCard_type')
      examineAndApproveStatusOptions.value.forEach((item) => {
        item.value = item.dictValue
        item.lable = item.dictLabel
      })
      makeUpCardTypeOptions.value.forEach((item) => {
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

      open,
      formRef,
      drawerTitle,
      examineAndApproveStatusOptions,
      makeUpCardTypeOptions,
      formState,
      handleClose,
      handleAdd,
      handleUpdate,
      handleSubmit,
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
