<template>
  <div v-show="isPageLoading" class="au-full-loading">
    <loading-com></loading-com>
  </div>
  <my-modal v-model="modal_show.linkxuecemodal_show"  :dragable="true" >
    <!-- 自动填涂 -->
    <div class="modal-content">
      <div class="modal-line">
        <label>环境：</label>
        <input type="radio" id="option1" name="env" value="test1" v-model="env">
        <label for="option1">test1</label>
        <input type="radio" id="option2" name="env" value="test2" v-model="env" >
        <label for="option2">test2</label>
      </div>
      <div class="modal-line">
        <label>类型：

        </label>
        <input type="radio" id="option3" name="papertype" value="exam" v-model="papertype">
        <label for="option3">考试</label>
        <input type="radio" id="option4" name="papertype" value="classwork" v-model="papertype">
        <label for="option4">作业</label>
      </div>
      <div class="modal-line">
        <label>考试/作业id：</label>
        <input type="text" v-model="paperid" style="width: 4rem;" />
        <div>{{linkErrorMsg}}</div>
      </div>
      <div class="modal-line" style="justify-content: flex-end;">
        
        <button @click="linktoXuece()" >关联</button>
        <!-- <button @click="downloadPDF()" v-show="pdfUrl">导入</button> -->
      </div>
    </div>
  </my-modal>

  <my-modal v-model="modal_show.json_show" :dragable="true" >
    <!-- json-view -->
    <div class="modal-content" style="max-height: 500px;overflow: auto;">
     <json-modal :json-data="cutParamJson"></json-modal>
    </div>
    <textarea v-model="cutParamJsonStr"/>
    <button @click="formattedJsonStr">生成Json</button>
  </my-modal>

  <my-modal v-model="modal_show.fill_show" :dragable="true">
    <div class="au-grid">
      <div class="rows gutter-l" >
        <div class="cols s12">
          <input type="radio" name="fillError" id="noError" value="0" v-model="fillError">
          <label for="noError">自定义</label>
        </div>
      </div>
      <div class="rows gutter-l" v-show="fillError == 0">
        <div class="cols s3">
          <input type="checkbox" id="ticketNum" v-model="fillNum">
          <label for="ticketNum">准考证</label>
        </div>
        <div class="cols s3">
          <input type="checkbox" id="obj-q" v-model="fillObj">
          <label for="obj-q">客观题</label>
        </div>
        <div class="cols s3">
          <au-select :dataList="['A','AB','ABC','ABCD']" @change="changeOptionOffset"></au-select>
        </div>
        <div class="cols s3">
          <input type="checkbox" id="subj-q" v-model="fillSubj">
          <label for="subj-q">主观题</label>
        </div>
      </div>
      <div class="rows gutter-l" >
        <div class="cols s6">
          <input type="radio" name="fillError" id="ticketNumberError" value="1" v-model="fillError">
          <label for="ticknumberError">准考证异常</label>
        </div>
        <div class="cols s6">
          <input type="radio" name="fillError" id="positionError" value="2" v-model="fillError">
          <label for="positionError">识别点异常</label>
        </div>
      </div>
      <div class="rows gutter-l" >
        <div class="cols s6">
          <input type="radio" name="fillError" id="objError" value="3" v-model="fillError">
          <label for="objError">客观题异常</label>
        </div>
        <div class="cols s6">
          <input type="radio" name="fillError" id="subjError" value="4" v-model="fillError">
          <label for="subjError">主观题异常</label>
        </div>
      </div>
      <div class="rows gutter-l end">
        <div class="cols">
          <button @click="fillAnswerCard()">填涂</button>
        </div>
      </div>
    </div>
  </my-modal>


  <div class="sheetview">
    <div class="sheeteditor" :style="{ height:clientHeight + 'px'}">

      <input type="file" ref="uploadpdf" @change="handleFileChange" accept=".pdf" style="display: none;">
      <div class="menu-bar" v-show="toolsParams?.canvasVisible">
        <div class="filenameview">
          <IconWrapper name="RiArrowLeftSLine" size="22" @click="toolsParams.canvasVisible = false,cutparamshow = false"/>
          <div class="filename">{{filename}}</div>
        </div>

        <!-- 识别点编辑按钮 -->
        <div  class="filenameview">
            <div class="cutparameditbox">
              <IconWrapper name="RiSaveLine" size="22" @click="saveData()"/>
            </div>
            <div class="cutparameditbox">
              <IconWrapper name="RiFocusMode" size="22" @click="showCutParam()"/>
            </div>
            <div class="cutparameditbox">
              <IconWrapper name="RiLink" @click="modal_show.linkxuecemodal_show=!modal_show.linkxuecemodal_show"  size="22"/>
            </div>
            <div class="cutparameditbox" title="识别参数" v-show="cutParamJson" @click="modal_show.json_show=!modal_show.json_show">
              <IconWrapper name="RiBracesLine" size="22"/>
            </div>
            <div class="cutparameditbox" v-show="cutParamJson" @click="modal_show.fill_show=!modal_show.fill_show">
              <div class="filename">填涂</div>
            </div>
        </div>

        <div v-show="!toolsParams?.canvasVisible" class="filenameview">
          <IconWrapper name="RiArrowLeftSLine" size="22" @click="toolsParams.canvasVisible = false,cutparamshow = false"/>
        </div>
      </div>
      <div v-show="!toolsParams?.canvasVisible" class="cover">
        <div class="cover-historys">
          <div class="cover-historys-item">
            <div class="item cover-create" >
              <div class="upload-icon" @click="clickuploadpdf">
                <icon-wrapper name="RiAddLargeLine" size="40"/>
              </div>
              <div style="width:80px;height:1px;background: #8883;"></div>
              <div class="upload-icon" @click="modal_show.linkxuecemodal_show = true">
                <icon-wrapper name="RiLinksLine" size="40"/>
              </div>
            </div>
            <p>上传pdf文件</p>
          </div>
          <div v-for="(data, index) in reversedList" :key="index" class="cover-historys-item">
            <div class="item cover-pdf-data" @click="openFromImg(data)">
              <img :src="`${data?.img_urls[0]}?x-oss-process=image/resize,m_lfit,h_300`" />
            </div>
            <p :title="data.file_name">{{data.file_name}}</p>
          </div>
        </div>
        <div class="cover-links" v-if="reversedLinkList.length > 0">
          <div class="table-content">
            <table class="au-table">
              <thead>
                <tr>
                  <th>
                    <div class="au-table-item">
                      <icon-wrapper name="RiLinksFill"  size="17" color="#ffc848"/>
                      <div>历史关联</div>
                    </div>
                  </th>
                  <th>环境</th>
                  <th>考试/作业id</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>                
                <tr v-for="(data,index) in reversedLinkList" :key="index" @click="openFromLinks(data)">
                  <td>
                    <div class="au-table-item">
                      {{data.name}}
                      <div class="au-table-item-tag">
                        {{data.card_type == "exam" ? "考试":"作业"}}
                      </div>
                    </div>
                  </td>
                  <td>
                    {{data.env}}
                  </td>
                  <td>
                    {{data.paper_id}}
                  </td>
                  <td>
                    {{data.update_time || "-"}}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div v-show="toolsParams?.canvasVisible" class="canvasbox" :style="{ height:clientHeight - 40 + 'px'}" ref="canvasbox">
        <canvas class="sheet-canvas" @pointerdown="MoDown($event)" @pointermove="MoMove($event)" @pointerup="MoUp" v-for="pageIndex in toolsParams.pdfPages " :id="'canvas'+pageIndex" :key="pageIndex" v-show="!isDrawing && pageIndex == toolsParams.page_num" ref="pdfcanvas">
        </canvas>

         <!-- 识别点展示 -->
        <div ref="cutparampage" class="cutpage" v-show="cutparamshow">
          <div ref="cutparampanel" class="cutpage-panel" v-if="cutParamJson">
            <div class="cutpage-section" v-show="toolsParams?.page_num%2===1"
            :style="{ width:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.width + 'px') : '0',
                      height:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.height + 'px') : '0',
                      top:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.y + 'px') : '0',
                      left:cutParamJson.studentIdRect ? (cutDivScale*cutParamJson.studentIdRect.x + 'px') : '0'}"></div>
            <div class="cutpage-section"  v-for="(section,index) in cutParamJson.section" :key="index" v-show="section.pageNumber == toolsParams?.page_num"
            :style="{ width:cutDivScale*section.rect.width + 'px',
                      height:cutDivScale*section.rect.height + 'px',
                      top:cutDivScale*section.rect.y + 'px',
                      left:cutDivScale*section.rect.x + 'px'}">
              <div class="cutpage-section sub" v-for="(subsection,index) in section.subsections" :key="index" :style="hasFreeStyleGroupsSubsectionStyle(subsection)">
                      <!-- <div class="cutpage-section sub remove">
                        {{subsection.x}}{{subsection.y}}
                      </div> -->
                      <div class="cutpage-section" v-for="(freeStyleCellGroup,index) in subsection.freeStyleCellGroups" :key="index">
                        <div class="cutpage-section sub" v-for="(freeStyleCell, index) in freeStyleCellGroup" :key="index" :style="{ width:'1px',height:'1px',
                        top:cutDivScale*freeStyleCell.y + 'px',
                        left:cutDivScale*freeStyleCell.x + 'px'}"></div>
                      </div>
                        
              </div>
            </div>
          </div>
        </div>

        <div class="dragged-image" v-for="(image, index) in images" v-show="image" :key="index"  @pointerdown="dragimgdown($event)"  @pointerup="dragimgup" ref="imageRefs">
          <img  draggable="false" :src="image" width="150" />
          <IconWrapper name="RiCheckboxCircleFill" size="22" color="#7ed321" style="position: absolute;right: -11px;top: -9px;" @click="darwimg(index)" @pointerdown.prevent="$event.stopPropagation()" @pointerup="$event.stopPropagation()"/>
          <IconWrapper name="RiCloseCircleFill" size="22" color="#d0021b" style="position: absolute;right: -11px;top: 24px;" @click="delimg(index)" @pointerdown.prevent="$event.stopPropagation()" @pointerup="$event.stopPropagation()"/>
          <IconWrapper name="RiExpandDiagonalS2Line" size="22" color="#555" :strokeWidth="2" style="position: absolute;right: -11px;bottom: -9px;" @pointerdown.prevent="resizeImgStart($event,index)" @pointermove="$event.stopPropagation()" @pointerup="stopResize"/>
        </div>

        <edit-tools-box v-model="toolsParams" v-if="toolsParams?.canvasVisible" @update-type="updateType" />
      </div>
    </div>            
  </div>
