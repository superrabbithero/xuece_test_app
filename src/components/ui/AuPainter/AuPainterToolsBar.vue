<template>
  <div :class="[position,'edit-tools-box',{'active':editToolsActive}]" ref="dragToolsBar" @pointerover="handleToolsBarFocus" @pointerleave="handleToolsBarOut">

    <div :class="{'edit-tools-item':true,'active':props.modelValue == 'pencil'}" @click="changeTool('pencil')">
      <au-icon name="RiPencilLine"  size="22"></au-icon>
    </div>
    <div :class="{'edit-tools-item':true,'active':props.modelValue == 'eraser'}" @click="changeTool('eraser')">
      <au-icon name="RiEraserLine" size="22"></au-icon>
    </div>
    <div :class="{'edit-tools-item':true,'active':props.modelValue == 'move'}" @click="changeTool('move')">
      <au-icon name="RiCursorLine" size="22"></au-icon>
    </div>
    <div class="divider-line"></div>
    <div class="edit-tools-item" @click="changeModalShow">
      <au-icon name="RiSettings2Line" size="22"></au-icon>
    </div>
    <div v-if="position == 'fixed'" class="edit-tools-drag" @pointerdown="dragdown($event)"  @mouseup="dragup">
      <au-icon style="user-select: none;" name="RiDraggable" size="20"></au-icon>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, toRefs, onBeforeUnmount,defineEmits,defineProps} from 'vue'


const emit = defineEmits(['update:modelValue','changeSetting'])

const props = defineProps({
    modelValue: { // 添加 modelValue 以支持 v-model
      type: String,
      default: "pencil"
    },
    position: {
      type:String,
      default:"fixed"
    }
})

// let settingModalShow = props.settingModal

const changeModalShow = ()=>{
  emit('changeSetting',1)
}

onBeforeUnmount(() => {
  document.removeEventListener('pointermove', dragmove)
  document.removeEventListener('pointerup', dragup)
})

const changeTool = (tool) => {
  emit('update:modelValue', tool);
}

// const getcanvastool = (tool) => {
//   props.modelValue = tool
//   if (tool == 'pencil') {
//     state.historyContext.globalCompositeOperation = 'source-over'
//     state.erasing = false
//   } else if (tool == "eraser") {
//     // state.historyContext.globalCompositeOperation = 'destination-out'
//     state.erasing = true
//   }
// }

// 响应式数据
const state = reactive({
  
  dragToolsBar: null,
  disx: 0,
  disy: 0,
  editToolsActive: false,
  pressTimer: null,
  pressTimerNum: 0,

  tool:"pencil",

})

const { 
  editToolsActive,
} = toRefs(state)

const dragToolsBar = ref(null)

// 方法
const dragdown = (e) => {
  if (!state.dragToolsBar) {
    state.dragToolsBar = dragToolsBar.value
    document.addEventListener('pointermove', dragmove)
    document.addEventListener('pointerup', dragup)
    state.disx = e.clientX - state.dragToolsBar.offsetLeft
    state.disy = e.pageY - state.dragToolsBar.offsetTop
    state.dragToolsBar.style.right = 'unset'
    state.dragToolsBar.style.left = e.clientX - state.disx + 'px'
    state.dragToolsBar.style.top = e.pageY - state.disy + 'px'
  }
}

const dragmove = (e) => {
  if (state.dragToolsBar) {
    state.dragToolsBar.style.left = e.clientX - state.disx + 'px'
    state.dragToolsBar.style.top = e.pageY - state.disy + 'px'
  }
}

const dragup = () => {
  state.dragToolsBar = null
  document.removeEventListener('pointermove', dragmove)
}

const handleToolsBarFocus = () => {
  // console.log("---------focus")
  state.editToolsActive = true
  state.pressTimerNum = 0
  clearInterval(state.pressTimer)
  state.pressTimer = null
}

const handleToolsBarOut = () => {
  state.pressTimerNum = 0
  clearInterval(state.pressTimer)
  state.pressTimer = null
  state.pressTimer = setInterval(() => {
    state.pressTimerNum += 1
    if (state.pressTimerNum >= 5) {
      state.editToolsActive = false
      state.pressTimerNum = 0
      clearInterval(state.pressTimer)
      state.pressTimer = null
    }
  }, 1000)
}


</script>

<style scoped>
  .edit-tools-item, .edit-tools-drag {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 2px;
    cursor: pointer;
  }

  .edit-tools-drag {
    width: unset;
    opacity: 0.5;
  }

  


  .edit-tools-item img{
    width: 25px;
    -webkit-user-drag: none;
  }

  .edit-tools-item:hover{
    background: var(--button-highlight);

  }

  .edit-tools-item.active {
    background: #ffc848;
    box-shadow: var(--inset-boxShadow-yellow);
    color: #363636;
  }
  

  /* 工具栏2.0样式 */
  .edit-tools-box {
    display: flex;
    border-radius: 14px;
    border: var(--box-border);
    z-index: 900;
    background: var(--box-bgc);
    padding: 6px 4px;
    box-shadow: unset;
    opacity: 0.5;
    touch-action: none;
  }

  .edit-tools-box.fixed{
    position: fixed;
    right:20px;
  }

  .edit-tools-box.bottom{
    position: absolute;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
  }

  .edit-tools-box.top{
    position: absolute;
    left: 50%;
    top: 20px;
    transform: translateX(-50%);
  }

  .edit-tools-box.active {
    opacity: 1;
    box-shadow: var(--box-shadow);
  }

  /*.edit-tools-box:hover {
    box-shadow: var(--box-shadow);
    opacity: 1;
  }*/
</style>