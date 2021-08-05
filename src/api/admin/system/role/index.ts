import HttpRequest from "@/utils/request";

// 查询角色
export function getRole(params = {}) {
  return HttpRequest('/admin/system/role', 'GET', params)
}

// 查询某个角色
export function getRoleById(id: number) {
  return HttpRequest('/admin/system/role/' + id, 'GET', {}, false)
}

// 添加角色
export function addRole(params = {}) {
  return HttpRequest('/admin/system/role', 'POST', params)
}

// 修改角色
export function updateRole(params: any = {}) {
  return HttpRequest('/admin/system/role/' + params.id, 'PUT', params)
}

// 修改角色状态
export function updateRoleStatus(params = {}) {
  return HttpRequest('/admin/system/role/changeRoleStatus', 'PUT', params)
}

// 删除角色
export function delRole(ids: string) {
  return HttpRequest('/admin/system/role/' + ids, 'DELETE')
}