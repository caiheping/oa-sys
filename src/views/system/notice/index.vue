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
      <a-col v-has-permi="['system:notice:add']">
        <a-button color="success" @click="handleAdd">{{
          t('common.add')
        }}</a-button>
      </a-col>
      <a-col v-has-permi="['system:notice:delete']">
        <a-popconfirm
          :title="t('common.confirmDelete')"
          :ok-text="t('common.okText')"
          :cancel-text="t('common.cancelText')"
          @confirm="confirm"
          @cancel="cancel"
        >
          <a-button :disabled="!hasSelected" color="error">
            {{ t('common.update') }}
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
      :data-source="noticeList"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template #status="{ record }">
        <span>{{ selectDictLabel(statusOptions, record.status) }}</span>
      </template>
      <template #noticeType="{ record }">
        <span>{{ selectDictLabel(typeOptions, record.noticeType) }}</span>
      </template>
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['system:notice:update']"
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
              v-has-permi="['system:notice:delete']"
            >
              {{ t('common.delete') }}
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 新增修改推窗 -->
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
            <a-form-item
              :label="t('routes.notice.noticeTitle')"
              name="noticeTitle"
            >
              <a-input
                v-model:value="formState.noticeTitle"
                :placeholder="t('routes.notice.noticeTitle')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              :label="t('routes.notice.noticeType')"
              name="noticeType"
            >
              <a-select
                v-model:value="formState.noticeType"
                :placeholder="t('routes.notice.noticeTypePlaceholder')"
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
            <a-form-item :label="t('routes.notice.status')" name="status">
              <a-radio-group
                v-model:value="formState.status"
                :options="disableOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item
              :label="t('routes.notice.noticeContent')"
              name="noticeContent"
            >
              <a-textarea
                :rows="3"
                v-model:value="formState.noticeContent"
                :placeholder="t('routes.notice.noticeContentPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="24">
            <a-form-item>
              <a-button type="primary" class="mr-3" @click="handleSubmit">
                {{ t('common.okText') }}
              </a-button>
              <a-button @click="handleClose">{{
                t('common.cancelText')
              }}</a-button>
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
  nextTick,
  toRefs,
  computed,
} from 'vue'
import {
  getNotice,
  getNoticeById,
  delNotice,
  addNotice,
  updateNotice,
} from '@/api/admin/system/notice'
import { getDict, selectDictLabel } from '@/utils/dictFormat'
import useDrawer from '@/hooks/useDrawer'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useAppStore } from '@/store/modules/app'
import { TableState } from 'ant-design-vue/es/table/interface'

import FormSearch from '@/components/FormSearch/index.vue'
import { INotice } from '@/api/admin/system/notice/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

interface FormState {
  id: undefined | number
  noticeTitle: undefined | string
  noticeType: undefined | number
  status: undefined | string
  noticeContent: undefined | string
}
type Pagination = TableState['pagination']