</template>



<script setup>
import * as pdfjsLib from "pdfjs-dist";

import EditToolsBox from "@/components/EditToolsBox.vue";

import loadingCom from "@/components/motion/LoadingJumpingDots.vue";

import key from 'keymaster'
import {getFormattedDateTime} from "@/assets/js/utils.js"

import xueceApi from "@/api/endpoints/xuece"

import {ref, computed, onMounted, nextTick, inject, provide, watch} from 'vue'

import { useOssStore } from '@/stores/ossStore';

const ossStore = useOssStore();

const toast = inject('toast')

//工具栏参数
const toolsParams = ref({
  canvasVisible:false,
  scaleCount:0.5,
  page_num:1,
  pdfPages:0
})

const isPageLoading = ref(false)

// 基本数据类型使用ref
const isDrawing = ref(false)
const images = ref([])
const tool_type = ref("move")
// const canvasVisible = ref(false)
const pdfDoc = ref(null)
// const page_num = ref(1)
const penColor = ref("#000")
const hlpenColor = ref("#000")
const penWidth = ref(4)

const hlpenWidth = ref(20)
const penClick = ref(false)
const startAxisX = ref(0)
const startAxisY = ref(0)
const controlPointX = ref(0)
const controlPointY = ref(0)
const points = ref([])
const beginPoint = ref({x:0, y:0})
// const history = ref([])
const historys = ref([])
const cur_canvas = ref(null)
const cur_ctx = ref(null)
const undo = ref(false)
// const pdfPages = ref(0)
// const scaleCount = ref(0.5)
const width_temp = ref(0)
const height_temp = ref(0)
const clientHeight = ref(document.documentElement.clientHeight - 145)
const draged = ref(false)
const disx = ref(0)
const disy = ref(0)
const canvasX = ref(0)
const canvasY = ref(0)
const filename = ref('')
const draggedImageDom = ref(null)
const cutparamshow = ref(false)
const anchorxy = ref({x:0, y:0})
const cutParamJsonStr = ref("")
const cutParamJson = ref({})
const pdfUrl = ref(null)

const linkErrorMsg = ref(null)

const cutDivScale = ref(1)
const papertype = ref("exam")
const paperid = ref(18079)
const env = ref("test1")
const fillObj = ref(true)
const fillSubj = ref(true)
const fillNum = ref(true)
const fillError = ref(0)
const barcode_url = ref(null)
const optionOffset = ref([0])

const pdfDataList = ref([])
const pdfFromLinkDataList = ref([])

const cutparampanel = ref(null)
const cutparampage = ref(null)
const pdfcanvas = ref(null)
const canvasbox = ref(null)
const uploadpdf = ref(null)
const imageRefs = ref(null)

const isSaving = ref(false)

// 嵌套对象使用ref包装整个对象
const modal_show = ref({
  json_show: false,
  fill_show: false,
  linkxuecemodal_show: false,
})

