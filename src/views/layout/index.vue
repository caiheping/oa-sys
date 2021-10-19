<template>
  <!-- 是否是移动端 -->
  <teleport to="body">
    <div
      @click="toggleDrawer"
      v-if="isMobile && sidebarStatus"
      class="drawer-bg"
    ></div>
  </teleport>

  <!-- 左侧栏 -->
  <sidebar />
  <!-- 右边内容 -->
  <div
    class="main-container overflow-x-hidden"
    :style="{
      marginLeft: isMobile
        ? '0px'
        : collapsed
          ? '80px'
          : sideBarConfig.width + 'px',
    }"
  >
    <div class="header" :style="headerStyle">
      <!-- 头部 -->
      <navbar />
      <!-- 标签 -->
      <Tabs v-if="headerConfig.showTabs" />
    </div>
    <!-- 主体 -->
    <div
      class="main-container-content"
      :style="{
        paddingTop: headerConfig.showTabs ? '80px' : '50px',
      }"
    >
      <router-view v-slot="{ Component }">
        <keep-alive>
          <transition name="fade-transform" mode="out-in">
            <component :is="Component" />
          </transition>
        </keep-alive>
      </router-view>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import Sidebar from './components/Sidebar/index.vue'
import Navbar from './components/Navbar/index.vue'
import Tabs from './components/Tabs/index.vue'
export default defineComponent({
  components: {
    Sidebar,
    Navbar,
    Tabs,
  },
  setup() {
    const appStore = useAppStore()
    const isMobile = computed(() => appStore.isMobile)
    const sidebarStatus = computed(() => appStore.sidebarStatus)
    const sideBarConfig = computed(() => appStore.sideBarConfig)
    const collapsed = computed(() => appStore.collapsed)
    const headerConfig = computed(() => appStore.headerConfig)
    // 改变遮罩层状态
    const toggleDrawer = () => {
      if (appStore.isMobile) {
        appStore.setSidebar(!appStore.sidebarStatus)
      }
    }
    // 改变菜单栏状态
    const toggleCollapsed = () => {
      if (appStore.isMobile) {
        appStore.setSidebar(!appStore.sidebarStatus)
      } else {
        appStore.collapsed = !appStore.collapsed
      }
    }

    const headerStyle = computed(() => {
      console.log(appStore.isMobile)
      let style = {}
      // 移动端
      if (appStore.isMobile) {
        style = {
          width: 'calc(100%)',
        }
      } else {
        // pc
        if (appStore.collapsed) {
          style = {
            width: 'calc(100% - 80px)',
          }
        } else {
          style = {
            width: `calc(100% - ${appStore.sideBarConfig.width}px)`,
          }
        }
      }
      return style
    })

    return {
      toggleDrawer,
      toggleCollapsed,
      headerStyle,
      isMobile,
      sidebarStatus,
      collapsed,
      sideBarConfig,
      headerConfig,
    }
  },
})
</script>

<style lang="less" scoped>
.drawer-bg {
  background: #000;
  opacity: 0.5;
  width: 100vw;
  height: 100vh;
  top: 0;
  position: absolute;
  z-index: 999;
}
.main-container {
  margin-left: 200px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  position: relative;
  height: 100vh;
  &::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(144, 147, 153, 0.3);
    border-radius: 8px;
    box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-thumb:hover {
    background-color: rgba(0, 0, 0, 0.3);
  }
  .header {
    background: #fff;
    z-index: 99;
    width: 100%;
    position: fixed;
    width: calc(100% - 200px);
    right: 0;
    top: 0;
    transition: all 0.3s cubic-bezier(0.2, 0, 0, 1) 0s;
  }
  .main-container-content {
    padding-top: 80px;
    height: calc(100vh);
  }
}
</style>
