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
  Logs: () => import("@/views/system/logs/index.vue"),
  SystemConfig: () => import("@/views/system/systemConfig/index.vue"),


  // 审批管理
  Evection: () => import("@/views/approvalManagement/evection/index.vue"), // 出差
  Leave: () => import("@/views/approvalManagement/leave/index.vue"), // 请假
  MakeUpCard: () => import("@/views/approvalManagement/makeUpCard/index.vue"), // 打卡
  WorkOverTime: () => import("@/views/approvalManagement/workOverTime/index.vue"), // 加班

  // 基础数据
  ClockIn: () => import("@/views/baseInfo/clockIn/index.vue"), // 员工打卡详情
  HolidayDetails: () => import("@/views/baseInfo/holidayDetails/index.vue"), // 员工假期详情

  // 财务管理
  Salary: () => import("@/views/finance/salary/index.vue"), // 工资详细

}

export default dynamicRouter
