<template>
  <div class="article-tag-group" ref="tagGroup">
    <div
      v-for="(t,i) in tabList"
      :key="i"
      class="article-tag"
      :class="{active: activeIndex===i}"
      ref="tagRefs"
      @click="onClickTag(i)"
    >{{ t }}</div>
    <div class="underline-move" ref="underline" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, defineProps, defineEmits } from 'vue'

// 定义事件
const emit = defineEmits(['change'])

const props = defineProps({
  tabList: {
    type: Array,
    required: true
  }
})

const activeIndex = ref(0)

const tagRefs = ref([])
const tagGroup = ref(null)
const underline = ref(null)

const geom = { left: 0, width: 0 }

const measure = () => {
  const el = tagRefs.value[activeIndex.value]
  if (!el) return
  const groupRect = tagGroup.value.getBoundingClientRect()
  const rect = el.getBoundingClientRect()
  geom.left = rect.left - groupRect.left
  geom.width = rect.width
}

onMounted(async () => {
  await nextTick()
  tagRefs.value = tagRefs.value.filter(Boolean)
  measure()
  underline.value.style.width = geom.width + 'px'
  underline.value.style.transform = `translate3d(${geom.left}px,0,0) scaleX(1)`
})

const onClickTag = async (i) => {
  if (i === activeIndex.value) return
  const fromLeft = geom.left
  // const fromWidth = geom.width

  activeIndex.value = i
  await nextTick()
  const groupRect = tagGroup.value.getBoundingClientRect()
  const targetRect = tagRefs.value[i].getBoundingClientRect()
  const toLeft = targetRect.left - groupRect.left
  const toWidth = targetRect.width

  // 先更新宽度
  underline.value.style.width = toWidth + 'px'

  // 用 Web Animations API 做“果冻”动画
  underline.value.animate([
    { transform: `translate3d(${fromLeft}px,0,0) scaleX(1)` },
    { transform: `translate3d(${fromLeft}px,0,0) scaleX(0.6)`, offset: 0.35 },
    { transform: `translate3d(${toLeft}px,0,0) scaleX(0.6)`, offset: 0.65 },
    { transform: `translate3d(${toLeft}px,0,0) scaleX(1.1)`, offset: 0.84 },
    { transform: `translate3d(${toLeft}px,0,0) scaleX(1)` }
  ], {
    duration: 800,
    easing: 'cubic-bezier(.2,.8,.2,1)',
    fill: 'forwards'
  })

  geom.left = toLeft
  geom.width = toWidth

  // 发出切换事件
  emit('change', {
    index: i,
    label: props.tabList[i]
  })
}
</script>



<style scoped>
.article-tag-group {
  position: relative;
  display: flex;
}
.article-tag {
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: .6;
  user-select: none;
  cursor: pointer;
  padding: 4px 0 6px;
  width: 5rem;
  transition: color .2s ease, opacity .2s ease;
}
.article-tag:hover, .article-tag.active {
  color: var(--main-color);
  opacity: 1;
}

.underline-move {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  border-radius: 1px;
  background-color: var(--main-color);
  will-change: transform;
}
</style>
