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
    <a-form-item
      has-feedback
      :label="t('routes.user.oldPassword')"
      name="oldPassword"
    >
      <a-input-password
        v-model:value="formState.oldPassword"
        :placeholder="t('routes.user.oldPasswordPlaceholder')"
        type="password"
      />
    </a-form-item>
    <a-form-item
      has-feedback
      :label="t('routes.user.newPassword')"
      name="newPassword"
    >
      <a-input-password
        v-model:value="formState.newPassword"
        :placeholder="t('routes.user.newPasswordPlaceholder')"
        type="password"
      />
    </a-form-item>
    <a-form-item
      has-feedback
      :label="t('routes.user.confirmPassword')"
      name="confirmPassword"
    >
      <a-input-password
        v-model:value="formState.confirmPassword"
        :placeholder="t('routes.user.confirmPasswordPlaceholder')"
        type="password"
      />
    </a-form-item>
    <a-form-item>
      <a-button
        type="primary"
        html-type="submit"
        class="mr-3"
        @click="handleSubmit"
        v-has-permi="['system:user:update']"
      >
        {{ t('routes.user.saveUpdate') }}
      </a-button>
      <a-button @click="resetForm">{{ t('routes.user.reset') }}</a-button>
    </a-form-item>
  </a-form>
</template>
<script lang="ts">
import { defineComponent, reactive, ref, UnwrapRef } from 'vue'
import { updateUserPwd } from '@/api/admin/system/user'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { message as Message } from 'ant-design-vue'
import { useUserStore } from '@/store/modules/user'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

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
        return Promise.reject(t('routes.user.InconsistentPasswords'))
      } else {
        return Promise.resolve()
      }
    }

    const rules = {
      oldPassword: [
        {
          required: true,
          message: t('routes.user.oldPasswordCannotBeEmpty'),
          trigger: 'blur',
        },
      ],
      newPassword: [
        {
          required: true,
          message: t('routes.user.newPasswordCannotBeEmpty'),
          trigger: 'blur',
        },
        {
          min: 6,
          max: 20,
          message: t('routes.user.checkStringLength'),
          trigger: 'blur',
        },
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
      t,
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