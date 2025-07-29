<template>
  <div class="au-md-editor-container">
    <div class="editor">
      <textarea v-model="mdText"></textarea>
    </div>
    <div class="preview">
      <au-markdown-viewer :content="mdText"
        @update-headings="handleHeadingsUpdate"/>
    </div>
    
  </div>
  
</template>

<script setup>
import {ref} from 'vue';

const headings = ref([])
const mdText = ref('')

const handleHeadingsUpdate = (list) => {
  headings.value = list
}
</script>

<style lang="css" scoped>
.au-md-editor-container {
  width: 100%;
  display: flex;
  gap: 4px;
  height: calc(100vh - 110px)
}

.editor, .preview {
  border-radius: 5px;
  overflow: hidden;
  flex:1;
  border: var(--box-border);
}

.editor textarea{
  width: 100%;
  height: 100%;
  /* 重置默认样式 */
  padding: 10px;
  margin: 0;
  border: none;
  outline: none;
  resize: none; /* 禁止用户调整大小 */
  box-sizing: border-box; 
}

.preview {
  padding: 10px;
  background-color: field;
}



</style>