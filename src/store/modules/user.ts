import { defineStore } from "pinia"
import { login, getInfo, logout } from "@/api/login"
import Cookies from "js-cookie"
import { getToken, setToken, removeToken } from "@/utils/auth"
import { useAppStore } from './app'

interface LoginParams {
  userName: string | undefined;
  password: string | undefined;
  captcha: string | undefined;
}

interface UserInfo {
  [key: string]: any;
}

interface UserStore {
  userInfo: UserInfo;
  token: string | undefined;
  roles: string[];
  permissions: string[];
}

export const useUserStore = defineStore({
  id: "user",
  state: (): UserStore => {
    return {
      userInfo: {},
      token: getToken(),
      roles: [],
      permissions: [],
    }
  },
  getters: {},
  actions: {
    // 登录
    async Login(params: LoginParams, checked: boolean) {
      Cookies.set("userName", params.userName as string, {
        expires: 7, // 有效期7天
      })
      Cookies.set("password", params.password as string, {
        expires: 7,
      })
      Cookies.set("rememberMe", checked === true ? "true" : "false", {
        expires: 7,
      })
      const res = await login(params)
      setToken(res.data.token)
      this.token = res.data.token
      return res
    },
    // 登出
    async Logout() {
      const res = await logout()
      const appStore = useAppStore()
      appStore.resetTabs()
      removeToken()
      return res
    },
    // 获取用户信息
    async GetInfo() {
      try {
        const res = await getInfo()
        res.data.user.avatar === ""
          ? (await import("@/assets/images/profile.jpg")).default
          : res.data.user.avatar
        if (res.data?.user?.roles && res.data.user?.roles.length > 0) {
          // 验证返回的roles是否是一个非空数组
          this.roles = res.data.roles
          this.permissions = res.data.permissions
        } else {
          this.roles = []
        }
        this.userInfo = res.data.user
        return res
      } catch (error) {
        if (error.response.status === 401) {
          removeToken()
        }
      }
    },
  },
})
