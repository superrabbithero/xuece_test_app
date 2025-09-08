<template>
  <div class="au-md-editor-container">
    <div class="tool-bar">
      <div class="tool-group">
        <div class="tool-bar-item" @click="goBack()">
          <au-icon name="RiArrowLeftLine" size="22"/>
        </div>
        <div class="input-box">
          <input class="file-name-input" v-model="fileName" :style="{ width: `${inputWidth}px`}" @input="updateWidth" @keyup="handleKeyUp" />
          <span ref="calc_text_length" class="hide-span">{{fileName}}</span>
        </div>
      </div>
      <div class="tool-group sm-hidden">
        <div v-for="tool in toolBar" :key="tool" :class="['tool-bar-item',{'unable':tool?.unable}]" @click="tool?.click?.() || doEdit(tool.iconName)">
          <au-icon :name="tool.iconName" size="22"/>
        </div>
      </div>
      <div class="tool-group">
        <div class="tool-bar-item text" :title="`最近保存于 ${update_time}`" v-if="update_time">
          保存成功
        </div>
        <div class="tool-bar-item" @click="changeViewer()">
          <au-icon v-show="editorViewer == 0" name="RiLayoutRight2Fill" size="22"/>
          <au-icon v-show="editorViewer == 1" name="RiLayoutColumnFill" size="22"/>
          <au-icon v-show="editorViewer == 2" name="RiLayoutLeft2Line" size="22"/>
        </div>
        <div class="tool-bar-item" @click="saveToServer">
          <au-icon name="RiSaveLine" size="22"/>
        </div>
        <div class="tool-bar-item shake" @click="changeStyle()">
          <au-icon v-show='!dark' name="RiSunFill" class="pointer-shake" size="20"/>
          <au-icon v-show='dark' name="RiMoonFill" class="pointer-shake" size="18"/>
        </div>
      </div>
    </div>
    <div class="editor-area" ref="editorArea">
      <div class="editor-container" v-show="editorViewer != 2 " >
        <div class="editor" ref="scrollHost">
          <div class="edited-dom hidden" :style="{paddingBottom:`${paddingBottom}px`}">
            <div v-for="(line,index) in textLines" :key="index" class="text-line"
            >
              <div class="line-num" v-if="show_line_num">{{index+1}}</div>
              <!-- <div class="line-tools" v-else><au-icon  name="RiDraggable" size="20"/></div> -->
              <div v-html="line === '' ? '<br>' : escapeHtml(line)"></div>
            </div>
          </div>
          <div contenteditable="true" spellcheck="false" class="edited-dom" ref="textDiv" :style="{paddingBottom:`${paddingBottom}px`}"
            @keydown="handleKeyDown"
            @pointerdown="editorAreaPointerDown"
            @input="handleInput"
            @paste="handlePaste"
            @compositionend="handleCompositionEnd"
            @compositionstart="handleCompositionStart"
            @dragstart="handleDragStart"
            @drop="handleDrop">

            <div v-for="(line,index) in textLines" draggable="false" :key="index" class="text-line" >
              <div :class="['line-tools',{'active': index == curLineNum}]" @click="openLineTools($event,index)"><au-icon  name="RiDraggable" size="18" /></div>
              <div :class="['line-text',{'active': index == curLineNum}]" :id="`line-${index}`"  v-html="line === '' ? '<br>' : escapeHtml(line)"></div>
            </div>
          </div>
          {{showLineTools}}
          <div :class="['line-tools-box au-grid',{'show':showLineTools}]" ref="lineTools">
            <div class="rows">
              <div class="line-tools-box-item cols"><au-icon name="RiText" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiH1" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiH2" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiH3" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiH4" size="16"/></div>
            </div>
            <div class="rows">
              <div class="line-tools-box-item cols"><au-icon name="RiBold" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiItalic" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiStrikethrough" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiListUnordered" size="16"/></div>
              <div class="line-tools-box-item cols"><au-icon name="RiListOrdered2" size="16"/></div>
            </div>
          </div>
        </div>
        
        
        <div class="text-line-position" v-if="debug">
          <div>{{ curRange }}</div>
          <div>{{ textLines }}</div>
        </div>

        <div class="editor-footer-bar">
          <span>{{ rangePosition }}</span>
          <au-icon name="RiMoreLine" size="16" @click="show_more = !show_more"/>
          <div class="more-menu" v-show='show_more'>
            <div :class="['more-menu-item',{'active':show_line_num}]" 
                @click="show_line_num = !show_line_num">
                <div class="checkbox"><au-icon v-show="show_line_num" name="RiCheckLine" size="16"/></div>show lineNum
            </div>
          </div>
        </div>
      </div>

      <div class="preview" v-show="editorViewer != 0">
        <au-markdown-viewer :content="mdText"
          @update-headings="handleHeadingsUpdate"/>
      </div>
    </div>
  </div>
  
</template>
<script setup>
import imageApi from '@/api/endpoints/image'
import {uploadToOSSByKey} from '@/api/ossApi.js'
import oss from '@/api/endpoints/oss'
import documentApi from '@/api/endpoints/document'

import { useRouter } from 'vue-router';
import {ref, onMounted, getCurrentInstance, nextTick, onUnmounted, computed, defineProps} from 'vue';
const { proxy } = getCurrentInstance()
import { debounce } from 'lodash-es';
import dayjs from 'dayjs';

const update_time = ref(null)

const lineTools = ref(null)

const curLineNum = ref(null)

const showLineTools = ref(false)

