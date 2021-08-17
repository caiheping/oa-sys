import HttpRequest from "@/utils/request"
import { IRows, IMakeUpCard } from './type'

// 查询列表
export function getMakeUpCard(params = {}) {
  return HttpRequest<IRows>('/admin/examineAndApprove/makeUpCard', 'GET', params)
}

// 查询单个
export function getMakeUpCardById(id: number) {
  return HttpRequest<IMakeUpCard>('/admin/examineAndApprove/makeUpCard/' + id, 'GET', {}, false)
}

// 删除
export function delMakeUpCard(ids: string) {
  return HttpRequest('/admin/examineAndApprove/makeUpCard/' + ids, 'DELETE')
}

// 添加
export function addMakeUpCard(params = {}) {
  return HttpRequest('/admin/examineAndApprove/makeUpCard', 'POST', params)
}

// 修改
export function updateMakeUpCard(params: any) {
  return HttpRequest('/admin/examineAndApprove/makeUpCard/' + params.id, 'PUT', params)
}