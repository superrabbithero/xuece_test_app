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
        <div v-for="tool in toolBar" :key="tool" class="tool-bar-item" @click="tool?.click || doEdit(tool.iconName)">
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
    <div class="editor-area">
      <div class="editor" >
        <textarea ref="myTextarea" v-model="mdText"></textarea>
      </div>
      <div class="editor" v-show="editorViewer != 2 ">
        <div contenteditable="true" spellcheck="false" class="edited-dom" ref="textDiv" 
          @keydown="handleKeyDown"
          @pointerdown="editorAreaPointerDown"
          @input="handleInput"
          @paste="handlePaste">
          <div v-for="(line,index) in textLines" draggable="false" :key="index" class="text-line" :id="`line-${index}`"
          >{{ line }}</div>
        </div>
        
        <div class="text-line-position">
          <div>{{ curRange }}</div>
          <div>{{ textLines }}</div>
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
import {ref, defineProps, onMounted, getCurrentInstance, nextTick} from 'vue';
const { proxy } = getCurrentInstance()

//编辑器相关变量
// const textLines = ref(['abcdefgwerwerwer','hijklmn'])

const textDiv = ref(null)

const textLines = ref(['# 标题'])

//编辑器每行的input事件
const handleInput = () => {

  const content = curSelection.value.focusNode.parentElement.innerText
  saveCursorPosition()
  textLines.value[curRange.value.endIndex] = content
  
  //刷新光标位置
  nextTick(()=>{
    const newRange = document.createRange()
    const textNode = document.getElementById(`line-${curRange.value.endIndex}`).firstChild
    newRange.setStart(textNode,curRange.value.startOffset)
    newRange.setEnd(textNode,curRange.value.endOffset)
    console.log(newRange)
    curSelection.value.removeAllRanges(); // 清除现有选区
    curSelection.value.addRange(newRange);   // 设置新选区
  })
    

  mdText.value = textDiv.value.innerText
  console.log('handleInput')
  
}

//自己写一个基于textLines的range
const curRange = ref(null)

const getRange = () => {
  const startIndex = Number(savedRange.startContainer.parentElement.id.substring(5))
  const startOffset = savedRange.startOffset
  const endIndex = Number(savedRange.endContainer.parentElement.id.substring(5))
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
  //刷新光标位置
  const newRange = document.createRange()
  
  const textNode = document.getElementById(`line-${lineIndex}`).firstChild
  newRange.setStart(textNode, offset)
  newRange.setEnd(textNode, offset)
  curSelection.value.removeAllRanges(); // 清除现有选区
  curSelection.value.addRange(newRange);   // 设置新选区
  saveCursorPosition()
}

