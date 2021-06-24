import HttpRequest, { Methods } from "@/utils/request";

// 查询角色
export function getRole(params = {}) {
  return HttpRequest('/admin/system/role', Methods.get, params)
}

// 查询某个角色
export function getRoleById(id: number) {
  return HttpRequest('/admin/system/role/' + id, Methods.get, {}, false)
}

// 添加角色
export function addRole(params = {}) {
  return HttpRequest('/admin/system/role', Methods.post, params)
}

// 修改角色
export function updateRole(params: any = {}) {
  return HttpRequest('/admin/system/role/' + params.id, Methods.put, params)
}

// 修改角色状态
export function updateRoleStatus(params = {}) {
  return HttpRequest('/admin/system/role/changeRoleStatus', Methods.put, params)
}

// 删除角色
export function delRole(ids: string) {
  return HttpRequest('/admin/system/role/' + ids, Methods.del)
}

// 更新角色状态
export function changeRoleStatus(id: number, params: any = {}) {
  return HttpRequest(`/admin/system/role/${id}/updateStatus`, Methods.put, params)
}
