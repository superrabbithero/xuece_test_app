import { defineStore } from 'pinia'
import packageApi from '@/api/endpoints/package'

export const usePackageStore = defineStore('package', {
  state: () => ({
    curFilter:{appname: '0',system:null,is_debug:null,page:1,per_page:10},
    packages: [],
    pagination: {},
    isLoading:false
  }),
  
  actions: {
    async fetchPackages() {
      
      this.isLoading = true
      const res = await packageApi.getPackages(this.curFilter)
      this.isLoading = false
      this.packages = res?.data?.packages
      this.pagination = {
        total: res?.data?.total,
        pages: res?.data?.pages
      }
    },
    
    async createPackage(packageData) {
      try {
        // 确保包含所有必填字段
        const requiredFields = ['version', 'name', 'size', 'system', 'oss_key']
        const missingFields = requiredFields.filter(field => !packageData[field])
        
        if (missingFields.length > 0) {
          throw new Error(`缺少必填字段: ${missingFields.join(', ')}`)
        }
        
        // 添加默认值
        const completePackageData = {
          ar: 'x64',
          comment: '',
          appname: '',
          ...packageData
        }
        
        const response = await packageApi.createPackage(completePackageData)
        this.curFilter.appname = completePackageData.appname
        this.curFilter.page = 1
        this.fetchPackages()

        return response
      } catch (error) {
        console.error('创建软件包失败:', error)
        throw error
      }
    },

    async updatePackage(index, id, packageData) {
      try {
        if(this.packages[index].id == id){
          const response = await packageApi.updatePackage(id, packageData)
          const newPkg = await this.getPackage(id)
          console.log('newPkg',newPkg)
          this.packages[index] = newPkg
          return response
        }          
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
        console.log(res.data.package)
        return res.data.package; // 返回 Promise 的结果
      } catch (error) {
        console.error('查询软件包失败:', error);
        throw error; // 抛出错误以便在 .catch 中处理
      }
    }


  }
})