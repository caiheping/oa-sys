import axios from "axios"
import { useAppStore } from "@/store/modules/app"
import { message as Message, Modal } from "ant-design-vue"
import { getToken, removeToken } from "@/utils/auth"
import { baseUrl } from '@/config'
import { tansParams } from './tools'
import { i18n } from "@/locales"

type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface HttpResponse<T = any> {
  data: T;
  code: number,
  message: any,
  [key: string]: any
}

axios.defaults.withCredentials = true // 跨域访问需要发送cookie时一定要加这句

let httpTime = 0

// 添加请求拦截器，在发送请求之前做些什么
axios.interceptors.request.use(
  function (config) {
    httpTime++
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么，允许在数据返回客户端前，修改响应的数据
    return response.data
  },
  function (error) {
    return Promise.reject(error)
  }
)

// 封装数据返回失败提示函数
function errorState(error: any) {
  let message = ""
  switch (error.response && error.response.status) {
    case 400:
      for (const key in error.response.data.error) {
        console.log(key)
        message = error.response.data.error[key].message || i18n.global.t("sys.api.errMsg400")
        Message.error(message)
      }
      break
    case 401:
      Modal.confirm({
        title: i18n.global.t("sys.api.errMsg500"),
        content: i18n.global.t("sys.api.errTokenExpire"),
        onOk() {
          removeToken()
          window.location.reload()
        },
        onCancel() { },
      })

      break
    case 403:
      message = i18n.global.t("sys.api.errMsg403")
      Message.error(message)
      break
    case 500:
      message = error.response.data.message || i18n.global.t("sys.api.errMsg500")
      Message.error(message)

      break
    default:
      message = i18n.global.t("sys.api.errMsg500")
      Message.error(message)
  }
}


// 封装axios
function HttpRequest<T = any>(
  url: string,
  method: Methods,
  params: any = {},
  isLoading = true
): Promise<HttpResponse<T>> {
  const appStore = useAppStore()
  if (isLoading && method === "GET" && !appStore.loading) {
    appStore.loading = true
  }
  // 设置token
  const token = getToken()
  const httpDefault = {
    baseURL: baseUrl,
    method,
    url,
    headers: {
      withCredentials: true,
      Authorization: "Bearer " + token,
      vision: "1.0.0",
      operating_system: "Web",
      "Content-Type": "application/json; charset=utf-8",
    },
    params: method === "GET" || method === "DELETE" ? params : null,
    data: method === "POST" || method === "PUT" ? params : null,
    timeout: 10000,
  }
  return new Promise((resolve, reject) => {
    axios(httpDefault)
      .then((response: any) => {
        resolve(response)
      })
      .catch((response) => {
        errorState(response)
        reject(response)
      })
      .then(function () {
        httpTime--
        if (!httpTime) {
          appStore.loading = false
        }
      })
  })
}

export function downLoad(url, params = {}, filename = 'filename.xlsx') {
  console.log(baseUrl, url)
  return axios.post(baseUrl + url, params, {
    transformRequest: [(params) => {
      return tansParams(params)
    }],
    headers: {
      withCredentials: true,
      Authorization: "Bearer " + getToken(),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    responseType: 'blob'
  }).then((data: any) => {
    const content = data
    const blob = new Blob([content])
    if ('download' in document.createElement('a')) {
      const elink = document.createElement('a')
      elink.download = filename
      elink.style.display = 'none'
      elink.href = URL.createObjectURL(blob)
      document.body.appendChild(elink)
      elink.click()
      URL.revokeObjectURL(elink.href)
      document.body.removeChild(elink)
    } else {
      navigator.msSaveBlob(blob, filename)
    }
  }).catch((r) => {
    console.error(r)
  })
}

export default HttpRequest
