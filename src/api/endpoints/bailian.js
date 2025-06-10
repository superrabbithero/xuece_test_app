import http from '../http.js'

export default {
  // 人像风格重绘
  image_generation(data) {
    return http.post(
      'bailian/image_generation', data, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
  },

  get_task(taskId) {
    return http.get(`bailian/tasks/${taskId}`)
  }
}