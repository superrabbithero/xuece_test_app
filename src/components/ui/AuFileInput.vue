<template>
  <div class="upload-box">
    <div class="upload-area" @dragover.prevent @drop="handleDrop" @dragenter="handleDragEnter">
      <div @dragleave="handleDragLeave"  v-if="isFileOver" class="area1"></div>
      <p v-if="!isFileOver">
          拖拉文件到此区域上传或<a class="text_btn" @click="chooseFile">选择文件</a>
      </p>
      <p v-else>释放文件上传</p>
      <input type="file" ref="fileInput" @change="handleFileChange" :accept="accept" style="display: none;">
    </div>
    <div v-if="file && false" class="file-name">
      <label v-if="file.name" :title="file.name">{{file.name}}</label>
      <icon-wrapper class="table-do"  iconName="DeleteOne" theme="outline" :strokeWidth='3' size="20" @click="clearFile"/>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  props: {
    accept: {
      type: String,
      required: false
    },
    modelValue: {
      type: File,
      default: null
    }
  },

  emits:['update:modelValue'],

  setup(props, { emit }) {
    const isFileOver = ref(false)
    const file = ref(null)
    const fileInput = ref(null)

    const handleDrop = (event) => {
      isFileOver.value = false
      event.preventDefault();
      file.value = event.dataTransfer.files[0]

      emit('update:modelValue', file.value)
    }

    const handleDragEnter = () => {
      isFileOver.value = true
    }

    const handleDragLeave = () => {
      isFileOver.value = false
    }

    const chooseFile = () => {
      fileInput.value.click()
    }

    const clearFile = () => {
      file.value = null
      emit('update:modelValue', null);
    }


    return {
      isFileOver,
      fileInput,
      handleDrop,
      handleDragEnter,
      handleDragLeave,
      chooseFile,
      file,
      clearFile
    };
  }
};
</script>

<style scoped>
  .upload-box {
    width: 100%;
    display: flex;
    flex-direction: column;
  }

  .upload-area {
    border: 1px dashed var(--dashed-color);
    padding: 20px;
    text-align: center;
    height: 170px;
    position: relative;
    border-radius: 5px;
  }

  .upload-area p{
    margin-top: 68px;
  }

  .area1 {
    position: absolute;
    top:0;
    right:0;
    bottom:0;
    left:0;
    background-color: rgba(0, 0, 0, 0.1);
  }

  .text_btn{
    text-decoration: underline;  /* 添加下划线 */
    font-weight: bold;   
    cursor: pointer;
  }

  .file-name{
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .file-name > label {
    width: 80%;
    white-space: nowrap;      /* 禁止换行 */
    overflow: hidden;         /* 隐藏超出部分 */
    text-overflow: ellipsis;  /* 超出时显示省略号 */
    font-weight: normal;
  }
</style>
