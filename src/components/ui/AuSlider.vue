<template>
  <div class="au-slider-container" ref="sliderContainer">
    <div class="au-slider-track-box"  @pointerdown="handleTrackStart">
      <div class="au-slider-track" ref="track">
        <div class="au-slider-runnable-track" ref="runnable" :style="{width:`${progress}%`}"></div>
      </div>
    </div>
    <div class="au-slider-thumb" ref="thumb" :style="{left:`${progress}%`}" @pointerdown="handleThumbStart">
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount ,computed,defineProps,defineEmits  } from 'vue';


const props = defineProps(
  {
  modelValue: {
    type: Number,
    required: true
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 100
  },
  step: {
    type: Number,
    default: 1
  },
  vertical: {
    type: Boolean,
    default: false
  }
}) 
  
const emit = defineEmits(['update:modelValue'])

const track = ref(null);
const thumb = ref(null);
const sliderContainer = ref(null);
let thumbDrag = false
const runnable = ref(null);
const disx = ref(0);
const disy = ref(0);
const modelValue = ref(props.modelValue);
// console.log(`setup:${modelValue.value}`)
const step_px = ref(0)
const leftValue = ref(0)

const progress = computed(() => {
  // 当前值对应的百分比进度
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});

onMounted(() => {
  track.value = document.querySelector('.au-slider-track');
  step_px.value = track.value.clientWidth/props.max*props.step;
  // console.log('slider width:',sliderContainer)
});

onBeforeUnmount(() => {
  document.removeEventListener('pointermove', handleThumbMove);
  document.removeEventListener('pointerup', handleThumbUp);
});



const handleThumbStart = (e) => {
  e.preventDefault();
  if (!thumbDrag) {
    thumbDrag = true
    disx.value = e.pageX - thumb.value.offsetLeft;
    disy.value = e.pageY - thumb.value.offsetTop;
    
    document.addEventListener('pointermove', handleThumbMove);
    document.addEventListener('pointerup', handleThumbUp);
  }
};

const handleTrackStart = (e) => {
  // console.log(`handleTrackStart-1:${modelValue.value}`)
  if(!thumbDrag){
    thumbDrag = true
  
    // console.log(`left_steped = Math.floor(${e.offsetX}/${step_px.value})*${step_px.value}`)
    const left_steped = Math.floor(e.offsetX/step_px.value)*step_px.value
    // console.log(`left_steped:${left_steped}`)
    // console.log('slider width:',sliderContainer)
    const left = Math.min(Math.max(left_steped, 0), sliderContainer.value.clientWidth);

    // runnable.value.style.width = `${left}px`;
    // thumb.value.style.left = `${left}px`;
    // console.log(`handleTrackStart-2:${modelValue.value}`)
    // console.log(`Math.ceil(${props.min} + ${left}/${step_px.value})*${props.step};`)
    modelValue.value = Math.ceil(props.min + left/step_px.value)*props.step;
    // console.log(`handleTrackStart-3:${modelValue.value}`)
    leftValue.value = left
    emit('update:modelValue', modelValue.value)

    disx.value = e.pageX - thumb.value.offsetLeft;
    disy.value = e.pageY - thumb.value.offsetTop;


    document.addEventListener('pointermove', handleThumbMove);
    document.addEventListener('pointerup', handleThumbUp);
  }
};

const handleThumbMove = (e) => {
  // console.log('slider width:',sliderContainer.value)
  e.preventDefault();
  if (thumbDrag) {
    if (props.vertical) {
      const top = Math.min(Math.max(e.pageY - disy.value, 0), sliderContainer.value.clientHeight);
      runnable.value.style.height = `${top}px`;
      thumb.value.style.top = `${top}px`;
    } else {
      const left_steped = Math.floor((e.pageX - disx.value)/step_px.value)*step_px.value
      const left = Math.min(Math.max(left_steped, 0), sliderContainer.value.clientWidth);
      
      // runnable.value.style.width = `${left}px`;
      // thumb.value.style.left = `${left}px`;
      leftValue.value = left
      modelValue.value = Math.ceil(props.min + left/step_px.value)*props.step;
      emit('update:modelValue', modelValue.value)
    }
  }
};

const handleThumbUp = () => {
  thumbDrag = false;
  document.removeEventListener('pointermove', handleThumbMove);
  document.removeEventListener('pointerup', handleThumbUp);
};


</script>

<style scoped>
.log {
  position: absolute;
  width: 50px;
  left: -50px;
}
/*容器*/
.au-slider-container {
  margin: 0!important;
  position: relative;
  background-color: transparent;
  width: 100%;
  height: 30px;
}

/*轨道*/
.au-slider-track-box {
  height: 100%;
  
}
.au-slider-track {
  position: absolute;
  height: 6px;
  border-radius: 3px;
  width: 100%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: var(--layout-bgc);
  box-shadow: var(--inset-boxShadow-gray);
  overflow: hidden;
}
.au-slider-runnable-track {
  position: absolute;
  height: 100%;
  background-color: #ffc848;
  box-shadow: var(--inset-boxShadow-yellow);
  width: 0;
  border-radius: 3px;
  left: 0;
}
/*滑块*/
.au-slider-thumb {
  width: 20px;
  height: 20px;
  position: absolute;
  left: 0px;
  top: 50%;
  border-radius: 50%;
  transform: translate(-50%,-50%);
  background-color: var(--handle-color);
  box-shadow: var(--outset-boxShadow-gray);
  touch-action: none;
  cursor: pointer;
}

.au-slider-container:hover .au-slider-thumb{
  background-color: #fff;
}
</style>
