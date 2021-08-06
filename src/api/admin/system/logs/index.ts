import HttpRequest from "@/utils/request"
import { IRows, ILog } from "./type"

// 查询列表
export function getLogs(params = {}) {
  return HttpRequest<IRows>('/admin/system/logs', 'GET', params, false)
}

// 查询单个
export function getLogsById(id: number) {
  return HttpRequest<ILog>('/admin/system/logs/' + id, 'GET', {}, false)
}

// 删除
export function delLogs(ids: string) {
  return HttpRequest('/admin/system/logs/' + ids, 'DELETE')
}

// 清空所有
export function delAllLogs() {
  return HttpRequest('/admin/system/logs/deleteAllLogs', 'DELETE')
}


// 添加
export function addLogs(params = {}) {
  return HttpRequest('/admin/system/logs', 'POST', params)
}

// 修改
export function updateLogs(params: any) {
  return HttpRequest('/admin/system/logs/' + params.deptId, 'PUT', params)
}