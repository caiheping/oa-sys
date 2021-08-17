import HttpRequest from "@/utils/request"
import { IRows, IWorkOvertime } from './type'

// 查询列表
export function getWorkOvertime(params = {}) {
  return HttpRequest<IRows>('/admin/examineAndApprove/workOverTime', 'GET', params)
}

// 查询单个
export function getWorkOvertimeById(id: number) {
  return HttpRequest<IWorkOvertime>('/admin/examineAndApprove/workOverTime/' + id, 'GET', {}, false)
}

// 删除
export function delWorkOvertime(ids: string) {
  return HttpRequest('/admin/examineAndApprove/workOverTime/' + ids, 'DELETE')
}

// 添加
export function addWorkOvertime(params = {}) {
  return HttpRequest('/admin/examineAndApprove/workOverTime', 'POST', params)
}

// 修改
export function updateWorkOvertime(params: any) {
  return HttpRequest('/admin/examineAndApprove/workOverTime/' + params.id, 'PUT', params)
}