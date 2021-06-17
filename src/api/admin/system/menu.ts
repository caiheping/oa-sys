import HttpRequest, { Methods } from "@/utils/request";

// 登录
export function getRouters(params = {}) {
  return HttpRequest("/admin/system/menu/userMenu", Methods.get, params, false);
}
