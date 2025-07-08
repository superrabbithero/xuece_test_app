<template>
  <div style="position: fixed;top:90px">
    {{state.view}}{{state.scaleCount}}
    <input type="button" class="fill" value="清空" @click="clearAll"/>
    <input type="button" class="fill" value="重绘" @click="reDraw"/>
    <input type="button" class="fill" value="放大" @click="zoomIn"/>
    <input type="button" class="fill" value="缩小" @click="zoomOut"/>
  </div>
  <div class="canvas-area" ref="canvasArea">
    
    <canvas v-show="show" ref="canvasBcg" class="canvas-background">
    </canvas>
    
    <canvas v-show="show" ref="canvas" class="canvas-cur"
               @pointerdown="handlePointerDown">
    </canvas>
    <canvas v-show="state.historyShow" ref="canvasHistory" class="canvas-history">
    </canvas>
  </div>

    <div v-show="show" :class="{'edit-tools-box':true, 'active':editToolsActive || modal_show.setting_show}" ref="dragToolsBar" @pointerover="handleToolsBarFocus" @pointerleave="handleToolsBarOut">

      <div :class="{'edit-tools-item':true,'active':state.tool == 'pencil'}" @click="getcanvastool('pencil')">
        <au-icon name="RiPencilLine"  size="22"></au-icon>
      </div>
      <div :class="{'edit-tools-item':true,'active':state.tool == 'eraser'}" @click="getcanvastool('eraser')">
        <au-icon name="RiEraserLine" size="22"></au-icon>
      </div>
      <div :class="{'edit-tools-item':true,'active':state.tool == 'move'}" @click="getcanvastool('move')">
        <au-icon name="RiCursorLine" size="22"></au-icon>
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
  historyContext:null,
  bcgContext:null,
  historyShow:true,
  currentPointerType: null,
  multiLastPt: {},
  offsetTop: 0,
  offsetLeft: 0,
  startY: 0,
  scrolltop: 0,
  editTools_show: false,
  erasing: false,
  realErasing: false,
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
  pressTimerNum: 0,

  scaleCount:1,

  view:{
    x:0,
    y:0,
    width:0,
    height:0
  },

  allPoints:[],
  visiblePoints:[],
  tool:"pencil",
  movingStart:null,
  moveingOffset:{x:0,y:0}

})

const canvas = ref(null)
const canvasHistory = ref(null)
const canvasBcg = ref(null)
const dragToolsBar = ref(null)
const canvasArea = ref(null)

// const { modal_show } = toRefs(state)
// 解构常用状态
const { 
  penColor,
  penWidth,
  eraserWidth,
  // erasing,
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
  document.removeEventListener('pointermove', handlePointerMove)
  document.removeEventListener('pointerup', handlePointerUp)
})

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
  

  canvas.value.width = canvas.value.parentElement.clientWidth
  canvas.value.height = canvas.value.parentElement.clientHeight
  canvas.value.style.width = canvas.value.parentElement.clientWidth + "px"
  canvas.value.style.height = canvas.value.parentElement.clientHeight + "px"

  canvasHistory.value.width = canvasHistory.value.parentElement.clientWidth
  canvasHistory.value.height = canvasHistory.value.parentElement.clientHeight
  canvasHistory.value.style.width = canvasHistory.value.parentElement.clientWidth + "px"
  canvasHistory.value.style.height = canvasHistory.value.parentElement.clientHeight + "px"

  canvasBcg.value.width = canvasBcg.value.parentElement.clientWidth
  canvasBcg.value.height = canvasBcg.value.parentElement.clientHeight
  canvasBcg.value.style.width = canvasBcg.value.parentElement.clientWidth + "px"
  canvasBcg.value.style.height = canvasBcg.value.parentElement.clientHeight + "px"

  //初始化背景层
  state.bcgContext = canvasBcg.value.getContext('2d')
  drawBackground()

  //初始化实时层
  state.context = canvas.value.getContext('2d')
  // state.context.scale(2,2)
  state.context.strokeStyle = state.penColor
  state.context.lineCap = "round"

  //初始化历史层
  state.historyContext = canvasHistory.value.getContext('2d')
  // state.historyContext.scale(2,2)
  state.historyContext.strokeStyle = state.penColor
  state.historyContext.lineCap = "round"

  //初始化view坐标
  state.view = {x:0,y:0,width:canvas.value.width,height:canvas.value.height}
}

