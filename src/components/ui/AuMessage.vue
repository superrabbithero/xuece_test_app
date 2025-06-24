<template>
  <div v-if="demo" :class="{'toast':true, 'demo':demo}">
    <icon-wrapper v-show="displayType==item" v-for="(item,index) in typeList" :key="index" :class="`icon-${item}`" :name="iconName[item]" size="20"/>
    <div class="toast-message">{{ displayMessage }}</div>
  </div>
  <div v-else class="message-box">
    <transition name="toast-fade" v-for="(message, key) in messageList" :key="key">
      <div v-if="message.visible" class="toast" >
        <icon-wrapper v-show="message.type==item" v-for="(item,index) in typeList" :key="index" :class="`icon-${item}`" :name="iconName[item]" size="20"/>
        <div class="toast-message">{{ message.msg }}</div>
      </div>
    </transition>
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
    }
})


// 响应式状态
const visible = ref(false)
const showMessage = ref('')
const showType = ref('')
const displayMessage = computed(() => props.message || showMessage.value)
const displayType = computed(() => props.type || showType.value)

const typeList = ref(['info','warning','success','error'])
const iconName = ref({"info":"RiInformation2Fill","warning":"RiAlertFill","success":"RiCheckboxCircleFill","error":"RiCloseCircleFill"})

const messageList = ref({})

// 暴露给全局的方法
const show = (msg, options = {}) => {
  console.log("12312312")
  showMessage.value = msg
  showType.value = options.type || 'info'
  visible.value = true
  const newMessage = {
    msg:showMessage.value,
    type:showType.value,
    visible:visible.value
  }
  console.log(messageList.value)
  const id = Date.now()
  messageList.value[id] = newMessage
  setTimeout(() => {
    // delete messageList.value[id]
    messageList.value[id].visible = false
  }, options.duration || 3000)
}

defineExpose({ show })

</script>

<style scoped>
.toast {
  
  gap:10px;
  display: flex;
  align-items: center;
  
  transform: translateX(-50%);
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
  position: fixed;
  top: 1rem;
  left: 50%;
  z-index: 999;
}

.toast.demo {
  position: relative;
  width: fit-content;
  top: unset;
  left: unset;
  transform: unset;
}

.toast > .dot{
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 7px;
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


.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>