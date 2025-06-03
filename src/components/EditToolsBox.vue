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
      <div v-show="false">
        <svg ref="barcodeRef" ></svg>
      </div>
      <canvas id="canvas-codebar" v-show="false"/>
    </div>

  </my-modal>
  <div  class="touch-toolsbox">
    <div class="toolsbox" ref="toolsbox" id="toolsbox">
      <div class="edit-group">
        <div id="move" :class="[type=='move'?'edit-item active':'edit-item']" @click="switchtools($event)">
          <icon-wrapper name="RiDragMoveLine" color="#eee" size="25" />
        </div>
        <div id="pencil" :class="[type=='pencil'?'edit-item active':'edit-item']" @click="switchtools($event)">
          <icon-wrapper name="RiPencilLine" color="#eee" size="25" />
          <div v-if="type=='pencil'" class="text-editbox">
            <div class="color-item black" @click="getPenColor($event,'#000')"></div>
            <div class="color-item red" @click="getPenColor($event,'#f00')"></div>
            <div class="color-item orange" @click="getPenColor($event,'#ffa500')"></div>
            <div class="color-item yellow" @click="getPenColor($event,'#ff0')"></div>
            <div class="color-item green" @click="getPenColor($event,'#90ee90')"></div>
            <div class="color-item blue" @click="getPenColor($event,'#87ceeb')"></div>
            <div class="color-item white" @click="getPenColor($event,'#fff')"></div>
            <input type="range" value="2" max="15" @change="changePenWidth" id="penWidth-range">
          </div>
        </div>
        <div id="highlight" :class="[type=='highlight'?'edit-item active':'edit-item']" @click="switchtools($event)">
          <icon-wrapper name="RiMarkPenLine" color="#eee" size="25" />
        </div>
        <div id="rect" :class="[type=='rect'?'edit-item active':'edit-item']" @click="switchtools($event)">
          <icon-wrapper name="RiRectangleLine" color="#eee" size="25" />
        </div>
        <div id="pic" :class="[type=='pic'?'edit-item active':'edit-item']" @click="switchtools($event)">
          <icon-wrapper name="RiImageLine" color="#eee" size="25" />
          <div v-if="type=='pic'" class="pic-editbox">
            <div class="pics"> 
              <img src="sheeteditorimg\img1.jpg" @click="selectimg($event)"/>
              <img src="sheeteditorimg\img2.jpg" @click="selectimg($event)"/>
              <img src="sheeteditorimg\img1.png" @click="selectimg($event)"/>
              <img src="sheeteditorimg\img1.jpg" @click="selectimg($event)"/>
            </div>
          </div>
        </div>
        <div class="edit-item" @click="retrue">
          <icon-wrapper name="RiArrowGoBackLine" color="#eee" size="25" />
        </div>
      </div>
      <div class="edit-group zoom" v-if="modelValue?.canvasVisible">
        <div class="edit-item" @click="scaleD">
          <icon-wrapper name="RiZoomInLine" color="#eee" size="25" />
        </div>
        <div class="edit-item" @click="scaleX">
          <icon-wrapper name="RiZoomOutLine" color="#eee" size="25" />
        </div>
        <div class="word-view">
          {{parseInt(modelValue?.scaleCount*100)}}%
        </div>
      </div>
      <div class="edit-group pag" v-if="modelValue?.canvasVisible">
        <div class="edit-item" @click="prePage">
          <icon-wrapper name="RiArrowLeftSLine" color="#eee" size="25" />
        </div>
        <div class="word-view">
          {{modelValue?.page_num}} / {{modelValue?.pdfPages}}
        </div>
        <div class="edit-item"  @click="nextPage">
          <icon-wrapper name="RiArrowRightSLine" color="#eee" size="25" />
        </div>
      </div>
      <div class="edit-group">
        <div class="edit-item dld" @click="saveEditedImage(watermarktext)">
          <icon-wrapper name="RiDownloadLine" color="#eee" size="25" />
        </div>
        <input type="text" id="download-add-watermark" :class="{'edit-input d-watermark':true,'wmshow':watermarktext}" placeholder="默认无水印" v-model="watermarktext"/>
        <div class="edit-item" @click="codebar_show=!codebar_show">
          <IconWrapper name="RiBarcodeBoxLine" color="#eee" size="25" />
        </div>
        <div class="edit-item" @click="canvas2fullscreen">
          <IconWrapper v-if="fullscreen" name="RiFullscreenExitLine" theme="filled" color="#eee" size="25" />
          <IconWrapper v-else name="RiFullscreenLine" color="#eee" size="25" />
        </div>
        
      </div>  
      <div class="box-drag" @mousedown="dragdown($event,'toolsbox')"  @mouseup="dragup">
        <icon-wrapper name="RiDraggable" size="25" color="#aaa"/>
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

