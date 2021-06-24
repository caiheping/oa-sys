<template>
  <div class="p-4">
    <a-row :gutter="10" class="mb-2">
      <a-col>
        <a-button color="success" @click="isOpen = !isOpen">新增</a-button>
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
          <a-button type="link" color="success" class="mr-3">新增</a-button>
          <a-button type="link" color="success" class="mr-3">
            修改1{{ record.name }}
          </a-button>
          <a-button type="link" color="error">删除</a-button>
        </span>
      </template>
    </a-table>

    <BaseForm
      :open="isOpen"
      :title="drawerTitle"
      :formData="formData"
      @close="handleClose"
      @submit="handleSubmit"
    />
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
import BaseForm from './BaseForm.vue'

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
    BaseForm,
  },
  setup() {
    const menuList = ref([])
    const getMenuList = () => {
      getMenu().then((res) => {
        menuList.value = handleTree(res.data.rows, 'id', 'parentId').tree
      })
    }

    const isOpen = ref(false)
    const drawerTitle = ref('新增菜单')
    const formData = reactive([
      {
        type: 'treeselect',
        label: '上级菜单',
        name: 'menuId',
        value: null,
        placeholder: '请选择上级菜单',
        options: [
          {
            id: 'a',
            label: 'a',
            children: [
              {
                id: 'aa',
                label: 'aa',
              },
              {
                id: 'ab',
                label: 'ab',
              },
            ],
          },
          {
            id: 'b',
            label: 'b',
          },
        ],
      },
      {
        type: 'radio-group',
        label: '菜单类型',
        name: 'menuType',
        value: 'M',
        options: [
          { label: '目录', value: 'M' },
          { label: '菜单', value: 'C' },
          { label: '按钮', value: 'F' },
        ],
        fn: {
          change: () => {
            console.log(formData)
          },
        },
      },
      {
        type: 'IconSelect',
        label: 'IconSelect',
        name: 'IconSelect',
        value: 'search',
        placeholder: 'IconSelect',
      },
      {
        type: 'input-number',
        label: 'input-number',
        name: 'name',
        value: '',
        placeholder: 'input-number',
      },
      {
        type: 'cascader',
        label: 'cascader',
        name: 'cascader',
        value: [],
        placeholder: 'cascader',
        options: [],
      },
      {
        type: 'checkbox-group',
        label: 'chegroup',
        name: 'checkbox-group',
        value: [1, 2],
        placeholder: 'checkbox-group',
        options: [
          { label: 'Apple', value: 1 },
          { label: 'fjkdls', value: 2 },
        ],
      },
      {
        type: 'radio-group',
        label: 'radio-group',
        name: 'radio-group',
        value: '1',
        placeholder: 'radio-group',
        options: [
          { label: 'Apple', value: '1' },
          ,
          { label: 'fjkdls', value: '2' },
        ],
        fn: {
          change: () => {
            console.log(formData)
          },
        },
      },
      {
        type: 'date-picker',
        label: 'date-picker',
        name: 'date-picker',
        value: '',
        placeholder: 'date-picker',
      },
      {
        type: 'month-picker',
        label: 'month-picker',
        name: 'month-picker',
        value: '',
        placeholder: 'month-picker',
      },
      {
        type: 'range-picker',
        label: 'range-picker',
        name: 'range-picker',
        value: [],
        placeholder: 'range-picker',
      },
      {
        type: 'week-picker',
        label: 'week-picker',
        name: 'week-picker',
        value: '',
        placeholder: 'week-picker',
      },
      {
        type: 'time-picker',
        label: 'time-picker',
        name: 'time-picker',
        value: '',
        placeholder: 'time-picker',
      },
      {
        type: 'rate',
        label: 'rate',
        name: 'rate',
        value: 2,
        placeholder: 'rate',
      },
      {
        type: 'select',
        label: 'select',
        name: 'select',
        value: [],
        placeholder: 'select',
        options: [],
      },
      {
        type: 'slider',
        label: 'slider',
        name: 'slider',
        value: 20,
        placeholder: 'slider',
      },
      {
        type: 'switch',
        label: 'switch',
        name: 'switch',
        value: false,
        placeholder: 'switch',
      },
    ])

    const init = () => {
      getMenuList()
    }

    onMounted(() => {
      init()
    })

    const handleClose = () => {
      isOpen.value = false
    }

    const handleSubmit = () => {
      console.log(formData)
    }

    return {
      menuList,
      columns,
      getMenuList,
      isOpen,
      drawerTitle,
      formData,
      handleClose,
      handleSubmit,
    }
  },
})
</script>
