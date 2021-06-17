import HttpRequest, { Methods } from "@/utils/request";
import { httpResponse } from "types/global";

// 登录
export function login(params = {}): Promise<httpResponse> {
  return HttpRequest("/login", Methods.post, params);
}

// 登出
export function logout(params = {}): Promise<httpResponse> {
  return HttpRequest("/logout", Methods.post, params);
}

// 获取用户信息
export function getInfo(params = {}): Promise<httpResponse> {
  return HttpRequest("/admin/system/getInfo", Methods.get, params);
}

// 验证码
export function getCodeImg(params = {}): Promise<httpResponse> {
  return HttpRequest("/captcha", Methods.get, params, false);
}
