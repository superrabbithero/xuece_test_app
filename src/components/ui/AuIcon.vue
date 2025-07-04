<template>
  <component
    :is="iconComponent"
    :size="size"
    :color="color"
    class='icon'
  />
</template>

<script setup>
import { defineProps, computed} from 'vue'
import * as RemixIcons from '@remixicon/vue'

const props = defineProps({
  name: {
    type: String,
    required: true
  },
  size: {
    type: [Number, String],
    default: '22px'
  },
  color: {
    type: String,
    default: 'currentColor'
  }
})


const iconComponent = computed(()=>{return RemixIcons[props.name]})


</script>

<style scoped>

</style>



