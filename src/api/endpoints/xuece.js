import http from '../http.js'

export default {
  // 获取所有包
  get_answercard_info(params) {
    return http.get('/xuece/get_answercard', {params})
  }
}