import HttpRequest from "@/utils/request";

// 查询列表
export function getDept(params = {}) {
  return HttpRequest('/admin/system/department', 'GET', params, false)
}

// 查询单个
export function getDeptById(id: number) {
  return HttpRequest('/admin/system/department/' + id, 'GET', {}, false)
}

// 删除
export function delDept(ids: string) {
  return HttpRequest('/admin/system/department/' + ids, 'DELETE')
}

// 添加
export function addDept(params = {}) {
  return HttpRequest('/admin/system/department', 'POST', params)
}

// 修改
export function updateDept(params: any) {
  return HttpRequest('/admin/system/department/' + params.deptId, 'PUT', params)
}