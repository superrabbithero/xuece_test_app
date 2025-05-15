import axios from 'axios'
import router from '@/router'

const http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api', // Webpack 环境变量
  timeout: 10000
})

// 请求拦截器
http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
http.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // 处理token过期
      // 1. 清除失效Token
      localStorage.removeItem('token');
      
      // 2. 跳转登录页
      router.replace({
        path: '/login',
        query: { 
          redirect: router.currentRoute.fullPath // 携带当前路径用于登录后回跳
        }
      })
      
      // 3. 返回统一错误信息
      return Promise.reject({
        code: 401,
        message: '认证失效，请重新登录'
      });
    }
    return Promise.reject(error)
  }
)

export default http