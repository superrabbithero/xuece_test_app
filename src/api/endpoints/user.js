import http from '../http.js'

export default {
    login(data) {
        return http.post('/user/login', data, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
      },
}