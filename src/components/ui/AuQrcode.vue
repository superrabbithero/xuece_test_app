<template>
  <div class="qr-container">
    <QRCodeVue :value="qrValue" :size="size" :level="level" />
    <img 
      v-if="logo" 
      class="qr-logo" 
      :src="logo.src" 
      :width="logo.width" 
      :height="logo.height"
    >
  </div>
</template>

<script setup>
import { defineProps, toRefs } from 'vue';
import QRCodeVue from 'qrcode.vue';

// 直接使用 defineProps 的运行时声明（无需 withDefaults）
const props = defineProps({
  qrValue: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    required: true,
    validator: (value) => ['L', 'M', 'Q', 'H'].includes(value)
  },
  logo: {
    type: Object,
    default: () => null // 默认值直接在这里设置
  }
});

const { qrValue, size, level, logo } = toRefs(props);
</script>

<style scoped>
.qr-container {
  position: relative;
  padding: 4px 4px 1px 4px;
  display: inline-block;
  background-color: #fff;
  border-radius: 4px;
}

.qr-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  border: 3px solid #fff;
  border-radius: 20%;
}
</style>


