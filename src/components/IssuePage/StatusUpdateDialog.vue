<template>
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog">
      <h2>更新问题状态</h2>
      
      <div class="form-group">
        <label>新状态:</label>
        <select v-model="formData.status">
          <option value="claimed">已认领</option>
          <option value="ignored">已忽略</option>
          <option value="resolved">已处理</option>
        </select>
      </div>
      
      <div v-if="formData.status === 'claimed' || formData.status === 'resolved'" class="form-group">
        <label>Gitee URL:</label>
        <input type="url" v-model="formData.gitee_url" placeholder="https://gitee.com/..." required>
      </div>
      
      <div v-if="formData.status === 'ignored'" class="form-group">
        <label>忽略原因:</label>
        <textarea v-model="formData.ignore_reason" placeholder="请输入忽略原因..." required></textarea>
      </div>
      
      <div class="dialog-buttons">
        <button @click="closeDialog">取消</button>
        <button @click="submitForm" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : '确认' }}
        </button>
      </div>
      
      <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive,defineProps,defineEmits } from 'vue';
import { updateIssueStatus } from '@/api/endpoints/issue';

const props = defineProps({
  visible: Boolean,
  issueId: Number
});

const emit = defineEmits(['status-updated', 'close']);

const formData = reactive({
  status: 'claimed',
  gitee_url: '',
  ignore_reason: ''
});

const isSubmitting = ref(false);
const errorMessage = ref('');

const closeDialog = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  formData.status = 'claimed';
  formData.gitee_url = '';
  formData.ignore_reason = '';
  errorMessage.value = '';
};

const submitForm = async () => {
  isSubmitting.value = true;
  errorMessage.value = '';
  
  try {
    const payload = {
      status: formData.status
    };
    
    if (formData.status === 'claimed' || formData.status === 'resolved') {
      if (!formData.gitee_url) {
        throw new Error('Gitee URL不能为空');
      }
      payload.gitee_url = formData.gitee_url;
    }
    
    if (formData.status === 'ignored') {
      if (!formData.ignore_reason) {
        throw new Error('忽略原因不能为空');
      }
      payload.ignore_reason = formData.ignore_reason;
    }
    
    await updateIssueStatus(props.issueId, payload);
    emit('status-updated');
    closeDialog();
  } catch (error) {
    errorMessage.value = error.response?.data?.message || error.message || '状态更新失败';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 样式同之前版本 */
</style>