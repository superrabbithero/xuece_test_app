<template>
  <div class="issue-page">
    <!-- 顶部导航栏 -->
    <div class="page-header">
      <div class="header-actions">
        <AuButton variant="filled" size="small" @click="showCreateForm = true">
          创建问题
        </AuButton>
        <AuButton variant="outline" size="small" @click="fetchIssues">
          主动获取
        </AuButton>
      </div>
    </div>

    <!-- 筛选区域 -->
    <div class="filter-section">
      <div class="filter-group">
        <input type="date" v-model="filters.startTime" class="date-input">
        <span class="filter-separator">至</span>
        <input type="date" v-model="filters.endTime" class="date-input">
      </div>
      <div class="filter-group">
        <AuSelect 
          label="状态"
          :dataList="statusOptions" 
          v-model="statusIndex"
          @change="handleStatusChange"
        />
      </div>
      <AuButton variant="filled" size="small" @click="applyFilters">
        筛选
      </AuButton>
      <AuButton variant="outline" size="small" @click="resetFilters">
        重置
      </AuButton>
    </div>

    <!-- 问题列表 -->
    <div class="issue-list">
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <div v-else-if="issues.length === 0" class="empty-container">
        <p>暂无问题数据</p>
      </div>
      <div v-else class="issue-cards">
        <div 
          v-for="issue in issues" 
          :key="issue.id" 
          class="issue-card"
        >
          <div class="card-header">
            <div class="issue-id">#{{ issue.id }}</div>
            <div :class="['issue-status', `status-${issue.status}`]">
              {{ getStatusText(issue.status) }}
            </div>
          </div>
          <div class="card-content">
            <p class="issue-description">{{ issue.content }}</p>
            <div v-if="issue.images && issue.images.length > 0" class="issue-images">
              <img 
                v-for="(image, index) in issue.images" 
                :key="index" 
                :src="image" 
                alt="问题图片" 
                class="issue-image"
              >
            </div>
          </div>
          <div class="card-footer">
            <div class="issue-time">{{ formatTime(issue.created_at) }}</div>
            <AuButton variant="filled" size="small" @click="openStatusDialog(issue)">
              处理
            </AuButton>
          </div>
        </div>
      </div>
    </div>

    <!-- 手动创建问题表单 -->
    <MyModal 
      v-model="showCreateForm"
      :modeless="false"
      :width="500"
      title="创建新问题"
    >
      
      <form @submit.prevent="submitIssue" class="create-form">
        <div class="form-group">
          <label>问题描述：</label>
          <textarea 
            v-model="newIssue.content" 
            placeholder="请输入问题描述" 
            rows="5"
            required
          ></textarea>
        </div>
        <div class="form-group">
          <label>上传图片：</label>
          <div class="image-uploader">
            <AuFileInput 
              type="image" 
              accept="image/*" 
              @change="handleImageUpload"
            />
            <div v-if="newIssue.images.length > 0" class="uploaded-images">
              <div 
                v-for="(image, index) in newIssue.images" 
                :key="index" 
                class="uploaded-image-item"
              >
                <img :src="image.url" alt="预览" class="image-preview">
                <AuButton 
                  variant="text" 
                  size="small" 
                  @click="removeImage(index)"
                  class="remove-image"
                >
                  ×
                </AuButton>
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <AuButton variant="outline" size="small" @click="closeCreateForm">
          取消
        </AuButton>
        <AuButton variant="filled" size="small" type="submit" :isLoading="isUploading">
          {{ isUploading ? '上传中...' : '提交' }}
        </AuButton>
        </div>
      </form>
    </MyModal>

    <!-- 问题状态管理对话框 -->
    <MyModal 
      v-model="showStatusDialog"
      :modeless="false"
      :width="500"
      :title="`问题 #${selectedIssue?.id}`"
    >
      <div class="dialog-content">
        <div class="current-issue">
            <span :class="['issue-status', `status-${selectedIssue?.status}`]">
            {{ getStatusText(selectedIssue?.status) }}
          </span>
        
         
          <p>{{ selectedIssue?.content }}</p>
        </div>
        <div class="form-group">
          
        </div>
        <div class="form-group">
          <label>新状态：</label>
          <AuSelect 
            :dataList="statusOptions.slice(1)" 
            v-model="currentStatusIndex"
            @change="handleStatusUpdateChange"
          />
        </div>
        <div v-if="statusUpdate.newStatus === 'claimed' || statusUpdate.newStatus === 'resolved'" class="form-group">
          <label>Gitee Bug单 URL：</label>
          <input 
            style="width: auto;"
            type="url" 
            v-model="statusUpdate.giteeUrl" 
            placeholder="请输入Gitee Bug单地址"
            required
          >
        </div>
        <div v-if="statusUpdate.newStatus === 'ignored'" class="form-group">
          <label>忽略原因：</label>
          <textarea 
            v-model="statusUpdate.ignoreReason" 
            placeholder="请输入忽略原因"
            rows="3"
            required
          ></textarea>
        </div>
      </div>
      <div class="dialog-actions">
        <AuButton variant="outline" size="small" @click="closeStatusDialog">
        取消
      </AuButton>
      <AuButton variant="filled" size="small" @click="updateStatus">
        确认
      </AuButton>
      </div>
    </MyModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// import { useOssStore } from '@/stores/ossStore'