const openLineTools = (e, lineNum) => {
  const targetElement = e.currentTarget; // 当前点击的 .line-tools 元素
  const rect = targetElement.getBoundingClientRect(); // 获取该元素的视口坐标信息

  curLineNum.value = lineNum;

  // 获取 lineTools DOM 引用
  const toolsEl = lineTools.value;

  // 方案1：工具栏显示在点击元素的【正下方，水平居中】
  const toolsWidth = toolsEl.offsetWidth;  // 工具栏自身的宽度
  // const toolsHeight = toolsEl.offsetHeight; // 工具栏自身的高度（可选，用于避免超出屏幕）

  // 水平居中于当前点击元素
  const left = rect.left + (rect.width / 2) - (toolsWidth / 2);

  // 垂直放在元素的下方（rect.bottom 是元素下边缘的 Y 坐标）
  const top = rect.bottom + 5; // 5px 是间距

  // 限制不能超出屏幕左右边界（可选，增强健壮性）
  const finalLeft = Math.max(10, Math.min(left, window.innerWidth - toolsWidth - 10));

  toolsEl.style.position = 'fixed'; // 推荐使用 fixed，以视口为基准定位
  toolsEl.style.left = `${finalLeft}px`;
  toolsEl.style.top = `${top}px`;

  document.addEventListener('pointerdown', handleGlobalEvent)
  document.addEventListener('wheel', handleGlobalEvent, { passive: true })

  // 显示工具栏
  showLineTools.value = true;
}

// 判断是否应该关闭工具栏的函数
const shouldCloseLineTools = (event) => {
  if (!showLineTools.value) return false // 如果本来就是隐藏的，不需要处理

  if (!lineTools.value) return true // 如果工具栏 DOM 还没渲染，保守处理也关闭

  // 如果点击的目标在 lineTools 内部，不关闭
  if (lineTools.value.contains(event.target)) {
    return false
  }

  // 否则，应该关闭
  return true
}

const closeLineTools = () => {
  showLineTools.value = false
  const toolsEl = lineTools.value;
  toolsEl.style.position = 'fixed'; 
  toolsEl.style.left = `-999px`;
  toolsEl.style.top = `-999px`;
  document.removeEventListener('pointerdown', handleGlobalEvent)
  document.removeEventListener('wheel', handleGlobalEvent, { passive: true })
  curLineNum.value = null
}

// 全局事件处理
const handleGlobalEvent = (event) => {
  if (shouldCloseLineTools(event)) {
    closeLineTools()
  }
}


const debug = false //打开监控数据

const show_more = ref(false)
const show_line_num = ref(false)

const scrollHost = ref(null)

const router = useRouter();


const props = defineProps({
  fileName: String,
  textLines: Array,
  doc: Object
})



