<script lang="ts">
import { defineComponent, ref, onMounted, watchEffect } from "vue";
import { useAppStore } from "@/store/modules/app";

export default defineComponent({
  name: "AppProvider",
  inheritAttrs: false,
  setup(props, { slots }) {
    const appStore = useAppStore();
    const w = ref(document.body.clientWidth);
    // 监听浏览器窗口变化
    watchEffect(() => {
      if (w.value <= 640) {
        appStore.setMobile(true);
        appStore.setCollapsed(false);
      } else {
        appStore.setMobile(false);
        appStore.setSidebar(false);
      }
    });
    onMounted(() => {
      // 监听窗口事件，判断窗口类型是否是移动端
      window.addEventListener("resize", () => {
        w.value = document.body.clientWidth;
      });
    });
    return () => slots.default?.();
  },
});
</script>
