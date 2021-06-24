import HttpRequest, { Methods } from "@/utils/request";

// 获取用户路由
export function getRouters(params = {}) {
  return HttpRequest('/admin/system/menu/userMenu', Methods.get, params, false)
}

// 获取路由
export function getMenu(params = {}) {
  return HttpRequest('/admin/system/menu', Methods.get, params, false)
}

// 获取某条菜单
export function getMenuById(id: number) {
  return HttpRequest('/admin/system/menu/' + id, Methods.get, {}, false)
}

export function delMenu(ids: string) {
  return HttpRequest('/admin/system/menu/' + ids, Methods.del)
}

export function addMenu(params = {}) {
  return HttpRequest('/admin/system/menu', Methods.post, params)
}

export function updateMenu(params: any = {}) {
  return HttpRequest('/admin/system/menu/' + params.id, Methods.put, params)
}
