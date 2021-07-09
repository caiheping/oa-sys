<template>
  <a-row :gutter="24">
    <a-col :span="8">
      <a-card title="基本信息">
        <div>
          <img :src="userInfo.avatar" alt="" />
        </div>
        <ul>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>用户名</span>
            <span>{{ userInfo.userName }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>手机号</span>
            <span>{{ userInfo.mobile }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>用户邮箱</span>
            <span>{{ userInfo.email }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>所属部门</span>
            <span>{{ userInfo.department.deptName }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>角色</span>
            <span>{{ getRoleName(userInfo.roles) }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>创建日期</span>
            <span>{{ userInfo.createdAt }}</span>
          </li>
        </ul>
      </a-card>
    </a-col>
    <a-col :span="16">
      <a-card title="信息修改">
        <a-form name="custom-validation" ref="formRef" :model="formState">
          <a-form-item has-feedback label="用户昵称" name="nickName">
            <a-input
              v-model:value="formState.nickName"
              placeholder="请输入用户昵称"
            />
          </a-form-item>
          <a-form-item has-feedback label="手机号码" name="mobile">
            <a-input
              v-model:value="formState.mobile"
              placeholder="请输入手机号码"
            />
          </a-form-item>
          <a-form-item has-feedback label="用户邮箱" name="email">
            <a-input v-model:value="formState.email" placeholder="请输入邮箱" />
          </a-form-item>
          <a-form-item has-feedback label="性别" name="sex">
            <a-radio-group
              v-model:value="formState.sex"
              :options="[
                { label: '男', value: '1' },
                { label: '女', value: '0' },
              ]"
            />
          </a-form-item>
          <a-form-item>
            <a-button
              type="primary"
              html-type="submit"
              class="mr-3"
              @click="handleSubmit"
            >
              保存修改
            </a-button>
            <a-button @click="resetForm">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>
</template>

<script lang="ts">
import { defineComponent, UnwrapRef, reactive, ref } from 'vue'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useUserStore } from '@/store/modules/user'
import { mapState } from 'pinia'

import { updateUser } from '@/api/admin/system/user'

interface FormState {
  nickName: undefined | string
  mobile: undefined | string
  email: undefined | string
  sex: undefined | string
}

export default defineComponent({
  setup() {
    const userStore = useUserStore()
    console.log(userStore)
    const getRoleName = (roles) => {
      return roles.map((item) => item.roleName).join()
    }

    const formRef = ref()
    const formState: UnwrapRef<FormState> = reactive({
      nickName: userStore.userInfo.nickName,
      mobile: userStore.userInfo.mobile,
      email: userStore.userInfo.email,
      sex: userStore.userInfo.sex,
    })

    const handleSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          console.log('values', formState)
          const query = {
            nickName: userStore.userInfo.nickName,
            mobile: userStore.userInfo.mobile,
            email: userStore.userInfo.email,
            sex: userStore.userInfo.sex,
            roleIds: [],
          }
          Object.keys(userStore.userInfo).forEach((key) => {
            query[key] = userStore.userInfo[key]
          })
          query.nickName = formState.nickName
          query.mobile = formState.mobile
          query.email = formState.email
          query.sex = formState.sex
          query.roleIds = userStore.userInfo.roles.map((list) => list.id)

          updateUser(query).then((res) => {
            Message.success(res.message)
            window.location.reload()
          })
        })
        .catch((error: ValidateErrorEntity<FormState>) => {
          console.log('error', error)
        })
    }
    const resetForm = () => {
      formRef.value.resetFields()
    }
    return {
      getRoleName,

      formState,
      formRef,
      resetForm,
      handleSubmit,
    }
  },
  computed: {
    ...mapState(useUserStore, ['userInfo']),
  },
})
</script>