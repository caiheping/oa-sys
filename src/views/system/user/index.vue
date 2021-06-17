<template>
  <div class="p-4">
    <a-row :gutter="15">
      <a-col :span="4">
        <a-input v-model:value="deptName" placeholder="请输入部门名称">
          <template #prefix>
            <svg-icon name="search" class="text-[#d9d9d9]" />
          </template>
        </a-input>
        <a-tree
          :blockNode="true"
          :defaultExpandAll="true"
          :tree-data="treeData"
          v-model:expandedKeys="expandedKeys"
          v-model:selectedKeys="selectedKeys"
        />
      </a-col>
      <a-col :span="20">
        <div class="mb-3">
          <a-form layout="inline" :model="queryParams">
            <a-form-item label="用户名">
              <a-input
                v-model:value="queryParams.userName"
                placeholder="请输入用户名"
              />
            </a-form-item>
            <a-form-item label="部门">
              <a-select
                v-model:value="queryParams.deptName"
                placeholder="请选择部门"
                style="width: 200px"
              >
                <a-select-option value="shanghai">总部</a-select-option>
                <a-select-option value="beijing">测试部门</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="角色">
              <a-select
                v-model:value="queryParams.role"
                placeholder="请选择角色"
                style="width: 200px"
              >
                <a-select-option value="0">超级管理员</a-select-option>
                <a-select-option value="1">员工</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary">搜索</a-button>
                <a-button>重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
        <a-row :gutter="10" class="mb-2">
          <a-col>
            <a-button color="success">新增</a-button>
          </a-col>
          <a-col>
            <a-button color="error">删除</a-button>
          </a-col>
          <a-col>
            <a-button color="warning">导入</a-button>
          </a-col>
          <a-col>
            <a-button color="normal">导出</a-button>
          </a-col>
        </a-row>

        <a-table :dataSource="dataSource" :columns="columns" />
      </a-col>
    </a-row>
  </div>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, watch } from 'vue'
import { TreeDataItem } from 'ant-design-vue/es/tree/Tree'

const treeData: TreeDataItem[] = [
  {
    title: 'parent 1',
    key: '0-0',
    children: [
      {
        title: 'parent 1-0',
        key: '0-0-0',
        children: [
          { title: 'leaf', key: '0-0-0-0' },
          { title: 'leaf', key: '0-0-0-1' },
        ],
      },
    ],
  },
]
export default defineComponent({
  setup() {
    const deptName = ref('')
    const expandedKeys = ref<string[]>(['0-0', '0-0-0'])
    const selectedKeys = ref<string[]>(['0-0-0'])
    const queryParams = reactive({
      userName: undefined,
      deptName: undefined,
      role: undefined,
    })
    watch(expandedKeys, () => {
      console.log('expandedKeys', expandedKeys)
    })
    watch(selectedKeys, () => {
      console.log('selectedKeys', selectedKeys)
    })

    return {
      deptName,
      treeData,
      expandedKeys,
      selectedKeys,
      queryParams,
      dataSource: [
        {
          key: '1',
          name: '胡彦斌',
          age: 32,
          address: '西湖区湖底公园1号',
        },
        {
          key: '2',
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号',
        },
      ],

      columns: [
        {
          title: '姓名',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '年龄',
          dataIndex: 'age',
          key: 'age',
        },
        {
          title: '住址',
          dataIndex: 'address',
          key: 'address',
        },
      ],
    }
  },
})
</script>
