<template>
    <div class="page-box" ref="pageBox">
        <icon-wrapper @click="pre()" name="RiArrowLeftSLine" color="#ffc848" size="34" />
        <!-- <svg-icon @click="pre()" name="arrow-left" fill="#ffc848" size="34"></svg-icon> -->
        <div class="page-item" v-if="currentPage>3 && totalPages>10" @click="toPage(1)">1</div>
        <div class="page-item more" @click="pre(5)" v-if="currentPage>4 && totalPages>10">
            <icon-wrapper name="RiMoreLine" size="20" />
        </div>
        <div v-for="(item, index) in currentList" :key="index" :class="{'page-item':true,'active':item == currentPage}" @click="toPage(item)">{{item}}</div>
        <div class="page-item more" v-if="currentPage<totalPages-3 && totalPages>10" @click="next(5)">
            <icon-wrapper name="RiMoreLine" size="20" />
        </div>
        <div class="page-item" v-if="currentPage<totalPages-2 && totalPages>10" @click="toPage(totalPages)">{{totalPages}}</div>
        <icon-wrapper @click="next()" name="RiArrowRightSLine" fill="#ffc848" size="34" />
    </div>
</template>
<script setup>
import { ref ,defineProps, onMounted,defineEmits} from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    totalPages:{
        type:Number,
        required:true,
    },
    modelValue: { // 添加 modelValue 以支持 v-model
        type: Number,
        default: 0
    },
})



const currentPage = ref(1)
const currentList = ref([])

onMounted(()=>{
    if(props.totalPages>10){
        currentList.value=[1,2,3,4,5]
    }else{
        for(let i=1;i<=props.totalPages;i++){
            currentList.value.push(i)
        }
    }
})

const pre = (step=1) => {
    if(currentPage.value > step){
        currentPage.value -= step
        emit('update:modelValue', currentPage.value);
    }
    if(props.totalPages>10){
        refreshlist()
    }
    
}

const next = (step=1) => {
    if(currentPage.value<props.totalPages+1-step){
        currentPage.value += step
        emit('update:modelValue', currentPage.value);
    }
    if(props.totalPages>10){
        refreshlist()
    }
}

const toPage = (index) => {
    if(currentPage.value != index){
        currentPage.value=index
        emit('update:modelValue', currentPage.value);
    }
    
    if(props.totalPages>10){
        refreshlist()
    }
}

const refreshlist = () => {
    currentList.value = []
    if(props.totalPages - currentPage.value < 2){
        
        for(let i=props.totalPages-4;i<=props.totalPages;i++){
            currentList.value.push(i)
        }
    }else if(currentPage.value <= 3){
        currentList.value=[1,2,3,4,5]
    }else{
        for(let i=currentPage.value-2;i<=currentPage.value+2;i++){
            currentList.value.push(i)
        }
    }
}



</script>
<style scoped>
    .page-box {
        user-select: none;
        margin-top: 20px;
        display: flex;
        justify-content: center;
    }
    .page-box.left{
        justify-content: flex-start
    }
    .page-item{
        width: 30px;
        height: 30px;
        border-radius: 5px;
        background-color: var(--box-hightlight);
        box-shadow: var(--box-shadow-close);
        line-height: 30px;
        margin-right: 5px;
        border: 2px solid var(--box-hightlight);
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .page-item.more {
        background: transparent;
        border:  2px solid transparent;
    }
    .page-item.more:hover {
        border:  2px solid transparent;
    }
    .page-item:hover {
        border: 2px solid #ffc848;
    }
    .page-item.active {
        border: 2px solid #ffc848;
        color: #fff;
        background-color: #ffc848;
    }
</style>