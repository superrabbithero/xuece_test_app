import axios from 'axios'
import router from '@/router'

// 创建axios实例
const http = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || '/api', // Webpack环境变量
  timeout: 10000
})

// 请求拦截器
http.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
http.interceptors.response.use(
  response => {
    // 正常响应直接返回数据
    return {
      code:200,
      success:true,
      message: response.msg || '请求成功',
      data:response.data
    }
  },
  error => {
    if (error.response) {
      // 401未授权错误处理
      if (error.response.status === 401 || error.response.status === 403) {
        // 1. 清除失效token
        localStorage.removeItem('token')
        
        // 2. 跳转登录页
        console.log(router.currentRoute.value.path)
        const isLoginPage = router.currentRoute.value.path === '/login';

        //如果是登录页面则不跳转
        if(!isLoginPage){
          router.replace({
            path: '/login',
            query: { 
              redirect: router.currentRoute.value.fullPath // 携带当前路径用于登录后回跳
            }
          })
        }
        
        
        // 3. 返回统一错误信息
        return Promise.resolve({
          code: 401,
          message: 'token有误，请重新登录',
          handled: true
        })
      }
      
      // 其他错误返回服务器响应数据
      return Promise.resolve({
        code: error.response.status,
        message: error.response.data.message,
        handled: true
      })
    }
    
    // 处理网络错误等没有response的情况
    return Promise.reject(error)
  }
)

// 正确导出http实例
export default http