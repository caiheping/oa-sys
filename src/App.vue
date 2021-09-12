<template>
  <a-config-provider :locale="locale === 'en' ? enUS : zhCN">
    <AppProvider>
      <router-view />
    </AppProvider>
  </a-config-provider>
</template>

<script lang="ts">
import { defineComponent, provide } from 'vue'
import AppProvider from '@/components/AppProvider/index.vue'
import enUS from 'ant-design-vue/es/locale/en_US'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import { useAppStore } from '@/store/modules/app'
import router from './router'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: { AppProvider },
  setup() {
    const route = useRoute()
    const reload = () => {
      router.replace({
        path: '/redirect' + route.fullPath,
      })
    }
    provide('reload', reload)
    const appStore = useAppStore()
    const { locale } = appStore
    return {
      enUS,
      zhCN,
      locale,
    }
  },
})
</script>
