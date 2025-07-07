<template>
    <canvas v-show="show" ref="canvas"
               @pointerdown="handlePointerDown"
               @pointermove="handlePointerMove"
               @pointerup="handlePointerUp">
                
    </canvas>
    <div v-show="show" :class="{'edit-tools-box':true, 'active':editToolsActive || modal_show.setting_show}" ref="dragToolsBar" @pointerover="handleToolsBarFocus" @pointerleave="handleToolsBarOut">

      <div :class="{'edit-tools-item':true,'active':!erasing}" @click="getcanvastool('pencil')">
        <au-icon name="RiPencilLine"  size="22"></au-icon>
      </div>
      <div :class="{'edit-tools-item':true,'active':erasing}" @click="getcanvastool('eraser')">
        <au-icon name="RiEraserLine" size="22"></au-icon>
      </div>
      <div class="divider-line"></div>
      <div class="edit-tools-item" @click="modal_show.setting_show = !modal_show.setting_show">
        <au-icon name="RiSettings2Line" size="22"></au-icon>
      </div>
      <div class="edit-tools-drag" @pointerdown="dragdown($event)"  @mouseup="dragup">
        <au-icon style="user-select: none;" name="RiDraggable" size="20"></au-icon>
      </div>
    </div>

    <my-modal v-model="modal_show.setting_show" :modeless="true" :modalKey="'setting_show'">
      <div class="tools-setting-container">
        <div class="content-items">
          <label>画笔大小：</label>
            
          <au-slider v-model="penWidth" style="width: 150px;" :max="20"></au-slider>
          {{penWidth}}
        </div>
        <div class="content-items">
          <label>橡皮大小：</label>
          
          <au-slider v-model="eraserWidth" style="width: 150px;"></au-slider>{{eraserWidth}}
        </div>
        <div class="content-items">
          <label>画笔颜色：</label>
          <div v-for="color in colorList" :key="color" @click="penColor = color" class="color-item" :style="{backgroundColor:color,height: color==penColor ? '20px':'15px'}"></div>
        </div>
        <div class="content-items">
          <label>仅触控笔：</label>
          <au-switch v-model="mode" size="small"></au-switch>
          {{mode ? '开' : '关' }}
        </div>
      </div>
      
    </my-modal>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onBeforeUnmount, nextTick,defineProps, toRefs} from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: true
  },
  width: Number,
  height: Number,
  switch: Number
})

// const emit = defineEmits([])

// 响应式数据
const state = reactive({
  log: "",
  mode: false,
  isDrawing: false,
  drawData: null,
  isScroll: 0,
  context: null,
  currentPointerType: null,
  multiLastPt: {},
  offsetTop: 0,
  offsetLeft: 0,
  startY: 0,
  scrolltop: 0,
  editTools_show: false,
  erasing: false,
  el: null,
  points: [],
  beginPoint: { x: 0, y: 0 },
  penWidth: 5,
  eraserWidth: 40,
  penColor: '#f00',
  canvasWidth: 0,
  canvasHeight: 0,
  imgDataList: [],
  modal_show: {
    setting_show: false
  },
  colorList: ['#000', '#f00', '#ffa500', '#ff0', '#90ee90', '#87ceeb', '#fff'],
  dragToolsBar: null,
  disx: 0,
  disy: 0,
  editToolsActive: false,
  pressTimer: null,
  pressTimerNum: 0
})

const canvas = ref(null)
const dragToolsBar = ref(null)

// const { modal_show } = toRefs(state)
// 解构常用状态
const { 
  penColor,
  penWidth,
  eraserWidth,
  erasing,
  mode,
  editToolsActive,
  colorList,
  modal_show
} = toRefs(state)

// 监听器
watch(() => props.switch, (newval, oldval) => {
  changeCanvas(newval, oldval)
  console.log(newval, oldval)
})

watch(() => props.show, (newval) => {
  if (newval) {
    resize()
    document.body.classList.add('none-select')
  } else {
    document.body.classList.remove('none-select')
  }
})

// 生命周期钩子
onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  document.body.classList.remove('none-select')
  document.removeEventListener('pointermove', dragmove)
  document.removeEventListener('pointerup', dragup)
})

// 方法
const dragdown = (e) => {
  if (!state.dragToolsBar) {
    state.dragToolsBar = dragToolsBar.value
    document.addEventListener('pointermove', dragmove)
    document.addEventListener('pointerup', dragup)
    state.disx = e.pageX - state.dragToolsBar.offsetLeft
    state.disy = e.pageY - state.dragToolsBar.offsetTop
    state.dragToolsBar.style.right = 'unset'
    state.dragToolsBar.style.left = e.pageX - state.disx + 'px'
    state.dragToolsBar.style.top = e.pageY - state.disy + 'px'
  }
}

