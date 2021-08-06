import { defineStore } from "pinia"
import { getRouters } from "@/api/admin/system/menu"
import dynamicRouter from "@/router/dynamicRouter"
import { removeToken } from "@/utils/auth"
import { RouteRecordRaw } from "vue-router"

// 遍历后台传来的路由，生成路由
function filterAsyncRouter(asyncRouterMap: any) {
  // 过滤类型为方法的列表
  asyncRouterMap = asyncRouterMap.filter((item: any) => item.menuType !== "F")
  const routesObj: any = {}
  asyncRouterMap.forEach((item: any) => {
    item.children = []
    item.component = dynamicRouter[item.component]
    routesObj[item.id] = item
  })
  const routes: any = []
  const menus: any = []
  asyncRouterMap.forEach((list: any) => {
    const obj = {
      path: list.path,
      name: list.name,
      component: list.component,
      hidden: list.visible !== "1",
      children: list.children,
      meta: {
        title: list.title,
        menuType: list.menuType,
        noCache: true, // 不缓存
        icon: list.icon,
      },
    }
    if (list.parentId !== 0) {
      routesObj[list.parentId].children.push(obj)
    } else {
      if (list.path.indexOf("/layout") !== -1) {
        routes.push({
          path: list.path,
          // name: list.name,
          component: dynamicRouter.Layout,
          hidden: list.visible !== "1",
          children: [obj],
          meta: {
            title: list.title,
            noCache: true, // 不缓存
            icon: list.icon,
          },
        })
      } else {
        routes.push(obj)
      }
      menus.push(obj)
    }
  })
  return {
    routes,
    menus,
    routesObj,
  }
}

interface PermissionStore {
  routes: RouteRecordRaw[];
  sidebarRouters: RouteRecordRaw[];
}

export const usePermissionStore = defineStore({
  id: "permission",
  state: (): PermissionStore => {
    return {
      routes: [],
      sidebarRouters: [],
    }
  },
  getters: {},
  actions: {
    // 生成路由
    async GenerateRoutes() {
      try {
        const res = await getRouters()
        const accessedRoutes = filterAsyncRouter(res.data.rows).routes
        const accessedMenus = filterAsyncRouter(res.data.rows).menus
        accessedRoutes.push({
          path: "/:catchAll(.*)",
          redirect: "/404",
          hidden: true,
        })
        this.sidebarRouters = accessedMenus
        // console.log(accessedMenus, accessedRoutes);
        this.routes = accessedRoutes
        return accessedRoutes
      } catch (error) {
        if (error.response.status === 401) {
          removeToken()
        }
      }
    },
  },
})
