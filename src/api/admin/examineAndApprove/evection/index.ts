import HttpRequest from "@/utils/request"
import { IRows, IEvection } from './type'

// 查询列表
export function getEvection(params = {}) {
  return HttpRequest<IRows>('/admin/examineAndApprove/evection', 'GET', params)
}

// 查询单个
export function getEvectionById(id: number) {
  return HttpRequest<IEvection>('/admin/examineAndApprove/evection/' + id, 'GET', {}, false)
}

// 删除
export function delEvection(ids: string) {
  return HttpRequest('/admin/examineAndApprove/evection/' + ids, 'DELETE')
}

// 添加
export function addEvection(params = {}) {
  return HttpRequest('/admin/examineAndApprove/evection', 'POST', params)
}

// 修改
export function updateEvection(params: any) {
  return HttpRequest('/admin/examineAndApprove/evection/' + params.id, 'PUT', params)
}