//转义，用于在v-html中展示
function escapeHtml(str) {
  if(str)
    return str
      .replace(/&/g, "&amp;")   // 先转义 &
      .replace(/</g, "&lt;")    // 再转义 <
      .replace(/>/g, "&gt;")    // 再转义 >
      .replace(/"/g, "&quot;")  // 可选：转义 "
      .replace(/'/g, "&#39;");  // 可选：转义 '
  else
    return str
}

const doc_info = ref(null)



const saveToServer = async () => {
  console.log(textNeedUpdate.value,titleNeedUpdate.value)
  if(textNeedUpdate.value){
    const path = process.env.NODE_ENV === 'development' ? 'test/documents' : 'documents'
    
    // 1. 将 mdText.value 转换为 File 对象
    const createFileFromText = (text, fileName) => {
      const blob = new Blob([text], { type: 'text/markdown' })
      return new File([blob], fileName, { type: 'text/markdown' })
    }

    // 如果没有文档id，则调用接口创建文档数据获得文档id和预设的oss_key
    console.log(doc_info.value)
    if(!doc_info.value?.id){
      // 这里默认一个user_id是4
      const rst = await documentApi.reserve_doc(4,fileName.value, path)
      doc_info.value = rst.data.data
      console.log(doc_info.value)
    }

    // 2. 创建文件对象 - 使用文档id作为文件名或自定义文件名
    const file = createFileFromText(mdText.value, 'temp.md')

    // 通过oss_key上传md文件

    if(doc_info.value?.oss_key){
      const oss_token = await oss.getStsToken()
      const rst = await uploadToOSSByKey(file, doc_info.value.oss_key, oss_token.data)

      // .md文件上传成功后调用后台更新接口，更新更新时间
      if(rst?.url) {
        const title = titleNeedUpdate.value ? fileName.value : null
        const rsp = await documentApi.update_doc(doc_info.value.id,null,null,title)
        console.log(rsp)
        if(rsp?.data?.data?.id == doc_info.value.id){
          pre_title = fileName.value
          pre_text = mdText.value
          update_time.value = dayjs(rsp?.data?.data?.updated_at).format('YYYY/M/D HH:mm:ss');
        }else{
          update_time.value = -1
        }
        return rsp
      } else {
        update_time.value = -1
        return '文档上传oss失败'
      }
    }
  }else if(titleNeedUpdate.value){
    const rsp = await documentApi.update_doc(doc_info.value.id,null,null,fileName.value)
    if(rsp?.data?.data?.id == doc_info.value.id){
      pre_title = fileName.value
      update_time.value = dayjs(rsp?.data?.data?.updated_at).format('YYYY/M/D HH:mm:ss');
    }else{
      update_time.value = -1
    }
  }

    
}


//底部positon变量
const rangePosition = computed(()=>{
  if(curRange.value?.collapsed){
    return `Line ${curRange.value.endIndex + 1}, Column ${curRange.value.endOffset + 1}`
  }else if(curRange.value){
    const rangeTextLength = curSelection.value.toString().length
    const linesCount = curRange.value.startIndex - curRange.value.endIndex
    return `${(linesCount>0?linesCount:-linesCount)+1} lines, ${rangeTextLength} characters selected`
  }else{
    return `Line 0, Column 0`
  }
})

// textLines防抖处理
const syncMarkdown = debounce(() => {
  saveSnapshot()
  // mdText.value = textLines.value.join('\n');
}, 100);

// 防抖保存（停止输入3秒后触发）
const debouncedSave = debounce(saveToServer, 3000);

//用于监听编辑器高度变化
const editorArea = ref(null)

const paddingBottom = ref(10)

let observer

let pre_text = ''
let pre_title = ''

const textNeedUpdate = computed(()=>(pre_text != mdText.value))
const titleNeedUpdate = computed(()=>{
  console.log(pre_title,fileName.value)
  return pre_title != fileName.value})


onMounted(() => {


  doc_info.value = props.doc
  textLines.value = props.textLines
  pre_text = mdText.value

  fileName.value = props.fileName
  pre_title = fileName.value

  //监听editor高度变化，动态修改padding-bottom
  observer = new ResizeObserver((entries) => {
    paddingBottom.value = Math.floor(entries[0].contentRect.height/2)
  });

  observer.observe(editorArea.value);

  nextTick(()=>{
    //调整filename输入框宽度
    
    updateWidth()
    updateRange(0,textLines.value[textLines.value.length-1]?.length)
    saveSnapshot()
    textDiv.value.focus()
    saveCursorPosition()
  })

  
})



onUnmounted(() => {
  syncMarkdown.cancel()
  debouncedSave.cancel()
})

//编辑器相关变量

const textDiv = ref(null)

const textLines = ref([''])

const mdText = computed(()=>(textLines.value.join('\n')))

// 更安全的输入法输入判断
const isIMEInput = ref(false) // 标记是否处于输入法组合输入状态

const handleCompositionStart = () => {
  isIMEInput.value = true
}

//编辑器每行的input事件
const handleInput = (event) => {

  if(!event.isComposing && !isIMEInput.value){
    const content = curSelection.value.focusNode.data
    textLines.value[curRange.value.endIndex] = content
    saveCursorPosition()
    nextTick(()=>{
      updateRange(curRange.value.endIndex,curRange.value.endOffset)
      syncMarkdown()
      debouncedSave()
    })
  }
}

const handleCompositionEnd = () => {
  isIMEInput.value = false
  const content = curSelection.value.focusNode.data
  textLines.value[curRange.value.endIndex] = content
  saveCursorPosition()
  nextTick(()=>{
    updateRange(curRange.value.endIndex,curRange.value.endOffset)
    syncMarkdown()
    debouncedSave()
  })
}

const handleDragStart = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  requestAnimationFrame(() => {
    saveCursorPosition()
  });
  event.preventDefault()
}

//自己写一个基于textLines的range
const curRange = ref(null)

const getRange = () => {
  const startIndex = savedRange.startContainer.nodeType === Node.TEXT_NODE
                   ? Number(savedRange.startContainer.parentElement.id.substring(5))
                   : Number(savedRange.startContainer.id.substring(5))
  const endIndex = savedRange.endContainer.nodeType === Node.TEXT_NODE
                 ? Number(savedRange.endContainer.parentElement.id.substring(5))
                 : Number(savedRange.endContainer.id.substring(5))
  const startOffset = savedRange.startOffset
  const endOffset = savedRange.endOffset
  const collapsed = savedRange.collapsed

  const des = startIndex <= endIndex

  curRange.value = {
    startIndex: des?startIndex:endIndex,
    startOffset: des?startOffset:endOffset,
    endIndex:des?endIndex:startIndex,
    endOffset:des?endOffset:startOffset,
    collapsed
  }
}


// 要点说明：

// 我们不再依赖 lineNode.firstChild 必须是文本节点；即使是 <br> 或其它元素也 OK。

// 若你的 offset 是基于 textLines[lineIndex].length（纯文本长度）的，那就不把 <br> 计入长度（上面实现就是这样）。

// 如果你希望空行时光标出现在 <br> 之后，把 resolveCaretPosition 里有子节点时的返回从 { node: lineNode, offset: 0 } 改成 { node: lineNode, offset: lineNode.childNodes.length } 即可。


function resolveCaretPosition(lineNode, target) {
  // 快速路径：第一个就是文本节点
  if (lineNode.firstChild && lineNode.firstChild.nodeType === Node.TEXT_NODE) {
    const len = lineNode.firstChild.nodeValue.length;
    const off = Math.max(0, Math.min(target ?? 0, len));
    return { node: lineNode.firstChild, offset: off };
  }

  // 单次遍历文本节点，边走边累计；记录最后一个文本节点
  const walker = document.createTreeWalker(lineNode, NodeFilter.SHOW_TEXT, null);
  let acc = 0, n, last = null;
  const tgt = Math.max(0, target ?? 0);

  while ((n = walker.nextNode())) {
    const len = n.nodeValue.length;
    if (tgt <= acc + len) {
      return { node: n, offset: tgt - acc };
    }
    acc += len;
    last = n;
  }

  // 没有文本节点：若有子节点（可能是 <br>），放到行首；否则补空文本节点
  if (!last) {
    if (lineNode.firstChild) return { node: lineNode, offset: 0 };
    const t = document.createTextNode('');
    lineNode.appendChild(t);
    return { node: t, offset: 0 };
  }

  // 目标超过文本总长，落到最后一个文本节点的末尾
  return { node: last, offset: last.nodeValue.length };
}

// const updateRange = (lineIndex, offset) => {
//   if (!curSelection?.value) return;
//   if (_lastCaret.line === lineIndex && _lastCaret.off === offset) return; // 去重

//   const lineNode = document.getElementById(`line-${lineIndex}`);
//   if (!lineNode) return;

//   const { node, offset: rel } = resolveCaretPosition(lineNode, offset);

//   const rng = document.createRange();
//   rng.setStart(node, rel);
//   rng.collapse(true);

//   curSelection.value.removeAllRanges();
//   curSelection.value.addRange(rng);

//   _lastCaret = { line: lineIndex, off: offset };
//   saveCursorPosition();
// };

let _lastCaret = { line: -1, off: -1 };
let _lastRange = { sLine: -1, sOff: -1, eLine: -1, eOff: -1 };

/**
 * 用法：
 *  updateRange(lineIndex, offset)                            // 设置插入光标
 *  updateRange(startLineIndex, startOffset, endLineIndex, endOffset) // 设置选区
 */
const updateRange = (a, b, c, d) => {
  if (!curSelection?.value) return;

  const isCaret = (typeof c === 'undefined' && typeof d === 'undefined');


  if (isCaret) {
    // ---- 光标模式 ----
    const lineIndex = a | 0;
    const offset    = b | 0;

    if (_lastCaret.line === lineIndex && _lastCaret.off === offset) return;

    const lineNode = document.getElementById(`line-${lineIndex}`);
    if (!lineNode) return;

    const { node, offset: rel } = resolveCaretPosition(lineNode, offset);

    const rng = document.createRange();
    rng.setStart(node, rel);
    rng.collapse(true);

    curSelection.value.removeAllRanges();
    curSelection.value.addRange(rng);

    _lastCaret = { line: lineIndex, off: offset };
    _lastRange = { sLine: -1, sOff: -1, eLine: -1, eOff: -1 }; // 失效选区缓存
    saveCursorPosition();
    return;
  }

  // ---- 选区模式 ----
  let startLineIndex = a | 0;
  let startOffset    = b | 0;
  let endLineIndex   = c | 0;
  let endOffset      = d | 0;

  // 行索引钳制到合法范围
  const lastLine = Math.max(0, textLines.value.length - 1);
  startLineIndex = Math.max(0, Math.min(startLineIndex, lastLine));
  endLineIndex   = Math.max(0, Math.min(endLineIndex,   lastLine));

  // 规范化顺序：确保 (start <= end)
  if (
    startLineIndex > endLineIndex ||
    (startLineIndex === endLineIndex && startOffset > endOffset)
  ) {
    [startLineIndex, endLineIndex] = [endLineIndex, startLineIndex];
    [startOffset, endOffset] = [endOffset, startOffset];
  }

  if (
    _lastRange.sLine === startLineIndex && _lastRange.sOff === startOffset &&
    _lastRange.eLine === endLineIndex   && _lastRange.eOff === endOffset
  ) return;

  const sLineNode = document.getElementById(`line-${startLineIndex}`);
  const eLineNode = document.getElementById(`line-${endLineIndex}`);
  if (!sLineNode || !eLineNode) return;

  const s = resolveCaretPosition(sLineNode, startOffset);
  const e = resolveCaretPosition(eLineNode, endOffset);


  const rng = document.createRange();
  rng.setStart(s.node, s.offset);
  rng.setEnd(e.node, e.offset);

  curSelection.value.removeAllRanges();
  curSelection.value.addRange(rng);

  _lastRange = { sLine: startLineIndex, sOff: startOffset, eLine: endLineIndex, eOff: endOffset };
  _lastCaret = { line: -1, off: -1 }; // 失效光标缓存
  saveCursorPosition();
}



const deleteContents = () => {



  if(curRange.value.collapsed)
    return;

  if(curRange.value.startIndex == curRange.value.endIndex){ //删除选择在一行内
    const content = textLines.value[curRange.value.startIndex]
    const newLine = `${content.substring(0,curRange.value.startOffset)}${content.substring(curRange.value.endOffset)}` || ''
    
    textLines.value[Math.min(curRange.value.startIndex,curRange.value.endIndex)] = newLine
    nextTick(()=>{
      updateRange(curRange.value.startIndex,curRange.value.startOffset)
    })
  }else{
    let start, startOffset, end, endOffset;

    if (curRange.value.startIndex <= curRange.value.endIndex) {
      start = curRange.value.startIndex;
      startOffset = curRange.value.startOffset;
      end = curRange.value.endIndex;
      endOffset = curRange.value.endOffset;
    } else {
      start = curRange.value.endIndex;
      startOffset = curRange.value.endOffset;
      end = curRange.value.startIndex;
      endOffset = curRange.value.startOffset;
    }

    const newLine = textLines.value[start].substring(0,startOffset) + textLines.value[end].substring(endOffset)
    
    textLines.value[start] = newLine || ''
    textLines.value.splice(start+1,end-start)
    nextTick(()=>{
      updateRange(start, startOffset)
    })
    
  }
}

const handleKeyDown = (event) => {

  if(event.key == 'Process'){
    event.preventDefault
    // saveCursorPosition()
    return
  }
  requestAnimationFrame(() => {
    saveCursorPosition()
  });
  
  let rangeIndex = curRange.value.endIndex
  let rangeOffset = curRange.value.endOffset
  let ifUpdateRange = true
  if (event.key === 'Backspace' || event.key === 'Delete'){
    if(!curRange.value.collapsed){
      deleteContents()
      event.preventDefault(); // 阻止默认行为
      ifUpdateRange = false
    }else if(curRange.value.startOffset == 0 && event.key === 'Backspace'){
      const index = curRange.value.startIndex
      if(index != 0){
        const offset = textLines.value[index - 1].length
        const upLine = textLines.value[index]
        textLines.value[index-1] =  upLine == ''
                                  ? textLines.value[index-1]
                                  : textLines.value[index-1] + upLine
        textLines.value.splice(curRange.value.startIndex,1)
        rangeIndex = index-1
        rangeOffset = offset
      }

      event.preventDefault(); // 阻止默认行为
    }else if((curRange.value.startOffset == textLines.value[curRange.value.startIndex].length || textLines.value[curRange.value.startIndex] == '') && event.key === 'Delete'){
      const index = curRange.value.startIndex
      if(index + 1 <= textLines.value.length - 1){
        const offset = curRange.value.endOffset
        const downLine = textLines.value[index+1]
        textLines.value[index] =  textLines.value[index] + downLine
        textLines.value.splice(index+1,1)
        rangeIndex = index
        rangeOffset = offset
      }
      event.preventDefault(); // 阻止默认行为
    }else if(curRange.value.startOffset == 1 && textLines.value[curRange.value.startIndex].length == 1 && event.key === 'Backspace'){
      textLines.value[curRange.value.startIndex] = ''
      rangeIndex = curRange.value.startIndex
      rangeOffset = 0
      event.preventDefault();
    }else if(curRange.value.startOffset == 0 && textLines.value[curRange.value.startIndex].length == 1 && event.key === 'Delete'){
      textLines.value[curRange.value.startIndex] = ''
      rangeIndex = curRange.value.startIndex
      rangeOffset = 0
      event.preventDefault();
    }
    
  }else if (event.key === 'Enter'){
    event.preventDefault()
    //在当前位置插入换行符
    if(!curRange.value.collapsed)
      deleteContents()


    const nextLines = textLines.value[curRange.value.startIndex]?.substring(curRange.value.startOffset) || ''



    textLines.value[curRange.value.startIndex] = `${textLines.value[curRange.value.startIndex]?.substring(0,curRange.value.startOffset)}` || ''
    textLines.value.splice(curRange.value.startIndex+1, 0 ,nextLines)
    rangeIndex = curRange.value.startIndex + 1
    rangeOffset = 0
    // 移动光标到换行后
  }else if(event.ctrlKey || event.shiftKey || event.metaKey || event.altKey){
    if((event.ctrlKey || event.shiftKey) && event.key == 'z'){
      event.preventDefault()
      undo()
    }
    if((event.ctrlKey || event.shiftKey) && event.key == 'y'){
      event.preventDefault()
      redo()
    }
    return
  }else if(event.key.startsWith('Arrow')){
    event.preventDefault
    saveCursorPosition()
  }else{
    if(!curRange.value.collapsed){
      deleteContents()
      ifUpdateRange = false
    }
    // else{
    //   return
    // }
  }
  if(ifUpdateRange)
    nextTick(()=>{
      const lineDom = document.getElementById(`line-${rangeIndex}`)
      lineDom.scrollIntoView({ behavior: "instant", block: "nearest" });
      updateRange(rangeIndex,rangeOffset)
      syncMarkdown()
      debouncedSave()
      
    })


}

const upload_image_to_oss = async (file) => {
  const path = process.env.NODE_ENV === 'development' ? 'test/images/doc_img' : 'images/doc_img'
  const r = await imageApi.reserve_img(file.name, path)
  const img_data = r?.data?.data
  console.log(img_data)
  if(img_data?.oss_key){
    imgeList.push(img_data)
    const oss_token = await oss.getStsToken()
    const rst = await uploadToOSSByKey(file,img_data.oss_key,oss_token.data)
    if(rst?.url)
      return rst.url
    else
      return '图片上传oss失败'
  }else{
    console.error('reserve图片失败')
  }
}


//拦截contesteditable原生复制
const handlePaste = (e) => {
  e.preventDefault();
  //处理图片
  if (e.clipboardData.files.length > 0) {
    // 检查第一个文件是否是图片
    const file = e.clipboardData.files[0];
    if (file.type.startsWith('image/')) {
      // const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`

      upload_image_to_oss(file).then((url)=>{
        applyImageStyle(url);
      })

      return;
    }
  }

  //处理文本
  const clipboardText = e.clipboardData.getData('text/plain');
  insertLinesAtCursor(clipboardText);

}

//压缩图片,压缩效果不好，先不压缩了
// function compressImage(blob, callback, maxWidth = 1080, quality = 0.9) {
//   const img = new Image();
//   img.onload = () => {
//     const canvas = document.createElement("canvas");
//     const scale = Math.min(maxWidth / img.width, 1);
//     canvas.width = img.width * scale;
//     canvas.height = img.height * scale;
//     const ctx = canvas.getContext("2d");
//     ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//     canvas.toBlob(callback, "image/jpeg", quality); // 转为压缩后的 Blob
//   };
//   img.src = URL.createObjectURL(blob);
// }


// function convertBlobToBase64(blob, callback) {
//   const reader = new FileReader();
//   reader.onload = (e) => callback(e.target.result);
//   reader.readAsDataURL(blob);
// }

//用于管理文档内的图片
let imgeList = []

//上传图片到服务器
// function uploadBase64Image(base64) {
//   // 去掉 Data URL 前缀（如 "data:image/png;base64,"）
//   const base64Data = base64.split(",")[1];
//   fetch("/api/upload", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ image: base64Data }),
//   });
//   
// }

const insertLinesAtCursor = (text, selectRange) => {
  // saveCursorPosition()
  // let ifUpdateRange = true
  console.log(text)
  let _text = text
  let s = curRange.value.startIndex
  let e = 0
  let s_off = curRange.value.startOffset
  let e_off = 0
  let updateSelected = false
  



  if(!curRange.value.collapsed){
    if(selectRange){
      updateSelected = true
      s_off += selectRange[0]
      const content = curSelection.value.toString()
      _text = `${_text.substring(0,selectRange[0])}${content}${_text.substring(selectRange[1])}`
    }
    deleteContents();
    // ifUpdateRange = false
  }

  const lines = _text.split(/\r?\n/);

  if(lines.length == 0)
    return
  else if(lines.length == 1){
    e = curRange.value.endIndex
    const etext = textLines.value[curRange.value.endIndex] 
    e_off = selectRange
          ? curRange.value.startOffset + lines[0].length - selectRange[0]
          : curRange.value.startOffset + lines[0].length
    const result = etext.substring(0,curRange.value.startOffset) + lines[0] + etext.substring(curRange.value.startOffset)
    textLines.value[curRange.value.startIndex] = result
  }else{
    const etext = textLines.value[curRange.value.startIndex] 
    textLines.value[curRange.value.startIndex] = etext.substring(0,curRange.value.startOffset) + lines[0]
    const lastLine = lines[lines.length - 1] + etext.substring(curRange.value.startOffset)
    textLines.value.splice(curRange.value.startIndex+1,0,lastLine)
    if(lines.slice(1,-1).length > 0)
      textLines.value.splice(curRange.value.startIndex+1,0,...lines.slice(1,-1))
    updateSelected = true
    e = curRange.value.startIndex + lines.length - 1
    e_off = selectRange
          ? lines[lines.length - 1].length - selectRange[0]
          : lines[lines.length - 1].length
  }

  nextTick(()=>{
    if(updateSelected)
      updateRange(s,s_off,e,e_off)
    else
      updateRange(e,e_off)
    syncMarkdown()
    debouncedSave()
  })
}

const insertLinesAtBefore = (text) => {

  let start, end;

  if (curRange.value.startIndex < curRange.value.endIndex) {
    start = curRange.value.startIndex;
    end = curRange.value.endIndex;
  } else {
    start = curRange.value.endIndex;
    end = curRange.value.startIndex;
  }

  for(let i=start;i<=end;i++){
    const line = textLines.value[i].trim();

    if (line.startsWith(text)) {
      textLines.value[i] = line.slice(text.length); // 删除开头的 text
    }else{
      textLines.value[i] = text + line;
    }

  }
  

  nextTick(()=>{
    updateRange(curRange.value.startIndex,0)
    syncMarkdown()
    debouncedSave()
  })
}

const insertLinesAtStartAndEnd = (text) => {
  let start, startOffset, end, endOffset;

  if (curRange.value.startIndex <= curRange.value.endIndex) {
    start = curRange.value.startIndex;
    startOffset = curRange.value.startOffset;
    end = curRange.value.endIndex;
    endOffset = curRange.value.endOffset;
  } else {
    start = curRange.value.endIndex;
    startOffset = curRange.value.endOffset;
    end = curRange.value.startIndex;
    endOffset = curRange.value.startOffset;
  }

  const singleLine = start == end && startOffset == 0 && endOffset == textLines.value[end].length

  if(start != end || curRange.value.collapsed || singleLine){
    //选择多行，且非光标，则整段前后插入
    if(textLines.value[start-1]+textLines.value[end+1] == `${text}${text}`){
      textLines.value.splice(end+1,1)
      textLines.value.splice(start-1,1)
      nextTick(()=>{
        const eOff = textLines.value[end-1].length
        updateRange(start-1,0,end-1,eOff)
        syncMarkdown()
        debouncedSave()
      })
    }else{
      textLines.value.splice(end+1,0,text)
      textLines.value.splice(start,0,text)
      nextTick(()=>{
        const eOff = textLines.value[end+1].length
        updateRange(start+1,0,end+1,eOff)
        syncMarkdown()
        debouncedSave()
      })
    }
      
  }else if(text == '```'){
    const line = textLines.value[start]
    if(line[startOffset-1]+line[endOffset] != '``' ){
      const newLine = line.slice(0,startOffset) 
                    + '`' 
                    + line.slice(startOffset,endOffset)
                    + '`'
                    + line.slice(endOffset)
      textLines.value[start] = newLine  
      nextTick(()=>{
        updateRange(start,startOffset+1,end,endOffset+1)
        syncMarkdown()
        debouncedSave()
      })
    }else{
      const newLine = line.slice(0,startOffset-1) 
                    + line.slice(startOffset,endOffset)
                    + line.slice(endOffset+1)
      textLines.value[start] = newLine  
      nextTick(()=>{
        updateRange(start,startOffset-1,end,endOffset-1)
        syncMarkdown()
        debouncedSave()   
      })   
    }   
            
  }

}

const curSelection = ref(null)



let isRanging = false

const editorAreaPointerDown = () => {
  isRanging = true
  document.addEventListener('pointerup', editorAreaPointerup)
}

//获得光标的坐标
const editorAreaPointerup = () => {
  //获得当前selection数据
  if(isRanging){
    saveCursorPosition()
  }
  isRanging = false
  document.removeEventListener('pointerup', editorAreaPointerup)
}

const fileName = ref(props.fileName)




//控制预览模式
const editorViewer = ref(1) //仅编辑，编辑&预览，仅预览 0，1，2
const changeViewer = ()=>{
  editorViewer.value = (editorViewer.value + 1 )%3
}

let savedRange = null;
// 保存当前光标位置
const saveCursorPosition = () => {
  curSelection.value = window.getSelection();
  savedRange = curSelection.value.getRangeAt(0);
  getRange()
};

// 插入文本（支持替换选中内容）
const insertText = (text,selectRange=null) => {
  if(curRange.value){
    insertLinesAtCursor(text, selectRange)
  }
  
};


const applyHeadingStyle = () => {
  const content = '## 标题 '
  insertText(content,[3,5])
}

const applyBoldStyle = () => {
  const content = '**加粗文本**'
  insertText(content,[2,6])
}

const applyItalicStyle = () => {
  const content = '*强调文本*'
  insertText(content,[1,5])
}

const applyStrikethroughStyle = () => {
  const content = '~~删除线文本~~'
  insertText(content,[2,7])
}

const applyListStyle = (ordered=false,checked=false) => {
  let addContent = ''
  if(!(ordered || checked)){
    addContent = '- '
  }else if(ordered){
    addContent = '1. '
  }else if(checked){
    addContent = '- [ ] '
  }
  insertLinesAtBefore(addContent)
}

const applyImageStyle = (data='url') => {
  insertText(`![输入图片说明](${data})`)
}

const applyLinkStyle = (data='#') => {
  insertText(`[这里输入链接描述](${data})`)
}

const applyTableStyle = () => {
  insertLinesAtCursor('\n|  |  |\n|--|--|\n|  |  |')
}


const doEdit = (tool) => {
  switch (tool) {
    case 'RiHeading':
      return applyHeadingStyle(); // 调用单独的函数
    case 'RiBold':
      return applyBoldStyle();
    case 'RiItalic':
      return applyItalicStyle();
    case 'RiStrikethrough':
      return applyStrikethroughStyle();
    case 'RiListUnordered':
      return applyListStyle();
    case 'RiListOrdered2':
      return applyListStyle(true);
    case 'RiListCheck3':
      return applyListStyle(false, true)
    case 'RiDoubleQuotesR':
      return insertLinesAtBefore('> ')
    case 'RiCodeLine':
      return insertLinesAtStartAndEnd('```')
    case 'RiTable3':
      return applyTableStyle()
    case 'RiLinkM':
      return applyLinkStyle()
    case 'RiImageLine':
      return applyImageStyle()
    default:
      console.warn(`未处理工具类型: ${tool}`);
      return false; // 返回操作结果
  }
}

const toolBar = ref([
  {
    iconName:'RiArrowGoBackLine',
    unable:computed(()=>{
      return undoStack.value.length < 2
    }),
    click: () => {
      undo()
    }
  },
  {
    iconName:'RiArrowGoForwardLine',
    unable:computed(()=>{
      return redoStack.value.length < 1
    }),
    click: () => {
      redo()
    }
  },
  {
    iconName:'RiHeading',
  },
  {
    iconName:'RiBold'
  },
  {
    iconName:'RiItalic'
  },
  {
    iconName:'RiStrikethrough'
  },
  {
    iconName:'RiListUnordered'
  },
  {
    iconName:'RiListOrdered2'
  },
  {
    iconName:'RiListCheck3'
  },
  {
    iconName:'RiDoubleQuotesR'
  },
  {
    iconName:'RiCodeLine'
  },
  {
    iconName:'RiTable3'
  },
  {
    iconName:'RiLinkM'
  },
  {
    iconName:'RiImageLine'
  }
])

const calc_text_length = ref(null)
const inputWidth = ref('10')

const updateWidth = () => {
  inputWidth.value = calc_text_length.value?.offsetWidth || '10'
}
const handleKeyUp = (event) => {
  if(event.key == 'Process'){
    updateWidth()
  }
};



const goBack = () => {
  router.go(-1);
}

const headings = ref([])

const handleHeadingsUpdate = (list) => {
  headings.value = list
}

const dark = ref(proxy.$constants.DARK)

const changeStyle = () => {
  proxy.$constants.DARK = !proxy.$constants.DARK // 更新全局状态
  dark.value = proxy.$constants.DARK
  localStorage.setItem('isDark', proxy.$constants.DARK)
  document.body.classList.toggle('dark', proxy.$constants.DARK)
}




// 撤销和重做逻辑
const undoStack = ref([]);
const redoStack = ref([]);
const snapshotMax = 100; // 最大撤销步数

// 保存当前状态到撤销栈
function saveSnapshot() {
  const r_index = curRange.value?.endIndex || textLines.value.length-1
  const r_offset = curRange.value?.endOffset || textLines.value[textLines.value?.length-1]?.length

  undoStack.value.push({
    v:JSON.stringify(textLines.value),
    r:[r_index,r_offset]
  });
  if (undoStack.value.length > snapshotMax) {
    undoStack.value.shift(); // 限制栈大小
  }
  redoStack.value = []; // 清空重做栈
}

// 撤销
function undo() {
  if (undoStack.value.length === 1) return;
  const snapshot = undoStack.value.pop();
  const lastValue = undoStack.value[undoStack.value.length - 1]
  redoStack.value.push(snapshot);
  textLines.value = JSON.parse(lastValue.v);
  // mdText.value = textLines.value.join('\n');
  nextTick(()=>{
    updateRange(lastValue.r[0],lastValue.r[1])
  })
  
}

// 重做
function redo() {
  if (redoStack.value.length === 0) return;
  const snapshot = redoStack.value.pop();
  undoStack.value.push(snapshot);
  textLines.value = JSON.parse(snapshot.v);
  // mdText.value = textLines.value.join('\n');
  nextTick(()=>{
    updateRange(snapshot.r[0],snapshot.r[1])
  })
}



</script>

<style scoped>
.au-md-editor-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap:4px;
  padding: 5px;
  box-sizing: border-box;
}

