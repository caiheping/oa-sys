import type { AppRouteRecordRaw } from "types/permission";

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
        component: import("@/views/redirect/index.vue"),
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
          icon: "user",
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
  {
    path: '/test',
    hidden: true,
    component: import("@/views/system/test/index.vue"),
    meta: {
      title: "test",
    },
  }
];

export default constantRoutes;
