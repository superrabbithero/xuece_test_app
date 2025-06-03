import { defineStore } from 'pinia'
import ossApi from '@/api/endpoints/oss'
import { ossMultipartUpload } from '@/api/ossApi';

export const useOssStore = defineStore('oss', {
  state: () => ({
    stsToken: {},
    progress: 0,
    isUploading: false
  }),
  
  actions: {
    async getStsToken() {
      const res = await ossApi.getStsToken()

      this.stsToken = res.data
    },

    async getDownloadUrl(oss_key) {
      const res = await ossApi.getUrl(oss_key)
      return res.data
    }, 

    async MultiUpload(files, oss_path='packages/') {

      console.log(files)
      // 1. 参数校验（支持单文件或文件数组）
      if (!files) return [];
      const fileList = Array.isArray(files) ? files : [files];

      console.log(fileList)
      if (fileList.length === 0) return [];

      // 2. 检查STS Token   
      // if (!this.stsToken?.access_key_id) {
      await this.getStsToken();
      // }

      // 3. 初始化上传状态
      this.isUploading = true;
      this.progress = 0;

      try {
        // 4. 计算总大小用于进度计算
        const totalSize = fileList.reduce((sum, file) => sum + file.size, 0);
        let uploadedSize = 0;

        // 5. 批量上传（Promise.allSettled确保单个失败不影响其他）
        const results = await Promise.allSettled(
          fileList.map(file => {
            const path = process.env.NODE_ENV === 'development' 
              ? `test/${oss_path}` 
              : oss_path;

            // 单个文件的上传选项（带进度回调）
            const options = {
              progress: (p, uploadedFile) => {
                const fileSize = uploadedFile?.size || file.size; 
                uploadedSize += fileSize * p;
                this.progress = Math.round((uploadedSize / totalSize) * 100);
              }
            };

            const rst = ossMultipartUpload(file, path, this.stsToken, options);
            console.log(rst)
            return rst
          })
        );

        // 6. 处理上传结果
        return results.map((result, index) => {
          if (result.status === 'fulfilled') {
            return {
              success: true,
              data: result.value,
              file: fileList[index].name
            };
          } else {
            console.error(`${fileList[index].name} 上传失败:`, result.reason);
            return {
              success: false,
              error: result.reason,
              file: fileList[index].name
            };
          }
        });

      } catch (err) {
        console.error('批量上传异常:', err);
        throw err; // 抛出异常让调用方处理
      } finally {
        this.isUploading = false;
      }
    }
  }
})