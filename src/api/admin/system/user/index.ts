import HttpRequest from "@/utils/request";
import { IRows, IUser } from './type';

// 查询列表
export function listUser(params = {}) {
  return HttpRequest<IRows>('/admin/system/user', 'GET', params)
}

// 查询某个用户
export function getUser(id: number) {
  return HttpRequest<IUser>('/admin/system/user/' + id, 'GET', {}, false)
}

// 删除
export function delUser(ids = []) {
  return HttpRequest('/admin/system/user/' + ids, 'DELETE')
}

// 新增
export function addUser(params = {}) {
  return HttpRequest('/admin/system/user', 'POST', params)
}

// 修改
export function updateUser(params: any) {
  return HttpRequest('/admin/system/user/' + params.id, 'PUT', params)
}

// 导出
export function exportUser(params = {}) {
  return HttpRequest('/admin/system/user/export', 'GET', params)
}

// 修改图片
export function updateUserImg(userId: number, params = {}) {
  return HttpRequest(`/admin/system/user/${userId}/updateUserImg`, 'PUT', params)
}

// 重置密码
export function resetUserPwd(userId: number, params = {}) {
  return HttpRequest(`/admin/system/user/${userId}/resetPwd`, 'PUT', params)
}

// 更新用户密码
export function updateUserPwd(userId: number, params = {}) {
  return HttpRequest(`/admin/system/user/${userId}/updateUserPwd`, 'PUT', params)
}

// 导出模板
export function importTemplate(params = {}) {
  return HttpRequest('/admin/system/user/import', 'GET', params)
}

// 获取用户信息
export function getInfo(params = {}) {
  return HttpRequest('/admin/system/getInfo', 'GET', params, false)
}

// 上传头像
export function uploadAvatar(params = {}) {
  return HttpRequest('/upload', 'POST', params)
}

