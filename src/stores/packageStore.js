import { defineStore } from 'pinia'
import packageApi from '@/api/endpoints/package'

export const usePackageStore = defineStore('package', {
  state: () => ({
    packages: [],
    pagination: {}
  }),
  
  actions: {
    async fetchPackages(params) {
      const res = await packageApi.getPackages(params)
      console.log(res)
      this.packages = res.packages
      this.pagination = {
        total: res.total,
        pages: res.pages
      }
    },
    
    async createPackage(packageData) {
      try {
        // 确保包含所有必填字段
        const requiredFields = ['version', 'name', 'size', 'system', 'package_name', 'oss_key']
        const missingFields = requiredFields.filter(field => !packageData[field])
        
        if (missingFields.length > 0) {
          throw new Error(`缺少必填字段: ${missingFields.join(', ')}`)
        }
        
        // 添加默认值
        const completePackageData = {
          ar: 'x64',
          status: 0,
          comment: '',
          appname: '',
          ...packageData
        }
        
        const response = await packageApi.createPackage(completePackageData)
        return response
      } catch (error) {
        console.error('创建软件包失败:', error)
        throw error
      }
    },

    async updatePackage(id, packageData) {
      try {
        const response = await packageApi.updatePackage(id, packageData)
        return response
      } catch (error) {
        console.error('更新软件包信息失败:', error)
        throw error
      }
    },

    async deletePackage(id) {
      try {
        const res = await packageApi.deletePackage(id); // 添加 await
        return res; // 返回 Promise 的结果
      } catch (error) {
        console.error('删除软件包失败:', error);
        throw error; // 抛出错误以便在 .catch 中处理
      }
    },

    async getPackage(id) {
      try {
        const res = await packageApi.getPackageById(id); // 添加 await
        // console.log(res,res.package,res['package'])
        return res.package; // 返回 Promise 的结果
      } catch (error) {
        console.error('查询软件包失败:', error);
        throw error; // 抛出错误以便在 .catch 中处理
      }
    }


  }
})