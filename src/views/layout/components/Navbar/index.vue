<template>
  <div class="navbar flex justify-between items-center h-50px">
    <!-- 左侧 -->
    <div class="flex items-center">
      <div
        class="
          flex
          text-size-20px
          w-50px
          h-50px
          justify-center
          items-center
          cursor-pointer
          hover:bg-[rgba(0,0,0,0.05)]
        "
        @click="toggleCollapsed"
      >
        <MenuUnfoldOutlined v-if="collapsed" />
        <MenuFoldOutlined v-else />
      </div>
      <!-- 系统标题 -->
      <p class="ml-2 text-size-18px" v-if="headerConfig.showTitle">
        {{ settings.title }}
      </p>
    </div>
    <!-- 右侧 -->
    <div class="flex">
      <div
        v-if="headerConfig.showSearch"
        class="
          flex
          items-center
          justify-center
          cursor-pointer
          h-[50px]
          p-3
          hover:bg-[rgba(0,0,0,0.05)]
        "
      >
        <a-tooltip>
          <template #title>{{ t('common.searchText') }}</template>
          <svg-icon name="search" size="20px" />
        </a-tooltip>
      </div>
      <div
        v-if="headerConfig.showFullScreen"
        @click="toggle"
        class="
          flex
          items-center
          justify-center
          cursor-pointer
          h-[50px]
          p-3
          hover:bg-[rgba(0,0,0,0.05)]
        "
      >
        <a-tooltip v-if="!isFullscreen">
          <template #title>{{ t('layout.header.tooltipEntryFull') }}</template>
          <svg-icon name="fullScreen" size="20px" />
        </a-tooltip>
        <a-tooltip v-else>
          <template #title>{{ t('layout.header.tooltipExitFull') }}</template>
          <svg-icon name="exitFullScreen" size="20px" />
        </a-tooltip>
      </div>
      <a-dropdown
        :trigger="['click']"
        v-if="headerConfig.showLocale"
        class="
          flex
          items-center
          justify-center
          cursor-pointer
          h-[50px]
          p-3
          hover:bg-[rgba(0,0,0,0.05)]
        "
      >
        <a class="flex items-center" @click.prevent>
          <svg-icon name="language" size="20px" />
        </a>
        <template #overlay>
          <a-menu @click="handleLocaleClick">
            <a-menu-item key="zh-cn">
              <span>中文</span>
            </a-menu-item>
            <a-menu-item key="en">
              <span>English</span>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>

      <a-dropdown
        class="
          flex
          items-center
          justify-center
          cursor-pointer
          h-[50px]
          p-3
          hover:bg-[rgba(0,0,0,0.05)]
        "
      >
        <a class="flex items-center" @click.prevent>
          <img
            :src="userInfo.avatar ? baseImgUrl + userInfo.avatar : avatar"
            class="w-8 h-8 rounded-full mr-2"
            alt=""
          />
          <span class="text-size-[18px] text-gray-600">{{
            userInfo.nickName
          }}</span>
        </a>
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item key="1">
              <span>{{ t('layout.header.personalCenter') }}</span>
            </a-menu-item>
            <a-menu-divider />
            <a-menu-item key="3">{{
              t('layout.header.dropdownItemLoginOut')
            }}</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
      <div
        @click="showDrawer"
        class="
          flex
          items-center
          justify-center
          cursor-pointer
          h-[50px]
          p-3
          hover:bg-[rgba(0,0,0,0.05)]
        "
      >
        <a-tooltip>
          <template #title>{{ t('layout.header.setting') }}</template>
          <svg-icon name="setting" size="20px" />
        </a-tooltip>
      </div>

      <!-- setting -->
      <a-drawer
        width="360px"
        :title="t('layout.setting.systemConfiguration')"
        :placement="placement"
        :maskClosable="false"
        :visible="openSetting"
        @close="onClose"
      >
        <a-divider>{{ t('layout.setting.sidebar') }}</a-divider>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.showLogo') }}</span>
          <a-switch v-model:checked="sideBarConfig.showLogo" />
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.sidebarType') }}</span>
          <a-select v-model:value="sideBarConfig.mode" style="width: 120px">
            <a-select-option value="inline">inline</a-select-option>
            <a-select-option value="vertical">vertical</a-select-option>
          </a-select>
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.sidebarTheme') }}</span>
          <a-select v-model:value="sideBarConfig.theme" style="width: 120px">
            <a-select-option value="dark">dark</a-select-option>
            <a-select-option value="light">light</a-select-option>
          </a-select>
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.expandedMenuWidth') }}</span>
          <a-input-number
            v-model:value="sideBarConfig.width"
            :min="200"
            :max="400"
          />
        </div>

        <a-divider>{{ t('layout.setting.header') }}</a-divider>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.showTitle') }}</span>
          <a-switch v-model:checked="headerConfig.showTitle" />
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.showSearch') }}</span>
          <a-switch v-model:checked="headerConfig.showSearch" />
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.showFull') }}</span>
          <a-switch v-model:checked="headerConfig.showFullScreen" />
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.showLanguage') }}</span>
          <a-switch v-model:checked="headerConfig.showLocale" />
        </div>
        <div class="flex justify-between items-center mb-3">
          <span>{{ t('layout.setting.showTabs') }}</span>
          <a-switch v-model:checked="headerConfig.showTabs" />
        </div>
        <a-divider />
        <div class="flex justify-center items-center mb-3">
          <a-button @click="handleSaveSetting" type="primary" class="mr-3">
            {{ t('common.saveText') }}
          </a-button>
          <a-button @click="handleResetSetting">{{
            t('common.resetText')
          }}</a-button>
        </div>
      </a-drawer>
    </div>
  </div>
