<template>
  <a-row :gutter="24">
    <a-col :span="8">
      <a-card :title="t('routes.user.baseInfo')">
        <div class="flex justify-center">
          <img
            @click="isShowDialog = true"
            class="rounded-full block w-50 h-50"
            :src="
              userInfo.avatar ? baseImgUrl + userInfo.avatar : defaultAvatar
            "
            alt=""
          />
        </div>
        <ul>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>{{ t('routes.user.userName') }}</span>
            <span>{{ userInfo.userName }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>{{ t('routes.user.mobile') }}</span>
            <span>{{ userInfo.mobile }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>{{ t('routes.user.email') }}</span>
            <span>{{ userInfo.email }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>{{ t('routes.user.deptId') }}</span>
            <span>{{ userInfo.department.deptName }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>{{ t('routes.user.roleIds') }}</span>
            <span>{{ getRoleName(userInfo.roles) }}</span>
          </li>
          <li
            class="flex justify-between border-b border-b-[#e7eaec] pt-2 pb-2"
          >
            <span>{{ t('routes.user.createdAt') }}</span>
            <span>{{ userInfo.createdAt }}</span>
          </li>
        </ul>
      </a-card>
    </a-col>
    <a-col :span="16">
      <a-card :title="t('routes.user.updateInfo')">
        <a-form name="custom-validation" ref="formRef" :model="formState">
          <a-form-item
            has-feedback
            :label="t('routes.user.nickName')"
            name="nickName"
          >
            <a-input
              v-model:value="formState.nickName"
              :placeholder="t('routes.user.userNamePlaceholder')"
            />
          </a-form-item>
          <a-form-item
            has-feedback
            :label="t('routes.user.mobile')"
            name="mobile"
          >
            <a-input
              v-model:value="formState.mobile"
              :placeholder="t('routes.user.mobilePlaceholder')"
            />
          </a-form-item>
          <a-form-item
            has-feedback
            :label="t('routes.user.email')"
            name="email"
          >
            <a-input
              v-model:value="formState.email"
              :placeholder="t('routes.user.emailPlaceholder')"
            />
          </a-form-item>
          <a-form-item has-feedback :label="t('routes.user.sex')" name="sex">
            <a-radio-group
              v-model:value="formState.sex"
              :options="sexOptions"
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
      </a-card>
    </a-col>
  </a-row>

  <!-- 用于裁切的弹窗 -->
  <a-modal
    v-model:visible="isShowDialog"
    :title="t('routes.user.uploadImage')"
    :maskClosable="false"
    width="750px"
    @cancel="handleCancle"
  >
    <template #footer>
      <a-button class="select-picture">
        <span>{{ t('routes.user.selectImage') }}</span>
        <input
          class="absolute top-0 left-0 w-[100%] h-[100%] opacity-0"
          ref="uploadInput"
          type="file"
          accept="image/jpg, image/jpeg, image/png, image/gif"
          @change="selectFile"
        />
      </a-button>
      <a-button
        type="primary"
        @click="getResult"
        v-has-permi="['system:user:update']"
      >
        {{ t('routes.user.upload') }}
      </a-button>
    </template>
    <div class="flex justify-between">
      <p v-show="!pic" class="text-center w-[100%] text-color-[#999]">
        {{ t('routes.user.selectImagePlaceholder') }}
      </p>
      <!-- 图片裁切插件 -->
      <vue-picture-cropper
        v-show="pic"
        :boxStyle="{
          width: '75%',
          height: '100%',
          backgroundColor: '#f8f8f8',
          margin: 'auto',
        }"
        :img="pic"
        :options="{
          viewMode: 1,
          dragMode: 'crop',
          aspectRatio: 1 / 1,
          preview: '.preview',
        }"
      />
      <!-- 图片裁切插件 -->
      <div v-show="pic" class="preview" ref="preview">
        <img :src="result" alt="" />
      </div>
    </div>
  </a-modal>
  <!-- 用于裁切的弹窗 -->
</template>

<script lang="ts">
import {
  defineComponent,
  UnwrapRef,
  reactive,
  ref,
  onMounted,
  computed,
} from 'vue'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useUserStore } from '@/store/modules/user'
import VuePictureCropper, { cropper } from 'vue-picture-cropper/dist/esm'
import { getDict } from '@/utils/dictFormat'
import {
  updateUser,
  uploadAvatar,
  updateUserImg,
} from '@/api/admin/system/user'
import defaultAvatar from '@/assets/images/profile.jpg'
import { imageUrl } from '@/config'
import { IData } from '@/api/admin/system/dict/data/type'
import { useI18n } from '@/hooks/useI18n'

const { t } = useI18n()

interface FormState {
  nickName: undefined | string
  mobile: undefined | string
  email: undefined | string
  sex: undefined | string
}

export default defineComponent({
  components: {
    VuePictureCropper,
  },
  setup() {
    const userStore = useUserStore()
    const userInfo = computed(() => userStore.userInfo)
    const sexOptions = ref<IData[]>([])
    const baseImgUrl = imageUrl
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

    const pic = ref<string>('')
    const result = ref<string>('')
    const uploadInput = ref<HTMLInputElement | null>(null)
    const isShowDialog = ref<boolean>(false)
    /**
     * 选择图片
     */
    const selectFile = (e: Event): void => {
      // 获取选取的文件
      const target = e.target as HTMLInputElement
      const { files } = target
      if (!files) return
      const file: File = files[0]
      // 转换为base64传给裁切组件
      const reader: FileReader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (): void => {
        // 更新裁切弹窗的图片源
        pic.value = String(reader.result)
      }
    }

    /**
     * 获取裁切结果
     */
    const getResult = (): void => {
      // 获取生成的base64图片地址
      const base64: string = cropper.getDataURL()
      // 获取生成的blob文件信息
      const blob: Blob = cropper.getBlob()
      console.log({ base64, blob })
      // 把base64赋给结果展示区
      result.value = base64
      const formData = new FormData()
      console.log(
        (uploadInput.value as any).files[0].name,
        (uploadInput.value as any).files[0].type
      )
      const file = new window.File(
        [blob],
        (uploadInput.value as any).files[0].name,
        {
          type: (uploadInput.value as any).files[0].type,
        }
      )
      formData.append('file', file)
      uploadAvatar(formData)
        .then((res) => {
          console.log(res)
          const query = {
            avatar: res.data.path,
          }
          updateUserImg(userStore.userInfo.id, query).then((res) => {
            Message.success(res.message)
            isShowDialog.value = false
            window.location.reload()
          })
        })
        .catch((err) => {
          console.log(err)
        })
    }

    const handleCancle = () => {
      // 清空已选择的文件
      if (uploadInput.value) {
        uploadInput.value.value = ''
      }
      pic.value = ''
      result.value = ''
      isShowDialog.value = false
    }

    onMounted(async () => {
      sexOptions.value = await getDict('sys_user_sex')
      sexOptions.value.forEach((item) => {
        item.label = item.dictLabel
        item.value = item.dictValue
      })
    })
    return {
      t,
      userInfo,
      baseImgUrl,
      defaultAvatar,
      getRoleName,

      formState,
      sexOptions,
      formRef,
      result,
      resetForm,
      handleSubmit,
      selectFile,
      getResult,
      isShowDialog,
      pic,
      uploadInput,
      handleCancle,
    }
  },
})
</script>

<style lang="less" scoped>
.preview {
  display: block;
  overflow: hidden;
  width: 125px;
  height: 125px;
  border-radius: 50%;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>