const dragmove = (e) => {
  if (state.dragToolsBar) {
    state.dragToolsBar.style.left = e.pageX - state.disx + 'px'
    state.dragToolsBar.style.top = e.pageY - state.disy + 'px'
  }
}

const dragup = () => {
  state.dragToolsBar = null
  document.removeEventListener('pointermove', dragmove)
}

const resize = (Imgdata = null) => {
  const canvasEl = canvas.value
  let imageData = null
  if (Imgdata == null) {
    imageData = state.context.getImageData(0, 0, canvasEl.width, canvasEl.height)
  } else {
    imageData = Imgdata
  }

  // 保存当前的绘图状态
  const strokeStyle = state.context.strokeStyle
  const fillStyle = state.context.fillStyle
  const lineWidth = state.context.lineWidth
  const font = state.context.font
  const textAlign = state.context.textAlign
  const textBaseline = state.context.textBaseline
  const globalCompositeOperation = state.context.globalCompositeOperation
  
  canvasEl.width = canvas.value.clientWidth
  canvasEl.height = canvas.value.clientHeight
  state.canvasWidth = canvasEl.width
  state.canvasHeight = canvasEl.height
  // 清空并重置画布
  state.context.clearRect(0, 0, canvasEl.width, canvasEl.height)
  // 恢复绘图状态
  state.context.strokeStyle = strokeStyle
  state.context.fillStyle = fillStyle
  state.context.lineWidth = lineWidth
  state.context.font = font
  state.context.textAlign = textAlign
  state.context.textBaseline = textBaseline
  state.context.globalCompositeOperation = globalCompositeOperation
  if (imageData != "") {
    // 恢复画布内容
    state.context.putImageData(imageData, 0, 0)
  }
}

const init = () => {
  if (window.PointerEvent) {
    state.log = "Pointer events are supported."
  }
  

  canvas.value.width = canvas.value.parentElement.clientWidth * 5
  canvas.value.height = canvas.value.parentElement.clientHeight * 5
  canvas.value.style.width = canvas.value.parentElement.clientWidth + "px"
  canvas.value.style.height = canvas.value.parentElement.clientHeight + "px"
  console.log(canvas.value.width,canvas.value.height)
  // state.canvasWidth = canvas.value.width
  // state.canvasHeight = canvas.value.height
  // state.offsetLeft = canvas.value.offsetLeft
  // state.offsetTop = canvas.value.offsetTop
  state.context = canvas.value.getContext('2d')
  state.context.scale(5,5)
  state.context.strokeStyle = state.penColor
}

// const switchmode = () => {
//   state.mode = !state.mode
// }

const handlePointerDown = (event) => {
  if (state.dragToolsBar) return
  
  state.currentPointerType = event.pointerType

  state.offsetLeft = canvas.value.offsetLeft
  state.offsetTop = canvas.value.offsetTop

  if (state.mode == false && state.currentPointerType == 'pen') {
    state.mode = true
    console.log(`检测到正在使用触控笔，开启"仅触控笔"模式，可在画板设置中关闭`)
  }
  

  const id = event.pointerId
  state.multiLastPt[id] = { x: event.pageX, y: event.pageY }
  
  if (state.mode == true && state.currentPointerType === 'pen') {
    state.scrolltop = canvas.value.parentElement.scrollTop
    state.isDrawing = true
    state.points = []
    state.points.push({ x: event.pageX, y: event.pageY })
    state.beginPoint = state.points[0]
  } else if (state.mode == true && state.currentPointerType === 'touch') {
    state.isScroll = id
    state.startY = event.pageY
    state.scrolltop = canvas.value.parentElement.scrollTop
  } else if (state.mode === false) {
    state.scrolltop = canvas.value.parentElement.scrollTop
    if (Object.keys(state.multiLastPt).length == 2) {
      state.isDrawing = false
      state.isScroll = id
      state.startY = event.pageY
    } else if (Object.keys(state.multiLastPt).length == 1) {
      state.isDrawing = true
      state.points = []
      state.points.push({ x: event.pageX, y: event.pageY })
      state.beginPoint = state.points[0]
    }
  }
}

