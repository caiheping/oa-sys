import HttpRequest, { Methods } from "@/utils/request";

// 查询列表
export function getNotice(params = {}) {
  return HttpRequest('/admin/system/notice', Methods.get, params, false)
}

// 查询单个
export function getNoticeById(id: number) {
  return HttpRequest('/admin/system/notice/' + id, Methods.get, {}, false)
}

// 删除
export function delNotice(ids: string) {
  return HttpRequest('/admin/system/notice/' + ids, Methods.del)
}

// 添加
export function addNotice(params = {}) {
  return HttpRequest('/admin/system/notice', Methods.post, params)
}

// 修改
export function updateNotice(params: any) {
  return HttpRequest('/admin/system/notice/' + params.id, Methods.put, params)
}