import HttpRequest from "@/utils/request"
import { IRows, ISystemConfig } from './type'

// 查询列表
export function getSystemConfig(params = {}) {
  return HttpRequest<IRows>('/admin/system/systemConfig', 'GET', params)
}

// 查询单个
export function getSystemConfigById(id: number) {
  return HttpRequest<ISystemConfig>('/admin/system/systemConfig/' + id, 'GET', {}, false)
}

// 删除
export function delSystemConfig(ids: string) {
  return HttpRequest('/admin/system/systemConfig/' + ids, 'DELETE')
}

// 添加
export function addSystemConfig(params = {}) {
  return HttpRequest('/admin/system/systemConfig', 'POST', params)
}

// 修改
export function updateSystemConfig(params: any) {
  return HttpRequest('/admin/system/systemConfig/' + params.id, 'PUT', params)
}