const drawLine = (startp, endp, cl, ct) => {
  
  state.context.beginPath()
  state.context.moveTo((startp.x - cl), (startp.y - ct))
  // state.context.quadraticCurveTo((ctrlp.x - cl), (ctrlp.y - ct), (endp.x - cl), (endp.y - ct))
  state.context.lineTo((endp.x - cl), (endp.y - ct))
  state.context.strokeStyle = state.penColor
  state.context.lineCap = "round"
  state.context.stroke()
  state.context.closePath()
}

const handlePointerMove = (event) => {
  if (state.dragToolsBar) return
  
  const id = event.pointerId
  if (state.isDrawing && state.multiLastPt[id]) {
    if ((state.mode == true && state.currentPointerType === 'pen') || state.mode === false) {
      const scrolltop = canvas.value.parentElement.scrollTop
      if (!state.erasing) {
        if (state.currentPointerType == 'pen') {
          state.context.lineWidth = event.pressure * state.penWidth
        } else {
          state.context.lineWidth = state.penWidth
        }
      } else {
        state.context.lineWidth = state.eraserWidth
      }
      
      const endp = { x: event.pageX, y: event.pageY }
      state.points.push(endp)
      // console.log(state.points.length)
      const ct = state.offsetTop - scrolltop
      drawLine(state.beginPoint,  endp, state.offsetLeft, ct)
      state.beginPoint = endp
    }
  } else if (state.isScroll == id) {
    const y = event.pageY - state.startY
    canvas.value.parentElement.scrollTop = state.scrolltop - y
  }
}


// 平滑曲线不要删除
// const quadraticLine = () => {
//   state.context.beginPath()
//   const scrolltop = canvas.value.parentElement.scrollTop
  
//   const ct = state.offsetTop - scrolltop
//   const cl = state.offsetLeft

//   state.context.moveTo(state.points[0].x-cl,state.points[0].y-ct)
//   for (let i = 1; i < state.points.length; i++){
//     const cpx = (state.points[i].x + state.points[i-1].x) / 2
//     const cpy = (state.points[i].y + state.points[i-1].y) / 2
//     state.context.quadraticCurveTo(state.points[i-1].x-cl,state.points[i-1].y-ct,cpx-cl,cpy-ct)
//   }
//   state.context.strokeStyle = "blue"
//   // state.context.lineWidth = 3
//   state.context.stroke()
  
//   state.context.closePath()
// }

const handlePointerUp = (event) => {
  if (state.dragToolsBar) return
  
  const id = event.pointerId
  if (state.isDrawing) {
    state.isDrawing = false
    // quadraticLine()
  }
  if (state.multiLastPt[id]) {
    delete state.multiLastPt[id]
  }
  if (state.isScroll) {
    state.isScroll = null
  }
}

const getcanvastool = (tool) => {
  console.log("click")
  if (tool == 'pencil') {
    state.context.globalCompositeOperation = 'source-over'
    state.erasing = false
  } else if (tool == "eraser") {
    state.context.globalCompositeOperation = 'destination-out'
    state.erasing = true
  }
}

const handleToolsBarFocus = () => {
  console.log("---------focus")
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

const changeCanvas = (newval, oldval) => {
  const canvasEl = canvas.value
  let imageData = state.context.getImageData(0, 0, canvasEl.width, canvasEl.height)
  state.imgDataList[oldval] = imageData
  imageData = state.imgDataList[newval] ? state.imgDataList[newval] : ""
  
  nextTick(() => {
    resize(imageData)
  })
}
</script>

<style scoped>
  canvas {
    background-color: #eeef;
    display: block;
    touch-action: none;
/*    position: absolute;*/
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    -ms-interpolation-mode: nearest-neighbor;
  }

  .buttonbox{
    position: fixed;
    left: 0;
    z-index: 988;
  }

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
  
  .content-items{
    margin: 10px 0;
    display: flex;
    align-items: flex-end
  }

  .color-item {
    box-sizing: border-box;
    margin: 0 2px;
    border: 2px solid;
    width: 20px;
    transition: height 0.1s ease;
  }

  /* 工具栏2.0样式 */
  .edit-tools-box {
    display: flex;
    position: fixed;
    right:20px;
    border-radius: 14px;
    border: var(--box-border);
    z-index: 999;
    background: var(--box-bgc);
    padding: 6px 4px;
    box-shadow: unset;
    opacity: 0.5;
    touch-action: none;
  }

  .edit-tools-box.active {
    opacity: 1;
    box-shadow: var(--box-shadow);
  }

  /*.edit-tools-box:hover {
    box-shadow: var(--box-shadow);
    opacity: 1;
  }*/

  .divider-line {
    width: 0;
    border-left: var(--box-border);
    margin: 0 5px;
  }
</style>
