<template>
  <transition name="toast-fade">
    <div v-if="visible" class="toast">
      <icon-wrapper :class="`icon-${type}`" :name="iconName[type]" size="20"/>
      <div class="toast-message">{{ message }}</div>
    </div>
  </transition>
</template>

<script setup>
import { ref ,defineExpose} from 'vue'

// 响应式状态
const visible = ref(false)
const message = ref('')
const iconName = ref({"info":"RiInformation2Fill","warning":"RiAlertFill","success":"RiCheckboxCircleFill","error":"RiCloseCircleFill"})
const type = ref('info') //info waring success error

// 暴露给全局的方法
const show = (msg, options = {}) => {
  message.value = msg
  type.value = options.type || 'info'
  visible.value = true
  setTimeout(() => {
    visible.value = false
  }, options.duration || 3000)
}

defineExpose({ show })

</script>

<style scoped>
.toast {
  position: fixed;
  gap:10px;
  display: flex;
  align-items: center;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  padding: 7px 15px;
  font-size: 16px;
  border-radius: 8px;
  
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  z-index: 999;
  border: var(--box-border);
  color: var(--fontNormal);
  background-color: var(--content-bgc);
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