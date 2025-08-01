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
          @pointerup="editorAreaPointerup"
          @input="handleInput"
          @paste="handlePaste">
          <div v-for="(line,index) in textLines" :key="index" class="text-line" :id="`line-${index}`"
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

  if(curRange.value.startIndex == curRange.value.endIndex){
    const content = textLines.value[curRange.value.startIndex]
    textLines.value[curRange.value.startIndex] 
      = `${content.substring(0,curRange.value.startOffset)}${content.substring(curRange.value.endOffset)}`
    updateRange(curRange.value.startIndex,curRange.value.startOffset)
  }
}

const handleKeyDown = (event) => {
  console.log('handleKeyDown')
  requestAnimationFrame(() => {
    saveCursorPosition()
  });
  
  

  if (
    (event.key === 'Backspace' || event.key === 'Delete') &&
    textLines.value.length === 1 && 
    textLines.value[textLines.value.length - 1].trim() === ''
  ) {
    event.preventDefault(); // 阻止默认行为
  }

  if (event.key === 'Enter'){
    event.preventDefault()
    //在当前位置插入换行符
    if(!curRange.value.collapsed)
      deleteContents()
    
    const nextLines = textLines.value[curRange.value.endIndex].substring(curRange.value.endOffset)
    console.log(nextLines)
    textLines.value[curRange.value.endIndex] = `${textLines.value[curRange.value.endIndex].substring(0,curRange.value.endOffset)}  `
    console.log(`${textLines.value[curRange.value.endIndex].substring(0,curRange.value.endOffset)}  \n`)
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
  const selection = window.getSelection();
  if (!selection.rangeCount || !textDiv.value) return;
  
  const range = selection.getRangeAt(0);
  range.deleteContents();
  
  const lines = text.split(/\r?\n/);
  // const fragment = document.createDocumentFragment();
  
  lines.forEach((line, index) => {
    const div = document.createElement('div');
    div.className = 'text-line';
    div.textContent = line;
    if(index == 0){
      range.insertNode(div);
    }else{
      range.endContainer.parentElement.insertBefore(div, range.endContainer.nextSibling);
    }

    // 立即将光标移动到当前行末尾
    const newRange = document.createRange();
    newRange.selectNodeContents(div);
    newRange.collapse(false); // false 表示移动到末尾
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(newRange);
    
    // 更新原始range的位置，以便下一行插入到正确位置
    range.setStartAfter(div);
  
  });
  
  
  
  // 移动光标到最后
  const lastDiv = textDiv.value.querySelector('.text-line:last-child');
  if (lastDiv) {
    const newRange = document.createRange();
    newRange.selectNodeContents(lastDiv);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
  
  // 触发输入事件
  const event = new Event('input', { bubbles: true });
  textDiv.value.dispatchEvent(event);
}

const curSelection = ref(null)

//获得光标的坐标
const editorAreaPointerup = () => {
  //获得当前selection数据
  saveCursorPosition()
  console.log(curSelection.value.toString())
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













