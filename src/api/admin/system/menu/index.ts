import HttpRequest from "@/utils/request"
import { IRows, IMenu } from "./type"

// 获取用户路由
export function getRouters(params = {}) {
  return HttpRequest<IRows>('/admin/system/menu/userMenu', 'GET', params, false)
}

// 获取路由
export function getMenu(params = {}) {
  return HttpRequest<IRows>('/admin/system/menu', 'GET', params, false)
}

// 获取某条菜单
export function getMenuById(id: number) {
  return HttpRequest<IMenu>('/admin/system/menu/' + id, 'GET', {}, false)
}

// 删除
export function delMenu(ids: string) {
  return HttpRequest('/admin/system/menu/' + ids, 'DELETE')
}

// 新增
export function addMenu(params = {}) {
  return HttpRequest('/admin/system/menu', 'POST', params)
}

// 修改
export function updateMenu(params: any = {}) {
  return HttpRequest('/admin/system/menu/' + params.id, 'PUT', params)
}
