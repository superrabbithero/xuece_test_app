<template>
    <div class="no-style-container" style="gap:10px">
        <div class="left-container">
            <au-menu width='200px'>
                <au-menu-item  :active="activeMenu=='documents'">
                    <au-icon name='RiArticleLine' size='20'/>文章管理
                </au-menu-item>
                <au-menu-item  :active="activeMenu=='categories'">
                    <au-icon name='RiBookShelfLine' size='20'/>分类管理
                </au-menu-item>
            </au-menu>
        </div>
            
        <div class="right-container au-grid">
            <div v-for="doc in docs" :key="doc.id" class="rows">
                <div  class="cols s12">
                    <div class="doc_item" @click="gotoDocViewerPage(doc)">
                        <div class="doc_info">
                            <div class="doc_info-title">{{doc.title}}</div>
                            <p class="doc_info-summary">{{doc.short_content}}</p>
                            <div class="doc_info-time">{{formatted(doc.updated_at)}}</div>
                        </div>
                        <div class="doc_item-cover" v-if="doc.cover_img">
                            <img :src="doc.cover_img"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="fixed-button">
        <au-button iconName="RiQuillPenLine" variant="filled" shape="circle" size="large" @click="router.push('/post/creator')"/>
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
.fixed-button {
    position: fixed;
    bottom: 100px;
    right: 20px;
}

.left-container {
    width: fit-content;
    margin-bottom: 81px;
}
.right-container {
    flex: 1;
    padding:0;
    gap:10px!important
/*    padding: 8px;*/
/*    margin-bottom: 81px;*/
}

.doc_item {
    background-color: var(--box-bgc);
    border: var(--box-border);
    border-radius: 5px;
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    gap:10px;
    box-shadow: 0;
    transition: box-shadow 0.3s ease;
}

.doc_item:hover {
/*    background-color: #9991;*/
    box-shadow: var(--box-shadow);
    border: 1px solid #eee5;
}


.doc_info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.doc_info-summary {
    font-size: 0.9rem;
    color:#666c;
    margin: 0;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* 限制显示的行数 */
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
}

.doc_info-time {
    font-size: 0.9rem;
    user-select: none;
    opacity: 0.6;
}

.doc_item-cover {
    height: 90px;
    width: 140px;
    overflow: hidden;
    border-radius: 5px;
    flex-shrink: 0;
}
.doc_item-cover img{
    height: 100%;
    width: 100%;
    object-fit: cover;  /* 保持比例，填满容器 */
    object-position: left; /* 图片居中 */

}

</style>