// const switchmode = () => {
//   state.mode = !state.mode
// }

const drawBackground = (dotSize = 1,gridSize = 15) => {
  
    state.bcgContext.fillStyle = "#fff"
    state.bcgContext.fillRect(0,0, canvasBcg.value.width,canvasBcg.value.height)
    // 计算水平和垂直方向上的点数
    const dotsX = Math.floor(canvasBcg.value.width / gridSize);
    const dotsY = Math.floor(canvasBcg.value.height / gridSize);

    // 设置圆点颜色
    state.bcgContext.fillStyle = '#aaa';

    // 遍历所有点并绘制
    for (let x = 0; x < dotsX; x++) {
      for (let y = 0; y < dotsY; y++) {
        const posX = x * gridSize + gridSize / 2; // 计算圆点中心X坐标
        const posY = y * gridSize + gridSize / 2; // 计算圆点中心Y坐标

        state.bcgContext.beginPath();
        state.bcgContext.arc(posX, posY, dotSize, 0, Math.PI * 2); // 绘制圆点
        state.bcgContext.fill();
      }
    }
  
  
}

const handlePointerDown = (event) => {
  if (state.dragToolsBar) return
  
  state.currentPointerType = event.pointerType

  updateOffset()

  if (state.mode == false && state.currentPointerType == 'pen') {
    state.mode = true
    console.log(`检测到正在使用触控笔，开启"仅触控笔"模式，可在画板设置中关闭`)
  }
  
  const id = event.pointerId
  state.multiLastPt[id] = { x: event.clientX, y: event.clientY }
  
  if(state.tool == 'move'){
    
    state.movingStart = {x:event.clientX,y: event.clientY}
    state.context.drawImage(canvasHistory.value,0,0)
    state.historyShow = false
  }else if(state.tool == 'eraser'){
    state.realErasing = true
    console.log(state.allPoints)
  }
  else {
    //原来的双指判断等逻辑
    if (state.mode == true && state.currentPointerType === 'pen') {
      state.scrolltop = canvas.value.parentElement.scrollTop
      state.isDrawing = true
      document.addEventListener('pointermove', handlePointerMove)
      document.addEventListener('pointerup', handlePointerUp)
      state.points = []
      state.points.push(
        { x: Math.round((event.clientX - state.offsetLeft + state.view.x)*state.scaleCount), 
        y: Math.round((event.clientY - state.offsetTop + state.view.y)*state.scaleCount) })
      state.beginPoint = state.points[0]
    } else if (state.mode == true && state.currentPointerType === 'touch') {
      state.isScroll = id
      state.startY = event.clientY
      state.scrolltop = canvas.value.parentElement.scrollTop
    } else if (state.mode === false) {
      state.scrolltop = canvas.value.parentElement.scrollTop
      if (Object.keys(state.multiLastPt).length == 2) {
        state.isDrawing = false
        state.isScroll = id
        state.startY = event.clientY
      } else if (Object.keys(state.multiLastPt).length == 1) {
        state.isDrawing = true
        document.addEventListener('pointermove', handlePointerMove)
        document.addEventListener('pointerup', handlePointerUp)
        state.points = []
        state.points.push(
          { x: Math.round((event.clientX - state.offsetLeft + state.view.x)*state.scaleCount), 
          y: Math.round((event.clientY - state.offsetTop + state.view.y)*state.scaleCount) })
        state.beginPoint = state.points[0]
      }
    }
  }
}

const drawLine = (startp, endp) => {

  const ctx = state.erasing ? state.historyContext : state.context;

  ctx.beginPath()
  ctx.moveTo((startp.x)/state.scaleCount - state.view.x, (startp.y)/state.scaleCount - state.view.y)
  ctx.lineTo((endp.x)/state.scaleCount - state.view.x, (endp.y)/state.scaleCount - state.view.y)
  ctx.strokeStyle = state.penColor
  ctx.lineWidth = state.erasing ? state.eraserWidth/state.scaleCount : state.penWidth/state.scaleCount  
  ctx.stroke()
  ctx.closePath()
}

