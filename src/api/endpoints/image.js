import http from '../http.js'

export default {
    reserve_img(fileName,oss_path) {
      const data = {
        'ext': fileName.substring(fileName.lastIndexOf(".")),
        'prefix': oss_path
      }
      return http.post('/images/reserve', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
    },
}