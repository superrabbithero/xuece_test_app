<template>
  <div class="dashboard">
    <header>
      <h1>线上问题收集系统</h1>
      <div class="actions">
        <button @click="showCreateDialog = true" class="create-btn">创建问题</button>
      </div>
    </header>
    
    <FilterPanel @filter="handleFilter" />
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else-if="error" class="error">
      {{ error }}
      <button @click="fetchIssues">重试</button>
    </div>
    
    <div v-else>
      <div v-if="issues.length === 0" class="empty-state">
        没有找到匹配的问题
      </div>
      
      <div class="masonry-layout">
        <IssueCard 
          v-for="issue in issues" 
          :key="issue.id" 
          :issue="issue"
          @status-changed="fetchIssues"
        />
      </div>
    </div>
    
    <CreateIssueDialog 
      :visible="showCreateDialog"
      @issue-created="handleIssueCreated"
      @close="showCreateDialog = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getIssues } from '@/api/endpoints/issue';
import FilterPanel from '@/components/IssuePage/FilterPanel.vue';
import IssueCard from '@/components/IssuePage/IssueCard.vue';
import CreateIssueDialog from '@/components/IssuePage/CreateIssueDialog.vue';

const issues = ref([]);
const loading = ref(true);
const error = ref(null);
const showCreateDialog = ref(false);

const currentFilters = ref({
  startTime: '',
  endTime: '',
  status: ''
});

onMounted(() => {
  fetchIssues();
});

const fetchIssues = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    const params = {};
    if (currentFilters.value.startTime) params.start_time = currentFilters.value.startTime;
    if (currentFilters.value.endTime) params.end_time = currentFilters.value.endTime;
    if (currentFilters.value.status) params.status = currentFilters.value.status;
    
    const response = await getIssues(params);
    issues.value = response.data;
  } catch (err) {
    error.value = err.message || '获取问题列表失败';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const handleFilter = (filters) => {
  currentFilters.value = filters;
  fetchIssues();
};

const handleIssueCreated = () => {
  fetchIssues();
};
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

header h1 {
  margin: 0;
  color: #2c3e50;
}

.actions {
  display: flex;
  gap: 10px;
}

.create-btn {
  padding: 8px 16px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.create-btn:hover {
  background-color: #359768;
}

.loading, .error, .empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.error {
  color: #ff5252;
}

.empty-state {
  color: #7f8c8d;
}

.error button, .empty-state button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.masonry-layout {
  column-count: 3;
  column-gap: 20px;
}

@media (max-width: 900px) {
  .masonry-layout {
    column-count: 2;
  }
}

@media (max-width: 600px) {
  .masonry-layout {
    column-count: 1;
  }
}
</style>