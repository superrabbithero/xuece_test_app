<template>
    <div @click="router.push('/post/creator')">创作中心</div>
    <div>推荐列表+筛选</div>
    <div>分类目录_树形</div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
 
</script>

<style lang="css" scoped>

</style>