watch(
  cur_canvas.value, 
  (newVal, oldVal) => {
    console.log(oldVal,"=>", newVal)
})

const updateType = (obj) => {
  tool_type.value = obj?.type

  if(tool_type.value === 'move') {
    cur_canvas.value.style.cursor = 'grab'
  } else if(tool_type.value === 'highlight') {
    cur_canvas.value.style.cursor = 'text'
  } else {
    cur_canvas.value.style.cursor = 'auto'
  }
}

const reversedList = computed(() => {
    // 当dataList变化时会自动重新计算
    return [...pdfDataList.value].reverse()
}) 

const reversedLinkList = computed(() => {
    // 当dataList变化时会自动重新计算
    return [...pdfFromLinkDataList.value].reverse()
}) 

const hasFreeStyleGroupsSubsectionStyle = computed(() => {
  return (subsection) => {
    if (subsection.freeStyleCellGroups) {
      return { 
        width: '0', 
        height: '0', 
        top: cutDivScale.value * subsection.y + 'px', 
        left: cutDivScale.value * subsection.x + 'px',
        border: 'none',
        boxSizing: 'border-size'
      }
    } else {
      return { 
        width: '1px', 
        height: '1px', 
        top: cutDivScale.value * subsection.y + 'px', 
        left: cutDivScale.value * subsection.x + 'px'
      }
    }
  }
})


onMounted(() => {
  // 加载历史记录
  const jsonStr = localStorage.getItem('pdf_data')

  pdfDataList.value = jsonStr ? JSON.parse(jsonStr) : []

  const jsonStr2 = localStorage.getItem("linkDataList")

  pdfFromLinkDataList.value = jsonStr2 ? JSON.parse(jsonStr2) : []


  console.log(pdfDataList.value[0])
  // 窗口大小变化监听
  window.onresize = () => {
    clientHeight.value = document.documentElement.clientHeight - 145
  }

  // 快捷键绑定
  key('⌘+z, ctrl+z', () => {
    retrue()
  })

  key('⌘+s, ctrl+s', () => {
    saveEditedImage()
  })
})

const openFromImg = (data) => {

  isPageLoading.value = true

  filename.value = data.file_name

  isDrawing.value = true




  cutParamJsonStr.value = data.cut_params

  if(cutParamJsonStr.value) formattedJsonStr()

  toolsParams.value.pdfPages = data?.img_urls?.length

  if(!data?.img_urls[toolsParams.value.page_num - 1]){
    toolsParams.value.page_num = 1
  }

  nextTick(() => {
    
    let i = 0
    if(Array.isArray(pdfcanvas.value)){
      pdfcanvas.value.forEach(item => {
        historys.value.push([])
        const ctx = item.getContext('2d')
        drawOssImage(i,item, ctx, data?.img_urls[i]);
        
        i++
      })

    }else{
      historys.value.push([])
      const ctx = pdfcanvas.value.getContext('2d')
      drawOssImage(i,pdfcanvas.value, ctx, data?.img_urls[i]);

      
    }
    

      
  })


  // 加载并绘制OSS图片
  function drawOssImage(i,canvas, ctx, imgUrl) {
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // 处理跨域问题
    
    img.onload = () => {
      // 设置Canvas尺寸与图片一致
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 绘制图片（从左上角开始）
      ctx.drawImage(img, 0, 0);
      
      historys.value[i].push({
          data: ctx.getImageData(0, 0, canvas.width, canvas.height)
        })
      // 如果需要缩放绘制：
      // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      if(i==0){
        isDrawing.value = false
        cur_canvas.value = canvas
        width_temp.value = cur_canvas.value.width
        height_temp.value = cur_canvas.value.height
        cur_ctx.value = ctx;

        canvasX.value = cur_canvas.value.style.left
        canvasY.value = cur_canvas.value.style.top
      }

      canvas.style.width = canvas.width * toolsParams.value.scaleCount + 'px'
      canvas.style.height = canvas.height * toolsParams.value.scaleCount + 'px'
      if(i >= pdfcanvas.value.length-1){
        toolsParams.value.canvasVisible = true
        isPageLoading.value = false
      }
        
    };

    img.onerror = () => {
      console.error('图片加载失败');
    };

    img.src = imgUrl;
  }
  
}


const formattedJsonStr = () => {
  try{
    cutParamJson.value = JSON.parse(cutParamJsonStr.value)
    // console.log(cutParamJsonStr.value)
    cutParamJsonStr.value = JSON.stringify(cutParamJson.value, null, 4);
    // console.log(JSON.stringify(cutParamJson.value).replace(/\s+/g, ''))
  }catch(error){
    cutParamJson.value = {"code":"error","msg":error}
  }
}