const columns = [
  {
    title: t('routes.notice.noticeTitle'),
    dataIndex: 'noticeTitle',
    key: 'noticeTitle',
    align: 'center',
  },
  {
    title: t('routes.notice.noticeType'),
    dataIndex: 'noticeType',
    key: 'noticeType',
    align: 'center',
    slots: { customRender: 'noticeType' },
  },
  {
    title: t('routes.notice.noticeContent'),
    dataIndex: 'noticeContent',
    key: 'noticeContent',
    align: 'center',
  },
  {
    title: t('routes.notice.status'),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: t('routes.notice.createdBy'),
    dataIndex: 'createdBy',
    key: 'createdBy',
    align: 'center',
  },
  {
    title: t('routes.notice.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.notice.action'),
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
    const loading = computed(() => useAppStore().loading)
    const statusOptions = ref<IData[]>([])
    const disableOptions = ref<IData[]>([])
    const typeOptions = ref<IData[]>([])
    const rules = {
      noticeTitle: [
        {
          required: true,
          message: t('routes.notice.noticeTitleCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
      noticeType: [
        {
          required: true,
          message: t('routes.notice.noticeTypeCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
      status: [
        {
          required: true,
          message: t('routes.notice.statusCannotBeEmpty'),
          trigger: 'change',
        },
      ],
    }
    const formFields = reactive([
      {
        type: 'input',
        label: t('routes.notice.noticeTitle'),
        name: 'noticeTitle',
        value: '',
        placeholder: t('routes.notice.noticeTitlePlaceholder'),
      },
      {
        type: 'select',
        label: t('routes.notice.noticeType'),
        name: 'noticeType',
        value: undefined,
        placeholder: t('routes.notice.noticeTypePlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: typeOptions,
      },
      {
        type: 'select',
        label: t('routes.notice.status'),
        name: 'status',
        value: undefined,
        placeholder: t('routes.notice.statusPlaceholder'),
        normalizer: {
          value: 'dictValue',
          label: 'dictLabel',
        },
        options: statusOptions,
      },
    ])
    // 查询表单操作
    const queryParams = reactive({
      pageNum: 1,
      pageSize: 10,
      noticeTitle: undefined || '',
      noticeType: undefined || '',
      status: undefined || '',
    })

    const handleQuery = (query: {
      noticeTitle: string
      noticeType: string
      status: string
    }) => {
      pagination.value.current = 1
      queryParams.pageNum = pagination.value.current
      queryParams.noticeTitle = query.noticeTitle
      queryParams.noticeType = query.noticeType
      queryParams.status = query.status
      getList(queryParams)
    }
    // 表格操作
    const noticeList = ref<INotice[]>([])
    const pagination = ref({
      total: 0,
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      showTotal: (total) => `共 ${total} 条`,
    })
    const handleTableChange = (page: Pagination) => {
      (pagination.value as Pagination) = page
      queryParams.pageNum = pagination.value.current
      queryParams.pageSize = pagination.value.pageSize
      getList(queryParams)
    }
    const state = reactive({
      selectedRowKeys: [],
    })
    const hasSelected = computed(() => state.selectedRowKeys.length > 0)

    const onSelectChange = (selectedRowKeys) => {
      console.log('selectedRowKeys changed: ', selectedRowKeys)
      state.selectedRowKeys = selectedRowKeys
    }

    const getList = (queryParams?: {}) => {
      getNotice(queryParams).then((res) => {
        console.log(res)
        noticeList.value = res.data.rows
        pagination.value.total = res.data.count
        state.selectedRowKeys = []
      })
    }

    const init = () => {
      getList(queryParams)
    }

    const formRef = ref()
    const formState: FormState = reactive({
      id: undefined,
      noticeTitle: undefined,
      noticeType: undefined,
      status: '1',
      noticeContent: undefined,
    })
    const { open, drawerTitle } = useDrawer()
    console.log(open)
    const handleClose = () => {
      formState.id = undefined
      formRef.value.resetFields()
      console.log(formRef)
      open.value = false
    }
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateNotice(formState).then((res) => {
              Message.success(res.message)
              getList(queryParams)
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addNotice(formState).then((res) => {
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
    // 确认删除
    const confirm = (row) => {
      const ids = row.id || state.selectedRowKeys
      delNotice(ids).then(() => {
        if (
          (ids.length && ids.length === noticeList.value.length) ||
          noticeList.value.length === 1
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

    // 新增按钮操作
    const handleAdd = () => {
      open.value = true
      drawerTitle.value = t('common.add')
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getNoticeById(row.id).then((res) => {
        open.value = true
        drawerTitle.value = t('common.update')
        nextTick(() => {
          Object.keys(formState).forEach((key) => {
            formState[key] = res.data[key]
          })
        })
      })
    }

    onMounted(async () => {
      statusOptions.value = await getDict('sys_normal_disable')
      typeOptions.value = await getDict('sys_notice_type')
      disableOptions.value = await getDict('sys_normal_disable')
      disableOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      init()
    })

    return {
      t,
      loading,
      queryParams,
      formFields,
      handleQuery,
      noticeList,
      columns,
      pagination,
      handleTableChange,
      selectDictLabel,
      statusOptions,
      typeOptions,
      ...toRefs(state),
      hasSelected,
      onSelectChange,

      open,
      drawerTitle,
      formState,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      rules,
      formRef,
      handleClose,
      handleSubmit,
      confirm,
      cancel,
      handleAdd,
      handleUpdate,
      disableOptions,
    }
  },
})
</script>
