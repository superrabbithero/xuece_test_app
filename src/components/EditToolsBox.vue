<template>
  <my-modal v-model="codebar_show" :dragable="true">
    <!-- 生成条形码 -->
    <div class="modal-content" v-show="codebar_show">
      <div class="modal-line center line14">
        <label>准考证号：</label>
        <input v-model="barcodeData" type="text"/>
        <button @click="generateBarcode">生成</button>
      </div>
      <div class="modal-line center">
        <img v-show="barcode_url" :src="barcode_url" @click="selectimg($event)"/>
      </div>
      <div v-show="true">
        <svg ref="barcodeRef" style="box-sizing: border-box;"></svg>
      </div>
      <canvas id="canvas-codebar" v-show="false"/>
    </div>

  </my-modal>
  <div :class="['touch-toolsbox',{'locked':locked}]" ref="touchToolsbox">
    <div class="toolsbox" ref="toolsbox" id="toolsbox">
      <div class="edit-group">
        <div id="move" :class="[type=='move'?'edit-item active':'edit-item']">
          <au-button iconName="RiDragMoveLine" size="small" shape="square" @click="switchtools('move')" variant="text"/>
        </div>
        <div id="pencil" :class="[type=='pencil'?'edit-item active':'edit-item']">
          <au-button iconName="RiPencilLine" size="small" shape="square" @click="switchtools('pencil')" variant="text"/>
          <div v-if="type=='pencil'" class="text-editbox">
            <div class="text-editbox-groups">
              <template v-for="color in colorList" :key="color">
                <div class="color-item" :style="{backgroundColor:color,outlineColor:`${color}55`}" @click="getPenColor($event,color)"></div>
              </template>
            </div>
            <au-slider v-model="penWidth" style="width: 169px;" :max="30" />
            <!-- <input type="range" value="2" max="15" @change="changePenWidth" id="penWidth-range"> -->
          </div>
        </div>
        <div id="highlight" :class="[type=='highlight'?'edit-item active':'edit-item']">
          <au-button iconName="RiMarkPenLine" size="small" shape="square" @click="switchtools('highlight')" variant="text"/>
        </div>
        <div id="rect" :class="[type=='rect'?'edit-item active':'edit-item']">
          <au-button iconName="RiRectangleLine" size="small" shape="square" @click="switchtools('rect')" variant="text"/>
        </div>
        <div id="pic" :class="[type=='pic'?'edit-item active':'edit-item']">
          <au-button iconName="RiImageLine" size="small" shape="square" @click="switchtools('pic')" variant="text"/>
          <div v-if="type=='pic'" class="pic-editbox">
            <div class="pics"> 
              <img src="sheeteditorimg\img1.jpg" @click="selectimg($event)"/>
              <img src="sheeteditorimg\img2.jpg" @click="selectimg($event)"/>
              <img src="sheeteditorimg\img1.png" @click="selectimg($event)"/>
              <img src="sheeteditorimg\img1.jpg" @click="selectimg($event)"/>
            </div>
          </div>
        </div>
        <div class="edit-item">
          <au-button iconName="RiArrowGoBackLine" size="small" shape="square" @click="retrue" variant="text"/>
        </div>
      </div>
      <div class="edit-group">
        <div class="edit-item dld">
          <au-button iconName="RiDownloadLine" size="small" shape="square" @click="saveEditedImage(watermarktext)" variant="text"/>
        </div>
        <input type="text" id="download-add-watermark" :class="{'edit-input d-watermark':true,'wmshow':watermarktext}" placeholder="默认无水印" v-model="watermarktext"/>
        <div class="edit-item">
          <au-button iconName="RiBarcodeBoxLine" size="small" shape="square" @click="codebar_show=!codebar_show" variant="text"/>
        </div>
        <div class="edit-item">
          <au-button 
          :iconName="`${fullscreen?'RiFullscreenExitLine':'RiFullscreenLine'}`" 
          size="small" 
          shape="square" 
          @click="canvas2fullscreen" 
          variant="text"/>
        </div>
        
      </div>  
      <div class="box-drag" @pointerdown="dragdown">
        <au-icon name="RiDraggable" size="22" color="#aaa"/>
      </div>
    </div>
  </div>
  <div class="textinput" style="display:none">
    <textarea id="edit-textarea">
    </textarea>
  </div>
</template>

<script setup>
import { ref, inject, watch, defineEmits, defineProps } from 'vue'

const emit = defineEmits(['update-type','update:modelValue'])

const props = defineProps({
  modelValue:{
    type:Object,
    required: true
  },
})

const colorList = ['#000000', '#fb351e', '#f47d1e', '#f0cc1b', '#40ceb0', '#31a9f9', '#6663f6','#ffffff']

const touchToolsbox = ref(null)

const toolsbox = ref(null)


const {
  clearImges,
  saveEditedImage,
  push2images,
  changeBarcodeUrl,
  changePenColor,
  updatePenWidth,
  retrue
} = inject('pageMethods')