const changeOptionOffset = (index) => {
  console.log(index)
  switch(index){
    case 0: optionOffset.value = [0];break;
    case 1: optionOffset.value = [0,1];break;
    case 2: optionOffset.value = [0,1,2];break;
    case 3: optionOffset.value = [0,1,2,3];break;
  }
}
const watermark = (text) => {
  for(let i=1 ; i <= toolsParams.value.pdfPages ; i++){
    const canvas = document.getElementById("canvas"+i)
    const ctx = canvas.getContext("2d");
    ctx.font = `bold ${canvas.height / 20}px arial`;
    ctx.fillStyle = 'rgba(255, 0, 0, .1)';
    // ctx.textBaseline = 'bottom';
    ctx.transform(1, 0.5, -0.5, 1, 0, -canvas.height / 2);

    let txt = text+" ";
    const txtHeight = canvas.height / 15;
    txt = Array(Math.ceil(canvas.width / ctx.measureText(txt).width) * 2).join(txt);
    for (let i = 0; i < Math.ceil(canvas.height / txtHeight) * 2; i++) {
      ctx.fillText(txt, 0, i * txtHeight);
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    addHistoy(i,canvas)
    // console.log(i)
  }
}

const resizeImgStart = (e, index) => {
  e.stopPropagation()
  // const imgElem = this.$refs[`image-${index}`][0]
  const imgElem = imageRefs.value[index]
  draggedImageDom.value = imgElem.querySelector('img')
  disx.value = e.pageX;
  disy.value = draggedImageDom.value.width
  window.addEventListener('pointermove', imgResize);
  window.addEventListener('pointerup', stopResize);
}

const imgResize = (e) => {
  if(draggedImageDom.value){
    draggedImageDom.value.width = disy.value + e.pageX - disx.value
  }
}

const stopResize = (e) => {
  e.stopPropagation()
  disx.value = 0;
  disy.value = 0;
  draggedImageDom.value = null;

  window.removeEventListener('pointermove', imgResize);
  window.removeEventListener('pointerup', stopResize);
}


const darwimg = (index) => {
  // const imgElem = this.$refs[`image-${index}`][0]
  const imgElem = imageRefs.value[index]
  const img = imgElem.querySelector('img')
  // console.log(img.width)
  var x = imgElem.offsetLeft
  var y = imgElem.offsetTop
  drop(img,x,y)
  delimg(index)
}

const delimg = (index) => {
  images.value[index] = null;
  // console.log(images.value)
}

const dragimgdown = (e) => {
  const el = e.currentTarget
  draggedImageDom.value = el
  el.left = 0
  el.top = 0
  window.addEventListener('pointermove',dragimgmove)
  disx.value = e.pageX - el.offsetLeft
  disy.value = e.pageY - el.offsetTop

  // console.log(el.style.left)
}

const dragimgmove = (e) => {
  // var scrolltop = document.documentElement.scrollTop||document.body.scrollTop;
  if(draggedImageDom.value){
    const el = draggedImageDom.value
    // console.log(el)
    // console.log(el.offsetLeft, el.offsetTop)
    // console.log(disx,disy)
    // const ctx = cur_ctx.value;
    // console.log(stopAxisX,stopAxisY)
    el.style.left = e.pageX - disx.value + 'px';
    el.style.top = e.pageY - disy.value + 'px';
  }      
}

const dragimgup = () => {
  // const el = draggedImageDom.value
  window.removeEventListener('pointermove',dragimgmove)
  draggedImageDom.value = null
}




const drop = (img,stopAxisX,stopAxisY) => {

  
  const canvas = cur_canvas.value;
  // const el = canvasbox.value
  const ctx = cur_ctx.value;
  // console.log(stopAxisX,stopAxisY)
  // var scrolltop = el.scrollTop;
  // var scrollleft = el.scrollLeft;
  // console.log(scrolltop,scrollleft)
  
  const cl = canvas.offsetLeft
  const ct = canvas.offsetTop

  const x = stopAxisX - cl + 22;
  const y = stopAxisY - ct + 22;

  // console.log(x,y,img.width)

  ctx.drawImage(img, x/toolsParams.value.scaleCount, y/toolsParams.value.scaleCount, img.width/toolsParams.value.scaleCount, img.height/toolsParams.value.scaleCount);

  addHistoy()

}

const clickuploadpdf = () => {
  uploadpdf.value.click()
  
}
const handleFileChange = () => {
  isPageLoading.value = true
  loadPDF().then(()=>{
    toolsParams.value.canvasVisible = true
  }).finally(()=>{
    isPageLoading.value = false
  })
}

const loadPDF = async (hasUrl=false) => {
  // NOTE: 这一步要特别注意，网上很多关于pdfjs的使用教程里漏了这一步，会出现workerSrc未定义的错误
  pdfjsLib.GlobalWorkerOptions.workerSrc = require('pdfjs-dist/build/pdf.worker.entry')
  // pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.mjs'
  
  if(hasUrl){
    const loadingTask = pdfjsLib.getDocument(pdfUrl.value);
    loadingTask.promise.then((pdf) => {
      pdfDoc.value = pdf
      toolsParams.value.pdfPages = pdfDoc.value.numPages
      nextTick(() => {
        renderPage(toolsParams.value.page_num)
      })
    }).catch((error) => {
      console.error("PDF加载失败:", error);
    });
  }else{
    const file = uploadpdf.value.files[0];
    if (file) {
      filename.value = file.name
      historys.value = []
      if(filename.value.split('.').slice(-1)[0].toLowerCase()=='pdf'){
        const reader = new FileReader();
        reader.onload = async (e) => {
          console.log(e)
          const loadingTask = pdfjsLib.getDocument({ data: e.target.result });
          loadingTask.promise.then((pdf) => {
            pdfDoc.value = pdf
            toolsParams.value.pdfPages = pdfDoc.value.numPages
            nextTick(() => {
              // this.initPages()
              renderPage(toolsParams.value.page_num)
            })
          })
        };
        reader.readAsArrayBuffer(file);
      }else{
        //传图
        const reader = new FileReader();
        reader.onload = (e) => {
          toolsParams.value.pdfPages = 1
          const img = new Image();
          nextTick(() => {
            historys.value.push([])
            const canvas = document.getElementById('canvas1');
            cur_canvas.value = canvas;
            // console.log(cur_canvas.value)
            const ctx = canvas.getContext("2d");
            // 设置canvas宽高为图片宽高
            width_temp.value = img.width
            cur_canvas.value.width = img.width;
            cur_canvas.value.style.width = img.width * toolsParams.value.scaleCount + 'px'
            height_temp.value = img.height
            cur_canvas.value.height = img.height;
            cur_canvas.value.style.height = img.height * toolsParams.value.scaleCount + 'px'
            cur_ctx.value = ctx
            img.onload = () => {
              // 清除之前的内容
              cur_ctx.value.clearRect(0, 0, cur_canvas.value.width, cur_canvas.value.height);
              // 绘制图像到画布
              cur_ctx.value.drawImage(img, 0, 0, cur_canvas.value.width, cur_canvas.value.height);
            };
          })
          
          img.src = e.target.result;
        };

        reader.readAsDataURL(file);
      }
      
    }
  }

    
}



const nextPage = () => {
  if(toolsParams.value.page_num < toolsParams.value.pdfPages)
    toolsParams.value.page_num++;
    cur_canvas.value = document.getElementById("canvas"+toolsParams.value.page_num);
    cur_ctx.value = cur_canvas.value.getContext("2d");
    cur_canvas.value.style.left = canvasX.value;
    cur_canvas.value.style.top = canvasY.value;

    // this.addHistoy();
}
const prePage = () => {
  if(toolsParams.value.page_num > 1)
    toolsParams.value.page_num--;
    cur_canvas.value = document.getElementById("canvas"+toolsParams.value.page_num);
    cur_ctx.value = cur_canvas.value.getContext("2d");
    cur_canvas.value.style.left = canvasX.value;
    cur_canvas.value.style.top = canvasY.value;
    // this.addHistoy();
}

const renderPage = (num) => {
  historys.value.push([])
  var canvasId = 'canvas' + num
  const canvas = document.getElementById(canvasId);
  cur_canvas.value = canvas;
  const ctx = canvas.getContext("2d");
  cur_ctx.value = ctx
  const page = pdfDoc.value.getPage(num);
  page.then((page) => {
    var width1 = page.getViewport({ scale: 1.0 }).width;
    //简单判断纸张大小
    var myscale = 3068/width1
    if (width1 < page.getViewport({ scale: 1.0 }).height){
      //A4
      myscale = 1654/width1
    }
    const viewport = page.getViewport({ scale: myscale });
    cur_canvas.value.style.height = viewport.height * toolsParams.value.scaleCount + "px";
    height_temp.value = viewport.height
    cur_canvas.value.height = viewport.height;
    cur_canvas.value.style.width = viewport.width * toolsParams.value.scaleCount + "px";
    width_temp.value = viewport.width
    cur_canvas.value.width = viewport.width
    
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport,
    };

    page.render(renderContext).promise.then(() => {
      toolsParams.value.canvasVisible = true;
      historys.value[num-1].push({
        data: cur_ctx.value.getImageData(0, 0, canvas.width, canvas.height)
      })
      if(num < toolsParams.value.pdfPages){
        renderPage(num + 1);
      }else{
        cur_canvas.value = document.getElementById("canvas1");
        // console.log("#######3", cur_canvas.value)
        cur_ctx.value = cur_canvas.value.getContext("2d");
        // console.log('初始化比例：',toolsParams.value.scaleCount)
        canvasX.value = cur_canvas.value.style.left
        canvasY.value = cur_canvas.value.style.top
      }
    });
  });
  
}
const saveEditedImage = (text=null) => {

  if(text){
    watermark(text)
  }
  var date = new Date()
  for(let i=1 ; i <= toolsParams.value.pdfPages ; i++){
    const canvas = document.getElementById("canvas"+i)
    const ctx = canvas.getContext("2d")
    const editedImage = canvas.toDataURL("image/jpeg");
    const link = document.createElement("a");
    link.href = editedImage;

    link.download = date.getTime() +"("+i+").jpg";
    link.click();
    if(text){
      var history = historys.value[i-1];
      history.pop();
      ctx.putImageData(history[history.length - 1]['data'], 0, 0);
    }   
  }
}
const MoDown = (event)=>{
  // console.log(tool_type.value)
  if(tool_type.value == 'move'){
    draged.value = true
    const el = cur_canvas.value
    el.style.cursor='grabbing'
    disx.value = event.pageX - el.offsetLeft
    disy.value = event.pageY - el.offsetTop
  }else{
    points.value = []
    points.value.push({x:event.pageX,y:event.pageY});
    beginPoint.value = points.value[0]
    penClick.value = true;
    controlPointX.value = 0;
    controlPointY.value = 0
    startAxisX.value = event.pageX;
    startAxisY.value = event.pageY;
    // const el = canvasbox.value
    // console.log(el.offsetLeft,el.offsetTop)
    // console.log(event.pageX,event.pageY)
  }
}
const MoUp = () => {     
  if(tool_type.value == 'move'){
    draged.value = false
    cur_canvas.value.style.cursor='grab'
    canvasX.value = cur_canvas.value.style.left
    canvasY.value = cur_canvas.value.style.top
  }else{
    penClick.value = false;
    addHistoy()
  }
}
const drawLine = (startp,ctrlp,endp,cl,ct) => {
  cur_ctx.value.beginPath();
  cur_ctx.value.moveTo((startp.x-cl)/toolsParams.value.scaleCount,(startp.y-ct)/toolsParams.value.scaleCount)
  cur_ctx.value.quadraticCurveTo((ctrlp.x-cl)/toolsParams.value.scaleCount,(ctrlp.y-ct)/toolsParams.value.scaleCount,(endp.x-cl)/toolsParams.value.scaleCount,(endp.y-ct)/toolsParams.value.scaleCount)
  cur_ctx.value.strokeStyle = penColor.value;//设置颜色
  cur_ctx.value.lineWidth = penWidth.value;//设置大小
  cur_ctx.value.lineCap = "round";//设置两端的形状
  cur_ctx.value.stroke();// stroke() 方法来绘制线条
  cur_ctx.value.closePath();

}
const MoMove = (event)=>{
  if(tool_type.value == 'move'){
      if(draged.value == true){
      const el = cur_canvas.value
      // const pg = cutparampage.value
      // console.log(el.offsetLeft, el.offsetTop)
      // console.log(disx.value,disy.value)
      cutparampage.value.style.left = el.style.left = event.pageX - disx.value + 'px';
      cutparampage.value.style.top = el.style.top = event.pageY - disy.value + 'px';
    }
  }else{
    if(!penClick.value) return;
    const canvas = cur_canvas.value;
    const el = canvasbox.value
    const ctx = cur_ctx.value;
    const stopAxisX = event.pageX;
    const stopAxisY = event.pageY;
    var scrolltop = el.scrollTop;
    var scrollleft = el.scrollLeft;
    const cl = el.offsetLeft + canvas.offsetLeft - scrollleft;
    const ct = el.offsetTop + canvas.offsetTop - scrolltop;
    
    if(tool_type.value == 'pencil'){    
      var endp = {x:stopAxisX, y:stopAxisY}
      points.value.push(endp)

      if(points.value.length > 2){
        const lastTwoPoints = points.value.slice(-2);
        const controlPoint = lastTwoPoints[0];
        const endPoint = {
            x: (lastTwoPoints[0].x + lastTwoPoints[1].x) / 2,
            y: (lastTwoPoints[0].y + lastTwoPoints[1].y) / 2,
        }
        drawLine(beginPoint.value, controlPoint, endPoint, cl, ct);
        beginPoint.value = endPoint;
      }
    }else if(tool_type.value == 'rect'){
      //创建路径

      // ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.beginPath();
      //设置矩形填充颜色
      ctx.fillStyle="#000";
      //绘制矩形
      showLastHistory()
      ctx.fillRect((startAxisX.value-cl)/toolsParams.value.scaleCount,(startAxisY.value - ct)/toolsParams.value.scaleCount,(stopAxisX-cl-startAxisX.value+cl)/toolsParams.value.scaleCount,(stopAxisY - ct-startAxisY.value + ct)/toolsParams.value.scaleCount);
      //关闭路径
      ctx.closePath();
    }else if(tool_type.value == 'highlight'){
      
      ctx.beginPath();
      showLastHistory()
      ctx.moveTo((startAxisX.value - cl)/toolsParams.value.scaleCount, (startAxisY.value - ct)/toolsParams.value.scaleCount);//moveTo(x,y) 定义线条开始坐标

      ctx.lineTo((stopAxisX-cl)/toolsParams.value.scaleCount,(startAxisY.value - ct)/toolsParams.value.scaleCount );//lineTo(x,y) 定义线条结束坐标

      ctx.strokeStyle = hlpenColor.value;//设置颜色
      ctx.lineWidth = hlpenWidth.value;//设置大小
      ctx.lineCap = "butt";//设置两端的形状 context.lineCap="butt|round|square";
      ctx.stroke();// stroke() 方法来绘制线条
      ctx.closePath();
    }
  }
  

}

