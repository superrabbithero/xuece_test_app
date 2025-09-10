<template>
  <div class="upload-box">
    <div
      :class="['au-grid', 'upload-area', type, { dragable: dragable, 'drag-over': isDragOver }]"
      @dragover.prevent
      @drop="handleDrop"
      @dragenter="handleDragEnter"
      @dragleave="handleDragLeave"
      @click="!dragable && chooseFile()"
    >
      <!-- 拖拽区域提示 -->
      <div v-if="isDragOver && dragable" class="drag-overlay">
        <p>释放文件上传</p>
      </div>
      
      <!-- 非拖拽状态下的提示 -->
      <div v-else class="upload-prompt">
        <template v-if="uploadedUrl">
          <au-image :src="uploadedUrl"><au-icon name="RiDeleteBin6Line" size="16" @click="clearFile"/></au-image>
        </template>
        <template v-else-if="dragable">
          <p>拖拉文件到此区域上传或<a class="text-btn" @click.stop="chooseFile">选择文件</a></p>
        </template>
        <template v-else-if="type === 'image'">
          <div class="image-prompt rows center">
            <au-icon size="24" name="RiAddLine"/>
            <span>点击上传图片</span>
          </div>
        </template>
        
      </div>

      <!-- 文件选择输入框 -->
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        @change="handleFileChange"
        class="file-input"
      >
      <div v-if="uploading" class="upload-progress">
        上传中: {{ progress }}%
      </div>
    </div>

    <!-- 文件名称显示 -->
    <div v-if="file && false" class="file-info">
      <span class="file-name" :title="file.name || file">{{ file.name || file }}</span>
      <au-icon
        class="remove-btn"
        name="RiCloseCircleLine"
        size="20"
        @click="clearFile"
      />
    </div>
  </div>

  

</template>

<script>
import { ref, computed, inject } from 'vue';
import imageApi from '@/api/endpoints/image'
import {uploadToOSSByKey} from '@/api/ossApi.js'
import oss from '@/api/endpoints/oss'



// MIME类型映射表
const MIME_TYPES = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  mp4: 'video/mp4',
  mp3: 'audio/mp3',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  zip: 'application/zip',
  rar: 'application/vnd.rar'
};

