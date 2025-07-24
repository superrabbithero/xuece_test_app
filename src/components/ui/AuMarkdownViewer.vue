<template>
  <div v-html="parsedMarkdown"></div>
</template>

<script setup>
import {computed, defineProps} from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js';

marked.setOptions({
  highlight: (code) => hljs.highlightAuto(code).value,
});

const props = defineProps({
    content:{
        type:String,
        required:true
    }
});

const parsedMarkdown = computed(()=>{
    return marked(props.content || '');
});

</script>

<style scoped>

</style>