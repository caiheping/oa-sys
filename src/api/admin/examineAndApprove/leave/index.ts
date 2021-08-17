import HttpRequest from "@/utils/request"
import { IRows, ILeave } from './type'

// 查询列表
export function getLeave(params = {}) {
  return HttpRequest<IRows>('/admin/examineAndApprove/leave', 'GET', params)
}

// 查询单个
export function getLeaveById(id: number) {
  return HttpRequest<ILeave>('/admin/examineAndApprove/leave/' + id, 'GET', {}, false)
}

// 删除
export function delLeave(ids: string) {
  return HttpRequest('/admin/examineAndApprove/leave/' + ids, 'DELETE')
}

// 添加
export function addLeave(params = {}) {
  return HttpRequest('/admin/examineAndApprove/leave', 'POST', params)
}

// 修改
export function updateLeave(params: any) {
  return HttpRequest('/admin/examineAndApprove/leave/' + params.id, 'PUT', params)
}