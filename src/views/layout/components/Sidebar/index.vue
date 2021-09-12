<template>
  <div class="sidebar-container" :style="sidebarStyle">
    <Scrollbar>
      <h2
        v-if="sideBarConfig.showLogo"
        class="
          flex
          items-center
          justify-center
          text-red-200 text-size-20px text-center
          h-50px
        "
      >
        LOGO
      </h2>
      <a-menu
        style="width: 100%"
        :inline-collapsed="collapsed"
        :mode="sideBarConfig.mode"
        :theme="sideBarConfig.theme"
        v-model:openKeys="openKeys"
        v-model:selectedKeys="selectedKeys"
        @click="handleClick"
      >
        <SidebarItem
          v-for="item in sidebarRouters"
          :key="item.name"
          :item="item"
        />
      </a-menu>
    </Scrollbar>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed, watchEffect, ref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRoute } from 'vue-router'
import { Scrollbar } from '@/components/Scrollbar'
import SidebarItem from './SidebarItem.vue'
import router from '@/router'

export default defineComponent({
  components: {
    Scrollbar,
    SidebarItem,
  },
  setup() {
    const permissionStore = usePermissionStore()
    const sidebarRouters = computed(() => permissionStore.sidebarRouters)
    const appStore = useAppStore()
    const isMobile = computed(() => appStore.isMobile)
    const sideBarConfig = computed(() => appStore.sideBarConfig)
    const sidebarStatus = computed(() => appStore.sidebarStatus)
    const collapsed = computed(() => appStore.collapsed)
    const route = useRoute()
    const selectedKeys = ref([''])
    const openKeys = ref([''])
    selectedKeys.value = [route.name as string]
    openKeys.value = [route.matched[0].name as string]
    watchEffect(() => {
      selectedKeys.value = [route.name as string]
      openKeys.value = [route.matched[0].name as string]
    })
    const changeMode = (checked: boolean) => {
      appStore.sideBarConfig.mode = checked ? 'vertical' : 'inline'
    }
    const changeTheme = (checked: boolean) => {
      appStore.sideBarConfig.theme = checked ? 'dark' : 'light'
    }
    const sidebarStyle = computed(() => {
      const style: any = {}
      // 移动端
      if (appStore.isMobile) {
        style.width = appStore.sideBarConfig.width
        if (appStore.sidebarStatus) {
          style.transform = 'translateX(0px)'
        } else {
          style.transform = `translateX(-${appStore.sideBarConfig.width}px)`
        }
      } else {
        // pc
        style.transform = 'translateX(0px)'
        if (appStore.collapsed) {
          style.width = '80px'
        } else {
          style.width = appStore.sideBarConfig.width + 'px'
        }
      }

      if (appStore.sideBarConfig.theme === 'dark') {
        style.background = '#001529'
      } else {
        style.background = '#ffffff'
        style.borderRight = '1px solid #f0f0f0'
      }

      return style
    })
    const handleClick = ({ key }: { key: string }) => {
      // console.log(key)
      router.push({
        name: key,
      })
    }
    return {
      isMobile,
      sideBarConfig,
      sidebarStatus,
      collapsed,
      sidebarRouters,
      changeMode,
      changeTheme,
      sidebarStyle,
      handleClick,
      selectedKeys,
      openKeys,
    }
  },
})
</script>

<style lang="less" scoped>
.sidebar-container {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  width: 200px;
  height: 100vh;
  background: #001529;
  overflow: auto;
  transition: width 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  box-shadow: 2px 0 6px rgb(0 21 41 / 30%);
}
.ant-menu-inline,
.ant-menu-vertical,
.ant-menu-vertical-left {
  border-right: 1px solid transparent;
}
</style>
