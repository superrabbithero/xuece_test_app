// import router from '@/router'
import { defineStore } from 'pinia'
import userApi from '@/api/endpoints/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem("token") || '',
    userInfo: JSON.parse(localStorage.getItem("userInfo")) || {}
  }),
  
  actions: {
    
    async login(userData) {
      try {
        // 确保包含所有必填字段
        const requiredFields = ['user_name', 'password']
        const missingFields = requiredFields.filter(field => !userData[field])
        
        if (missingFields.length > 0) {
          // throw new Error(`缺少必填字段: ${missingFields.join(', ')}`)
          return {
            code: 400,
            success:false,
            message:`缺少必填字段: ${missingFields.join(', ')}`,
            data:null
          }
        }
        
        const response = await userApi.login(userData)

        console.log(response.data)

        this.token = response?.data?.token
        this.userInfo = response?.data?.user_info
    
        localStorage.setItem('token', this.token)
        localStorage.setItem('userInfo', JSON.stringify(this.userInfo))
        console.log(response)
        return response
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    }


  }
})