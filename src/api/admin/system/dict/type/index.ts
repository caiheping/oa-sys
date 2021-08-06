import HttpRequest from "@/utils/request";
import { IRows, IType } from "./type";

// 查询列表
export function listType(params = {}) {
  return HttpRequest<IRows>('/admin/system/dictType', 'GET', params)
}

// 查询某一个
export function getType(id) {
  return HttpRequest<IType>('/admin/system/dictType/' + id, 'GET', {}, false)
}

// 删除
export function delType(ids) {
  return HttpRequest('/admin/system/dictType/' + ids, 'DELETE')
}

// 添加
export function addType(params = {}) {
  return HttpRequest('/admin/system/dictType', 'POST', params)
}

// 修改
export function updateType(params: any = {}) {
  return HttpRequest('/admin/system/dictType/' + params.id, 'PUT', params)
}