const retrue = () => {
  var history = historys.value[toolsParams.value.page_num-1];
  
  if(history && history.length > 1){
    
    history.pop();
    showLastHistory();
  }
  undo.value = false
}
const addHistoy = (pageNum=toolsParams.value.page_num, canvas=cur_canvas.value) => {
  var ctx = canvas.getContext("2d")

  historys.value[pageNum-1].push({
    data: ctx.getImageData(0, 0, canvas.width, canvas.height)
  })

  if (historys.value[pageNum-1].length > 20) {
    historys.value[pageNum-1].shift()
  }
}
const showLastHistory = () => {
  var history = historys.value[toolsParams.value.page_num-1];
  cur_ctx.value.putImageData(history[history.length - 1]['data'], 0, 0)
}
// pdf放大
const scaleD = ()=> {
  if (toolsParams.value.scaleCount == 2.0) {
    return
  }
  toolsParams.value.scaleCount =  parseFloat(toolsParams.value.scaleCount) + 0.1
  toolsParams.value.scaleCount = parseFloat(toolsParams.value.scaleCount.toFixed(1))
  // console.log(cur_canvas.value.style.width)
  // console.log('放大：'+ toolsParams.value.scaleCount)
  pdfcanvas.value.forEach(item => {
    var widthTemp = width_temp.value * parseFloat(toolsParams.value.scaleCount)
    var heightTemp = height_temp.value * parseFloat(toolsParams.value.scaleCount)
    item.style.width = widthTemp + 'px'
    item.style.height = heightTemp + 'px'
  })
  showCutParam(true)
}
// pdf缩小
const scaleX = () => {
  console.log(toolsParams.value.scaleCount)
  if (toolsParams.value.scaleCount == 0.1) {
    return
  }
  toolsParams.value.scaleCount =  parseFloat(toolsParams.value.scaleCount) - 0.1
  toolsParams.value.scaleCount = parseFloat(toolsParams.value.scaleCount.toFixed(1))

  console.log(toolsParams.value.scaleCount)

  pdfcanvas.value.forEach(item => {
    var widthTemp = width_temp.value * parseFloat(toolsParams.value.scaleCount)
    var heightTemp = height_temp.value * parseFloat(toolsParams.value.scaleCount)
    // console.log('缩小后的宽高：',widthTemp,heightTemp)
    item.style.width = widthTemp + 'px'
    item.style.height = heightTemp + 'px'
  })
  showCutParam(true)
  // console.log('缩小'+toolsParams.value.scaleCount)
}

