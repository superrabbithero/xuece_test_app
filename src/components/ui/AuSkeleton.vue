<!-- components/SkeletonLoader.vue -->
<template>
  <div class="skeleton-container">
    <!-- 圆形头像骨架 -->
    <div v-if="type === 'avatar'" class="skeleton-avatar"></div>
    
    <!-- 文本行骨架 -->
    <div v-else-if="type === 'text'" class="skeleton-text" :style="{
      width: width || '100%',
      height: height || '1rem'
    }"></div>

    <!-- 段落骨架 -->
    <div v-else-if="type === 'paragraph'" class="skeleton-paragraph" :style="{
      width: width || '100%',
    }">
      <div v-for="index in 4" :key="index" class="skeleton-text" style="width: 100%;"></div>
      <div class="skeleton-text" style="width: 60%;"></div>
    </div>
    <!-- 卡片骨架 -->
    <div v-else-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-image"></div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
        <div class="skeleton-line shorter"></div>
      </div>
    </div>
    
    <!-- 自定义内容 -->
    <div v-else class="skeleton-custom" :style="{
      width: width || '100%',
      height: height || '100px'
    }"></div>
  </div>
</template>

<script setup>
import {defineProps} from 'vue'

defineProps({
  type: {
    type: String,
    default: 'text', // 'avatar', 'text', 'card', 'custom'
    validator: value => ['avatar', 'text','paragraph', 'card', 'custom'].includes(value)
  },
  width: String,
  height: String
})
</script>

<style scoped>
.skeleton-container {
  padding: 0.5rem 0;
  display: inline-block;
  width: 100%;
}

/* 骨架屏基础样式 */
.skeleton-avatar,
.skeleton-text,
.skeleton-image,
.skeleton-line,
.skeleton-custom {
  background: var(--skeleton-bgc);
  background-size: 200% 100%;
  animation: loading 4s infinite;
  border-radius: 4px;
}

.skeleton-paragraph{
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-text{
  height: 1.2rem;
}

/* 动画效果 */
@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 特定样式 */
.skeleton-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
}

.skeleton-card {
  width: 300px;
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.skeleton-image {
  width: 100%;
  height: 200px;
}

.skeleton-content {
  padding: 16px;
}

.skeleton-line {
  height: 16px;
  margin-bottom: 12px;
  border-radius: 4px;
}

.skeleton-line.short {
  width: 60%;
}

.skeleton-line.shorter {
  width: 40%;
  margin-bottom: 0;
}
</style>