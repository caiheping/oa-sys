<template>
  <!-- 选择图片 -->
  <section class="section">
    <!-- 设置一个按钮 -->
    <a-button class="select-picture">
      <span>选择图片</span>
      <input
        ref="uploadInput"
        type="file"
        accept="image/jpg, image/jpeg, image/png, image/gif"
        @change="selectFile"
      />
    </a-button>
    <!-- 设置一个按钮 -->
  </section>
  <!-- 选择图片 -->

  <!-- 结果预览区 -->
  <section class="section" v-if="result">
    <p>裁切后的Base64图片预览：</p>
    <div class="preview" ref="preview">
      <img :src="result" alt="组合式 API" />
    </div>
    <p>可以按 F12 查看打印的 base64 / blob 结果</p>
  </section>
  <!-- 结果预览区 -->

  <!-- 用于裁切的弹窗 -->
  <a-modal
    v-model:visible="isShowDialog"
    title="图片裁切"
    :maskClosable="false"
  >
    <template #footer>
      <a-button @click="isShowDialog = false">取消</a-button>
      <a-button @click="clear">清除</a-button>
      <a-button @click="reset">重置</a-button>
      <a-button type="primary" @click="getResult">裁切</a-button>
    </template>

    <!-- 图片裁切插件 -->
    <vue-picture-cropper
      :boxStyle="{
        width: '100%',
        height: '100%',
        backgroundColor: '#f8f8f8',
        margin: 'auto',
      }"
      :img="pic"
      :options="{
        viewMode: 1,
        dragMode: 'crop',
        aspectRatio: 16 / 9,
        preview: '.preview',
      }"
    />
    <!-- 图片裁切插件 -->
  </a-modal>
  <!-- 用于裁切的弹窗 -->
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import VuePictureCropper, { cropper } from 'vue-picture-cropper/dist/esm'
export default defineComponent({
  components: {
    VuePictureCropper,
  },
  setup() {
    const uploadInput = ref<HTMLInputElement | null>(null)
    const pic = ref<string>('')
    const result = ref<string>('')
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
        // 显示裁切弹窗
        isShowDialog.value = true
        // 清空已选择的文件
        if (!uploadInput.value) return
        uploadInput.value.value = ''
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
      // 隐藏裁切弹窗
      isShowDialog.value = false
    }
    /**
     * 清除裁切框
     */
    const clear = (): void => {
      cropper.clear()
    }
    /**
     * 重置默认的裁切区域
     */
    const reset = (): void => {
      cropper.reset()
    }
    return {
      // 数据
      uploadInput,
      pic,
      result,
      isShowDialog,
      // 方法
      selectFile,
      getResult,
      clear,
      reset,
    }
  },
})
</script>

<style lang="less" scoped>
.section {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto 40px;
  &:last-child {
    margin-bottom: 0;
  }
  .select-picture {
    position: relative;
    margin-bottom: 1em;
    input {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
    }

    .preview {
      display: flex;
      justify-content: center;
      width: 100%;
      max-width: 800px;
      margin-bottom: 1em;
      img {
        width: auto;
        height: auto;
        max-width: 100%;
        max-height: 100%;
      }
    }
  }
}
</style>