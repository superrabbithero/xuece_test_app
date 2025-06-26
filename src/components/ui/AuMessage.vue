<template>
  <div v-if="demo" :class="{'toast':true, 'demo':demo}">
    <icon-wrapper v-show="displayType==item" v-for="(item,index) in typeList" :key="index" :class="`icon-${item}`" :name="iconName[item]" size="20"/>
    <div class="toast-message">{{ displayMessage }}</div>
    <icon-wrapper v-show="displayCloseBtn" name="RiCloseLine" size="16"/>
  </div>
  <div v-else class="message-box">
    <transition-group name="message-list" tag="div" class="message-content">
      <div class="toast" v-for="message in messageList" :key="message">
        <icon-wrapper v-show="message.type==item" v-for="(item,index) in typeList" :key="index" :class="`icon-${item}`" :name="iconName[item]" size="20"/>
        <div class="toast-message">{{ message.msg }}</div>
        <icon-wrapper v-if="message?.closeBtn" name="RiCloseLine" size="16" @click="remove(message)"/>
      </div>
    </transition-group>
  </div>
  
</template>

<script setup>
import { ref ,defineExpose, defineProps,computed} from 'vue'

const props = defineProps({
    demo:{
      type: Boolean,
      default: false
    },
    type:{
      type: String,
      default: ""
    },
    message:{
      type: String,
      default: ""
    },
    closeBtn:{
      type: Boolean,
      default: false
    },
    duration:{
      type: Number,
      default : 3000
    }
})


// 响应式状态
const showMessage = ref('')
const showType = ref('')
const showCloseBtn = ref(null)
const displayMessage = computed(() => props.message || showMessage.value)
const displayType = computed(() => props.type || showType.value)
const displayCloseBtn = computed(() => props.closeBtn || showType.value)

const typeList = ref(['info','warning','success','error'])
const iconName = ref({"info":"RiInformation2Fill","warning":"RiAlertFill","success":"RiCheckboxCircleFill","error":"RiCloseCircleFill"})

const messageList = ref([])

// 暴露给全局的方法
const show = (msg, options = {}) => {
  showMessage.value = msg
  showType.value = options.type || 'info'
  showCloseBtn.value = options.duration == 0 ? true : (options.closeBtn || false)
  const newMessage = {
    msg: showMessage.value,
    type: showType.value,
    closeBtn: showCloseBtn.value
  }

  messageList.value.push(newMessage)
  if(options.duration != 0){
    setTimeout(() => {
      messageList.value.splice(0, 1)
    }, options.duration || 3000)
  }
    
}

const remove = (item) => {
  const i = messageList.value.indexOf(item)
  if (i > -1) {
    messageList.value.splice(i,1)
  }
}

defineExpose({ show })

</script>

<style scoped>
.toast {
/*  position: absolute;*/
  gap:10px;
  display: flex;
  align-items: center;

  padding: 7px 15px;
  font-size: 16px;
  border-radius: 8px;
  
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  
  border: var(--box-border);
  color: var(--fontNormal);
  background-color: var(--content-bgc);
  margin-bottom: 10px;
}

.message-box {
  position: absolute;
  display: flex;
  justify-content: center;
  width: 100%;
  top: 1rem;
  z-index: 999;
}

.message-content{
/*  position: relative;*/
}

.toast.demo {
  position: relative;
  width: fit-content;
  top: unset;
  left: unset;
  transform: unset;
}

.icon-success {
  color:#18d06e
}

.icon-info {
  color:var(--fontNormal)
}

.icon-warning {
  color:#faab12
}

.icon-error {
  color:#f9565b
}

.message-list-move,
.message-list-enter-active,
.message-list-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
/*transition: all 0.3s ease;*/
}
.message-list-enter-from,
.message-list-leave-to {
  opacity: 0;
  transform: scaleY(0.01) translateX(30px);
}

.message-list-leave-active{
  position: absolute;
}
</style>