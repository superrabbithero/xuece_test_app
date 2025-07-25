<template>
  <div class="anchors" size="small">
    <div v-for="anchor in anchors" :key="anchor.id" class="anchor-item">
        <span :class="`h${anchor.level}`" @click="scrollTo(anchor.id)">{{anchor.raw}}</span>
    </div>
  </div>
</template>


<script setup>
import {ref, defineProps} from 'vue';

const props = defineProps({
    anchors:{
        type: Array,
        required:true
    },
    topOffset:{
        type: Number,
        default:65
    }

})

const curAnchor = ref(props.anchors[0]?.id)

const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (element) {
        curAnchor.value = id;
        // 计算目标位置 = 元素顶部位置 - 导航栏高度
        const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementTop - props.topOffset;
        // element.scrollIntoView({ behavior: 'smooth'});
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}


</script>

<style scoped>


</style>