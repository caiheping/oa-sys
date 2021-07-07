<template>
  <a-form name="custom-validation" ref="formRef" :model="formState">
    <a-form-item has-feedback label="Password" name="pass">
      <a-input
        v-model:value="formState.pass"
        type="password"
        autocomplete="off"
      />
    </a-form-item>
    <a-form-item>
      <a-button style="margin-left: 10px" @click="resetForm">Reset</a-button>
    </a-form-item>
  </a-form>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, UnwrapRef } from 'vue'
interface FormState {
  pass: string
}
export default defineComponent({
  setup() {
    const formRef = ref()
    const formState: UnwrapRef<FormState> = reactive({
      pass: '',
    })

    const resetForm = () => {
      formRef.value.resetFields()
    }
    return {
      formState,
      formRef,
      resetForm,
    }
  },
})
</script>