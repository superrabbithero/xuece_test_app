<template>
  <div @click="showToast('123')">toast</div>
  <transition name="toast-fade">
    <div v-if="visible" class="toast" :class="`toast-${type}`">
      {{ message }}
    </div>
  </transition>
</template>

<script setup>
import { ref ,defineExpose} from 'vue'

// 响应式状态
const visible = ref(false)
const message = ref('')
const type = ref('info')

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
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  background: #323232;
  color: white;
  border-radius: 4px;
  z-index: 9999;
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