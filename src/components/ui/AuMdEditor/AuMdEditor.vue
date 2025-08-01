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
          
          <div class="text-line"  
          >{{''}}</div>
        </div>
        
        <div class="text-line-position">{{ `行 ${caretPosition.y + 1}, 列 ${caretPosition.x + 1}` }}</div>
        <div class="text-line-position">{{ selectRange }}</div>
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
import {ref, defineProps, onMounted, getCurrentInstance} from 'vue';
const { proxy } = getCurrentInstance()

//编辑器相关变量
// const textLines = ref(['abcdefgwerwerwer','hijklmn'])
const caretPosition = ref({y:1,x:1}) 

const textDiv = ref(null)

//编辑器每行的input事件
const handleInput = () => {

  mdText.value = textDiv.value.innerText
  saveCursorPosition()
}

const handleKeyDown = (event) => {
  saveCursorPosition()

  const textLines = textDiv.value.querySelectorAll('.text-line');
  const lastLine = textLines[textLines.length - 1];

  if (
    (event.key === 'Backspace' || event.key === 'Delete') &&
    textLines.length === 1 && 
    lastLine.textContent.trim() === ''
  ) {
    event.preventDefault(); // 阻止默认行为
  }

  if (event.key === 'Enter'){
    //在当前位置插入换行符
    const range = curSelection.value.getRangeAt(0);
    const br = document.createTextNode('  ');
    range.insertNode(br);

    // 移动光标到换行后
    range.setStartAfter(br);
    range.collapse(true);
    curSelection.value.removeAllRanges();
    curSelection.value.addRange(range);
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
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    curSelection.value = selection
    savedRange = selection.getRangeAt(0);
  }

  console.log(savedRange)
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
}

.editor, .preview {
  border-radius: 5px;
  overflow: hidden;
  flex-basis: 100%;
  box-sizing: border-box; 
  border: var(--box-border);
  height: calc(100vh - 60px);
  background-color: field;
  padding: 10px;
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
  
  background-color: field;
  overflow: auto;
  
}

.tool-bar{
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
  margin: 0;
  padding: 0 5px;
  font-size: 18px;
  border-radius: 2px;
  height: 32px;
/*  box-sizing: border-box;*/
  margin-left: 4px;
}

.file-name-input:hover,.file-name-input:focus {
  background-color: #5551;
  outline: none;
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
}



.edited-dom {
  counter-reset: section;
  font-family: auto;
  outline: none ;
  height: 100%;
  width: 100%;
  overflow: auto;
  padding-left: 45px;
  box-sizing: border-box;
}

.edited-dom > .text-line {
  position: relative;
}

.edited-dom > .text-line:before {
  counter-increment: section; /* 递增计数器 */
  content: counter(section); /* 显示计数器 */
  position: absolute;
  /* font-size: 0.8rem; */
  left: -6ch;
  width: 6ch;
  height: 1.5rem;
  line-height: 1.5rem;
  /* background-color: aquamarine; */
  /* z-index: 999; */
  text-align: center;
  opacity: 0.5;
}


</style>