export default {
  name: 'FileUpload',
  
  props: {
    accept: {
      type: String,
      default: ''
    },
    modelValue: {
      type: [File,String],
      default: null
    },
    type: {
      type: String,
      default: ''
    },
    dragable: {
      type: Boolean,
      default: false
    },
    // 新增一个上传方法prop
    uploadHandler: {
      type: Function,
      default: null
    }
  },

  emits: ['update:modelValue', 'error'],

  setup(props, { emit }) {
    const isDragOver = ref(false);
    const fileInput = ref(null);
    const file = computed(() => props.modelValue);

    const toast = inject('toast');

    // 新增上传状态
    const uploading = ref(false);
    const progress = ref(0);
    const uploadedUrl = ref(null)

    const image_viewer_data = ref(null)

    const imageView = () => {
      console.log(uploadedUrl.value)
      if(uploadedUrl.value){
        image_viewer_data.value = uploadedUrl.value
      }
    }

    // 处理文件上传
    const handleUpload = async (file) => {
      if (!file) return;
      
      try {
        uploading.value = true;
        progress.value = 0;
        
        let result;
        
        if (props.uploadHandler) {
          // 如果提供了自定义上传方法
          result = await props.uploadHandler({
            file,
            onProgress: (percent) => {
              progress.value = percent;
              // emit('progress', percent);

            }
          });
        } else {
          // 默认行为（可选）
          result = await defaultUpload(file);
        }
        uploadedUrl.value = result
        console.log(result)
        // emit('upload-success', result);
      } catch (error) {
        // emit('upload-error', error);
        console.error(error)
      } finally {
        uploading.value = false;
      }
    };

    const defaultUpload = (file) => {
      console.log(file.name)
      if(props.type == 'image')
        return upload_image_to_oss(file)
    }

    const upload_image_to_oss = async (file) => {
      const path = process.env.NODE_ENV === 'development' ? 'test/images/doc_cover' : 'images/doc_cover'
      const r = await imageApi.reserve_img(file.name, path)
      const img_data = r?.data?.data
      console.log(img_data)
      if(img_data?.oss_key){
        const oss_token = await oss.getStsToken()
        const rst = await uploadToOSSByKey(file,img_data.oss_key,oss_token.data)
        if(rst?.url)
          return rst.url
        else
          return '图片上传oss失败'
      }else{
        console.error('reserve图片失败')
      }
    }

    // 选择文件
    const chooseFile = () => {
      fileInput.value?.click();
    };

    // 清空文件
    const clearFile = () => {
      uploadedUrl.value = null
      emit('update:modelValue', null);
    };

    // 处理文件选择
    const handleFileChange = (event) => {
      const selectedFile = event.target.files[0];
      if (selectedFile) {
        validateAndSetFile(selectedFile);
      }
    };

    // 处理拖拽放置
    const handleDrop = (event) => {
      if (!props.dragable) return;
      
      isDragOver.value = false;
      event.preventDefault();
      
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        validateAndSetFile(droppedFile);
      }
    };

    // 处理拖拽进入
    const handleDragEnter = (event) => {
      if (!props.dragable) return;
      event.preventDefault();
      isDragOver.value = true;
    };

    // 处理拖拽离开
    const handleDragLeave = (event) => {
      if (!props.dragable) return;
      
      // 确保鼠标真正离开上传区域
      if (!event.currentTarget.contains(event.relatedTarget)) {
        isDragOver.value = false;
      }
    };

    // 验证并设置文件
    const validateAndSetFile = async (file) => {
      if (isFileValid(file.name, props.accept)) {
        await handleUpload(file);
        if(uploadedUrl.value)
          emit('update:modelValue', uploadedUrl.value);
        else
          emit('update:modelValue', file);
      } else {
        const errorMsg = `文件格式不符合要求 (${props.accept})`;
        toast?.(errorMsg, { type: 'error' });
        // emit('error', new Error(errorMsg));
      }
    };

    // 验证文件是否符合accept规则
    const isFileValid = (fileName, acceptRules) => {
      if (!acceptRules) return true;

      const rules = acceptRules.split(',').map(rule => rule.trim());
      const extension = fileName.toLowerCase().split('.').pop();

      return rules.some(rule => {
        // 处理扩展名规则 (.pdf, .jpg)
        if (rule.startsWith('.')) {
          return extension === rule.substring(1).toLowerCase();
        }
        
        // 处理MIME类型规则 (image/*, application/pdf)
        const fileMime = getMimeTypeFromExtension(extension);
        if (rule.includes('/*')) {
          const category = rule.split('/')[0].toLowerCase();
          return fileMime.startsWith(category);
        }
        
        return fileMime === rule.toLowerCase();
      });
    };

    // 根据扩展名获取MIME类型
    const getMimeTypeFromExtension = (extension) => {
      return MIME_TYPES[extension] || 'application/octet-stream';
    };

    return {
      isDragOver,
      fileInput,
      file,
      chooseFile,
      clearFile,
      handleDrop,
      handleDragEnter,
      handleDragLeave,
      handleFileChange,
      uploading,
      progress,
      uploadedUrl,
      imageView,
      image_viewer_data
    };
  }
};
</script>

<style scoped>
.upload-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.upload-area {
  border: 2px dashed #8888;
  border-radius: 8px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

/*.upload-area:hover {
  border-color: var(--main-color);
  background-color: #8882;
}*/

.upload-area.drag-over {
  border-color: var(--main-color);
  background-color: #8882;
}

.upload-area.image {
  width: 100px;
  height: 100px;
  background: #8882;
  min-height: unset;
}

.drag-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #8882;
}

.upload-prompt {
  height: 100%;
  width: 100%;
  text-align: center;
  color: var(--text-secondary, #6c757d);
}

.image-prompt {
  height: 100%;
  width: 100%;
  flex-direction: column;
  gap: 4px;
  color: inherit;
}

.image-prompt span{
  font-size: 0.9rem;
}

.upload-area.image:hover {
  border-color: var(--main-color);
}

.text-btn {
  color: var(--main-color);
  text-decoration: underline;
  cursor: pointer;
  margin-left: 4px;
}

.text-btn:hover {
  color: var(--main-color-dark);
}

.file-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  z-index: -1;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background-color: var(--bg-secondary, #f8f9fa);
  border-radius: 4px;
}

.file-name {
  flex: 1;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remove-btn {
  color: var(--danger, #dc3545);
  cursor: pointer;
  flex-shrink: 0;
}

.remove-btn:hover {
  color: var(--danger-dark, #bd2130);
}
</style>