//在画布中添加图片
// const addimge = (image)=> {
//   let ctx = cur_ctx.value;
//   ctx.drawImage(image,0,0);
// }

const showCutParam = (ifScale = false) =>{
  
  if(cutParamJson?.value == null){
    modal_show.value.linkxuecemodal_show = false
    // console.log(this.linkxuecemodal_show)
    return
  }
  if (cutparamshow.value && !ifScale) {
    cutparamshow.value = false;
  }else {
    // console.log("right here")
    const result = findfirstanchor()
    // console.log(result)
    if (!result) {
      // return
    }
    var json = cutParamJson.value
    // console.log(json.pageSize.width,json.pageSize.height)
    var widthTemp = width_temp.value * parseFloat(toolsParams.value.scaleCount)
    var heightTemp = height_temp.value * parseFloat(toolsParams.value.scaleCount)
    
    cutparampage.value.style.width = widthTemp + 'px'
    cutparampage.value.style.height = heightTemp + 'px'

    var panel = cutparampanel.value

    // cutDivScale.value = widthTemp/json.pageSize.width

    widthTemp = cutDivScale.value*json.panelSize.width
    heightTemp = cutDivScale.value*json.panelSize.height


    panel.style.width = widthTemp + 'px'
    panel.style.height = heightTemp + 'px'
    panel.style.marginTop = (anchorxy.value.y-3)*toolsParams.value.scaleCount + 'px'
    panel.style.marginLeft = (anchorxy.value.x-3)*toolsParams.value.scaleCount + 'px'
    cutparamshow.value = true
  }
}


const findfirstanchor = () => {
  if(cutParamJson?.value?.pageSize?.width){
    // var width_temp = width_temp.value * parseFloat(toolsParams.value.scaleCount)
    cutDivScale.value = width_temp.value * parseFloat(toolsParams.value.scaleCount)/cutParamJson.value.pageSize.width
    // console.log(cutDivScale.value)
  }else{
    console.log("参数信息中没找到")
    return false
  }     
  var ctx = cur_ctx.value
  var canvas = cur_canvas.value

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Find first black rectangle
  let blackRectangleFound = false;
  let minX = canvas.width;
  let minY = canvas.height;
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const index = (y * canvas.width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      if (r <= 60 && g <= 60 && b <= 60) { // Black color dark
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        blackRectangleFound = true;
        break;
      }
    }
    if (blackRectangleFound) break;
  }

  if (blackRectangleFound) {
    anchorxy.value = {x:minX,y:minY}
    // console.log(minX,minY)
    return true
  } else {
    anchorxy.value = {x:0,y:0}
    console.log('No black rectangle found.');
    return false
  }
}

const linktoXuece = () => {
  // console.log(env.value,papertype.value,paperid.value)
  isPageLoading.value = true
  const params = {
    'env': env.value,
    'card_type': papertype.value,
    'paper_id': paperid.value
  }
  xueceApi.get_answercard_info(params).then(rst => {
    if(!rst?.data?.name){
      linkErrorMsg.value = "未找到相关答题卡。"
      return
    }

    cutParamJsonStr.value = rst?.data?.params
    cutParamJson.value = JSON.parse(cutParamJsonStr.value)
    pdfUrl.value = rst?.data?.pdf_url

    if(!toolsParams.value.canvasVisible){
      filename.value = `${rst?.data?.name}.pdf`
      linkErrorMsg.value = pdfUrl.value ? null:"关联答题卡尚未生成pdf。"
      if(pdfUrl.value){
        downloadPDF()
      }
    }
      
    
  }).catch(error => {
    linkErrorMsg.value = "未找到相关答题卡。"
    toast(error,'error');
  })
}

const openFromLinks = (data) => {
  isPageLoading.value = true
  env.value = data.env
  papertype.value = data.card_type
  paperid.value = data.paper_id

  linktoXuece()

}

const downloadPDF = () => {
  // console.log("******下载pdf:"+pdfUrl.value)

  const data = {
    "name":filename.value,
    "env":env.value,
    "card_type":papertype.value,
    "paper_id": paperid.value,
    "update_time": getFormattedDateTime('m')
  }

  // 查找是否已存在相同的数据
  const existingIndex = pdfFromLinkDataList.value.findIndex(item => 
    item.env === data.env && 
    item.card_type === data.card_type && 
    item.paper_id === data.paper_id
  );

  if (existingIndex !== -1) {
    pdfFromLinkDataList.value.splice(existingIndex, 1);
  }

  pdfFromLinkDataList.value.push(data)

  localStorage.setItem("linkDataList",JSON.stringify(pdfFromLinkDataList.value))

  loadPDF(true).then(()=>{
    modal_show.value.linkxuecemodal_show = false
    toolsParams.value.canvasVisible = true
  }).finally(()=>{
    isPageLoading.value = false
  })
  
}


