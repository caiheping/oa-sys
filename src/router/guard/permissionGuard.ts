import type { Router, RouteRecordRaw } from "vue-router"
import { usePermissionStore } from "@/store/modules/permission"
import { useUserStore } from "@/store/modules/user"
import { getToken, removeToken } from "@/utils/auth"

const whiteList = ["/login"]

export function createPermissionGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const permissionStore = usePermissionStore()
    const userStore = useUserStore()
    if (getToken()) {
      // 是否有token
      if (permissionStore.routes.length === 0) {
        // 动态路由长度是否为0
        // 获取用户信息
        const res = await userStore.GetInfo()
        if (res) {
          const accessRoutes = await permissionStore.GenerateRoutes()
          console.log(accessRoutes)

          if (accessRoutes.length === 0) {
            next({
              path: "/login",
              replace: true,
            })
            removeToken()
          } else {
            // 动态添加路由
            accessRoutes.forEach((route: RouteRecordRaw) => {
              console.log(route)
              router.addRoute(route)
            })

            if (to.path === "/login") {
              next({
                name: accessRoutes[0].children[0].name,
                query: to.query,
                replace: true,
              })
            } else {
              next({
                ...to,
                replace: true,
              })
            }
          }
        } else {
          next({
            path: "/login",
            replace: true,
          })
        }
      } else {
        next()
      }
    } else {
      // 没有token
      if (whiteList.indexOf(to.path) !== -1) {
        // 在免登录白名单，直接进入
        next()
      } else {
        next(`/login?redirect=${to.fullPath}`) // 否则全部重定向到登录页
      }
    }
  })
}