import issueApi from '@/api/endpoints/issue'

// 状态管理
const issues = ref([])
const isLoading = ref(false)
const showCreateForm = ref(false)
const showStatusDialog = ref(false)
const selectedIssue = ref(null)
const isUploading = ref(false)

// 筛选条件
const filters = ref({
  startTime: '',
  endTime: '',
  status: ''
})

// 状态列表数据
const statusOptions = ['全部', '未处理', '已认领', '已忽略', '已处理']
// 状态值映射
const statusValueMap = {
  '全部': '',
  '未处理': 'unhandled',
  '已认领': 'claimed',
  '已忽略': 'ignored',
  '已处理': 'resolved'
}
// 当前选中的状态索引
const statusIndex = ref(0)

// 新问题表单
const newIssue = ref({
  content: '',
  images: []
})

// 状态更新表单
const statusUpdate = ref({
  newStatus: '',
  giteeUrl: '',
  ignoreReason: ''
})

// 当前状态更新的索引
const currentStatusIndex = ref(0)

// OSS Store
// const ossStore = useOssStore()

// 生命周期钩子
onMounted(() => {
  loadIssues()
})

// 加载问题列表
const loadIssues = async () => {
  isLoading.value = true
  try {
    // 注释掉API调用，使用模拟数据
    /*
    const params = {}
    if (filters.value.startTime) params.start_time = filters.value.startTime
    if (filters.value.endTime) params.end_time = filters.value.endTime
    if (filters.value.status) params.status = filters.value.status
    
    const response = await issueApi.getIssues(params)
    issues.value = response.data
    */
    
    // 使用模拟数据展示UI效果
    issues.value = [
      {
        id: 1,
        content: '用户报告首页加载缓慢，特别是在移动设备上。点击某些链接会出现卡顿现象，影响用户体验。',
        status: 'unhandled',
        created_at: new Date().toISOString(),
        images: [
          'https://picsum.photos/seed/issue1/300/200'
        ]
      },
      {
        id: 2,
        content: '登录功能出现问题，用户输入正确的用户名和密码后无法登录。已经尝试清除缓存和重启浏览器，但问题仍然存在。',
        status: 'claimed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        images: [
          'https://picsum.photos/seed/issue2/300/200',
          'https://picsum.photos/seed/issue2-2/300/200'
        ]
      },
      {
        id: 3,
        content: '数据显示错误，某些统计图表中的数值与实际数据不符。特别是周报表中的销售数据存在明显偏差。',
        status: 'resolved',
        created_at: new Date(Date.now() - 172800000).toISOString(),
        images: []
      }
    ]
    
    // 如果有筛选条件，应用筛选
    if (filters.value.status) {
      issues.value = issues.value.filter(issue => issue.status === filters.value.status)
    }
    
    if (filters.value.startTime) {
      const startTime = new Date(filters.value.startTime)
      issues.value = issues.value.filter(issue => new Date(issue.created_at) >= startTime)
    }
    
    if (filters.value.endTime) {
      const endTime = new Date(filters.value.endTime)
      endTime.setHours(23, 59, 59, 999)
      issues.value = issues.value.filter(issue => new Date(issue.created_at) <= endTime)
    }
    
  } catch (error) {
    console.error('加载问题失败:', error)
    alert('加载问题失败，请稍后重试')
  } finally {
    isLoading.value = false
  }
}

// 应用筛选
const applyFilters = () => {
  loadIssues()
}

// 处理状态变化
const handleStatusChange = (index) => {
  filters.value.status = statusValueMap[statusOptions[index]]
}

// 重置筛选
const resetFilters = () => {
  filters.value = {
    startTime: '',
    endTime: '',
    status: ''
  }
  statusIndex.value = 0
  loadIssues()
}

// 主动获取问题
const fetchIssues = async () => {
  try {
    // 这里需要实现主动获取问题的逻辑，调用API获取外部数据
    // 目前假设API返回了问题数据
    const response = await issueApi.fetchIssues([])
    console.log('主动获取问题成功:', response)

    alert('主动获取成功')
    loadIssues()
  } catch (error) {
    console.error('主动获取问题失败:', error)
    alert('主动获取问题失败，请稍后重试')
  }
}

// 显示创建表单
const closeCreateForm = () => {
  showCreateForm.value = false
  newIssue.value = {
    content: '',
    images: []
  }
}

// 处理图片上传
const handleImageUpload = (e) => {
  // 由于AuFileInput组件已经处理了文件上传并返回了URL
  // 我们只需要将返回的URL添加到图片列表中
  if (e) {
    newIssue.value.images.push({
      url: e
    })
  }
}

// 移除图片
const removeImage = (index) => {
  newIssue.value.images.splice(index, 1)
}

