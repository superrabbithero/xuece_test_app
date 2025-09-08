<template>
    <div class="no-style-container" style="gap:10px">
        <div class="left-container">
            <au-menu width='200px'>
                <au-button :block='true' size="small" variant="filled" @click="gotoDocEditorPage()" :style="{marginBottom:'8px'}">
                写文章</au-button>
                <au-menu-item @click="turn2Page('documents')" :active="activeMenu=='documents'">
                    <au-icon name='RiArticleLine' size='20'/>文章管理
                </au-menu-item>
                <au-menu-item @click="turn2Page('categories')" :disable="true" :active="activeMenu=='categories'">
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
                        <div class="doc_item" @click="gotoDocEditorPage(doc)">
                            <div class="doc_info">
                                <div class="doc_info-title">{{doc.title}}</div>
                                <div class="doc_info-time">{{formatted(doc.updated_at)}}</div>
                            </div>
                            <div class="doc_actions" @click.stop>
                                <au-icon name="RiMoreLine"/>
                                <div class="doc_actions_list more-menu">
                                    <div class="more-menu-item" @click="gotoDocEditorPage(doc)" >
                                        <au-icon name="RiEditBoxLine" size="16"/>编 辑
                                    </div>
                                    <div class="more-menu-item" @click="gotoDocViewerPage(doc)">
                                        <au-icon name="RiGlassesLine" size="16"/>预 览
                                    </div>
                                    <div class="more-menu-item" @click="deleteDocConfirmModal = true,curDoc=doc">
                                        <au-icon name="RiDeleteBinLine" size="16"/>删 除
                                    </div>
                                    <div class="more-menu-item" v-if="doc.status==0" @click="publishModal = true, curDoc=doc">
                                        <au-icon name="RiTelegram2Line" size="16"/>发 布
                                    </div>
                                    <div class="more-menu-item" v-else><au-icon name="RiReplyLine" size="16"/>下 架
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <my-modal v-model="deleteDocConfirmModal" confirmTitle="删除内容后不可恢复，确定删除吗？" :onFunction="deleteDoc" :width="320"></my-modal>
    <!-- <div>我的文档+筛选</div>
    <div>分类目录_树形</div> -->

    <my-modal v-model="publishModal">
        <!-- 分类（单选）、标签（多选或自定义）、封面、摘要100字 -->
        <au-form v-model="publishForm"></au-form>
        <div class="form-actions">
            <au-button iconName="RiTelegram2Line" value="发 布" variant="filled" size="small"/>
        </div>
    </my-modal>
    
</template>

<script setup>
import { useRouter } from 'vue-router';
import docApi from '@/api/endpoints/document'
import {ref, onMounted} from 'vue'
import dayjs from 'dayjs';


const formatted = (date_time) => (dayjs(date_time).format('YYYY-MM-DD HH:mm'));

const router = useRouter();

const activeMenu = ref('documents')

const deleteDocConfirmModal = ref(false)

const publishModal = ref(false)

const publishForm = ref([
    {
        'name':'封面',
        'key':'cover',
        'type':'image',
        'value':''
    },
    {
        'name':'文章摘要',
        'key': 'summary',
        'required':true,
        'type':'text',
        'max':100,
        'value':''
    }
])

const curDoc = ref(null)

const deleteDoc = () => {
    docApi.delete_doc(curDoc.value.id).then(rst => {
        console.log(rst)
        console.log(filter.value)
        getMyDocuments()
    })
}

onMounted(() => {
    getMyDocuments()
    console.log(useRouter)
})

const turn2Page = (menu) => {
    activeMenu.value = menu
}

const tabs = ['草 稿','文 章']

const docs = ref([])

const handleTabChange = ({ index, label }) => {
  console.log('切换到：', index, label)
  filter.value.status = index == 0 ? "0" : "123"
  console.log(filter.value)
  getMyDocuments()
}



const gotoDocEditorPage = (doc) => {
    const path = doc?.id 
               ? `/post/editor/${doc.id}` 
               : '/post/editor'
    router.push(path)
}

const gotoDocViewerPage = (doc) => {
    if(doc?.id){
        const path = `/post/viewer/${doc.id}` 
        router.push(path)
    }
        
}



// 分页
// let page = 1
// let pageSize = 10
const filter = ref({
    user_id:4,
    status:"0",
    page:1,
    per_page:10
})

//
const getMyDocuments = async () => {
    docApi.get_my_docs(filter.value).then(rst=>{
        console.log(rst.data)
        docs.value = rst.data.items
    })
}
 
</script>

<style lang="css" scoped>
.left-container {
    width: fit-content;
    margin-bottom: 81px;
}
.right-container {
    background-color: var(--box-bgc);
    border: var(--box-border);
    flex: 1;
    border-radius: 5px;
    padding: 8px;
    margin-bottom: 81px;
}

.doc_item {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    border-bottom: var(--box-border);
    padding: 1rem;
}

.doc_item:hover {
    background-color: #9991;
}


.doc_info {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.doc_info-time {
    font-size: 0.9rem;
    user-select: none;
    opacity: 0.6;
}

.doc_actions{
    position: relative;
    width: 25px;
    height: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 3px;
    
}

/*.doc_actions:hover {*/
/*    background-color: #8882;*/
/*}*/

.doc_actions:hover .more-menu{
    display: block;
}

.more-menu {
    display: none;
    user-select: none;
    position: absolute;
    top: 25px;
/*    transform: translateY(30px);*/
    right: 0;
    background-color: var(--box-bgc);
    box-shadow: var(--box-shadow);
    padding: 4px 0;
    border-radius: 4px;
    z-index: 1;
}

.more-menu-item {
    font-size: 14px;
    cursor: pointer;
    padding: 3px 10px;
    gap: 5px;
    display: flex;
    align-items: center;
    white-space: nowrap;
}

.more-menu-item:hover {
    background-color: #8882;
}

.form-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
    padding-top: 10px;
    border-top: var(--box-border);
}

</style>
