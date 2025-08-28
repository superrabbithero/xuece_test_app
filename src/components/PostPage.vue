<template>
  <div class="container left row">
    <div class="markdown-box">
      <au-markdown-viewer v-if="!isLoading" :content="content"
      @update-headings="handleHeadingsUpdate"/>
      <au-skeleton v-else type="paragraph"/>
    </div>
    <div class="anchors-box">
      <au-anchor v-if="headings.length != 0" :anchors="headings"/>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, defineProps, inject, onBeforeUnmount} from 'vue'
import documentApi from '@/api/endpoints/document'

const changePageTitle = inject('changePageTitle')

const content = ref(null)

const fileName = ref('新建文档')

const doc_info = ref(null)

const props = defineProps({
  id: String // 自动接收路由参数
})

const isLoading = ref(true)

onMounted(()=>{
    console.log(props.id)

    isLoading.value = true

    if(props.id){
        documentApi.get_doc(props.id).then(rst => {
            const doc = rst?.data.data
            doc_info.value = doc
            fetchOssMd(doc.oss_key).then(text => {
                content.value = String(text)
                document.title = doc.title
                changePageTitle(doc.title)
                fileName.value = doc.title
            }).catch(err => {
                content.value = '文章似乎不存在了，请重试'
                console.log("找不到云文件，请重试",err)
            })
        }).catch(err => {
            content.value = '文章似乎不存在了，请重试'
            console.log("没有找到相关文章",err)
        }).finally(()=>{
          isLoading.value = false
        })
    }else{
        content.value = '文章似乎不存在了，请重试'
    }
        
})

onBeforeUnmount(()=>{
  changePageTitle(null)
})



const fetchOssMd = (oss_key) => {
  return new Promise((resolve, reject) => {
    fetch(`https://oss.superrabbithero.xyz/${oss_key}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('文件加载失败');
        }
        return response.text();
      })
      .then((text) => {
        resolve(text); // 成功时返回文本
      })
      .catch((err) => {
        console.error('加载失败:', err);
        reject('文件加载失败'); // 失败时返回错误信息
      });
  });
};

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
/*  border-left: var(--box-border);*/
  padding: 1rem;
  width: 12rem;
  position: sticky;
  top: 82px;
}

@media(max-width:700px){
  .anchors-box {
    display: none;
  }
}

</style>