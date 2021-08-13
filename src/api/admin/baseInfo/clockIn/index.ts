import HttpRequest from "@/utils/request"
import { IRows, IClockIn } from './type'

// 查询列表
export function getClockIn(params = {}) {
  return HttpRequest<IRows>('/admin/baseInfo/clockIn', 'GET', params)
}

// 查询单个
export function getClockInById(id: number) {
  return HttpRequest<IClockIn>('/admin/baseInfo/clockIn/' + id, 'GET', {}, false)
}

// 删除
export function delClockIn(ids: string) {
  return HttpRequest('/admin/baseInfo/clockIn/' + ids, 'DELETE')
}

// 添加
export function addClockIn(params = {}) {
  return HttpRequest('/admin/baseInfo/clockIn', 'POST', params)
}

// 修改
export function updateClockIn(params: any) {
  return HttpRequest('/admin/baseInfo/clockIn/' + params.id, 'PUT', params)
}