<template>
  <div class="p-4">
    <a-row :gutter="10" class="mb-2">
      <a-col v-has-permi="['system:menu:add']">
        <a-button color="success" @click="handleAdd">
          {{ t('common.add') }}
        </a-button>
      </a-col>
    </a-row>
    <a-table
      :loading="loading"
      rowKey="id"
      :columns="columns"
      :data-source="menuList"
      :defaultExpandAllRows="true"
      :pagination="false"
    >
      <template #icon="{ record }">
        <div class="flex justify-center">
          <svg-icon :name="record.icon" />
        </div>
      </template>
      <template #status="{ record }">
        <div class="flex justify-center">
          <span>{{
            record.status === '1' ? t('common.normal') : t('common.deactivate')
          }}</span>
        </div>
      </template>
      <template #visible="{ record }">
        <div class="flex justify-center">
          <span>{{
            record.visible === '1' ? t('common.show') : t('common.hidden')
          }}</span>
        </div>
      </template>
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleAdd(record)"
            v-has-permi="['system:menu:add']"
          >
            {{ t('common.add') }}
          </a-button>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['system:menu:update']"
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
              v-has-permi="['system:menu:delete']"
            >
              {{ t('common.delete') }}
            </a-button>
          </a-popconfirm>
        </span>
      </template>
    </a-table>

    <!-- 操作推窗 -->
    <a-drawer
      width="50%"
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
          <a-col :span="12">
            <a-form-item :label="t('routes.menu.parentId')" name="parentId">
              <treeselect
                ref="treeRef"
                class="!mt-[3px]"
                v-model="formState.parentId"
                :normalizer="normalizer"
                :placeholder="t('routes.menu.parentIdPlaceholder')"
                :options="treeOptions"
                @select="handleTreeSelect"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.menu.menuType')" name="menuType">
              <a-radio-group
                v-model:value="formState.menuType"
                :options="[
                  { label: t('routes.menu.M'), value: 'M' },
                  { label: t('routes.menu.C'), value: 'C' },
                  { label: t('routes.menu.F'), value: 'F' },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.menu.title')" name="title">
              <a-input
                v-model:value="formState.title"
                :placeholder="t('routes.menu.titlePlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item :label="t('routes.menu.icon')" name="icon">
              <IconSelect
                v-model:value="formState.icon"
                :placeholder="t('routes.menu.iconPlaceholder')"
                @change="handleIconChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.menu.orderNum')" name="orderNum">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.orderNum"
                :placeholder="t('routes.menu.orderNumPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item :label="t('routes.menu.path')" name="path">
              <a-input
                v-model:value="formState.path"
                :placeholder="t('routes.menu.pathNumPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col
            :span="12"
            v-if="formState.menuType === 'C' || formState.menuType === 'M'"
          >
            <a-form-item :label="t('routes.menu.component')" name="component">
              <a-select
                :placeholder="t('routes.menu.componentPlaceholder')"
                v-model:value="formState.component"
              >
                <a-select-option
                  v-for="item in dynamicComponents"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType === 'F'">
            <a-form-item :label="t('routes.menu.perms')" name="perms">
              <a-input
                v-model:value="formState.perms"
                :placeholder="t('routes.menu.permsPlaceholder')"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item :label="t('routes.menu.visible')" name="visible">
              <a-radio-group
                v-model:value="formState.visible"
                :options="showOrHideOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item :label="t('routes.menu.status')" name="status">
              <a-radio-group
                v-model:value="formState.status"
                :options="disableOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item :label="t('routes.menu.keepAlive')" name="keepAlive">
              <a-radio-group
                v-model:value="formState.keepAlive"
                :options="[
                  { label: t('routes.menu.cache'), value: 1 },
                  { label: t('routes.menu.noCache'), value: 0 },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item :label="t('routes.menu.isFrame')" name="isFrame">
              <a-radio-group
                v-model:value="formState.isFrame"
                :options="[
                  { label: t('routes.menu.yes'), value: '1' },
                  { label: t('routes.menu.no'), value: '0' },
                ]"
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
  onMounted,
  reactive,
  ref,
  nextTick,
  computed,
} from 'vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import {
  getMenu,
  getMenuById,
  delMenu,
  addMenu,
  updateMenu,
} from '@/api/admin/system/menu'
import { handleTree } from '@/utils/tools'
import dynamicRouter from '@/router/dynamicRouter'
import { message as Message } from 'ant-design-vue'
import IconSelect from '@/components/IconSelect/index.vue'
import Treeselect from 'vue3-treeselect'
import { formRules } from '@/utils/validate'
import useDrawer from '@/hooks/useDrawer'
import { useAppStore } from '@/store/modules/app'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { IMenu } from '@/api/admin/system/menu/type'
import { IData } from '@/api/admin/system/dict/data/type'
import { getDict } from '@/utils/dictFormat'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

// 表头配置
const columns = [
  {
    title: t('routes.menu.title'),
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: t('routes.menu.icon'),
    dataIndex: 'icon',
    key: 'icon',
    align: 'center',
    slots: { customRender: 'icon' },
  },
  {
    title: t('routes.menu.orderNum'),
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center',
  },
  {
    title: t('routes.menu.perms'),
    dataIndex: 'perms',
    key: 'perms',
    align: 'center',
  },
  {
    title: t('routes.menu.component'),
    dataIndex: 'component',
    key: 'component',
    align: 'center',
  },
  {
    title: t('routes.menu.status'),
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' },
  },
  {
    title: t('routes.menu.visible'),
    dataIndex: 'visible',
    key: 'visible',
    align: 'center',
    slots: { customRender: 'visible' },
  },
  {
    title: t('routes.menu.createdAt'),
    dataIndex: 'createdAt',
    key: 'createdAt',
    align: 'center',
  },
  {
    title: t('routes.menu.action'),
    key: 'action',
    align: 'center',
    slots: { customRender: 'action' },
  },
]

