import HttpRequest from "@/utils/request";

// 获取用户路由
export function getRouters(params = {}) {
  return HttpRequest('/admin/system/menu/userMenu', 'GET', params, false)
}

// 获取路由
export function getMenu(params = {}) {
  return HttpRequest('/admin/system/menu', 'GET', params, false)
}

// 获取某条菜单
export function getMenuById(id: number) {
  return HttpRequest('/admin/system/menu/' + id, 'GET', {}, false)
}

export function delMenu(ids: string) {
  return HttpRequest('/admin/system/menu/' + ids, 'DELETE')
}

export function addMenu(params = {}) {
  return HttpRequest('/admin/system/menu', 'POST', params)
}

export function updateMenu(params: any = {}) {
  return HttpRequest('/admin/system/menu/' + params.id, 'PUT', params)
}
