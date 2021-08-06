import HttpRequest from "@/utils/request"
import { IRows, INotice } from './type'

// 查询列表
export function getNotice(params = {}) {
  return HttpRequest<IRows>('/admin/system/notice', 'GET', params, false)
}

// 查询单个
export function getNoticeById(id: number) {
  return HttpRequest<INotice>('/admin/system/notice/' + id, 'GET', {}, false)
}

// 删除
export function delNotice(ids: string) {
  return HttpRequest('/admin/system/notice/' + ids, 'DELETE')
}

// 添加
export function addNotice(params = {}) {
  return HttpRequest('/admin/system/notice', 'POST', params)
}

// 修改
export function updateNotice(params: any) {
  return HttpRequest('/admin/system/notice/' + params.id, 'PUT', params)
}