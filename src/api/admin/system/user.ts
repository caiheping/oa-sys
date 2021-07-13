import HttpRequest, { Methods } from "@/utils/request";

// 查询列表
export function listUser(params = {}) {
  return HttpRequest('/admin/system/user', Methods.get, params)
}

// 查询某个用户
export function getUser(id: number) {
  return HttpRequest('/admin/system/user/' + id, Methods.get, {}, false)
}

// 删除
export function delUser(ids = []) {
  return HttpRequest('/admin/system/user/' + ids, Methods.del)
}

// 新增
export function addUser(params = {}) {
  return HttpRequest('/admin/system/user', Methods.post, params)
}

// 修改
export function updateUser(params: any) {
  return HttpRequest('/admin/system/user/' + params.id, Methods.put, params)
}

// 导出
export function exportUser(params = {}) {
  return HttpRequest('/admin/system/user/export', Methods.get, params)
}

// 修改图片
export function updateUserImg(userId: number, params = {}) {
  return HttpRequest(`/admin/system/user/${userId}/updateUserImg`, Methods.put, params)
}

// 重置密码
export function resetUserPwd(userId: number, params = {}) {
  return HttpRequest(`/admin/system/user/${userId}/resetPwd`, Methods.put, params)
}

// 更新用户密码
export function updateUserPwd(userId: number, params = {}) {
  return HttpRequest(`/admin/system/user/${userId}/updateUserPwd`, Methods.put, params)
}

// 导出模板
export function importTemplate(params = {}) {
  return HttpRequest('/admin/system/user/import', Methods.get, params)
}

// 获取用户信息
export function getInfo(params = {}) {
  return HttpRequest('/admin/system/getInfo', Methods.get, params, false)
}

// 上传头像
export function uploadAvatar(params = {}) {
  return HttpRequest('/upload', Methods.post, params)
}

