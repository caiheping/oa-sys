import HttpRequest, { Methods } from "@/utils/request";

// 查询列表
export function listType(params = {}) {
  return HttpRequest('/admin/system/dictType', Methods.get, params)
}

// 查询某一个
export function getType(id) {
  return HttpRequest('/admin/system/dictType/' + id, Methods.get, {}, false)
}

// 删除
export function delType(ids) {
  return HttpRequest('/admin/system/dictType/' + ids, Methods.del)
}

// 添加
export function addType(params = {}) {
  return HttpRequest('/admin/system/dictType', Methods.post, params)
}

// 修改
export function updateType(params: any = {}) {
  return HttpRequest('/admin/system/dictType/' + params.id, Methods.put, params)
}
