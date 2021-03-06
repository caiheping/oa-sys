type Theme = "theme-dark" | "theme-light";

interface Settings {
  sideTheme: Theme;
  showSettings: boolean;
  topNav: boolean;
  tagsView: boolean;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  version: string;
  companyName: string;
  title: string;
}

const settings: Settings = {
  /**
   * 侧边栏主题 深色主题theme-dark，浅色主题theme-light
   */
  sideTheme: "theme-dark",

  /**
   * 是否系统布局配置
   */
  showSettings: false,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * 是否固定头部
   */
  fixedHeader: true,

  /**
   * 是否显示logo
   */
  sidebarLogo: false,

  version: "1.0.0",
  companyName: "版权所有 ©2021 xxx公司",
  title: "xxx - 员工管理系统",
}

export default settings
