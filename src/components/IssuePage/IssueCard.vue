<template>
  <div class="issue-card" :class="statusClass">
    <div class="card-header">
      <span class="status-badge" :class="statusClass">{{ statusText }}</span>
      <span class="timestamp">{{ formatDate(issue.created_at) }}</span>
    </div>
    
    <div class="content">
      {{ issue.content }}
    </div>
    
    <div v-if="issue.images && issue.images.length" class="image-gallery">
      <div 
        v-for="(img, index) in issue.images" 
        :key="index" 
        class="thumbnail"
        @click="openImagePreview(img)"
      >
        <img :src="img" alt="问题截图">
      </div>
    </div>
    
    <div class="submitter-info">
      <div class="avatar"></div>
      <span>{{ issue.submitter?.name || '未知用户' }}</span>
    </div>
    
    <div v-if="issue.handler" class="handler-info">
      <span>处理人: {{ issue.handler.name }}</span>
      <a v-if="issue.gitee_url" :href="issue.gitee_url" target="_blank" class="gitee-link">
        查看Bug单
      </a>
    </div>
    
    <div v-if="issue.ignore_reason" class="ignore-reason">
      <strong>忽略原因:</strong> {{ issue.ignore_reason }}
    </div>
    
    <div class="card-footer">
      <button @click="showStatusDialog = true">更新状态</button>
      <button @click="issue_delete" class="delete-btn">删除</button>
    </div>
    
    <!-- 图片预览 -->
    <div v-if="previewImage" class="image-preview" @click="previewImage = null">
      <img :src="previewImage" alt="预览">
    </div>
    
    <!-- 状态更新对话框 -->
    <StatusUpdateDialog 
      :visible="showStatusDialog"
      :issue-id="issue.id"
      @status-updated="handleStatusUpdated"
      @close="showStatusDialog = false"
    />
  </div>
</template>

<script setup>
import { ref,defineProps,defineEmits } from 'vue';
import { deleteIssue } from '@/api/endpoints/issue';
import StatusUpdateDialog from './StatusUpdateDialog.vue';

const props = defineProps({
  issue: Object
});

const emit = defineEmits(['status-changed']);

const showStatusDialog = ref(false);
const previewImage = ref(null);

const statusMap = {
  unhandled: { text: '未处理', class: 'status-unhandled' },
  claimed: { text: '已认领', class: 'status-claimed' },
  ignored: { text: '已忽略', class: 'status-ignored' },
  resolved: { text: '已处理', class: 'status-resolved' }
};

const statusText = statusMap[props.issue.status]?.text || props.issue.status;
const statusClass = statusMap[props.issue.status]?.class || '';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString();
};

const openImagePreview = (imgUrl) => {
  previewImage.value = imgUrl;
};

const handleStatusUpdated = () => {
  emit('status-changed');
  showStatusDialog.value = false;
};

const issue_delete = async () => {
  if (confirm('确定要删除这个问题吗？')) {
    try {
      await deleteIssue(props.issue.id);
      emit('status-changed');
    } catch (error) {
      console.error('删除问题失败:', error);
      alert('删除问题失败: ' + (error.response?.data?.message || error.message));
    }
  }
};
</script>

<style scoped>
.issue-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
  transition: transform 0.2s;
}

.issue-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.status-unhandled {
  background-color: #ff5252;
}

.status-claimed {
  background-color: #ffb142;
}

.status-ignored {
  background-color: #aaa;
}

.status-resolved {
  background-color: #2ed573;
}

.timestamp {
  font-size: 12px;
  color: #777;
}

.content {
  margin-bottom: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
}

.image-gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.thumbnail {
  cursor: pointer;
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 1/1;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.thumbnail:hover img {
  transform: scale(1.05);
}

.submitter-info, .handler-info {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #42b983;
  margin-right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
}

.gitee-link {
  margin-left: 10px;
  color: #007bff;
  text-decoration: none;
}

.gitee-link:hover {
  text-decoration: underline;
}

.ignore-reason {
  padding: 8px;
  background-color: #fff8e1;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 14px;
}

.card-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 12px;
}

.card-footer button {
  padding: 6px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.card-footer button:hover {
  background-color: #2980b9;
}

.delete-btn {
  background-color: #ff6b6b !important;
}

.delete-btn:hover {
  background-color: #ff5252 !important;
}

.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  cursor: pointer;
}

.image-preview img {
  max-width: 90%;
  max-height: 90%;
}
</style>