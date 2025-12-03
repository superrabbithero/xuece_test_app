<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog">
      <h2>创建新问题</h2>
      
      <div class="form-group">
        <label>问题内容:</label>
        <textarea 
          v-model="formData.content" 
          placeholder="请详细描述问题..."
          rows="5"
          required
        ></textarea>
      </div>
      
      <div class="form-group">
        <label>添加图片:</label>
        <!-- <ImageUploader @images-change="handleImagesChange" /> -->
      </div>
      
      <div class="dialog-buttons">
        <button @click="closeDialog">取消</button>
        <button @click="submitForm" :disabled="isSubmitting">
          {{ isSubmitting ? '创建中...' : '创建问题' }}
        </button>
      </div>
      
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, defineProps, defineEmits } from 'vue';
import { createIssue } from '@/api/endpoints/issue';
// import ImageUploader from './ImageUploader.vue';

defineProps({
  visible: Boolean
});

const emit = defineEmits(['issue-created', 'close']);

const formData = reactive({
  content: '',
  images: []
});

const isSubmitting = ref(false);
const errorMessage = ref('');

// const handleImagesChange = (images) => {
//   formData.images = images;
// };

const closeDialog = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  formData.content = '';
  formData.images = [];
  errorMessage.value = '';
};

const submitForm = async () => {
  if (!formData.content.trim()) {
    errorMessage.value = '问题内容不能为空';
    return;
  }
  
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    await createIssue(formData.content, formData.images);
    emit('issue-created');
    closeDialog();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '创建问题失败';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.dialog {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
}

.dialog-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.dialog-buttons button:first-child {
  background-color: #f0f0f0;
}

.dialog-buttons button:last-child {
  background-color: #42b983;
  color: white;
}

.error-message {
  color: #ff5252;
  margin-top: 15px;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}
</style>