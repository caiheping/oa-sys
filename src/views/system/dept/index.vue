<template>
  <div class="p-4">
    <a-row :gutter="10" class="mb-2">
      <a-col v-has-permi="['system:department:add']">
        <a-button color="success" @click="handleAdd">新增</a-button>
      </a-col>
    </a-row>
    <a-table
      :loading="loading"
      rowKey="deptId"
      :columns="columns"
      :data-source="deptList"
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
            v-has-permi="['system:department:add']"
          >
            新增
          </a-button>
          <a-button
            type="link"
            color="success"
            class="mr-3"
            @click="handleUpdate(record)"
            v-has-permi="['system:department:update']"
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
              v-has-permi="['system:department:delete']"
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
          <a-col :span="12" v-show="formState.parentId !== 0">
            <a-form-item label="上级部门" name="parentId">
              <treeselect
                ref="treeRef"
                class="!mt-[3px]"
                v-model:value="formState.parentId"
                :normalizer="normalizer"
                placeholder="请选择上级部门"
                :options="deptOptions"
                @select="handleTreeSelect"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="部门名称" name="deptName">
              <a-input
                v-model:value="formState.deptName"
                placeholder="请输入部门名称"
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
            <a-form-item label="部门状态" name="status">
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
  getDept,
  getDeptById,
  delDept,
  addDept,
  updateDept,
} from '@/api/admin/system/dept'
import { handleTree } from '@/utils/tools'
import { useUserStore } from '@/store/modules/user'
import { message as Message } from 'ant-design-vue'
import Treeselect from 'vue3-treeselect'
import { formRules } from '@/utils/validate'
import useDrawer from '@/hooks/useDrawer'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'
import 'vue3-treeselect/dist/vue3-treeselect.css'
import { IDept } from '@/api/admin/system/dept/type'

interface FormState {
  deptId: undefined | number
  parentId: undefined | number
  deptName: undefined | string
  orderNum: string | number
  status: string
}

// 表头配置
const columns = [
  {
    title: '部门名称',
    dataIndex: 'deptName',
    key: 'deptName',
  },
  {
    title: '排序',
    dataIndex: 'orderNum',
    key: 'orderNum',
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
    Treeselect,
  },
  setup() {
    const userStore = useUserStore()
    const treeRef = ref()
    const rules = {
      parentId: [
        {
          required: true,
          validator: formRules.number,
          message: '上级部门不能为空',
          trigger: 'change',
        },
      ],
      deptName: [
        { required: true, message: '部门名称不能为空', trigger: 'blur' },
      ],
      orderNum: [
        {
          required: true,
          validator: formRules.number,
          message: '显示排序不能为空',
          trigger: 'blur',
        },
      ],
    }
    const formRef = ref()
    const normalizer = (node) => {
      if (node.children && !node.children.length) {
        delete node.children
      }
      return {
        id: node.deptId,
        label: node.deptName,
        children: node.children,
      }
    }

    // 获取部门树
    const deptOptions = ref<IDept[]>([])
    const deptList = ref<IDept[]>([])
    // 获取部门列表
    const getList = () => {
      getDept().then((res) => {
        // 获取菜单树
        const children = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          userStore.userInfo.deptId
        ).tree
        const parent = res.data.rows.filter(
          (item) => item.deptId === userStore.userInfo.deptId
        )
        parent[0].children = children
        deptList.value = parent
        deptOptions.value = parent
      })
    }
    const formState: FormState = reactive({
      deptId: undefined,
      parentId: undefined,
      deptName: undefined,
      orderNum: '1',
      status: '1',
    })
    // 取消推窗
    const { open, drawerTitle } = useDrawer()
    const handleClose = () => {
      formState.deptId = undefined
      formRef.value.resetFields()
      console.log(formState)
      open.value = false
    }
    // 表单提交
    const handleSubmit = () => {
      console.log(formState)
      formRef.value
        .validate()
        .then(() => {
          if (formState.deptId) {
            updateDept(formState).then((res) => {
              Message.success(res.message)
              getList()
              formState.deptId = undefined
              formRef.value.resetFields()
              open.value = false
            })
          } else {
            addDept(formState).then((res) => {
              Message.success(res.message)
              getList()
              formState.deptId = undefined
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
      delDept(row.deptId).then(() => {
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
      getDept().then((res) => {
        res.data.rows.forEach((item) => {
          item.isDisabled = false
        })
        const children = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          userStore.userInfo.deptId
        ).tree
        const parent = res.data.rows.filter(
          (item) => item.deptId === userStore.userInfo.deptId
        )
        parent[0].children = children
        deptList.value = parent
        deptOptions.value = parent

        open.value = true
        drawerTitle.value = '添加部门'
        if (row != null && row.deptId) {
          nextTick(() => {
            formState.parentId = row.deptId
            if (treeRef.value) {
              treeRef.value.forest.selectedNodeIds.push(row.deptId)
            }
          })
        }
      })
    }
    // 更新按钮操作
    const handleUpdate = (row) => {
      getDept().then((res) => {
        res.data.rows.forEach((item) => {
          if (item.deptId === row.deptId) {
            item.isDisabled = true
          } else {
            item.isDisabled = false
          }
        })
        const children = handleTree(
          res.data.rows,
          'deptId',
          'parentId',
          'children',
          userStore.userInfo.deptId
        ).tree
        const parent = res.data.rows.filter(
          (item) => item.deptId === userStore.userInfo.deptId
        )
        parent[0].children = children
        deptList.value = parent
        deptOptions.value = parent

        getDeptById(row.deptId).then((res) => {
          open.value = true
          drawerTitle.value = '修改部门'
          nextTick(() => {
            Object.keys(formState).forEach((key) => {
              formState[key] = res.data[key]
            })
            treeRef.value.forest.selectedNodeIds.push(res.data.parentId)
          })
        })
      })
    }

    // 上级部门选中事件
    const handleTreeSelect = (node) => {
      formState.parentId = node.deptId
    }

    // 初始化
    const init = () => {
      getList()
    }
    onMounted(() => {
      init()
    })

    return {
      deptList,
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
      deptOptions,
      rules,
      formRef,
      treeRef,
      handleTreeSelect,
    }
  },
  computed: {
    ...mapState(useAppStore, ['loading']),
  },
})
</script>
