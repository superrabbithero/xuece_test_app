<script setup>
import { motion } from "motion-v"

const dotVariants = {
  jump: {
    y: -30,
    transition: {
      duration: 0.8,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    },
  },
}
</script>

<template>
  <motion.div
    class="m-container"
    animate="jump"
    :transition="{ staggerChildren: -0.2, staggerDirection: -1 }"
  >
    <motion.div class="m-dot" :variants="dotVariants" />
    <motion.div class="m-dot" :variants="dotVariants" />
    <motion.div class="m-dot" :variants="dotVariants" />
  </motion.div>
</template>

<style scoped>
.m-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.m-dot {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--main-color);
  will-change: transform;
}
</style>
