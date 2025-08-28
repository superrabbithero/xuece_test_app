<template>
  <div class="anchors" size="small">
    <div v-for="anchor in anchors" :key="anchor.id" :class="`anchor-item h${anchor.level}`" @click="scrollTo(anchor.id)">
        <div :class="[`handle`,{show:anchor.id == curAnchor}]" ></div>
        <span :class="{show:anchor.id == curAnchor}">{{anchor.raw}}</span>
    </div>
  </div>
</template>


<script setup>
import { ref, defineProps, onMounted, onUnmounted,nextTick } from 'vue';

const props = defineProps({
  anchors: {
    type: Array,
    required: true
  },
  topOffset: {
    type: Number,
    default: 81
  }
});

// 当前高亮的锚点 ID
const curAnchor = ref(props.anchors[0]?.id);

// 点击导航项，滚动到对应锚点，并更新当前高亮
const scrollTo = (id) => {
  const element = document.getElementById(id);
  if (element) {
    curAnchor.value = id;
    const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementTop - props.topOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

// 滚动时自动计算当前应该高亮的锚点
const updateCurAnchorOnScroll = () => {

  let currentId = null;
  let closestDistance = Infinity;
  const scrollPos = window.pageYOffset + props.topOffset;

  // 遍历所有锚点，找到距离视口顶部最近的那个
  for (const anchor of props.anchors) {
    const element = document.getElementById(anchor.id);

    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.pageYOffset;
      const distance = Math.abs(elementTop - scrollPos);
      // 选择距离最小的元素
      if (distance < closestDistance) {
        closestDistance = distance;
        currentId = anchor.id;
      }
    }
  }



  // 确保至少有一个锚点被选中
  if (currentId) {
    curAnchor.value = currentId;
  }
};

// 组件挂载时添加滚动监听
onMounted(() => {
    window.addEventListener('scroll', updateCurAnchorOnScroll, { passive: true });
    nextTick(()=>{
        updateCurAnchorOnScroll(); // 初始化高亮
    })
  
});

// 组件卸载时移除监听
onUnmounted(() => {
  window.removeEventListener('scroll', updateCurAnchorOnScroll);
});
</script>

<style scoped>
.anchors {
/*    width: 400px;*/
}

.anchor-item {
    height: 1.5rem;
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    cursor: pointer;
}

.anchor-item .handle {
    transition: 0.3s ease-in-out;
    background-color: #8888;
}

.anchor-item .handle.show{
    background-color: var(--fontNormalHighlight);
}

.anchor-item:hover .handle {
    background-color: var(--fontNormalHighlight);
}

.anchors:hover span{
    opacity: 1;
}

.anchor-item:hover span {
    color: var(--fontNormalHighlight);
}
.h1 .handle{
    width: 24px;
    height: 4px;
    border-radius: 2px;
}

.h2 .handle{
    width: 20px;
    height: 4px;
    border-radius: 2px;
    margin-right: 6px;
}

.h3 .handle {
    width: 16px;
    height: 4px;
    border-radius: 2px;
    margin-right: 12px;
}

.h4 .handle,.h5 .handle {
    width: 12px;
    height: 4px;
    border-radius: 2px;
    margin-right: 18px;
}

.h3 span,.h4 span,.h5 span {
    font-weight: 200;
}

.anchor-item span {
    color: #8888;
    width: 100%;
    font-size: 0.9rem;
    height: 24px;
    line-height: 24px;
    white-space: nowrap;       /* 禁止换行 */
    overflow: hidden;          /* 隐藏超出容器的内容 */
    text-overflow: ellipsis; 
    opacity: 0;
    transition: 0.3s ease-in-out;
}

.anchor-item span.show {
    color: var(--fontNormalHighlight);
    opacity: 1;
}

</style>