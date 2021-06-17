import axios from "axios";
import { useAppStore } from "@/store/modules/app";
import { message as Message } from "ant-design-vue";
import { getToken, removeToken } from "@/utils/auth";

axios.defaults.withCredentials = true; // 跨域访问需要发送cookie时一定要加这句

let httpTime = 0;

// 添加请求拦截器，在发送请求之前做些什么
axios.interceptors.request.use(
  function (config) {
    httpTime++;
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 添加响应拦截器
axios.interceptors.response.use(
  function (response) {
    // 对响应数据做点什么，允许在数据返回客户端前，修改响应的数据
    return response.data;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// 封装数据返回失败提示函数
function errorState(error: any) {
  let message = "";
  switch (error.response && error.response.status) {
    case 400:
      for (const key in error.response.data.error) {
        console.log(key);
        message = error.response.data.error[key].message || "参数错误";
        Message.error(message);
      }
      break;
    case 401:
      message = "token失效";
      Message.error(message);
      removeToken();
      break;
    case 403:
      message = "拒绝访问";
      Message.error(message);
      break;
    case 500:
      message = error.response.data.message || "服务器异常";
      Message.error(message);

      break;
    default:
      message = "服务器异常";
      Message.error(message);
  }
}

export enum Methods {
  get = "GET",
  post = "POST",
  put = "PUT",
  del = "DELETE",
}

// 封装axios
function HttpRequest(
  url: string,
  method: Methods = Methods.get,
  params: any = {},
  isLoading = true
): Promise<any> {
  const appStore = useAppStore();
  if (isLoading && method === "GET" && !appStore.loading) {
    appStore.loading = true;
  }
  // 设置token
  const token = getToken();
  const httpDefault = {
    baseURL: import.meta.env.VITE_GLOB_API_URL as string,
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
  };
  return new Promise((resolve, reject) => {
    axios(httpDefault)
      .then((response) => {
        resolve(response);
      })
      .catch((response) => {
        errorState(response);
        reject(response);
      })
      .then(function () {
        httpTime--;
        if (!httpTime) {
          appStore.loading = false;
        }
      });
  });
}

export default HttpRequest;
