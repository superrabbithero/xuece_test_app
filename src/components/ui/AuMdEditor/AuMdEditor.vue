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
      <div class="editor" v-show="editorViewer != 2 ">
        <textarea ref="myTextarea" v-model="mdText"></textarea>
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

const myTextarea = ref(null)



const props = defineProps({
  fileName:{
    type:String,
    default:'新建文档'
  }
})

//控制预览模式
const editorViewer = ref(0) //仅编辑，编辑&预览，仅预览 0，1，2
const changeViewer = ()=>{
  editorViewer.value = (editorViewer.value + 1 )%3
}

// 编辑工具相关方法
const insertText = (content, selectRange=null) => { //工具方法,在光标处插入内容,并定位光标
  const textarea = myTextarea.value;
  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;

  const selectContent = mdText.value.substring(startPos,endPos)

  const selectLength = selectContent.length || content.length

  if(selectContent.length > 0){
    const newContent = content.substring(0, selectRange[0]) +
                     selectContent +
                     content.substring(selectRange[1])
    mdText.value = mdText.value.substring(0, startPos) + 
               newContent + 
               mdText.value.substring(endPos);

  }else{
    mdText.value = mdText.value.substring(0, startPos) + 
               content + 
               mdText.value.substring(endPos);
  }
  
  // 设置光标位置
  nextTick(() => {
    if(selectRange){
      textarea.setSelectionRange(startPos + selectRange[0], startPos + selectRange[0] + selectLength);
    }else{
      textarea.selectionStart = startPos + content.length;
      textarea.selectionEnd = startPos + content.length;
    }
    textarea.focus();
  });
};
//检查是否选中整段或多段文字
// function isWholeParagraphSelected(textarea) {
//   const { selectionStart, selectionEnd, value } = textarea;
  
//   // 1. 如果没有选中文本,直接返回 false
//   if (selectionStart === selectionEnd) return false;

//   // 2. 获取选中文本前后的字符
//   const prevChar = value[selectionStart - 1];
//   const nextChar = value[selectionEnd];

//   // 3. 判断选中内容是否以段落边界开头和结尾
//   const startsAtParagraphStart = selectionStart === 0 || prevChar === '\n';
//   const endsAtParagraphEnd = selectionEnd === value.length || nextChar === '\n';

//   return startsAtParagraphStart && endsAtParagraphEnd;
// }

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
}

.preview {
  padding: 10px;
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



</style>