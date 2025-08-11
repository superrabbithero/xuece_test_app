<template>
  <div class="au-md-editor-container">
    <div class="tool-bar">
      <div class="tool-group">
        <div class="tool-bar-item" @click="goBack()">
          <au-icon name="RiArrowLeftLine" size="22"/>
        </div>
        <div>
          <input class="file-name-input" v-model="fileName" :style="{ width: `${inputWidth}px`}" @input="updateWidth" @keyup="handleKeyUp" />
          <span ref="calc_text_length" class="hide-span">{{fileName}}</span>
        </div>
      </div>
      <div class="tool-group">
        <div v-for="tool in toolBar" :key="tool" :class="['tool-bar-item',{'unable':tool?.unable}]" @click="tool?.click?.() || doEdit(tool.iconName)">
          <au-icon :name="tool.iconName" size="22"/>
        </div>
      </div>
      <div class="tool-group">
        <div class="tool-bar-item" @click="changeViewer()">
          <au-icon v-show="editorViewer == 0" name="RiLayoutRight2Fill" size="22"/>
          <au-icon v-show="editorViewer == 1" name="RiLayoutColumnFill" size="22"/>
          <au-icon v-show="editorViewer == 2" name="RiLayoutLeft2Line" size="22"/>
        </div>
        <div class="tool-bar-item" @click="changeStyle()">
          <au-icon name="RiContrast2Line" size="22"/>
        </div>
      </div>
    </div>
    <div class="editor-area" ref="editorArea">
      <div class="editor-container" v-show="editorViewer != 2 " >
        <div class="editor">
          <div class="edited-dom hidden" v-if="show_line_num" >
            <div v-for="(line,index) in textLines" :key="index" class="text-line"
            ><div class="line-num">{{index+1}}</div>{{ line }}</div>
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
            <div v-for="(line,index) in textLines" draggable="false" :key="index" class="text-line" :id="`line-${index}`"
            >{{ line }}<br v-show="!line"></div>
          </div>
        </div>
        
        
        <div class="text-line-position" v-if="debug">
          <div>{{ curRange }}</div>
          <div>{{ textLines }}</div>
        </div>

        <div class="editor-footer-bar">
          {{ rangePosition }}
        </div>
      </div>

      <div class="preview" v-if="editorViewer != 0">
        <au-markdown-viewer :content="mdText"
          @update-headings="handleHeadingsUpdate"/>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router';
import {ref, defineProps, onMounted, getCurrentInstance, nextTick, onUnmounted, computed} from 'vue';
const { proxy } = getCurrentInstance()
import { debounce } from 'lodash-es';

const debug = true //打开监控数据

const show_line_num = true

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
  mdText.value = textLines.value.join('\n');
}, 100);

//用于监听编辑器高度变化
const editorArea = ref(null)

const paddingBottom = ref(10)

let observer

onMounted(() => {
  //调整filename输入框宽度
  updateWidth()

  //监听editor高度变化，动态修改padding-bottom
  observer = new ResizeObserver((entries) => {
    paddingBottom.value = Math.floor(entries[0].contentRect.height/2)
  });

  observer.observe(editorArea.value);

  textDiv.value.focus()

  nextTick(()=>{
    updateRange(0,textLines.value[textLines.value.length-1]?.length)
    saveSnapshot()
  })

  
})

onUnmounted(() => {
  syncMarkdown.cancel()
})

//编辑器相关变量
// const textLines = ref(['abcdefgwerwerwer','hijklmn'])

const textDiv = ref(null)

const textLines = ref(['# 标题'])

// 更安全的输入法输入判断
const isIMEInput = ref(false) // 标记是否处于输入法组合输入状态

const handleCompositionStart = () => {
  isIMEInput.value = true
}

//编辑器每行的input事件
const handleInput = (event) => {
  console.log(event.isComposing)
  if(!event.isComposing && !isIMEInput.value){
    const content = curSelection.value.focusNode.data
    console.log(content)
    textLines.value[curRange.value.endIndex] = content
    console.log(1)
    saveCursorPosition()
    nextTick(()=>{
      updateRange(curRange.value.endIndex,curRange.value.endOffset)
      syncMarkdown()
    })
  }else{
    console.log('在使用输入法')
  }
}

const handleCompositionEnd = () => {
  console.log('handleCompositionEnd')
  isIMEInput.value = false
  const content = curSelection.value.focusNode.data
  console.log(content)
  textLines.value[curRange.value.endIndex] = content
  console.log(2)
  saveCursorPosition()
  nextTick(()=>{
    updateRange(curRange.value.endIndex,curRange.value.endOffset)
    syncMarkdown()
  })
}

const handleDragStart = (event) => {
  event.preventDefault()
}

