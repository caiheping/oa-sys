import type { RouteRecordRaw } from "vue-router"

// @ts-ignore
interface AppRouteRecordRaw extends RouteRecordRaw {
  path: string;
  name?: string;
  component?: any;
  hidden?: boolean;
  redirect?: string;
  children?: AppRouteRecordRaw[];
  meta?: RouteMeta;
}

interface RouteMeta {
  title: string;
  menuType?: string;
  noCache?: boolean; // 不缓存
  icon?: string;
}

const constantRoutes: AppRouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
  },
  {
    path: "/redirect",
    component: () => import("@/views/layout/index.vue"),
    hidden: true,
    children: [
      {
        path: "/redirect/:path(.*)",
        name: "Redirect",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/user",
    component: () => import("@/views/layout/index.vue"),
    hidden: true,
    children: [
      {
        path: "profile",
        component: () => import("@/views/system/user/profile/index.vue"),
        name: "Profile",
        meta: {
          title: "个人中心",
          menuType: "C",
        },
      },
    ],
  },
  {
    path: "/404",
    hidden: true,
    component: import("@/views/error/404.vue"),
    meta: {
      title: "404",
    },
  },
  {
    path: "/401",
    hidden: true,
    component: import("@/views/error/401.vue"),
    meta: {
      title: "401",
    },
  },
]

export default constantRoutes
