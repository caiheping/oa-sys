import { defineStore } from "pinia";
import { getLocalStorage } from "@/utils/tools";
import { RouteLocationNormalizedLoaded } from "vue-router";

// 侧边栏配置
interface SideBarConfig {
  mode?: 'vertical' | 'inline';
  theme?: 'dark' | 'light';
  width?: number;
  showLogo?: boolean;
}

interface HeaderConfig {
  showTitle?: boolean;
  showSearch?: boolean;
  showFullScreen?: boolean;
  showLocale?: boolean;
  showTabs?: boolean;
}

interface AppStore {
  loading: boolean;
  isMobile: boolean;
  collapsed: boolean;
  isFixedNav: boolean;
  tabs: RouteLocationNormalizedLoaded[];
  locale: string | null;
  sideBarConfig: SideBarConfig;
  headerConfig: HeaderConfig;
  sidebarStatus: boolean;
}

const initSideBarConfig: SideBarConfig = {
  mode: 'inline',
  theme: 'dark',
  width: 200,
  showLogo: true
}

const initHeaderConfig: HeaderConfig = {
  showTitle: true,
  showSearch: true,
  showFullScreen: true,
  showLocale: true,
  showTabs: true
}

const getSideBarConfig = (): SideBarConfig => {
  if (localStorage.getItem('sysSettings') && JSON.parse(localStorage.getItem('sysSettings') as string).sideBarConfig) {
    return JSON.parse(localStorage.getItem('sysSettings') as string).sideBarConfig
  } else {
    return initSideBarConfig
  }
}

const getHeaderConfig = (): HeaderConfig => {
  if (localStorage.getItem('sysSettings') && JSON.parse(localStorage.getItem('sysSettings') as string).headerConfig) {
    return JSON.parse(localStorage.getItem('sysSettings') as string).headerConfig
  } else {
    return initHeaderConfig
  }
}

export const useAppStore = defineStore({
  id: "app",
  state: (): AppStore => {
    return {
      loading: false,
      isMobile: false,
      collapsed: false,
      isFixedNav: false,
      tabs: [],
      sideBarConfig: getSideBarConfig(),
      headerConfig: getHeaderConfig(),
      locale: localStorage.getItem("locale")
        ? localStorage.getItem("locale")
        : "zh-cn",
      sidebarStatus: getLocalStorage("sidebarStatus")
        ? Boolean(getLocalStorage("sidebarStatus"))
        : false, // 左侧栏是否展开，默认展开
    };
  },
  getters: {},
  actions: {
    setMobile(val: boolean) {
      this.isMobile = val;
    },
    setCollapsed(val: boolean) {
      this.collapsed = val;
    },
    setSidebar(val: boolean) {
      this.sidebarStatus = val;
    },
    setFixedNav(val: boolean) {
      this.isFixedNav = val;
    },
    setSideBarWidth(val: number) {
      this.sideBarConfig.width = val
    },
    resetTabs() {
      this.tabs = []
    },
    resetLocale() {
      this.locale = 'zh-cn'
    }
  },
});