export default defineComponent({
  components: {
    IconSelect,
    Treeselect,
  },
  setup() {
    const loading = computed(() => useAppStore().loading)
    const disableOptions = ref<IData[]>([])
    const showOrHideOptions = ref<IData[]>([])
    const treeRef = ref()
    const dynamicComponents = ref(Object.keys(dynamicRouter))

    const formRef = ref()
    const normalizer = (node) => {
      return {
        id: node.id,
        label: node.title,
        children: node.children,
      }
    }

    // 获取菜单树
    const treeOptions = ref<any[]>([
      {
        id: 0,
        title: t('routes.menu.homeDirectory'),
        children: [],
      },
    ])
    const menuList = ref<IMenu[]>([])
    // 获取菜单列表/转成树格式
    const getList = () => {
      getMenu().then((res) => {
        menuList.value = handleTree(res.data.rows, 'id', 'parentId').tree
        treeOptions.value[0].children = handleTree(res.data.rows, 'id').tree
      })
    }
    const formState = reactive({
      id: undefined,
      parentId: undefined,
      menuType: 'M',
      icon: undefined,
      title: undefined,
      orderNum: '1',
      path: undefined,
      component: undefined,
      perms: undefined,
      visible: '1',
      status: '1',
      keepAlive: 1,
      isFrame: '0',
    })

    const checkType = (rule, value: string) => {
      if (formState.menuType === 'M') {
        if (typeof value === 'string' && value.charAt(0) !== '/') {
          return Promise.reject(t('routes.menu.menuTypeRule'))
        }
      }
      return Promise.resolve()
    }
    const rules = {
      parentId: [
        {
          required: true,
          validator: formRules.number,
          message: t('routes.menu.parentIdCannotBeEmpty'),
          trigger: 'change',
        },
      ],
      title: [
        {
          required: true,
          message: t('routes.menu.titleCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
      orderNum: [
        {
          required: true,
          validator: formRules.number,
          message: t('routes.menu.orderNumCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
      path: [
        {
          required: true,
          message: t('routes.menu.pathCannotBeEmpty'),
          trigger: 'blur',
        },
        {
          validator: checkType,
          trigger: 'blur',
        },
      ],
      component: [
        {
          required: true,
          message: t('routes.menu.componentCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
      perms: [
        {
          required: true,
          message: t('routes.menu.permsCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
    }
    // 取消推窗
    const { open, drawerTitle } = useDrawer()
    const handleClose = () => {
      formState.id = undefined
      formRef.value.resetFields()
      open.value = false
    }
    // 表单提交
    const handleSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          if (formState.id) {
            updateMenu(formState).then((res) => {
              Message.success(res.message)
              getList()
              formState.id = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addMenu(formState).then((res) => {
              Message.success(res.message)
              getList()
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
      delMenu(row.id).then(() => {
        getList()
        Message.success(t('common.deleteSuccess'))
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success(t('common.cancelDelete'))
    }

    // 新增按钮操作
    const handleAdd = (row) => {
      getMenu().then((res) => {
        res.data.rows.forEach((item) => {
          item.isDisabled = false
        })
        treeOptions.value[0].children = handleTree(res.data.rows, 'id').tree

        open.value = true
        drawerTitle.value = t('common.add')
        if (row != null && row.id) {
          nextTick(() => {
            formState.parentId = row.id
            treeRef.value.forest.selectedNodeIds.push(row.id)
          })
        }
      })
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getMenu().then((res) => {
        res.data.rows.forEach((item) => {
          if (item.id === row.id) {
            item.isDisabled = true
          } else {
            item.isDisabled = false
          }
        })
        treeOptions.value[0].children = handleTree(res.data.rows, 'id').tree

        getMenuById(row.id).then((res) => {
          open.value = true
          drawerTitle.value = t('common.update')
          nextTick(() => {
            Object.keys(formState).forEach((key) => {
              formState[key] = res.data[key]
            })
            treeRef.value.forest.selectedNodeIds.push(res.data.parentId)
          })
        })
      })
    }
    // 表单图标改变事件
    const handleIconChange = (val) => {
      formState.icon = val
    }
    // 上级部门选中事件
    const handleTreeSelect = (node) => {
      formState.parentId = node.id
    }

    // 初始化
    const init = () => {
      getList()
    }
    onMounted(async () => {
      disableOptions.value = await getDict('sys_normal_disable')
      showOrHideOptions.value = await getDict('sys_show_hide')
      disableOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      showOrHideOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
      init()
    })

    return {
      t,
      loading,
      menuList,
      confirm,
      cancel,
      columns,
      handleAdd,
      handleUpdate,

      open,
      drawerTitle,
      handleClose,
      handleSubmit,
      formState,
      dynamicComponents,
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      normalizer,
      treeOptions,
      rules,
      formRef,
      handleIconChange,
      treeRef,
      handleTreeSelect,
      disableOptions,
      showOrHideOptions,
    }
  },
})
</script>
