<template>
    <my-modal v-model="config.modal_show" :modeless="false" width="auto">
      <div class="tools-setting-container">
        <div class="content-items">
          <div class="content-title">
            <au-icon name="RiPencilLine" size="22px"/>
            <span>画笔大小：</span>
          </div>
          <au-slider v-model="config.penWidth" style="width: 210px;" :max="20"></au-slider>
        </div>
        <div class="content-items">
          <div class="content-title">
            <au-icon name="RiEraserLine" size="22px"/>
            <span>橡皮大小：</span>
          </div>
          
          <au-slider class="" v-model="config.eraserWidth" style="width: 210px;"></au-slider>
        </div>
        <div class="content-items">
          <div class="content-title">
            <au-icon name="RiPaletteLine" size="22px"/>
            <span>画笔颜色：</span>
          </div>
          <div class="color-group">
            <div v-for="color in colorList" :key="color" @click="config.penColor = color" :class="['color-item',{'active':config.penColor == color}]" :style="{backgroundColor:color,outlineColor:`${color}55`}">
                <au-icon 
                v-show="config.penColor == color" 
                name="RiCheckLine" 
                size="14px" 
                :color="config.penColor == '#ffffff' ? '#000':'#fff' "/>
            </div>
          </div>
        </div>
        <div class="content-items">
          <div class="content-title">
            <au-icon name="RiMouseLine" size="22px"/>
            <span>仅触控笔：</span>
          </div>
          <au-switch v-model="config.mode" size="small"></au-switch>
        </div>
      </div>
    </my-modal>
</template>

<script setup>
import {ref, defineProps, defineEmits, watch} from 'vue'

const emit = defineEmits(['update:modelValue'])

const props = defineProps({
    modelValue: { // 添加 modelValue 以支持 v-model
        type: Object,
        require: true
    },
})

const colorList = ['#000000', '#fb351e', '#f47d1e', '#f0cc1b', '#40ceb0', '#31a9f9', '#6663f6','#ffffff']

const config = ref(props.modelValue)

// 监听 props.modelValue 变化
watch(() => config, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

</script>
<style scoped>
  .tools-setting-container{
    display: flex;
    flex-direction: column;
    padding: 0 10px;
    gap: 10px;
    align-items: center
  }

  .content-title{
    font-size: 14px;
    display: flex;
    gap: 8px;
    align-items: center;
  }

  
  .content-items{
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 30px;
    width: 320px;
  }

  .color-group {
    width: 210px;
    display: flex;
    justify-content: space-between
  }

  .color-item {
    box-sizing: border-box;
    border-radius: 50%;
    width: 18px;
    height: 18px;
/*    opacity: 0;*/
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
/*    border: var(--box-border);*/
    box-shadow: 0px 0px 0px 1px #0002;

  }
  .color-item.active,.color-item:hover {
/*    opacity: 0.4;*/
    outline: 4px solid #fff0;
  }

  /*.color-item .circle{
    position: absolute;
    top: 50%;
    left: 50%;
    opacity: 1;
    transform: translate(-50%, -50%);
  }*/

</style>