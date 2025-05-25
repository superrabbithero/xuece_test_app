<template>
  <div class="select-box" ref="selectBox">
    <div v-if="label" class="label">{{label}}</div>
    <div :class="{'input-area':true,'active':selectShow}" @click="openSelect">
      <div class="list-value">{{dataList[currIndex]}}</div>
      <IconWrapper name="RiArrowDownSLine" size="16" :class="{'icon':true,'show':selectShow}"/>
    </div>
    <div :class="{'select-item-group':true,'show':selectShow}" ref="options">
      <div :class="{'options':true,'show':selectShow}">
        <div :class="{'select-item':true,'active':index == currIndex}" v-for="(item,index) in dataList" :key="index" @click="changeIndex(index)">
          {{ item }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, onUnmounted } from 'vue'; // 注意：是 onUnmounted 不是 unmounted

const emit = defineEmits(['change']) // 应该使用数组形式

const props = defineProps({
  dataList: {
    type: Array,
    required: true
  },
  modelValue: { // 添加 modelValue 以支持 v-model
    type: Number,
    default: 0
  },
  label: {
    type: String,
    default: null
  }
})

const selectShow = ref(false)
const currIndex = ref(props.modelValue) // 使用传入的 props 初始化

// 修正生命周期钩子名称
onUnmounted(() => {
  document.removeEventListener('click', closeSelect)
})

const openSelect = () => {
  selectShow.value = !selectShow.value
  if(selectShow.value) {
    document.addEventListener('click', closeSelect)
  } else {
    document.removeEventListener('click', closeSelect)
  }
}

const closeSelect = (event) => { // 添加 event 参数
  if(!selectBox.value.contains(event.target)) {
    selectShow.value = false
    document.removeEventListener('click', closeSelect)
  }
}

const changeIndex = (index) => {
  currIndex.value = index
  selectShow.value = false
  document.removeEventListener('click', closeSelect)
  emit('change', index)
  emit('update:modelValue', index) // 支持 v-model
}

const selectBox = ref(null) // 添加模板引用
</script>

<style scoped>
  .select-box {
    width: 100%;
    position: relative;
    margin-top: 6px;
    background-color: var(--box-bgc);
  }
  .label {
    position: absolute;
    font-size: 10px;
    background-color: var(--box-bgc);
    /* background-color: red; */
    font-weight: 100;
    height: 3px;
    line-height: 3px;
    padding: 0 4px;
    top: -2px;
    left: 6px;
  }

  .input-area {
    font-size: 14px;
    border: var(--box-border);
    padding: 6px 8px;
    border-radius: 8px;
    /* height: 28px; */
    /* line-height: 28px; */
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-weight: 500;
  }

  .list-value{
    height: 20px;
    line-height: 20px;
  }
  .input-area.active{
    outline: 1px solid var(--main-color);
    border: 1px solid var(--main-color)
  }

  .icon {
    /*position: absolute;
    right: 6px;
    top: 50%;*/
/*    transform: translateY(-50%) ;*/
    color:var(--fontNormal);
    transition: transform 0.3s ease;
  }

  .icon.show{
    transform: rotate(180deg);
  }
  .select-item-group{
    /* padding: 4px 0; */
    /* padding-bottom: 4px; */
    top: 40px;
    position: absolute;
    z-index: 999;
    width: 100%;
    background-color: var(--box-bgc);
    font-size: 15px;
    border-radius: 5px;
    opacity: 0;
    pointer-events: none;
  }

  .select-item-group.show{
    pointer-events: auto;
    box-shadow: var(--box-shadow);
    opacity: 1;
  }
  .options {
    overflow: auto;
    max-height: 0px;
    transition: max-height 0.2s ease;
  }
  .options::-webkit-scrollbar{
    width: 4px;
  }

  .options::-webkit-scrollbar-track{
    /* background: red; */
  }

  .options::-webkit-scrollbar-thumb{
    /* background-color: var(--scrollbar-thumb-bgc); */
    background-color: #fff0;
    /* opacity: 0!important; */
  }

  .options:hover::-webkit-scrollbar-thumb{
    background-color: var(--scrollbar-thumb-bgc);
  }
  
  .options.show {
    max-height: 140px;
  }

  .select-item{
    margin: 0 4px;
    padding: 6px 8px;
    font-size: 13px;
    border-radius: 6px;
    cursor: pointer;
  }

  .select-item:last-child {
    margin-bottom: 4px;
  }

  .select-item:first-child {
    margin-top: 4px;
  }

  .select-item.active{
    color: var(--main-color);
  }

  @media(any-hover:hover){
    .select-item:hover{
      background-color: var(--white-highlight);
    }
    .input-area:hover{
      outline: 1px solid var(--main-color);
      border: 1px solid var(--main-color)
    }
  }
</style>