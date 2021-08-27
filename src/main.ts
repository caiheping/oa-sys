import "virtual:windi.css"
import "virtual:svg-icons-register"
import { createApp } from "vue"
import Antd from "ant-design-vue"
import App from "./App.vue"
import router, { setupRouter } from "@/router"
import { setupStore } from "@/store"
import { setupI18n } from "@/locales/index"
import { registerGlobComp } from '@/components/registerGlobComp'
import { setupGlobDirectives } from '@/directives' // 自定义指令

// 需要全局引入再添加
import SvgIcon from "./components/SvgIcon/index.vue" // 全局svg图标组件

import "normalize.css/normalize.css"
import "ant-design-vue/dist/antd.less"
import "./assets/styles/index.less"
let a;

(async () => {
  console.log(import.meta.env.MODE)
  const app = createApp(App)
  app.use(Antd)

  registerGlobComp(app)

  setupStore(app)
  await setupI18n(app)

  setupRouter(app)
  // 自定义指令
  setupGlobDirectives(app)

  // Mount when the route is ready
  // https://next.router.vuejs.org/api/#isready
  await router.isReady()
  app.component("SvgIcon", SvgIcon)

  app.mount("#app", true)
})()