const updateOffset = () => {
  const rect = canvas.value.getBoundingClientRect()

  state.offsetLeft = rect.left
  state.offsetTop = rect.top
}

const handlePointerMove = (event) => {
  if (state.dragToolsBar) return
  if (state.movingStart){
    const offsetX = event.clientX - state.movingStart.x
    const offsetY = event.clientY - state.movingStart.y
    state.moveingOffset = {
      x: offsetX,
      y: offsetY}
    canvas.value.style.top = offsetY + 'px'
    canvas.value.style.left = offsetX + 'px'
  }else if(state.realErasing){
    console.log("moving")
    const point = { 
          x: Math.round((event.clientX - state.offsetLeft + state.view.x)*state.scaleCount), 
          y: Math.round((event.clientY - state.offsetTop + state.view.y)*state.scaleCount)}

    state.context.clearRect(0,0,canvas.value.width,canvas.value.height)

    state.context.beginPath()
    state.context.arc(point.x,point.y,state.eraserWidth/state.scaleCount/2,0,Math.PI * 2)
    state.context.strokeStyle = "#000"
    state.context.lineWidth = 2
    state.context.stroke()

    eraseStrokes(point.x,point.y,state.eraserWidth/state.scaleCount)
  }else{
    //之前的逻辑
    const id = event.pointerId
    if (state.isDrawing && state.multiLastPt[id]) {
      if ((state.mode == true && state.currentPointerType === 'pen') || state.mode === false) {
        if (!state.erasing) {
          if (state.currentPointerType == 'pen') {
            state.context.lineWidth = event.pressure * state.penWidth/state.scaleCount
          } else {
            state.context.lineWidth = state.penWidth/state.scaleCount
          }
        } else {
          state.historyContext.lineWidth = state.eraserWidth/state.scaleCount
        }
        
        const endp = { 
          x: Math.round((event.clientX - state.offsetLeft + state.view.x)*state.scaleCount), 
          y: Math.round((event.clientY - state.offsetTop + state.view.y)*state.scaleCount)}
        state.points.push(endp)
        drawLine(state.beginPoint,endp)
        state.beginPoint = endp
      }
    } else if (state.isScroll == id) {
      const y = event.clientY - state.startY
      canvas.value.parentElement.scrollTop = state.scrolltop - y
    }
  }
  
    
}


// 平滑曲线不要删除
const quadraticLine = (points=null) => {

  const pt = points ? points.points : simplifyPoints(state.points,1)
  const cur_color = points ? points.color : state.penColor
  const cur_line_width = points ? points.width : state.penWidth

  const temp = state.historyContext.globalCompositeOperation
  if(points != null){
    state.historyContext.globalCompositeOperation = points.tool == 0 ? 'destination-out' : 'source-over'
  }

  state.historyContext.beginPath()
  state.historyContext.beginPath()

  state.historyContext.moveTo((pt[0].x)/state.scaleCount - state.view.x,(pt[0].y)/state.scaleCount - state.view.y)
  for (let i = 1; i < pt.length; i++){
    const cpx = (pt[i].x + pt[i-1].x) / 2
    const cpy = (pt[i].y + pt[i-1].y) / 2
    state.historyContext.quadraticCurveTo(
      (pt[i-1].x)/state.scaleCount - state.view.x,
      (pt[i-1].y)/state.scaleCount - state.view.y,
      (cpx)/state.scaleCount - state.view.x,
      (cpy)/state.scaleCount - state.view.y)
  }



  

  state.historyContext.lineTo(
    (pt[pt.length-1].x)/state.scaleCount - state.view.x,
    (pt[pt.length-1].y)/state.scaleCount - state.view.y)
  state.historyContext.strokeStyle = cur_color
  state.historyContext.lineWidth = cur_line_width/state.scaleCount

  state.context.clearRect(0,0,canvas.value.width,canvas.value.height)

  state.historyContext.stroke()

  state.historyContext.globalCompositeOperation = temp

  if(points==null){
    state.allPoints.push({
      tool:state.erasing ? 0 : 1, //0橡皮，1画笔
      points:pt,
      color:cur_color,
      width:cur_line_width
    })
  }
    
  state.historyContext.closePath()
  for (let i = 0; i < pt.length; i++){

    state.historyContext.beginPath();
    state.historyContext.arc(
      (pt[i].x)/state.scaleCount - state.view.x,
      (pt[i].y)/state.scaleCount - state.view.y, 
      state.penWidth/2, 0, 
      Math.PI * 2); // 绘制圆点
    state.historyContext.fill();
    state.historyContext.closePath()
  }
}



