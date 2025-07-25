<template>
  <div class="container left row">
    <div class="markdown-box">
      <au-markdown-viewer content="https://oss.superrabbithero.xyz/test/markdown/%E5%9C%A8edge%20WebView2%E4%B8%AD%E4%BD%BF%E7%94%A8selenium%E6%B5%8B%E8%AF%95.md"
      @update-headings="handleHeadingsUpdate"/>
    </div>
    <div class="anchors-box">
      <au-anchor v-if="headings" :anchors="headings"/>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue'

const headings = ref([])

const handleHeadingsUpdate = (value) => {
  headings.value = value
}

</script>

<style scoped>
.row {
  flex-direction: row;
  gap: 10px;
}
.markdown-box {
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
}
.anchors-box {
  flex-shrink:0;
  border-left: var(--box-border);
  padding: 1rem;
  min-width: 10rem;
  position: sticky;
  top: 82px;
}

@media(max-width:700px){
  .anchors-box {
    display: none;
  }
}

</style>