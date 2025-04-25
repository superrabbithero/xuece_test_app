import axios from 'axios'

const http = axios.create({
  // baseURL: process.env.API_BASE_URL || '/api', // Webpack 环境变量
  baseURL: 'http://localhost:5000/api', // Flask后端地址
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
    }
    return Promise.reject(error)
  }
)

export default http