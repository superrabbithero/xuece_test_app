<template>
  <div class="markdown-body" v-html="parsedMarkdown"></div>
</template>

<script setup>
import {ref, computed, defineProps, onMounted} from 'vue';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';
// import 'highlight.js/styles/dark.css'


const marked = new Marked(
  markedHighlight({
    emptyLangClass: 'hljs',
    langPrefix: 'hljs language-',
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : 'plaintext';
      return hljs.highlight(code, { language }).value;
    }
  })
);
const props = defineProps({
    content:{
        type:String,
        required:true
    }
});

const mdContent = ref(props.content)

const isValidUrl = (string) => {
    try{
        new URL(string)
        return true;
    } catch(err){
        return false;
    }
};

const loadRemoteMarkdown = async () => {
    try{
        const response = await fetch(mdContent.value)
        if (!response.ok) throw new Error('文件加载失败');
        return await response.text() || '文件加载失败'
    } catch (err) {
        console.error('加载失败:', err);
        return '文件加载失败'
    }
        
}

const remoteMarkdownText = ref('');

onMounted(()=>{
    init()
})

const init = async () => {
    if (isValidUrl(mdContent.value)) {
        remoteMarkdownText.value = await loadRemoteMarkdown();
    }
}

const parsedMarkdown = computed(() => {
    return marked.parse(
        isValidUrl(mdContent.value) 
            ? remoteMarkdownText.value 
            : mdContent.value || ''
    );
});

</script>

<style scoped>
@import "./markdown.css";
@import "./github-markdown.css";
</style>