.editor-area{
  display: flex;
  gap: 4px;
  height: 100%;
  overflow: auto;
}

.editor-container, .preview {
  border-radius: 5px;
  
  flex-basis: 100%;
  box-sizing: border-box; 
  border: var(--box-border);
  height: calc(100vh - 60px);
  background-color: field;
  padding: 10px;
}

.editor{
  height: 100%;
  overflow: auto;
  position: relative;
  width: 100%;
}

.editor-container{
  display: flex;
  flex-direction: column;
  padding: 10px 0 0 0 ;
}

.editor-footer-bar {
  height: 1.5rem;
  line-height: 1.5rem;
  font-size: 0.7rem;
/*  font-weight: 200;*/
  font-family: auto;
  background-color: #0002;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.more-menu {
  user-select: none;
  position: absolute;
  right: 5px;
  bottom: 1.7rem;
  background-color: var(--box-bgc);
  box-shadow: var(--box-shadow);
  padding: 4px 2px;
  border-radius: 4px;
}

.more-menu-item {
  cursor: pointer;
  padding: 0 15px 0 5px;
  border-radius: 4px;
  display: flex;
}

.more-menu-item .checkbox {
  height: 21px;
  display: flex;
  width: 20px;
  align-items: end;
}

/*.more-menu-item.active {
  color:var(--main-color);
}
*/
.more-menu-item:hover {
  background-color: #8882;
}

