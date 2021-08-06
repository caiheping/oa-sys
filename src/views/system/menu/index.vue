<template>
  <div class="p-4">
    <a-row :gutter="10" class="mb-2">
      <a-col v-has-permi="['system:menu:add']">
        <a-button color="success" @click="handleAdd"> 新增 </a-button>
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
          <span>{{ record.status === '1' ? '正常' : '停用' }}</span>
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
            新增
          </a-button>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['system:menu:update']"
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
              v-has-permi="['system:menu:delete']"
            >
              删除
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
            <a-form-item label="上级菜单" name="parentId">
              <treeselect
                ref="treeRef"
                class="!mt-[3px]"
                v-model="formState.parentId"
                :normalizer="normalizer"
                placeholder="请选择上级菜单"
                :options="treeOptions"
                @select="handleTreeSelect"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="菜单类型" name="menuType">
              <a-radio-group
                v-model:value="formState.menuType"
                name="menuType"
                :options="[
                  { label: '目录', value: 'M' },
                  { label: '菜单', value: 'C' },
                  { label: '按钮', value: 'F' },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="菜单名称" name="title">
              <a-input
                v-model:value="formState.title"
                placeholder="请输入菜单名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item label="菜单图标" name="icon">
              <IconSelect
                v-model:value="formState.icon"
                placeholder="选择菜单图标"
                @change="handleIconChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="显示排序" name="orderNum">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.orderNum"
                placeholder="请输入显示排序"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item label="路由地址" name="path">
              <a-input
                v-model:value="formState.path"
                placeholder="请输入路由地址"
              />
            </a-form-item>
          </a-col>
          <a-col
            :span="12"
            v-if="formState.menuType === 'C' || formState.menuType === 'M'"
          >
            <a-form-item label="组件名" name="component">
              <!-- <a-input
                v-model:value="formState.component"
                placeholder="请输入组件名"
              /> -->
              <a-select
                placeholder="请输入组件名"
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
            <a-form-item label="权限标识" name="perms">
              <a-input
                v-model:value="formState.perms"
                placeholder="请输入权限标识"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item label="显示状态" name="visible">
              <a-radio-group
                v-model:value="formState.visible"
                name="menuType"
                :options="[
                  { label: '显示', value: '1' },
                  { label: '隐藏', value: '0' },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="菜单状态" name="status">
              <a-radio-group
                v-model:value="formState.status"
                name="menuType"
                :options="[
                  { label: '正常', value: '1' },
                  { label: '停用', value: '0' },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item label="是否缓存" name="keepAlive">
              <a-radio-group
                v-model:value="formState.keepAlive"
                name="menuType"
                :options="[
                  { label: '缓存', value: 1 },
                  { label: '不缓存', value: 0 },
                ]"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" v-if="formState.menuType !== 'F'">
            <a-form-item label="是否外链" name="isFrame">
              <a-radio-group
                v-model:value="formState.isFrame"
                name="menuType"
                :options="[
                  { label: '是', value: '1' },
                  { label: '否', value: '0' },
                ]"
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
import { defineComponent, onMounted, reactive, ref, nextTick } from 'vue'
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
import { mapState } from 'pinia'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { IMenu } from '@/api/admin/system/menu/type'

// 表头配置
const columns = [
  {
    title: '菜单名称',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '图标',
    dataIndex: 'icon',
    key: 'icon',
    align: 'center',
    slots: { customRender: 'icon' },
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
    align: 'center',
  },
  {
    title: '权限标识',
    dataIndex: 'perms',
    key: 'perms',
    align: 'center',
  },
  {
    title: '组件名',
    dataIndex: 'component',
    key: 'component',
    align: 'center',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    align: 'center',
    slots: { customRender: 'status' },
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
    IconSelect,
    Treeselect,
  },
  setup() {
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
        title: '主目录',
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
        console.log(typeof value === 'string' && value.charAt(0) !== '/')
        if (typeof value === 'string' && value.charAt(0) !== '/') {
          console.log(999)
          return Promise.reject('菜单类型为目录，必须以 / 开头')
        }
      }
      return Promise.resolve()
    }
    const rules = {
      parentId: [
        {
          required: true,
          validator: formRules.number,
          message: '上级菜单不能为空',
          trigger: 'change',
        },
      ],
      title: [{ required: true, message: '菜单名称不能为空', trigger: 'blur' }],
      orderNum: [
        {
          required: true,
          validator: formRules.number,
          message: '显示排序不能为空',
          trigger: 'blur',
        },
      ],
      path: [
        {
          required: true,
          message: '路由地址不能为空',
          trigger: 'blur',
        },
        {
          validator: checkType,
          trigger: 'blur',
        },
      ],
      component: [{ required: true, message: '组件不能为空', trigger: 'blur' }],
      perms: [{ required: true, message: '权限标识不能为空', trigger: 'blur' }],
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
        Message.success('删除成功')
      })
    }
    // 取消删除
    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success('取消删除')
    }

    // 新增按钮操作
    const handleAdd = (row) => {
      getMenu().then((res) => {
        res.data.rows.forEach((item) => {
          item.isDisabled = false
        })
        treeOptions.value[0].children = handleTree(res.data.rows, 'id').tree

        open.value = true
        drawerTitle.value = '添加菜单'
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
          drawerTitle.value = '修改菜单'
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
    onMounted(() => {
      init()
    })

    return {
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
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
