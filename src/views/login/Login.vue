<template>
  <div class="mr-25 bg-white p-6 w-100">
    <h3 class="text-xl text-center mb-5 font-bold">登 录</h3>
    <a-form
      name="custom-validation"
      ref="formRef"
      :model="formState"
      :rules="rules"
      v-bind="layout"
      @finish="handleFinish"
      @finishFailed="handleFinishFailed"
    >
      <a-form-item name="userName">
        <a-input
          size="large"
          v-model:value="formState.userName"
          placeholder="请输入用户名"
        >
          <template #prefix>
            <UserOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item name="password">
        <a-input
          size="large"
          v-model:value="formState.password"
          type="password"
          placeholder="请输入密码"
        >
          <template #prefix>
            <LockOutlined style="color: rgba(0, 0, 0, 0.25)" />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item name="captcha" :wrapper-col="{ span: 24, offset: 0 }">
        <div style="display: flex">
          <a-input
            size="large"
            v-model:value="formState.captcha"
            placeholder="请输入验证码"
          >
            <template #prefix>
              <SafetyOutlined style="color: rgba(0, 0, 0, 0.25)" />
            </template>
          </a-input>
          <div class="login-captcha" v-html="codeHtml" @click="getCode"></div>
        </div>
      </a-form-item>
      <a-checkbox v-model:checked="checked">记住我？</a-checkbox>
      <a-form-item :wrapper-col="{ span: 24, offset: 0 }">
        <a-button
          class="mt-5"
          type="primary"
          html-type="submit"
          size="large"
          style="width: 100%"
          >{{ t('sys.login.loginButton') }}</a-button
        >
      </a-form-item>
    </a-form>
  </div>
</template>
<script lang="ts">
import {
  UserOutlined,
  LockOutlined,
  SafetyOutlined,
} from '@ant-design/icons-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import {
  defineComponent,
  reactive,
  ref,
  UnwrapRef,
  onMounted,
  unref,
} from 'vue'
import { getCodeImg } from '@/api/login'
import { useI18n } from '@/hooks/useI18n'
import { useUserStore } from '@/store/modules/user'
import Cookies from 'js-cookie'
import router from '@/router'

interface FormState {
  userName: string | undefined
  password: string | undefined
  captcha: string | undefined
}
export default defineComponent({
  components: {
    UserOutlined,
    LockOutlined,
    SafetyOutlined,
  },
  setup() {
    const userStore = useUserStore()
    const checked = ref(false)
    const { t } = useI18n()
    const formRef = ref()
    const formState: UnwrapRef<FormState> = reactive({
      userName: '',
      password: '',
      captcha: '',
    })
    const layout = {
      labelCol: { span: 0 },
      wrapperCol: { span: 24 },
    }
    const rules = {
      userName: [
        {
          required: true,
          message: '请输入用户名',
          trigger: 'blur',
        },
      ],
      password: [
        {
          required: true,
          message: '请输入密码',
          trigger: 'blur',
        },
      ],
      captcha: [
        {
          required: true,
          message: '请输入验证码',
          trigger: 'blur',
        },
      ],
    }

    // 获取验证码
    const codeHtml: any = ref()
    const getCode = () => {
      return getCodeImg().then((res) => {
        codeHtml.value = res
      })
    }
    // 登录
    const handleFinish = async () => {
      const params = unref(formState)
      const res = await userStore.Login(params, checked.value)
      console.log(res.code)
      if (res && res.code === 0) {
        router.replace('/layout/home')
      }
    }
    // 校验失败
    const handleFinishFailed = (errors: ValidateErrorEntity<FormState>) => {
      console.log(errors)
    }

    // 获取cookie
    const getCookie = () => {
      formState.userName = Cookies.get('userName')
      formState.password = Cookies.get('password')
      checked.value = Cookies.get('rememberMe') === 'true' ? true : false
    }
    onMounted(async () => {
      getCookie()
      await getCode()
    })

    return {
      formState,
      formRef,
      layout,
      rules,
      handleFinishFailed,
      handleFinish,
      codeHtml,
      getCode,
      t,
      checked,
    }
  },
})
</script>

<style lang="less">
.login-captcha {
  height: 40px;
  svg {
    height: 100%;
  }
}
</style>
