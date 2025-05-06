import http from '../http.js'

export default {
  // 获取所有包
  getStsToken() {
    return http.get('/oss/sts-token')
  },
  //获得安装包路径
  getUrl(oss_key) {
    return http.get(`/oss/download/${oss_key}`)
  }
}