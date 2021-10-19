import HttpRequest from "@/utils/request"
import { IRows, IWorkingDaySettings } from './type'

// 查询列表
export function getWorkingDaySettings(params = {}) {
  return HttpRequest<IRows>('/admin/baseInfo/workingDaySettings', 'GET', params)
}

// 查询单个
export function getWorkingDaySettingsById(id: number) {
  return HttpRequest<IWorkingDaySettings>('/admin/baseInfo/workingDaySettings/' + id, 'GET', {}, false)
}

// 删除
export function delWorkingDaySettings(ids: string) {
  return HttpRequest('/admin/baseInfo/workingDaySettings/' + ids, 'DELETE')
}

// 添加
export function addWorkingDaySettings(params = {}) {
  return HttpRequest('/admin/baseInfo/workingDaySettings', 'POST', params)
}

// 修改
export function updateWorkingDaySettings(params: any) {
  return HttpRequest('/admin/baseInfo/workingDaySettings/' + params.id, 'PUT', params)
}