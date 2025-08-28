 
<template>
    <div class="full-screen-container">
        <au-md-editor v-if="lines != null" :textLines="lines" :fileName="fileName" :doc="doc_info"/>
    </div>
</template>

<script setup>
import {ref, onMounted, defineProps} from 'vue'
import documentApi from '@/api/endpoints/document'

const lines = ref(null)

const fileName = ref('新建文档')

const doc_info = ref(null)

const props = defineProps({
  id: String // 自动接收路由参数
})

onMounted(()=>{
    console.log(props.id)
    if(props.id){
        documentApi.get_doc(props.id).then(rst => {
            const doc = rst?.data.data
            doc_info.value = doc
            fetchOssMd(doc.oss_key).then(text => {
                lines.value = text.split(/\r?\n/)
                fileName.value = doc.title
            }).catch(err => {
                lines.value = ['']
                console.log("找不到云文件，请重试",err)
            })
        }).catch(err => {
            lines.value = ['']
            console.log("没有找到相关文章",err)
        })
    }else{
        lines.value = ['']
    }
        
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

 
</script>

<style lang="css" scoped>

</style>
