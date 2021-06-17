<template>
  <div class="p-5">
    <a-button @click="info">Show info</a-button>

    <span @click="reload">suanxian</span>
    <a-form layout="inline" :model="queryParams">
      <a-form-item label="菜单名称">
        <a-input
          v-model:value="queryParams.menuName"
          placeholder="请输入菜单名称"
        />
      </a-form-item>
      <a-form-item label="状态">
        <a-input
          v-model:value="queryParams.menuName"
          placeholder="请输入菜单状态"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary">{{ t("sys.login.loginButton") }}</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts">
import { inject, defineComponent, reactive, UnwrapRef } from "vue";
import { Modal } from "ant-design-vue";
import { useI18n } from "@/hooks/useI18n";

interface queryParams {
  menuName: string;
  status: number;
}
export default defineComponent({
  setup() {
    const { t } = useI18n();
    const queryParams: UnwrapRef<queryParams> = reactive({
      menuName: "",
      status: 0,
    });
    const info = () => {
      Modal.info({
        title: "some info",
        content: "some info",
      });
    };
    const reload = inject("reload");
    return {
      queryParams,
      info,
      reload,
      t,
    };
  },
});
</script>
