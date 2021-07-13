<template>
  <a-row :gutter="24">
    <a-col :span="8">
      <a-card title="基本信息">
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
              v-has-permi="['system:user:update']"
            >
              保存修改
            </a-button>
            <a-button @click="resetForm">重置</a-button>
          </a-form-item>
        </a-form>
      </a-card>
    </a-col>
  </a-row>

  <!-- 用于裁切的弹窗 -->
  <a-modal
    v-model:visible="isShowDialog"
    title="上传图片"
    :maskClosable="false"
    width="750px"
    @cancel="handleCancle"
  >
    <template #footer>
      <a-button class="select-picture">
        <span>选择图片</span>
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
        上传
      </a-button>
    </template>
    <div class="flex justify-between">
      <p v-show="!pic" class="text-center w-[100%] text-color-[#999]">
        请选择图片
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
import { defineComponent, UnwrapRef, reactive, ref } from 'vue'
import { message as Message } from 'ant-design-vue'
import { ValidateErrorEntity } from 'ant-design-vue/es/form/interface'
import { useUserStore } from '@/store/modules/user'
import { mapState } from 'pinia'
import VuePictureCropper, { cropper } from 'vue-picture-cropper/dist/esm'

import {
  updateUser,
  uploadAvatar,
  updateUserImg,
} from '@/api/admin/system/user'
import defaultAvatar from '../../../../assets/images/profile.jpg'

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
    const baseImgUrl = import.meta.env.VITE_GLOB_IMAGE_URL
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
    return {
      baseImgUrl,
      defaultAvatar,
      getRoleName,

      formState,
      formRef,
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
  computed: {
    ...mapState(useUserStore, ['userInfo']),
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