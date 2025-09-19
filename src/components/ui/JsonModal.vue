<template>
  <div class="au-grid" style="width:100%">
    <div class="rows gap10 end tool-bars">
      <span>双击值可修改</span>
      <div class="actions" >
        <au-icon name="RiClipboardLine" size="16"/>
        <au-icon name="RiCollapseVerticalLine" size="16" @click="collapseAll"/>
        <au-icon name="RiExpandVerticalLine" size="16" @click="expandAll"/>
      </div>
    </div>
    <div style="width: 100%;max-height: 500px;min-height: 200px;overflow: auto;">
      <vue-json-pretty 
      v-model:data="refData"
      showLength
      showLine
      :editable="editable" 
      :showSelectController='true'
      :virtual='false'
      :deep="expandDepth" 
      editableTrigger="dblclick"
      @nodeMouseover="mouseOver"
      :theme="theme"></vue-json-pretty>
    </div>
  </div>
</template>

<script setup>
import VueJsonPretty from 'vue-json-pretty';
import 'vue-json-pretty/lib/styles.css'
import {ref, computed, defineProps, defineEmits, getCurrentInstance} from 'vue'

const { proxy } = getCurrentInstance()

const props = defineProps({
  jsonData: {
    type: Object,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:jsonData', 'mouseOver']);

// 使用 computed 而不是 ref，确保响应性
const refData = computed({
  get: () => props.jsonData,
  set: (value) => {
    emit('update:jsonData', value);
  }
});

const theme = computed(()=>proxy.$constants.DARK?'dark':'light')

const expandDepth = ref(1)

const expandAll = () => {
  expandDepth.value = 99
}

const collapseAll = () => {
  expandDepth.value = 1
}

const mouseOver = (data)=>{
  emit('mouseOver',data.path)
}



</script>

<style scoped>
.tool-bars {
  border-bottom: var(--box-border);
  padding-bottom: 6px;
}
.tool-bars span{
  font-size: 0.9rem;
  color: #8888;
}
.actions{
  display: flex;
}


</style>
<style>
.vjs-tree-node {
  align-items: center;
}
</style>
