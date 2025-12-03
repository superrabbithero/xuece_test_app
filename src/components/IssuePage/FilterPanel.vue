<template>
  <div class="filter-panel">
    <h3>筛选条件</h3>
    
    <div class="filter-group">
      <label>开始时间:</label>
      <input type="datetime-local" v-model="filters.startTime">
    </div>
    
    <div class="filter-group">
      <label>结束时间:</label>
      <input type="datetime-local" v-model="filters.endTime">
    </div>
    
    <div class="filter-group">
      <label>问题状态:</label>
      <select v-model="filters.status">
        <option value="">全部</option>
        <option value="unhandled">未处理</option>
        <option value="claimed">已认领</option>
        <option value="ignored">已忽略</option>
        <option value="resolved">已处理</option>
      </select>
    </div>
    
    <div class="filter-actions">
      <button @click="applyFilters">应用筛选</button>
      <button @click="resetFilters">重置</button>
    </div>
  </div>
</template>

<script setup>
import { reactive, defineEmits } from 'vue';

const emit = defineEmits(['filter']);

const filters = reactive({
  startTime: '',
  endTime: '',
  status: ''
});

const applyFilters = () => {
  emit('filter', {...filters});
};

const resetFilters = () => {
  filters.startTime = '';
  filters.endTime = '';
  filters.status = '';
  emit('filter', {...filters});
};
</script>

<style scoped>
/* 样式同之前版本 */
</style>