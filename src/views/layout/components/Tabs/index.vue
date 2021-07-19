<template>
  <div class="tabs flex">
    <span
      class="flex w-30px justify-center items-center cursor-pointer"
      @click="handleLeftScroll"
    >
      <svg-icon name="tabs-left" class="hover:text-[#333333] text-gray-400" />
    </span>
    <div class="h-30px overflow-x-hidden flex-1" ref="tabsBox">
      <ul
        class="tabs-content h-30px box-border flex flex-nowrap items-center"
        ref="tabsView"
      >
        <li
          class="
            h-24px
            box-border
            border-1 border-[#d8dce5]
            pr-5
            pl-2
            mr-1
            whitespace-nowrap
            relative
            cursor-pointer
            hover:text-[#1890ff]
            rounded-[2px]
          "
          :class="active === item.name ? 'tabActive' : ''"
          v-for="(item, index) in tabs"
          :key="index"
          @click="go(item)"
        >
          <span>{{ item.meta.title }}</span>
          <span
            v-if="tabs.length !== 1"
            class="closeTab"
            @click.stop="handleCloseTab(index)"
          >
            <svg-icon name="close" size="14px" />
          </span>
          <span v-else class="spot"></span>
        </li>
      </ul>
    </div>
    <span
      class="flex w-30px justify-center items-center cursor-pointer"
      @click="handleRightScroll"
    >
      <svg-icon name="tabs-right" class="hover:text-[#333333] text-gray-400" />
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, watchEffect, watch } from 'vue'
import router from '@/router'
import { RouteRecordRaw, useRoute } from 'vue-router'
import { useAppStore } from '@/store/modules/app'
import { mapState } from 'pinia'

export default defineComponent({
  setup() {
    // x轴超出滚动操作
    const initLeft = ref(0)
    const tabsView = ref(null as HTMLHtmlElement | null)
    const tabsBox = ref(null as HTMLHtmlElement | null)
    const handleLeftScroll = () => {
      if (
        (tabsView.value as HTMLHtmlElement).clientWidth <
        (tabsBox.value as HTMLHtmlElement).clientWidth
      ) {
        return
      }
      initLeft.value += 500
      if (initLeft.value >= 0) {
        initLeft.value = 0
      }
      (
        tabsView.value?.style as CSSStyleDeclaration
      ).transform = `translateX(${initLeft.value}px)`
    }
    const handleRightScroll = () => {
      if (
        (tabsView.value as HTMLHtmlElement).clientWidth <
        (tabsBox.value as HTMLHtmlElement).clientWidth
      ) {
        return
      }
      initLeft.value -= 500
      if (
        Math.abs(initLeft.value) >=
        (tabsView.value as HTMLHtmlElement).clientWidth -
          (tabsBox.value as HTMLHtmlElement).clientWidth
      ) {
        initLeft.value = -(
          (tabsView.value as HTMLHtmlElement).clientWidth -
          (tabsBox.value as HTMLHtmlElement).clientWidth
        )
      }
      (
        tabsView.value?.style as CSSStyleDeclaration
      ).transform = `translateX(${initLeft.value}px)`
    }

    // tab路由操作
    const route = useRoute()
    const appStore = useAppStore()
    watch(route, () => {
      if (route.meta?.title) {
        if (!appStore.tabs.map((item) => item.name).includes(route.name)) {
          appStore.tabs.push({ ...route })
        }
      }
    })
    const active = ref('')
    active.value = route.name as string
    watchEffect(() => {
      active.value = route.name as string
    })
    const handleCloseTab = (index: number) => {
      if (appStore.tabs.length === 1) {
        return
      } else if (appStore.tabs[index].name === active.value) {
        appStore.tabs.splice(index, 1)
        router.push({
          name: appStore.tabs[0].name as string,
        })
      } else {
        appStore.tabs.splice(index, 1)
      }
    }

    const go = (item: RouteRecordRaw) => {
      // console.log(item)
      router.push({
        path: item.path,
      })
    }

    onMounted(() => {
      appStore.tabs.push({ ...route })
    })
    return {
      handleLeftScroll,
      handleRightScroll,
      tabsView,
      tabsBox,
      handleCloseTab,
      go,
      active,
    }
  },
  computed: {
    ...mapState(useAppStore, ['tabs']),
  },
})
</script>

<style lang="less" scoped>
.tabs-content {
  transition: all 0.5s;
  width: fit-content;
}
.tabs {
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 12%), 0 0 3px 0 rgb(0 0 0 / 4%);
  .tabActive {
    background: #1890ff;
    color: #fff;
    border: 1px solid transparent;
  }
}
.closeTab {
  cursor: pointer;
  position: absolute;
  right: 2px;
  top: 3px;
  border-radius: 50%;
  padding: 1px;
  &:hover {
    background: #ccc;
    color: #fff;
  }
}
.spot {
  position: absolute;
  right: 5px;
  top: 7px;
  border-radius: 50%;
  padding: 1px;
  background: #fff;
  width: 8px;
  height: 8px;
}
</style>
