<template>
  <div class="p-4">
    <a-row :gutter="10" class="mb-2">
      <a-col>
        <a-button color="success" @click="handleAdd">新增</a-button>
      </a-col>
    </a-row>
    <a-table
      rowKey="id"
      :columns="columns"
      :data-source="menuList"
      :defaultExpandAllRows="true"
    >
      <template #action="{ record }">
        <span>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleAdd(record)"
          >
            新增
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
            title="确定要删除改数据吗？"
            ok-text="确定"
            cancel-text="取消"
            @confirm="confirm(record)"
            @cancel="cancel"
          >
            <a-button type="link" color="error"> 删除 </a-button>
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
                class="!mt-[3px]"
                v-model="formState.parentId"
                :normalizer="normalizer"
                placeholder="请选择上级菜单"
                :options="treeOption"
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
            <a-form-item label="图标" name="icon">
              <IconSelect
                v-model:value="formState.icon"
                placeholder="选择图标"
                @change="handleIconChange"
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
          <a-col :span="12">
            <a-form-item label="显示排序" name="orderNum">
              <a-input-number
                class="!w-[100%]"
                v-model:value="formState.orderNum"
                placeholder="请输入显示排序"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="路由地址" name="path">
              <a-input
                v-model:value="formState.path"
                placeholder="请输入路由地址"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="组件名" name="component">
              <a-input
                v-model:value="formState.component"
                placeholder="请输入组件名"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="权限标识" name="perms">
              <a-input
                v-model:value="formState.perms"
                placeholder="请输入权限标识"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="显示隐藏" name="visible">
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
          <a-col :span="12">
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
          <a-col :span="12">
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
import { defineComponent, onMounted, reactive, ref } from 'vue'
import {
  getMenu,
  getMenuById,
  delMenu,
  addMenu,
  updateMenu,
} from '@/api/admin/system/menu'
import { handleTree } from '@/utils/tools'
import { message as Message } from 'ant-design-vue'
import IconSelect from '@/components/IconSelect/index.vue'
import Treeselect from 'vue3-treeselect'
import 'vue3-treeselect/dist/vue3-treeselect.css'

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
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
  },
  {
    title: '权限标识',
    dataIndex: 'perms',
    key: 'perms',
  },
  {
    title: '组件名',
    dataIndex: 'component',
    key: 'component',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    key: 'createdAt',
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
    const rules = {
      name: [
        {
          required: true,
          message: '请输入角色名称',
          trigger: 'blur',
        },
      ],
    }
    const formRef = ref()
    const menuList = ref([])
    const treeOption = ref([
      {
        id: 0,
        title: '主目录',
        children: [],
      },
    ])
    const getMenuList = () => {
      getMenu().then((res) => {
        menuList.value = handleTree(res.data.rows, 'id', 'parentId').tree
        treeOption.value[0].children = handleTree(res.data.rows, 'id').tree
      })
    }
    const normalizer = (node) => {
      return {
        id: node.id,
        label: node.title,
        children: node.children,
      }
    }
    const open = ref(false)
    const drawerTitle = ref('')
    const formState = reactive({
      id: null,
      parentId: 0,
      menuType: 'M',
      icon: '',
      title: '',
      orderNum: '',
      path: '',
      component: '',
      perms: '',
      visible: '1',
      status: '1',
      keepAlive: '1',
      isFrame: '0',
    })
    const init = () => {
      getMenuList()
    }

    onMounted(() => {
      init()
    })
    const handleClose = () => {
      formState.id = null
      formRef.value.resetFields()
      open.value = false
    }

    const handleSubmit = () => {
      console.log(formState.id)
      if (formState.id) {
        updateMenu(formState).then((res) => {
          Message.success(res.message)
          getMenuList()
          open.value = false
        })
      } else {
        addMenu(formState).then((res) => {
          console.log(res)
          Message.success(res.message)
          getMenuList()
          open.value = false
        })
      }
    }

    const confirm = (row) => {
      delMenu(row.id).then(() => {
        getMenuList()
        Message.success('删除成功')
      })
    }

    const cancel = (e: MouseEvent) => {
      console.log(e)
      Message.success('取消删除')
    }

    /** 新增按钮操作 */
    const handleAdd = (row) => {
      console.log(formState)
      if (row != null && row.id) {
        formState.parentId = row.id
      }
      console.log(row.id)
      open.value = true
      drawerTitle.value = '添加菜单'
    }
    /** 新增按钮操作 */
    const handleUpdate = (row) => {
      getMenuById(row.id).then((res) => {
        Object.keys(formState).forEach((key) => {
          formState[key] = res.data[key]
        })
        open.value = true
        drawerTitle.value = '修改菜单'
      })
    }

    const handleIconChange = (val) => {
      formState.icon = val
      console.log(val)
    }

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
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      normalizer,
      treeOption,
      rules,
      formRef,
      handleIconChange,
    }
  },
})
</script>