import JsBarcode from 'jsbarcode';

const locked = ref(true)

const type = ref("move")
// const tmptype = ref("")
// const draged = ref(false)
const dragedel = ref(null)
const disx = ref(0)
const disy = ref(0)
// const textColor = ref("#000")
// const draggedImage = ref(null)
const fullscreen = ref(false)
const watermarktext = ref("")
const barcodeData = ref("")
const codebar_show = ref(false)
const barcode_url = ref(null)

const canvasBoxRef = ref(null)
const barcodeRef = ref(null)
// const canvasRef = ref(null)




watch(type, (newVal, oldVal) => {
  if (oldVal === 'pic' && newVal !== 'move') {
    console.log('还有贴图没有绘制，确认后未保存的贴图将丢失!')
    clearImges()
  }
})

// 方法定义
// const handleWatchEnter = (e) => {
//   if(e.repeat) return
// }

// const handleWatchOut = (e) => {
//   const key = window.event ? e.keyCode : e.which
//   if (key === 32) {
//     type.value = tmptype.value
//     gettoolsbystring(type.value)
//   }
// }

const switchtools = (type) => {
  gettoolsbystring(type)
}

const gettoolsbystring = (typeId) => {
  type.value = typeId // 通过事件通知父组件
  emit('update-type', {
    type: typeId
  })
  
  // console.log("getCurCanvas", getCurCanvas)

  // canvasRef.value = getCurCanvas

  // if(typeId === 'move') {
  //   canvasRef.value.style.cursor = 'grab'
  // } else if(typeId === 'highlight') {
  //   canvasRef.value.style.cursor = 'text'
  // } else {
  //   canvasRef.value.style.cursor = 'auto'
  // }
  
  // if(penClick.value) {
  //   emit('mo-up') // 通知父组件执行MoUp
  // }
}

const dragdown = (e) => {
  dragedel.value = true
  locked.value = false
  document.addEventListener('pointermove', dragmove)
  document.addEventListener('pointerup', dragup)
  disx.value = e.pageX - toolsbox.value.offsetLeft
  disy.value = e.pageY - toolsbox.value.offsetTop
}

const dragup = () => {
  dragedel.value = false
  const rect1 = touchToolsbox.value.getBoundingClientRect();
  const y1 = rect1.top;
  
  // 获取第二个div的y坐标（相对于视口）
  const rect2 = toolsbox.value.getBoundingClientRect();
  const y2 = rect2.top;

  // 计算y坐标的绝对差值
  const difference = Math.abs(y1 - y2);

  locked.value = difference <= 100

  if(locked.value){
    toolsbox.value.style.top = 'unset'
    toolsbox.value.style.left = 'unset'
  }

  document.removeEventListener('mousemove', dragmove)
  document.removeEventListener('pointerup', dragup)
}

const dragmove = (e) => {
  if(dragedel.value) {
    toolsbox.value.style.left = e.pageX - disx.value + 'px'
    toolsbox.value.style.top = e.pageY - disy.value + 'px'
  }
}

// const getTextColor = (e, color) => {
//   const colorItems = document.querySelectorAll('.color-item')
//   const item = e.currentTarget
//   colorItems.forEach(i => i.classList.remove('active'))
//   item.classList.add('active')
//   textColor.value = color
//   textareaRef.value.style.color = textColor.value
// }

const getPenColor = (e, color) => {
  const colorItems = document.querySelectorAll('.color-item')
  const item = e.currentTarget
  colorItems.forEach(i => i.classList.remove('active'))
  item.classList.add('active')
  changePenColor(color)
  // emit('update-pen-color', color) // 通知父组件更新笔颜色
}

const penWidth = ref(props.modelValue.penWidth)

watch(penWidth , ()=>{
  updatePenWidth(parseInt(penWidth.value))
})

const selectimg = (e) => {
  const image = e.currentTarget
  push2images(image.src)
}

const canvas2fullscreen = () => {
  if(document.fullscreenElement) {
    exitFullscreen()
  } else {
    requestFullscreen(canvasBoxRef.value)
  }
  fullscreen.value = !fullscreen.value
}

// 辅助函数
const exitFullscreen = () => {
  if (document.exitFullscreen) {
    document.exitFullscreen()
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen()
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen()
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen()
  }
}

const requestFullscreen = (element) => {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.webkitRequestFullScreen) {
    element.webkitRequestFullScreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen()
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen()
  }
}