const fillAnswerCard = () => {
  console.log("当前：",anchorxy.value)
  if(!(anchorxy.value.x || anchorxy.value.x)){
    const result = findfirstanchor()
    console.log(result)
    if (!result) {
      return
    }
  }
  console.log(anchorxy.value)
  let scale = cutDivScale.value/toolsParams.value.scaleCount
  let pageNum = 0
  let canvas = null
  let ctx = null
  var pdfPages = toolsParams.value.pdfPages
  // var that = this
  var stuIdX = null
  var stuIdY = null

  if(cutParamJson.value.studentIdRect){
    stuIdX = anchorxy.value.x + cutParamJson.value.studentIdRect.x*scale
    stuIdY = anchorxy.value.y + cutParamJson.value.studentIdRect.y*scale
  }else{
    stuIdX = anchorxy.value.x + cutParamJson.value.section[0].rect.x*scale
    stuIdY = anchorxy.value.y + cutParamJson.value.section[0].rect.y*scale
  } 
      
  if(cutParamJson.value){
    cutParamJson.value.section.forEach(function(Eachsection) {
      if(pageNum != Eachsection.pageNumber && Eachsection.pageNumber <= pdfPages){
        if(canvas && ctx){
          ctx.closePath();
          addHistoy(pageNum,canvas)
        }
        pageNum = Eachsection.pageNumber
        canvas = document.getElementById("canvas"+pageNum)
        ctx = canvas.getContext("2d")
        // console.log("111"+barcode_url.value,stuIdX,stuIdY)
        if((barcode_url.value && pageNum%2==1) && (((fillNum.value && fillError.value == 0))||(fillError.value  !=1 && fillError.value  != 0))){
          darwCodebar(ctx,stuIdX,stuIdY)
        }
        //设置矩形填充颜色
        ctx.fillStyle="#000";
        ctx.strokeStyle = "red"
        ctx.lineWidth = 2
      }
      if(Eachsection.sectionType.includes("Choice") && (((fillObj.value && fillError.value ==0))||(fillError.value !=3&&fillError.value !=0))){
        let sectionx = Eachsection.rect.x
        var sectiony = Eachsection.rect.y
        // const that = this          
        Eachsection.subsections.forEach(function(subsection){    
          
          var endx = subsection.cellWidth*scale
          var endy = subsection.cellHeight*scale
          var startx = anchorxy.value.x + (sectionx+subsection.x)*scale
          var starty = anchorxy.value.y + (sectiony+subsection.y)*scale
          //客观题横向
          if(subsection.sequenceOption == "HorizontalFirst"){
            var widthgap = subsection.positions*(subsection.cellWidth + subsection.cellGapWidth)-subsection.cellGapWidth+subsection.columnGapWidth
            for(let i = 0; i < subsection.totalSequences; i++){
              
              var nstartx = startx + i%subsection.columns*widthgap*scale 
              let nstarty = starty + Math.floor(i/subsection.columns)*(subsection.cellHeight+subsection.rowGapHeight)*scale
              optionOffset.value.forEach(offset=>{
                ctx.beginPath()
                ctx.fillRect(nstartx + offset*(subsection.cellWidth+subsection.cellGapWidth)*scale,nstarty,endx,endy)
              })
              
            }
            //客观题竖向
          }else if(subsection.sequenceOption == "VerticalGroupVerticalFirst"){
            for(let i = 0; i < subsection.totalSequences; i++){
              let nstarty = starty + i*(subsection.cellHeight+subsection.rowGapHeight)*scale
              optionOffset.value.forEach(offset=>{
                ctx.beginPath()
                ctx.fillRect(startx + offset*(subsection.cellWidth+subsection.cellGapWidth)*scale,nstarty,endx,endy)
              })
            }
          }else if(subsection.sequenceOption == "FreeStyle"){
            subsection.freeStyleCellGroups.forEach(freeStyleCellGroup=>{
              optionOffset.value.forEach(offset=>{
                var nstartx = startx + freeStyleCellGroup[offset].x*scale
                let nstarty = starty + freeStyleCellGroup[offset].y*scale
                // console.log("do",nstartx,nstarty)
                ctx.beginPath()
                ctx.fillRect(nstartx,nstarty,endx,endy)
              })
            })
            
          }
        })
      }else if(Eachsection.sectionType.includes("ScoreBox") && (((fillSubj.value&&fillError.value ==0))||(fillError.value !=4&&fillError.value !=0))){
        //填涂主观题
        var score = [1,3,0]
        let sectionx = Eachsection.rect.x
        
        var cellwidth = Eachsection.rect.width/19
        // console.log("sectionNum:"+Eachsection.sectionNumber+"'s cellwidth is "+cellwidth)
        var subsection = Eachsection.subsections[0]
        var startY = anchorxy.value.y + (Eachsection.rect.y - subsection.cellHeight)*scale
        var endY = startY + 3*subsection.cellHeight*scale
        var tensX = null
        var oneX = null

        // 默认满分
        var fullscore = Math.floor(Math.abs(subsection.maxIntegerScore));
        score = [Math.floor(fullscore / 10),fullscore%10,0]
        console.log(score)
        if(subsection.maxIntegerScore <= subsection.maxSingleBoxScore){
          oneX = anchorxy.value.x + ((17.5-10*score[0]-score[1])*cellwidth+sectionx)*scale
        }else{
          tensX = score[0] == 0 ? null : anchorxy.value.x + ((7.5-score[0])*cellwidth+sectionx)*scale
          oneX = anchorxy.value.x + ((17.5-score[1])*cellwidth+sectionx)*scale
        }
        var halfX = score[2] == 0 ? null : anchorxy.value.x + (Eachsection.rect.width-cellwidth/2+sectionx)*scale
        if(tensX){
          ctx.beginPath()
          ctx.moveTo(tensX,startY)
          ctx.lineTo(tensX,endY)
          ctx.stroke()
        }
        if(halfX){
          ctx.beginPath()
          ctx.moveTo(halfX,startY)
          ctx.lineTo(halfX,endY)
          ctx.stroke()
        }
        if(oneX){
          ctx.beginPath()
          ctx.moveTo(oneX,startY)
          ctx.lineTo(oneX,endY)
          ctx.stroke()
        }
      }
    })
    addHistoy(pageNum,canvas)
  }else{
    console.log("未绑定试卷识别Json")
  }
}

const darwCodebar = (ctx,x,y) => {
  let img = new Image()

  img.onload = function(){
    ctx.drawImage(img,x,y)
  }
  img.src = barcode_url.value
}

const clearImges = () => {
  images.value = []
}

const push2images = (src) => {
  images.value.push(src)
}