const handleDrop = (event) => {
  requestAnimationFrame(() => {
    console.log(3)
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

  curRange.value = {
    startIndex,
    startOffset,
    endIndex,
    endOffset,
    collapsed
   
  }
}

const updateRange = (lineIndex, offset) => {
  if(curSelection?.value){
    //刷新光标位置
    const newRange = document.createRange()
    const lineNode = document.getElementById(`line-${lineIndex}`)
    let textNode = lineNode
    let relOffset = 0
    if(lineNode?.firstChild){
      textNode = lineNode?.firstChild
      relOffset = offset
    }
    if(textLines.value[lineIndex] == '')
      relOffset = 0
    newRange.setStart(textNode, relOffset)
    newRange.setEnd(textNode, relOffset)
    curSelection.value.removeAllRanges(); // 清除现有选区
    curSelection.value.addRange(newRange);   // 设置新选区
    console.log(4)
    saveCursorPosition()
  }
  
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
    console.log('keydown_process')
    event.preventDefault
    // saveCursorPosition()
    return
  }
  requestAnimationFrame(() => {
    console.log(5)
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
    
    const nextLines = textLines.value[curRange.value.endIndex].substring(curRange.value.endOffset) || ''
    textLines.value[curRange.value.endIndex] = `${textLines.value[curRange.value.endIndex].substring(0,curRange.value.endOffset)}` || ''
    textLines.value.splice(curRange.value.endIndex+1, 0 ,nextLines)
    rangeIndex = curRange.value.endIndex + 1
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
    console.log(6)
    saveCursorPosition()
  }else{
    if(!curRange.value.collapsed){
      deleteContents()
      ifUpdateRange = false
    }else{
      return
    }
  }
  if(ifUpdateRange)
    nextTick(()=>{
      const lineDom = document.getElementById(`line-${rangeIndex}`)
      lineDom.scrollIntoView({ behavior: "instant", block: "nearest" });
      updateRange(rangeIndex,rangeOffset)
      syncMarkdown()
      // 保证焦点所在行可见
      
    })


}


//拦截contesteditable原生复制
const handlePaste = (e) => {
  e.preventDefault();
  //处理图片
  if (e.clipboardData.files.length > 0) {
    // 检查第一个文件是否是图片
    const file = e.clipboardData.files[0];
    if (file.type.startsWith('image/')) {
      const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`
      
      convertBlobToBase64(file, (base64) => {
        applyImageStyle(base64);
        imgeList.push({
          id:id,
          url:base64,
          uploaded:false,
          deleted:false})
      });
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


function convertBlobToBase64(blob, callback) {
  const reader = new FileReader();
  reader.onload = (e) => callback(e.target.result);
  reader.readAsDataURL(blob);
}

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

const insertLinesAtCursor = (text) => {
  // saveCursorPosition()
  // let ifUpdateRange = true

  if(!curRange.value.collapsed){
    deleteContents();
    // ifUpdateRange = false
  }

  
  const lines = text.split(/\r?\n/);


  let offset = 0
  let index = 0

  if(lines.length == 0)
    return
  else if(lines.length == 1){
    index = curRange.value.endIndex
    const text = textLines.value[curRange.value.endIndex] 
    offset = curRange.value.startOffset + lines[0].length
    const result = text.substring(0,curRange.value.startOffset) + lines[0] + text.substring(curRange.value.startOffset)
    textLines.value[curRange.value.startIndex] = result
  }else{
    const text = textLines.value[curRange.value.endIndex] 
    textLines.value[curRange.value.endIndex] = text.substring(0,curRange.value.startOffset) + lines[0]
    const lastLine = lines[lines.length - 1] + text.substring(curRange.value.endOffset)
    textLines.value.splice(curRange.value.endIndex+1,0,lastLine)
    if(lines.slice(1,-1).length > 0)
      textLines.value.splice(curRange.value.endIndex+1,0,...lines.slice(1,-1))
    index = curRange.value.endIndex + lines.length - 1
    offset = lines[lines.length - 1].length
  }

  nextTick(()=>{
    updateRange(index,offset)
    syncMarkdown()
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

  if(start != end || curRange.value.collapsed){
    //选择多行，且非光标，则整段前后插入
    textLines.value.splice(end+1,0,text)
    textLines.value.splice(start,0,text)
    nextTick(()=>{
    updateRange(curRange.value.startIndex,0)
    syncMarkdown()
  })
  }else if(text == '```'){
    const line = textLines.value[start]
    const newLine = line.slice(0,startOffset) 
                  + '`' 
                  + line.slice(startOffset,endOffset)
                  + '`'
                  + line.slice(endOffset)
    textLines.value[start] = newLine   
    nextTick(()=>{
      updateRange(start,endOffset+1)

      syncMarkdown()
    })           
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
  console.log(curSelection)
  if(isRanging){
    console.log(7)
    saveCursorPosition()
  }
  isRanging = false
  document.removeEventListener('pointerup', editorAreaPointerup)
}



const props = defineProps({
  fileName:{
    type:String,
    default:'新建文档'
  }
})


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
  console.log(selectRange)
  if(curRange.value){
    insertLinesAtCursor(text)
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

const router = useRouter();

const fileName = ref(props.fileName)

const goBack = () => {
  router.go(-1);
}

const headings = ref([])
const mdText = ref('')

const handleHeadingsUpdate = (list) => {
  headings.value = list
}

const changeStyle = () => {
  // isDark.value = !isDark.value
  proxy.$constants.DARK = !proxy.$constants.DARK // 更新全局状态
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
  mdText.value = textLines.value.join('\n');
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
  mdText.value = textLines.value.join('\n');
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
  font-weight: 100;
  font-family: auto;
  background-color: #0002;
  padding: 0 10px;
/*  opacity: 0.5;*/
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
  width: 100%;
  line-height: 1.5rem;
  min-height: 1.5rem;
  background-color: field;
  white-space: pre-wrap;
  word-break: break-all; /*  纯数字的换行问题*/
  position: relative;
  
}



.edited-dom {
  font-family: auto;
  outline: none ;
  width: calc(100% - 10px);
  min-height: calc(100% - 10px);
  padding-left: 80px;
  box-sizing: border-box;
}

.edited-dom.hidden{
  position: absolute;
  visibility: hidden;
  min-width: 0;
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



.text-line-position {
  position: fixed;
  bottom: 10px;
  right: 0;
}

</style>
