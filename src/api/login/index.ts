import HttpRequest from "@/utils/request";
import { httpResponse } from "types/global";

// 登录
export function login(params = {}): Promise<httpResponse> {
  return HttpRequest("/login", 'POST', params);
}

// 登出
export function logout(params = {}): Promise<httpResponse> {
  return HttpRequest("/logout", 'POST', params);
}

// 获取用户信息
export function getInfo(params = {}): Promise<httpResponse> {
  return HttpRequest("/admin/system/getInfo", 'GET', params);
}

// 验证码
export function getCodeImg(params = {}): Promise<httpResponse> {
  return HttpRequest("/captcha", 'GET', params, false);
}
