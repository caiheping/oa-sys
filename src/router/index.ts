import { createRouter, createWebHashHistory } from "vue-router"
import type { App } from "vue"
import type { RouteRecordRaw } from "vue-router"
import routes from "./routes"
import { setupRouterGuard } from "./guard"

const router = createRouter({
  history: createWebHashHistory('/'),
  routes: routes as RouteRecordRaw[],
  scrollBehavior: () => ({ left: 0, top: 0 }),
})

export function setupRouter(app: App<Element>) {
  app.use(router)
  setupRouterGuard()
}

export default router