const handlePointerUp = (event) => {
  if (state.dragToolsBar) return
  
  const id = event.pointerId
  if (state.movingStart){
    state.view.x -= state.moveingOffset.x
    state.view.y -= state.moveingOffset.y
    clearAll()
    reDraw()
    state.movingStart = null
    canvas.value.style.top = 0
    canvas.value.style.left = 0
    state.historyShow = true
  }else if(state.realErasing){
    state.realErasing = false
    console.log(state.allPoints)
  }else{
    if (state.isDrawing) {
      state.isDrawing = false
      
      if (state.erasing==false)
        quadraticLine()
      else{
        state.allPoints.push({
          tool:0, //0橡皮，1画笔
          points:simplifyPoints(state.points,1),
          color:"0",
          width:state.eraserWidth
        })
      }
    }
    if (state.multiLastPt[id]) {
      delete state.multiLastPt[id]
    }
    if (state.isScroll) {
      state.isScroll = null
    }
  }
  
}

const clearAll = () => {
  state.context.clearRect(0,0,canvas.value.width,canvas.value.height)
  state.historyContext.clearRect(0,0,canvas.value.width,canvas.value.height)
}

const simplifyPoints = (points, tolerance = 1)=>{
  if (points.length <= 2) return points;
  
  const first = points[0];
  const last = points[points.length - 1];
  
  // 找到离首尾连线最远的点
  let maxDist = 0;
  let index = 0;
  
  for (let i = 1; i < points.length - 1; i++) {
    const dist = perpendicularDistance(points[i], first, last);
    if (dist > maxDist) {
      maxDist = dist;
      index = i;
    }
  }
  
  // 递归处理子分段
  if (maxDist > tolerance) {
    const left = simplifyPoints(points.slice(0, index + 1), tolerance);
    const right = simplifyPoints(points.slice(index), tolerance);
    return left.slice(0, -1).concat(right);
  } else {
    return [first, last];
  }
}

// 计算点到线段的垂直距离
const perpendicularDistance = (point, lineStart, lineEnd)=> {
  const area = Math.abs(
    (lineEnd.x - lineStart.x) * (lineStart.y - point.y) - 
    (lineStart.x - point.x) * (lineEnd.y - lineStart.y)
  );
  const lineLength = Math.hypot(lineEnd.x - lineStart.x, lineEnd.y - lineStart.y);
  return area / lineLength;
}

const reDraw = () => {
  
  // state.visiblePoints = []

  state.allPoints.forEach((points)=>{
    // 检查当前笔画是否有至少一个点在可视范围内
    // console.log(points)
    const hasVisiblePoint = points.points.some(point => {
      return point.x >= state.view.x * state.scaleCount &&
             point.x <= state.view.x * state.scaleCount + state.view.width &&
             point.y >= state.view.y * state.scaleCount && 
             point.y <= state.view.y * state.scaleCount + state.view.height;
    });

    // 只有当有可见点时才会绘制
    if (hasVisiblePoint) {
        quadraticLine(points);
        // state.visiblePoints.push(index)
    }
  })
}

