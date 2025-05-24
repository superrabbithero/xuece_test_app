<template>
  <div class="select-box" ref="selectBox">
    <div :class="{'input-area':true,'active':selectShow}" @click="openSelect">
      <div class="list-value">{{dataList[currIndex]}}</div>
      <!-- <svg-icon name="arrow-down" size="16" :class="{'icon':true,'show':selectShow}" ></svg-icon> -->
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
  }
  .input-area {
    border: var(--box-border);
    padding: 0 5px;
    font-size: 15px;
    border-radius: 5px;
    height: 28px;
    line-height: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;

  }
  .input-area.active{
    outline: 2px solid var(--main-color);
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
    padding: 4px 0;
    top: 36px;
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
    transition: max-height 0.1s ease;
  }
  .options.show {
    max-height: 140px;
  }

  .select-item{
    padding: 4px 5px;
  }

  .select-item.active{
    color: var(--main-color);
  }

  @media(any-hover:hover){
    .select-item:hover{
      background-color: var(--white-highlight);
    }
    .input-area:hover{
      outline: 2px solid var(--main-color);
    }
  }
</style>