const changeBarcodeUrl = (url) => {
  barcode_url.value = url
}

const changeType = (type) => {
  console.log("changeType",type)
  tool_type.value = type
}

const changePenColor = (color) => {
  penColor.value = color
}

const updatePenWidth = (width) => {
  penWidth.value = width
}

const saveData = async () => {
  var index = 0
  pdfDataList.value.forEach((data) => {
    if(data.file_name == filename.value){
      return
    }else{
      index++
    }
  })

  isSaving.value = true
  //上传图片到oss
  var files = []
  try{
    for(let i=1 ; i <= toolsParams.value.pdfPages ; i++){
      const canvas = document.getElementById("canvas"+i)
      if (!canvas) {
        throw new Error('Canvas 元素未找到');
      }

      // 2. 将 canvas 转换为 blob (异步操作)
      const blob = await new Promise((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob);
        }, 'image/png', 1); // 1 表示质量最高
      });

      if (!blob) {
        throw new Error('Canvas 转换失败');
      }

      // 3. 将 blob 转换为 file 对象
      const file = new File([blob], 'canvas-image.png', {
        type: 'image/png',
        lastModified: Date.now(),
      });

      files.push(file)
    }

    // 4. 使用 OSS store 上传
    const uploadResult = await ossStore.MultiUpload(files, 'pdfs/images/');

    console.log(uploadResult[0].data)

    // 5. 处理上传结果
    const urls = uploadResult.map(item => `https://superrabbithero-appmanage.oss-cn-beijing.aliyuncs.com/${item.data?.key}`);


    if(index == pdfDataList.value.length ){
      pdfDataList.value.push({
        file_name:filename.value,
        img_urls:urls,
        cut_params:JSON.stringify(cutParamJson.value).replace(/\s+/g, '')
      })
      //控制最多本地存3条
      if(index >= 3){
        pdfDataList.value.shift()
      }
    }else{
      pdfDataList.value[index].img_urls = urls
    }

    const newJson = JSON.stringify(pdfDataList.value)

    localStorage.setItem('pdf_data', newJson)

  } catch (error) {
    console.error('保存并上传失败:', error);
    throw error; // 抛出错误以便调用者处理
  } 

  //保存数据到本地indexDB，本地最多保存5条
  
  //后续如果登录，将数据保存到后端数据库

}

// 提供方法给子组件
provide('pageMethods', {
  nextPage,
  prePage,
  scaleD,
  scaleX,
  // addimge,
  clearImges,
  saveEditedImage,
  push2images,
  changeBarcodeUrl,
  changeType,
  changePenColor,
  updatePenWidth,
  retrue
})


</script>

<style>
.sheetview {
  margin: 20px 30px;
  padding: 10px 20px ;
  background-color: var(--box-bgc);
  border: var(--box-border);
  border-radius:12px;

}

.canvasbox {
  position: relative;
  width: 100%;
  overflow: auto;
  border-radius: 12px;
  background-color: var(--canvas-bgc);
  border: var(--box-border);
}

.sheet-canvas{
  filter: var(--img-filter);
  position: absolute;
  box-shadow: var(--box-shadow);
  touch-action: none;
/*  transform: translateX(-50%);*/
  left: 1rem ;
  top: 1rem;
}

.filenameview{
  display: flex;
  cursor: pointer;
  align-items: center;
}

.filename { 
  margin-left: 5px;
  /*display: inline-block;
  vertical-align: 3px;*/
  font-family: auto;
  font-weight: 200;
}

.cutparameditbox {
  margin-left: 15px;
  cursor: pointer;
  display: inline-block;
  line-height: 0;
}

.cutparameditbox:hover {
  color: #ffc848;
}

/*封面设计*/
.cover {
  width: 100%;
  height: calc(100% - 12px);
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  border: var(--box-border);
  background-color: var(--canvas-bgc);
  overflow-y: auto;
}

.cover-historys, .cover-links {
  padding: 40px;
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 50px 30px;
}

.table-content {
/*  background: var(--box-bgc);*/
  padding: 10px;
  border-radius: 10px;
/*  border: var(--box-border);*/
  overflow: auto;
  width: 100%;
}

.cover-historys-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.cover-historys-item > p{
  height: 40px;
  line-height: 40px;
  font-size: 15px;
  letter-spacing: 1px;
  font-weight: 500;
  width: 100%;
  white-space: nowrap; 
  overflow: hidden;         /* 隐藏超出部分 */
  text-overflow: ellipsis;  /* 超出时显示省略号 */
  position: absolute;
  bottom: -40px;
  margin: 0;
  text-align: center;
}

.cover-historys-item .item{
  background-color: var(--content-bgc);
  box-shadow: var(--box-shadow);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 0 1px 1px #8882;
  transition: 0.1s ease box-shadow;
  filter: var(--img-filter);
}

.cover-historys-item .item:hover{
  box-shadow: var(--box-shadow);
}

.cover-create {
  width: 150px;
  height: 200px;
  flex-direction: column;
  justify-content: space-evenly!important;
}


.cover-pdf-data {
  height: 200px;
  overflow: hidden;
}

.cover-pdf-data > img{
  height: 100%;
}

.cover-title {
  font-family: SmileySans-Oblique;
  text-align: center;
  width: 100%;
  font-size: 100px;
  margin-bottom: 30px;
}

.start-btn {
  height: 70px;
  padding: 0 25px;
  font-size: 35px;
  border: 3px solid #3e3e3e;
  border-radius: 10px;
  line-height: 70px;
  cursor: pointer;
  font-family: SmileySans-Oblique;
  transition: background-color 0.3s ease, color 0.3s ease;
/*  color: #3e3e3e;*/
}



@media (any-hover:hover){
  .start-btn:hover {
    background-color: #3e3e3e;
    color: #fff;
  }
}
.start-btn:active {
  background-color: #3e3e3e;
  color: #fff;
}

.dragged-image {
  padding: 20px;
  position: absolute;
  width: fit-content;
  left: 50%;
  top: 50%;
  border: 2px solid #ddd;
}

.cutpage{
  border: 1px solid red;
  background: none;
  position: absolute;
  pointer-events: none;
  top:1rem;
  left: 1rem;
}

.cutpage-panel{
  border: 1px solid red;
  background: none;
  position:relative;
}

.cutpage-section{
  border: 1px solid red;
  background: none;
  position: absolute;
  box-sizing: border-box;
}

.cutpage-section.sub.remove {
  position: absolute;
  transform: translateY(-100%);
  color: red;
  border: none;
}

.cutpage-section.sub{
  box-sizing: content-box;
}

.menu-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 5px;
}

.upload-icon {
  color: #888;
  transition: 0.1s color ease-in-out;
  width: 100%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-icon:hover {
  color: var(--main-color);
}


</style>