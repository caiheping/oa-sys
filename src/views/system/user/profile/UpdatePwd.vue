<template>
  <a-form
    name="custom-validation"
    ref="formRef"
    :model="formState"
    :rules="rules"
    :labelCol="layout.labelCol"
    :wrapperCol="layout.wrapperCol"
    class="w-100"
  >
    <a-form-item has-feedback label="原始密码" name="oldPassword">
      <a-input-password
        v-model:value="formState.oldPassword"
        placeholder="请输入原始密码"
        type="password"
      />
    </a-form-item>
    <a-form-item has-feedback label="新密码" name="newPassword">
      <a-input-password
        v-model:value="formState.newPassword"
        placeholder="请输入新密码"
        type="password"
      />
    </a-form-item>
    <a-form-item has-feedback label="确认密码" name="confirmPassword">
      <a-input-password
        v-model:value="formState.confirmPassword"
        placeholder="请输入确认新密码"
        type="password"
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
</template>
<script lang="ts">
import { defineComponent, reactive, ref, UnwrapRef } from 'vue'
import { updateUserPwd } from '@/api/admin/system/user'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { message as Message } from 'ant-design-vue'
import { useUserStore } from '@/store/modules/user'

interface FormState {
  oldPassword: undefined | string
  newPassword: undefined | string
  confirmPassword: undefined | string
}
export default defineComponent({
  setup() {
    const formRef = ref()
    const userStore = useUserStore()
    const formState: UnwrapRef<FormState> = reactive({
      oldPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined,
    })

    const equalToPassword = (rule, value) => {
      if (formState.newPassword !== value) {
        return Promise.reject('两次密码不一致')
      } else {
        return Promise.resolve()
      }
    }

    const rules = {
      oldPassword: [
        { required: true, message: '旧密码不能为空', trigger: 'blur' },
      ],
      newPassword: [
        { required: true, message: '新密码不能为空', trigger: 'blur' },
        { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
      ],
      confirmPassword: [
        {
          required: true,
          validator: equalToPassword,
          trigger: 'change',
        },
      ],
    }
    const layout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
    }

    const handleSubmit = () => {
      formRef.value
        .validate()
        .then(() => {
          console.log('values', formState)
          const query = {
            password: formState.oldPassword,
            newPassword: formState.newPassword,
          }
          updateUserPwd(userStore.userInfo.id, query).then((res) => {
            Message.success(res.message)
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
      formState,
      formRef,
      rules,
      layout,
      resetForm,
      handleSubmit,
    }
  },
})
</script>