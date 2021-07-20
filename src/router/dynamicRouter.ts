interface IDynamicRouter {
  [key: string]: any;
}
const dynamicRouter: IDynamicRouter = {
  Layout: () => import("@/views/layout/index.vue"),
  Home: () => import("@/views/home/index.vue"),

  // 系统管理
  User: () => import("@/views/system/user/index.vue"),
  Role: () => import("@/views/system/role/index.vue"),
  Menu: () => import("@/views/system/menu/index.vue"),
  Dict: () => import("@/views/system/dict/index.vue"),
  DictData: () => import("@/views/system/dict/data.vue"),
  Dept: () => import("@/views/system/dept/index.vue"),
  Notice: () => import("@/views/system/notice/index.vue"),
  Logs: () => import("@/views/system/logs/index.vue")
};

export default dynamicRouter;
