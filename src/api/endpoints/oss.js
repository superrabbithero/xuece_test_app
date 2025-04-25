import http from '../http.js'

export default {
  // 获取所有包
  getStsToken() {
    return http.get('/oss/sts-token')
  }
}