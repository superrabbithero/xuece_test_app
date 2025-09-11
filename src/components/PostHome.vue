<template>
    <div class="no-style-container" style="gap:10px">
        <div class="left-container">
            <au-menu width='200px'>
                <au-button :block='true' size="small" variant="filled" @click="router.push('/post/creator')" :style="{marginBottom:'8px'}">
                写文章</au-button>
                <au-menu-item  :active="activeMenu=='documents'">
                    <au-icon name='RiArticleLine' size='20'/>文章管理
                </au-menu-item>
                <au-menu-item  :active="activeMenu=='categories'">
                    <au-icon name='RiBookShelfLine' size='20'/>分类管理
                </au-menu-item>
            </au-menu>
        </div>
            
        <div class="right-container">
            <div class="au-grid">
                <div class="rows">
                    <div class="cols">
                        <au-tabs :tabList='tabs'  @change="handleTabChange"/>
                    </div>
                </div>
                <div class="rows">
                    <div v-for="doc in docs" :key="doc.id" class="cols s12">
                        <div class="doc_item" @click="gotoDocViewerPage(doc)">
                            <div class="doc_info">
                                <div class="doc_info-title">{{doc.title}}</div>
                                <p>{{doc.short_content}}</p>
                                <div class="doc_info-time">{{formatted(doc.updated_at)}}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { useRouter} from 'vue-router';
import {ref, onMounted} from 'vue'
import docApi from '@/api/endpoints/document'
import dayjs from 'dayjs';
const router = useRouter();

const formatted = (date_time) => (dayjs(date_time).format('YYYY-MM-DD HH:mm'));

const docs = ref(null)

onMounted(()=>{
    getDocuments()
})

const filter = ref({
    status:"3",
    page:1,
    per_page:10
})

//
const getDocuments = async () => {
    docApi.get_new_docs(filter.value).then(rst=>{
        console.log(rst.data)
        docs.value = rst.data.items
    })
}

const gotoDocViewerPage = (doc) => {
    if(doc?.id){
        const path = `/post/viewer/${doc.id}` 
        router.push(path)
    }
        
}
</script>

<style lang="css" scoped>

</style>
