import HttpRequest from "@/utils/request"
import { IData, IRows } from "./type"

// 查询字典数据列表
export function listData(params) {
  return HttpRequest<IRows>('/admin/system/dictData', 'GET', params)
}

// 查询字典数据详细
export function getDataById(id) {
  return HttpRequest<IData>('/admin/system/dictData/' + id, 'GET', {}, false)
}

// 根据字典类型查询字典数据信息
export function getDicts(dictType) {
  return HttpRequest<IData[]>('/admin/system/showByType/' + dictType, 'GET')
}

// 新增字典数据
export function addData(params) {
  return HttpRequest('/admin/system/dictData', 'POST', params)
}

// 修改字典数据
export function updateData(params) {
  return HttpRequest('/admin/system/dictData/' + params.id, 'PUT', params)
}

// 删除字典数据
export function delData(ids) {
  return HttpRequest('/admin/system/dictData/' + ids, 'DELETE')
}