const getcanvastool = (tool) => {
  state.tool = tool
  if (tool == 'pencil') {
    state.historyContext.globalCompositeOperation = 'source-over'
    state.erasing = false
  } else if (tool == "eraser") {
    // state.historyContext.globalCompositeOperation = 'destination-out'
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


const zoomIn = () => {
  if(state.scaleCount - 0.1 <= 0)
    return
  state.scaleCount = parseFloat((state.scaleCount - 0.1).toFixed(1));
  state.view.width = Math.round(canvas.value.width*state.scaleCount)
  state.view.height = Math.round(canvas.value.height*state.scaleCount)
  clearAll()
  reDraw()
}

const zoomOut = () => {
  if(state.scaleCount + 0.1 >= 2)
    return
  state.scaleCount = parseFloat((state.scaleCount + 0.1).toFixed(1))
  state.view.width = Math.round(canvas.value.width*state.scaleCount)
  state.view.height = Math.round(canvas.value.height*state.scaleCount)
  clearAll()
  reDraw()
}

//对象橡皮擦擦除逻辑
// 橡皮擦功能
const eraseStrokes = (eraserX, eraserY, eraserSize) => {
  console.log(eraserX, eraserY, eraserSize)
  const newStrokes = [];
  const eraserRadius = eraserSize / 2;

  state.allPoints.forEach( stroke => {
    // const stroke = state.allPoints[index]
    let remainingPoints = [stroke.points[0]]; // 保留起点
    let splitSegments = [];

    for (let i = 1; i < stroke.points.length; i++) {
      const prevPoint = stroke.points[i-1];
      const currentPoint = stroke.points[i];
      
      // 检查线段端点是否都在圆内
      const p1InCircle = isPointInCircle(prevPoint, {x: eraserX, y: eraserY}, eraserRadius);
      const p2InCircle = isPointInCircle(currentPoint, {x: eraserX, y: eraserY}, eraserRadius);

      if (p1InCircle && p2InCircle) {
        remainingPoints = [currentPoint]
        continue
      }
      // 检测线段与橡皮擦的碰撞
      const intersection = checkLineEraserIntersection(
        prevPoint, currentPoint, 
        {x: eraserX, y: eraserY}, 
        eraserRadius
      );

      if (!intersection) {
        remainingPoints.push(currentPoint);
      }else{
        // 拆分为两个线段
        splitSegments.push({
          ...stroke,
          points: [...remainingPoints, intersection.point]
          // color: 
        });
        // 开始新的线段
        remainingPoints = [intersection.point, currentPoint];
      }
    }

    // 添加最后一段
    if (remainingPoints.length > 1) {
      splitSegments.push({
        ...stroke,
        points: remainingPoints
      });
    }

    newStrokes.push(...splitSegments);

  });

  state.allPoints = newStrokes;
  state.historyContext.clearRect(0,0,canvasHistory.value.width,canvasHistory.value.height)
  reDraw(); // 重绘画布
}
//橡皮擦和线段的碰撞判断
const checkLineEraserIntersection = (p1, p2, eraserCenter, radius) => {

   

  // 线段到圆心的最短距离计算
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx*dx + dy*dy);
  
  // 单位向量
  const nx = dx / length;
  const ny = dy / length;
  
  // 线段起点到圆心的向量
  const cx = eraserCenter.x - p1.x;
  const cy = eraserCenter.y - p1.y;
  
  // 投影长度
  const projection = cx * nx + cy * ny;
  const closestPoint = {
    x: p1.x + nx * Math.max(0, Math.min(projection, length)),
    y: p1.y + ny * Math.max(0, Math.min(projection, length))
  };
  
  // 距离计算
  const distX = eraserCenter.x - closestPoint.x;
  const distY = eraserCenter.y - closestPoint.y;
  const distance = Math.sqrt(distX*distX + distY*distY);
  
  if (distance <= radius) {
    console.log({
      point: closestPoint,
      distance: distance
    })
    return {
      point: closestPoint,
      distance: distance
    };
  }
  return null;
}

//判断点是否在圆内
const isPointInCircle = (point, center, radius) => {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
};
</script>

<style scoped>
  .canvas-area{
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .canvas-history,.canvas-cur,.canvas-background {
/*    display: block;*/
    touch-action: none;
    image-rendering: -moz-crisp-edges;
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
    -ms-interpolation-mode: nearest-neighbor;
  }


  .canvas-cur,.canvas-history{
    position: absolute;
    top: 0;
    left: 0;
    z-index: 2;
  }

  .canvas-history {
    z-index: 1;
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