.editor textarea{
  width: 100%;
  height: 100%;
  /* 重置默认样式 */
  padding: 10px;
  margin: 0;
  border: none;
  outline: none;
  resize: none; /* 禁止用户调整大小 */
  box-sizing: border-box; 
  font-size: 16px;
}

.preview {
  
  background-color: var(--box-bgc);
  overflow: auto;
  
}

.tool-bar{
  user-select: none;
  height:3rem;
  padding: 5px 6px;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--box-bgc);
  border: var(--box-border);
  border-radius: 5px;

  display: flex;
  align-items: center;
  justify-content: space-between
}


.tool-bar-item {
  height: 32px;
  width: 32px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-bar-item.text {
  width: fit-content;
  font-size: 14px;
  opacity: 0.5;
  user-select: none;
}

.tool-bar-item.text:hover {
  background: unset;
}

.tool-bar-item.unable {
  opacity: 0.5;
  pointer-events: none;  /* 禁止鼠标/触摸事件 */
  user-select: none;     /* 禁止文本选中 */
}

.tool-bar-item:hover {
  background-color: #5551;
}

.tool-group {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .input-box {
    max-width: 20rem;
  }
}


.file-name-input {
  max-width: 100%;
  min-width: 2ch;
  border: none;
  outline: none;
  margin: 0;
  padding: 0 8px;
  font-size: 18px;
  border-radius: 2px;
  height: 32px;
/*  box-sizing: border-box;*/
  margin-left: 4px;
}

.file-name-input:hover,.file-name-input:focus {
  background-color: #5551;
  outline: none;
  border: none;
}

.hide-span {
  position: absolute;
  visibility: hidden;
  left:-9999px;
  top: -9999px;
  font-size: 18px;
  white-space: pre
}

.text-line {
/*  width: 100%;*/
  line-height: 1.5rem;
  min-height: 1.5rem;
  background-color: field;
  white-space: pre-wrap;
  word-break: break-all; /*  纯数字的换行问题*/
  position: relative;
  padding: 0 30px;
}



.edited-dom {
/*  position: absolute;*/
/*  left: 10px;*/
  font-family: auto;
  outline: none ;
  padding: 0;
/*  width: calc(100% - 20px);*/
  min-height: calc(100% - 60px);
  box-sizing: border-box;
}

.edited-dom.hidden{
  position: absolute;
  visibility: hidden;
/*  z-index: 999;*/
/*  opacity: 0.5;*/
  min-width: 0;
/*  color: red;*/
}

.line-num {
  user-select: none;
  position: absolute;
  visibility: visible;
  width: 9ch;
  left: -80px;
  z-index: 1;
  text-align: center;
  color:var(--color-prettylights-syntax-comment);
  font-family: auto;
  line-height: 1.5rem;
  min-height: 1.5rem;

}

.line-tools {
  cursor: grab;
  user-select: none;
  position: absolute;
  visibility: visible;
  width: 20px;
  border-radius: 4px;
  height: 24px;
  left: 5px;
  bottom:0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color:var(--fontNormal)!important;
  opacity: 0;
  transition: 0.3s opacity ease;
}

.text-line:hover .line-tools{
  opacity: 1;
}

.line-tools:hover {
  background-color: #8882;
}

.line-tools.active {
  opacity: 1;
}

.line-text.active {
  background-color: #a0ceff91;
  opacity: 1;
}

/*#a0ceff91*/

.text-line-position {
  position: fixed;
  bottom: 10px;
  right: 0;
}

.editor-area::selection {
  background-color: #a0ceff91;
  color : initial;
}

.tool-bar-item.shake{
  background-color: inherit;
}

.pointer-shake{
  transform: rotate(0deg);
  transition: 0.3s transform ease-in-out;
}

.pointer-shake:hover {
  transform: rotate(-15deg);
}

.line-tools-box {
  position: fixed;
  z-index: 999;
  left: -999px;
  top: -999px;
  opacity: 0;
  background-color: var(--box-bgc);
  border-radius: 8px;
  border:var(--box-border);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.line-tools-box.show {
  opacity:1;
}

.line-tools-box .rows{
  margin: 0;
}

.line-tools-box-item {
  height: 24px;
  width: 24px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-tools-box-item:hover {
  background-color: #9993;
}

</style>