defineProps({
  modelValue:{
    type:Object,
    required: true
  },
})


const {
  nextPage,
  prePage,
  scaleD,
  scaleX,
  // addimge,
  clearImges,
  saveEditedImage,
  push2images,
  changeBarcodeUrl,
  changePenColor,
  updatePenWidth,
  retrue
} = inject('pageMethods')


import JsBarcode from 'jsbarcode';

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

const switchtools = (e) => {
  const type = e.currentTarget.id
  console.log("switchtools",type)
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

const dragdown = (e, id) => {
  dragedel.value = document.getElementById(id)
  document.addEventListener('mousemove', dragmove)
  disx.value = e.pageX - dragedel.value.offsetLeft
  disy.value = e.pageY - dragedel.value.offsetTop
}

const dragup = () => {
  dragedel.value = null
  document.removeEventListener('mousemove', dragmove)
}

const dragmove = (e) => {
  if(dragedel.value) {
    dragedel.value.style.left = e.pageX - disx.value + 'px'
    dragedel.value.style.top = e.pageY - disy.value + 'px'
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

const changePenWidth = () => {
  const range = document.getElementById('penWidth-range')
  updatePenWidth(parseInt(range.value))
}

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
    height: 100,
    fontSize: 18,
    fontOptions: 'bold',
    font: 'Courier New'
  })

  const svg = barcodeRef.value
  const svgBlob = new Blob([svg.outerHTML], { type: 'image/svg+xml' })
  const tempUrl = URL.createObjectURL(svgBlob)

  barcode_url.value = tempUrl
  changeBarcodeUrl(tempUrl) // 通知父组件更新条形码URL
}

</script>

<style scoped>

.touch-toolsbox {
  position: fixed; 
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: end;
/*  pointer-events: none;*/
}

.toolsbox{
  position: absolute;
  background-color: #333;
  margin-bottom: 16px;
  padding: 8px 30px 8px 18px;
  border-radius: 8px;
}

.edit-group {
  display: inline-block;
}



.edit-item {
  display: inline-block;
  padding: 5px 6px 6px 6px;
  margin: 0 2px;
  border-radius: 4px;
  pointer-events: auto;
  line-height: 0;
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


@media (any-hover:hover){
  .edit-item:hover {
    background-color: #444;
  }
  .color-item:hover {
  /*  border: 2px solid #fff;*/
  transform: scale(1.2);
  }
}
.edit-item:active {
  background-color: #444;
}

.color-item:active {
  /*  border: 2px solid #fff;*/
  transform: scale(1.2);
}

.edit-item:active {
  background-color: #555;
}

.edit-item.active {
  background-color: #444;
}

.word-view {
  -moz-user-select : none;
  -khtml-user-select : none;
  user-select: none;
  display: inline-block;
  color: #aaa;
  font-weight: 100;
  font-family: auto;
  vertical-align: 5px;
  padding: 5px 6px;
}

.edit-group.pag {
  display: inline-block;
}

.box-drag {
  position: absolute;
  height: 25px;
  width: 25px;
  padding-top:5px ;
  right: 2px;
  top: 8px;
  pointer-events: auto;
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
  flex-flow:row wrap;
/*  flex-direction: column;*/
  justify-content: center;
/*  align-items: center;*/
/*  height: 30px;*/
  top: -28px;
  padding: 8px 8px;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 5px;
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
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  margin-right: 6px;
  transition: transform 0.3s ease;  /* 添加过渡效果 */
  cursor: pointer; 
}



.color-item.active {
/*  border: 2px solid #fff;*/
transform: scale(1.2);
}

.color-item.black {
  background-color: #000;
}

.color-item.red{
  background-color: #ff0000;
}

.color-item.orange{
  background-color: #ffa500;
}

.color-item.yellow{
  background-color: #ff0;
}

.color-item.green{
  background-color: #90ee90;
}

.color-item.blue{
  background-color: #87ceeb;
}

.color-item.white{
  background-color: #fff;
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