const deleteContents = () => {
  if(curRange.value.collapsed)
    return;

  if(curRange.value.startIndex == curRange.value.endIndex){ //删除选择在一行内
    const content = textLines.value[curRange.value.startIndex]
    const newLine = `${content.substring(0,curRange.value.startOffset)}${content.substring(curRange.value.endOffset)}` || '\n'
    
    textLines.value[Math.min(curRange.value.startIndex,curRange.value.endIndex)] = newLine
    nextTick(()=>{
      updateRange(curRange.value.startIndex,curRange.value.startOffset)
    })
  }else{
    let start, startOffset, end, endOffset;

    if (curRange.value.startIndex < curRange.value.endIndex) {
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

    console.log(start,startOffset,end,endOffset)
    const newLine = textLines.value[start].substring(0,startOffset) + textLines.value[end].substring(endOffset)
    
    textLines.value[start] = newLine || '\n'
    textLines.value.splice(start+1,end-start)
    nextTick(()=>{
      updateRange(start, startOffset)
    })
    
  }
}

const handleKeyDown = (event) => {
  console.log('handleKeyDown')
  requestAnimationFrame(() => {
    saveCursorPosition()
  });
  
  

  if (event.key === 'Backspace' || event.key === 'Delete'){
    if(!curRange.value.collapsed){
      deleteContents()
      event.preventDefault(); // 阻止默认行为
    }
    else if(curRange.value.startOffset == 0 && event.key === 'Backspace'){
      const index = curRange.value.startIndex
      if(index != 0){
        const offset = textLines.value[index - 1].length
        const upLine = textLines.value[index]
        textLines.value[index-1] =  upLine == '\n'
                                  ? textLines.value[index-1]
                                  : textLines.value[index-1] + upLine
        textLines.value.splice(curRange.value.startIndex,1)
        nextTick(()=>{
          updateRange(index-1, offset)
        })
      }

      event.preventDefault(); // 阻止默认行为
    }else if((curRange.value.startOffset == textLines.value[curRange.value.startIndex].length || textLines.value[curRange.value.startIndex] == '\n') && event.key === 'Delete'){
      const index = curRange.value.startIndex
      if(index + 1 <= textLines.value.length - 1){
        const offset = curRange.value.endOffset
        const downLine = textLines.value[index+1]
        textLines.value[index] =  textLines.value[index] + downLine
        textLines.value.splice(index+1,1)
        nextTick(()=>{
          updateRange(index, offset)
        })
      }
      
      

      event.preventDefault(); // 阻止默认行为
    }else if(curRange.value.startOffset == 1 && textLines.value[curRange.value.startIndex].length == 1 && event.key === 'Backspace'){
      textLines.value[curRange.value.startIndex] = '\n'
      nextTick(()=>{
        updateRange(curRange.value.startIndex, 0)
      })
      event.preventDefault();
    }else if(curRange.value.startOffset == 0 && textLines.value[curRange.value.startIndex].length == 1 && event.key === 'Delete'){
      textLines.value[curRange.value.startIndex] = '\n'
      nextTick(()=>{
        updateRange(curRange.value.startIndex, 0)
      })
      event.preventDefault();
    }
    
  }

  if (event.key === 'Enter'){
    event.preventDefault()
    //在当前位置插入换行符
    if(!curRange.value.collapsed)
      deleteContents()
    
    const nextLines = textLines.value[curRange.value.endIndex].substring(curRange.value.endOffset) || '\n'
    console.log('下一行',nextLines)
    textLines.value[curRange.value.endIndex] = `${textLines.value[curRange.value.endIndex].substring(0,curRange.value.endOffset)}` || '\n'
    textLines.value.splice(curRange.value.endIndex+1, 0 ,nextLines)
    // 移动光标到换行后
    nextTick(()=>{
      updateRange(curRange.value.startIndex+1,0)
      mdText.value = textDiv.value.innerText
    })
    
  }
}


//拦截contesteditable原生复制
const handlePaste = (e) => {
  e.preventDefault();
  const clipboardText = e.clipboardData.getData('text/plain');
  insertLinesAtCursor(clipboardText);
}

const insertLinesAtCursor = (text) => {

  if(!curRange.value.collapsed)
    deleteContents();
  
  const lines = text.split(/\r?\n/);

  console.log(lines)

  let offset = 0
  let index = 0

  if(lines.length == 0)
    return
  else if(lines.length == 1){
    console.log('一行')
    index = curRange.value.endIndex
    const text = textLines.value[curRange.value.endIndex] 
    offset = text.length + lines[0].length - 1
    const result = text.substring(0,curRange.value.startOffset) + lines[0] + text.substring(curRange.value.endOffset)
    textLines.value[curRange.value.endIndex] = result
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

  console.log(index,offset)
  
  nextTick(()=>{
    updateRange(index,offset)
    mdText.value = textDiv.value.innerText
  })
  


  
  
  
  
  
  // 触发输入事件
  // const event = new Event('input', { bubbles: true });
  // textDiv.value.dispatchEvent(event);
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
    console.log(curSelection.value.toString())
  }
  isRanging = false
  document.removeEventListener('pointerup', editorAreaPointerup)
}




const myTextarea = ref(null)

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
  console.log(curSelection.value)
};

// 插入文本（支持替换选中内容）
const insertText = (text,selectRange=null) => {

  console.log(selectRange)
  console.log(savedRange)
  if (!textDiv.value) return;

  const selection = curSelection.value
  const range = savedRange || (selection.rangeCount > 0 && selection.getRangeAt(0));
  if (!range) return;

  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // 更新光标位置
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  mdText.value = textDiv.value.innerText
  saveCursorPosition()
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
    addContent = '1. '
  }else if(ordered){
    addContent = '- '
  }else if(checked){
    addContent = '- [ ]'
  }
  console.log(addContent)
  // insertTextPerLine(addContent)
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
    default:
      console.warn(`未处理工具类型: ${tool}`);
      return false; // 返回操作结果
  }
}

const toolBar = ref([
  {
    iconName:'RiHeading'
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

onMounted(() => {
  updateWidth()
})

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


</script>

<style lang="css" scoped>
@import './index.css';

.text-line-position {
  position: fixed;
  bottom: 10px;
}

</style>
