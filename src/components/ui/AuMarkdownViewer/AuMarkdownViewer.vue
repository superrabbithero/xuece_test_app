<template>
  <div class="markdown-body" v-html="parsedMarkdown"></div>
</template>

<script setup>
import {ref, computed, defineProps, onMounted, defineEmits, nextTick, watch} from 'vue';
import { Marked } from 'marked';
import { markedHighlight } from "marked-highlight";
import hljs from 'highlight.js';



import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";

const emit = defineEmits(['update-headings']);

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




// 使用标题id生成插件
const options = {
    prefix: "my-prefix-",
};

marked.use(gfmHeadingId(options),{
    hooks:{
        postprocess(html) {
            const headings = getHeadingList();
            emit('update-headings', headings);
            return `${html}`
        }
    }
});

const props = defineProps({
    content:{
        type:String,
        required:true
    }
});

const mdContent = computed(()=>{
    return props.content}
)

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
    const content = isValidUrl(mdContent.value) 
            ? remoteMarkdownText.value 
            : mdContent.value || ''

    return marked.parse(content)
});

watch(parsedMarkdown, ()=>{
    nextTick(()=>{
        addImageResizeFunctionality()
    })
})

// 添加图片调整功能
function addImageResizeFunctionality() {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // 如果已经处理过，跳过
        if (img.parentNode.classList.contains('resizable-image')) {
            return;
        }
        
        // 创建可调整容器
        const container = document.createElement('div');
        container.className = 'resizable-image';
        
        // 包装图片
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
        
        // 创建调整手柄
        const handle1 = document.createElement('div');
        handle1.className = 'resize-handle left';
        container.appendChild(handle1);

        // 创建调整手柄
        const handle2 = document.createElement('div');
        handle2.className = 'resize-handle right';
        container.appendChild(handle2);
        
        
        // 添加事件监听器
        handle1.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startResize(e, img, -1);
        });

        // 添加事件监听器
        handle2.addEventListener('mousedown', function(e) {
            e.preventDefault();
            startResize(e, img, 1);
        });
    });
}

// 开始调整大小
function startResize(e, img, off) {
    const startX = e.clientX;
    const startWidth = parseInt(getComputedStyle(img).width, 10);
    // const startHeight = parseInt(getComputedStyle(img).height, 10);
    // const aspectRatio = startWidth / startHeight;
    
    function onMouseMove(moveEvent) {
        const newWidth = startWidth + (moveEvent.clientX - startX)*off ;
        if (newWidth > 50) { // 最小宽度限制
            img.style.width = `${newWidth}px`;
            img.style.height = 'auto';
            document.body.style.cursor = 'w-resize'
            
            
        }
    }
    
    function onMouseUp() {
        document.body.style.cursor = null
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

</script>

<style>
@import "./markdown.css";
@import "./github-markdown.css";
</style>