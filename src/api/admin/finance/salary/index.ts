import HttpRequest from "@/utils/request"
import { IRows, ISalary } from './type'

// 查询列表
export function getSalary(params = {}) {
  return HttpRequest<IRows>('/admin/finance/salary', 'GET', params)
}

// 查询单个
export function getSalaryById(id: number) {
  return HttpRequest<ISalary>('/admin/finance/salary/' + id, 'GET', {}, false)
}

// 删除
export function delSalary(ids: string) {
  return HttpRequest('/admin/finance/salary/' + ids, 'DELETE')
}

// 添加
export function addSalary(params = {}) {
  return HttpRequest('/admin/finance/salary', 'POST', params)
}

// 生成员工工资
export function createEmployeeSalary(params = {}) {
  return HttpRequest('/admin/finance/salary/createEmployeeSalary', 'POST', params)
}

// 修改
export function updateSalary(params: any) {
  return HttpRequest('/admin/finance/salary/' + params.id, 'PUT', params)
}