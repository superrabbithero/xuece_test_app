<template>
    <div @click="router.push('/post/editor')">写文章</div>
    <div>我的文档+筛选</div>
    <div>分类目录_树形</div>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
 
</script>

<style lang="css" scoped>

</style>