// 提交问题
const submitIssue = async () => {
  try {
    const imageUrls = newIssue.value.images.map(img => img.url)
    await issueApi.createIssue(newIssue.value.content, imageUrls, 'manual')
    alert('问题创建成功')
    closeCreateForm()
    loadIssues()
  } catch (error) {
    console.error('创建问题失败:', error)
    alert('创建问题失败，请稍后重试')
  }
}

// 显示状态对话框
const openStatusDialog = (issue) => {
  selectedIssue.value = issue
  statusUpdate.value = {
    newStatus: issue.status,
    giteeUrl: '',
    ignoreReason: ''
  }
  // 根据当前状态设置索引
  // const statusKeys = Object.keys(statusValueMap)
  const statusValues = Object.values(statusValueMap)
  currentStatusIndex.value = statusValues.indexOf(issue.status) - 1 // 减去1是因为我们排除了"全部"选项
  showStatusDialog.value = true
}

// 处理状态更新变化
const handleStatusUpdateChange = (index) => {
  const statusValues = Object.values(statusValueMap)
  statusUpdate.value.newStatus = statusValues[index + 1] // 加1是因为我们排除了"全部"选项
}

// 关闭状态对话框
const closeStatusDialog = () => {
  showStatusDialog.value = false
  selectedIssue.value = null
  statusUpdate.value = {
    newStatus: '',
    giteeUrl: '',
    ignoreReason: ''
  }
}

// 更新状态
const updateStatus = async () => {
  try {
    if (!selectedIssue.value) return
    
    await issueApi.updateIssueStatus(
      selectedIssue.value.id,
      statusUpdate.value.newStatus,
      statusUpdate.value.giteeUrl,
      statusUpdate.value.ignoreReason
    )
    
    alert('状态更新成功')
    closeStatusDialog()
    loadIssues()
  } catch (error) {
    console.error('更新状态失败:', error)
    alert('更新状态失败，请稍后重试')
  }
}

// 辅助函数
const getStatusText = (status) => {
  const statusMap = {
    'unhandled': '未处理',
    'claimed': '已认领',
    'ignored': '已忽略',
    'resolved': '已处理'
  }
  return statusMap[status] || status
}

const formatTime = (time) => {
  const date = new Date(time)
  return date.toLocaleString('zh-CN')
}
</script>

<style scoped>
.issue-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 顶部导航栏 */
.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.page-header h1 {
  font-size: 24px;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
}

/* 筛选区域 */
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: bold;
}

.date-input, .status-select {
  height: 20px;
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-separator {
  color: #999;
}

/* 问题列表 */
.issue-list {
  margin-bottom: 20px;
}

.loading-container, .empty-container {
  text-align: center;
  padding: 50px 0;
  color: #999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 10px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.issue-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.issue-card {
  background: var(--box-bgc);
  border: var(--box-border);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0;
  transition: box-shadow 0.3s ease;
}

.issue-card:hover {
  box-shadow: var(--box-shadow);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.issue-id {
  font-weight: bold;
  color: #666;
}

.issue-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.status-unhandled {
  background-color: #ffeeee;
  color: #ff6b6b;
  opacity: 0.8;
}

.status-claimed {
  background-color: #e6f7ff;
  color: #1890ff;
  opacity: 0.8;
}

.status-ignored {
  background-color: #fff7e6;
  color: #faad14;
  opacity: 0.8;
}

.status-resolved {
  background-color: #f6ffed;
  color: #52c41a;
  opacity: 0.8;
}

.card-content {
  margin-bottom: 15px;
}

.issue-description {
  margin: 0 0 10px;
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.issue-images {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.issue-image {
  width: 100%;
  max-height: 150px;
  object-fit: cover;
  border-radius: 4px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-primary {
  background-color: #1890ff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #52c41a;
  color: #fff;
}

.btn-secondary:hover {
  background-color: #73d13d;
}

.btn-filter {
  background-color: #1890ff;
  color: #fff;
}

.btn-reset {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn-action {
  padding: 4px 8px;
  font-size: 12px;
  background-color: #1890ff;
  color: #fff;
}

/* 表单样式 */
.create-form-overlay, .status-dialog-overlay {
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

.create-form-container, .status-dialog-container {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.form-header, .dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-header h2, .dialog-header h2 {
  margin: 0;
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #999;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.create-form, .dialog-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 0 20px 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-weight: bold;
}

.form-group input, .form-group textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.image-uploader {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  position: relative;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.upload-label {
  display: inline-block;
  padding: 10px 20px;
  background-color: #1890ff;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.uploaded-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.uploaded-image-item {
  position: relative;
  width: 80px;
  height: 80px;
}

.image-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.remove-image {
  position: absolute;
  top: -5px;
  right: -5px;
  width: 20px;
  height: 20px;
  background-color: #ff4d4f;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-actions, .dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .issue-page {
    padding: 10px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .header-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .issue-cards {
    grid-template-columns: 1fr;
  }
}
</style>