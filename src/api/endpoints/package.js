import http from '../http.js'

export default {
  // 获取所有包
  getPackages(params) {
    return http.get('/packages/search', { params })
  },
  
  // 创建包（JSON格式）
  createPackage(data) {
    return http.post('/packages/', data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  // 删除包
  deletePackage(id) {
    return http.delete(`/packages/${id}`)
  },

  //更新包名和描述
  updatePackage(id, data) {
    return http.put(`/packages/${id}`, data,{
      headers: {
        'Content-Type': 'application/json'
      }
    })
  },
  //精确查找安装包信息
  getPackageById(id) {
    return http.get(`/packages/${id}`)
  }
}