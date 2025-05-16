import { defineStore } from 'pinia'
import ossApi from '@/api/endpoints/oss'

export const useOssStore = defineStore('oss', {
  state: () => ({
    stsToken: {}
  }),
  
  actions: {
    async getStsToken() {
      const res = await ossApi.getStsToken()
      console.log(res)
      this.stsToken = res.data
    },

    async getDownloadUrl(oss_key) {
      const res = await ossApi.getUrl(oss_key)
      return res.data
    } 
  }
})