</template>

<script lang="ts">
import { useAppStore } from '@/store/modules/app'
import { useUserStore } from '@/store/modules/user'
import { defineComponent, VNodeChild, ref, computed } from 'vue'
import { message as Message } from 'ant-design-vue'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import avatar from '@/assets/images/profile.jpg'
import settings from '@/settings'
import { useI18n } from '@/hooks/useI18n'
import router from '@/router'
import { useFullscreen } from '@vueuse/core'
import { imageUrl } from '@/config'

interface MenuInfo {
  key: string
  keyPath: string[]
  item: VNodeChild
  domEvent: MouseEvent
}
export default defineComponent({
  components: {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  },
  setup() {
    const { t } = useI18n()
    const placement = ref<string>('right')
    const openSetting = ref<boolean>(false)
    const baseImgUrl = imageUrl
    const appStore = useAppStore()
    const collapsed = computed(() => appStore.collapsed)
    const headerConfig = computed(() => appStore.headerConfig)
    const sideBarConfig = computed(() => appStore.sideBarConfig)
    const userStore = useUserStore()
    const userInfo = computed(() => userStore.userInfo)

    const { toggle, isFullscreen } = useFullscreen()
    // 改变菜单栏状态
    const toggleCollapsed = () => {
      if (appStore.isMobile) {
        appStore.setSidebar(!appStore.sidebarStatus)
      } else {
        appStore.collapsed = !appStore.collapsed
      }
    }

    const handleMenuClick = async (e: MenuInfo) => {
      console.log(e)
      if (e.key === '1') {
        router.push('/user/profile')
      }
      if (e.key === '3') {
        const res = await userStore.Logout()
        if (res.code === 0) {
          router.replace(`/redirect/login`)
          window.location.reload()
        }
      }
    }
    const handleLocaleClick = (e: MenuInfo) => {
      console.log(e.key)
      appStore.locale = e.key
      localStorage.setItem('locale', e.key)
      window.location.reload()
    }

    const showDrawer = () => {
      openSetting.value = true
    }

    const onClose = () => {
      openSetting.value = false
    }

    const handleSaveSetting = () => {
      const settings = {
        sideBarConfig: appStore.sideBarConfig,
        headerConfig: appStore.headerConfig,
      }
      localStorage.setItem('sysSettings', JSON.stringify(settings))
      Message.success(t('sys.api.operationSuccess'))
      openSetting.value = false
    }

    const handleResetSetting = () => {
      localStorage.removeItem('sysSettings')
      window.location.reload()
    }

    return {
      t,
      collapsed,
      headerConfig,
      sideBarConfig,
      userInfo,
      toggleCollapsed,
      avatar,
      baseImgUrl,
      settings,
      handleMenuClick,
      handleLocaleClick,
      toggle,
      isFullscreen,
      placement,
      openSetting,
      showDrawer,
      onClose,
      handleSaveSetting,
      handleResetSetting,
    }
  },
})
</script>

<style lang="less" scoped>
.navbar {
  box-shadow: 0 1px 4px rgb(0 21 41 / 8%);
}
</style>