const generateBarcode = () => {

  if(!barcodeRef.value || !barcodeData.value){
    return
  }

  JsBarcode(barcodeRef.value, barcodeData.value, {
    background:"#fff0",
    height: 100,
    fontSize: 18,
    fontOptions: 'bold',
    font: 'Courier New'
  })

  const svg = barcodeRef.value

  const width = svg.clientWidth || parseInt(svg.getAttribute('width'));
  const height = svg.clientHeight || parseInt(svg.getAttribute('height'));

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '0');
  rect.setAttribute('y', '0');
  rect.setAttribute('width', width);
  rect.setAttribute('height', height);
  rect.setAttribute('fill', '#fff'); // 透明填充
  rect.setAttribute('stroke', 'black'); // 边框颜色
  rect.setAttribute('stroke-width', '1'); // 边框粗细

  svg.insertBefore(rect, svg.firstChild);

  const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
  const tempUrl = URL.createObjectURL(svgBlob)

  barcode_url.value = tempUrl
  changeBarcodeUrl(tempUrl) // 通知父组件更新条形码URL
}

</script>

<style scoped>

.touch-toolsbox {
  position: relative; 
  min-width: 546px;
  width: 100%;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: fit-content;
}

.touch-toolsbox.locked{
/*  position: relative;*/
  
}

.touch-toolsbox.locked .toolsbox {
  position: relative;
  box-shadow: none;
  border-radius: unset;
  background: transparent;
}

.toolsbox{
  box-sizing: border-box;
/*  min-width: 546px;*/
  position: absolute;
  display: flex;
  gap: 2px;
  background-color: var(--box-bgc);
  box-shadow: var(--box-shadow);
  padding: 8px 0 8px 8px;
  border-radius: 8px;
  align-items: center;
  z-index: 999;
}



.edit-group {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}



.edit-item {
  width: 32px;
  height: 32px;
  border-radius: 4px;
}

.edit-input{
  background-color: #444;
  color: #aaa;
  border: none;
  font-weight: 100;
  font-family: auto;
  vertical-align: 5px;
  padding: 5px 6px;
  border-radius: 4px;
}

.edit-input:focus{
  background-color: #eee;
  color: #888;
  font-weight: normal;
  outline: none;
}

.d-watermark{
  box-sizing: border-box;
  width: 0px;
  padding: 5px 0;
  opacity: 0;
  transition:width 1s, padding 1s, opacity 1s;
}

.dld:hover + input,.d-watermark:hover,.d-watermark:focus{
  width: 5rem;
  padding: 5px 6px;
  opacity: 1;
/*  display: inline-block !important;*/
}

.wmshow{
  width: 5rem;
  padding: 5px 6px;
  opacity: 1;
}




.color-item:active {
  /*  border: 2px solid #fff;*/
  transform: scale(1.2);
}

.edit-item:active {
  background-color: #8884;
}

.edit-item.active {
  background-color: #8884;
}

.word-view {
  -moz-user-select : none;
  -khtml-user-select : none;
  user-select: none;
  display: flex;
  align-items: center;
  font-family: auto;
}

.edit-group.pag {
  display: inline-block;
}

.toolsbox:hover .box-drag{
  opacity: 1;

}

.box-drag {
  height: 32px;
  display: flex;
  align-items: center;
  opacity: 1;
  transition: 0.3s ease;
}

.locked .box-drag {
  opacity: 0;
}

.textinput {
  position: absolute;
  top:300px;
  left: 300px;
  border: 2px dashed #333;
  background-color: rgba(255,255,255,0);
}

#edit-textarea {
  font-size: 1rem;
  letter-spacing: 1px;
  padding: 10px;
  color: #f00;
  max-width: 100%;
  line-height: 1.5;
  border-radius: 5px;
  border: none;
  background-color: rgba(255,255,255,0);
  height: fit-content;
  overflow: auto;
}

.text-editbox {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
/*  top: -28px;*/
  padding: 8px 8px;
  background: var(--box-bgc);
  border: var(--box-border);
  border-radius: 5px;
  gap: 6px;
  width: max-content;
  align-items: center;
}

.text-editbox-groups{
   display: flex;
   gap: 6px;
}

.text-editbox > input {
  display: inline-block;
  background-color: #444;
  border: none;
  height: 14px;
  width: 40px;
  margin: 0 5px;
  color: #aaa;
  font-weight: 100;
  font-family: auto;
}

.text-editbox > input[type="range"] {
  display: inline-block;
  background-color: #444;
  height: auto;
  border: none;
  width: 80px;
  margin: 0 5px;
  color: #aaa;
}

.color-item {
    box-sizing: border-box;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0px 0px 0px 1px #0002;

  }
.color-item.active,.color-item:hover {
    outline: 4px solid #fff0;
  }

.pic-editbox {
  position: absolute;
  display: flex;
  flex-flow:row wrap;
/*  flex-direction: column;*/
  justify-content: center;
/*  align-items: center;*/
/*  height: 30px;*/
  width: 120%;
  height: 80px;
  top: -95px;
  left: -10%;
  padding: 10px 0px;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 5px;
  
}

.pics{
  overflow-x: auto ;
  white-space: nowrap;
}

.pics > img{
  background-color: white;
  width:  80px;
  height: 80px;
  display: inline-block;
  object-fit: cover;
  margin: 0 8px;
}






</style>

