<template>
  <div class="overlay" v-show="modelValue && !modeless"></div>
  <transition name="modal-slide">
    <div class="modal" :style="{width:modal_width}" ref="modal" v-if="modelValue">     
      <div :class="{'modal-bar':true,'draged':dragable}" @mousedown="dragdown($event)"  @mouseup="dragup">
        <div class="modal-close" @click="closeModal">
        </div>
      </div>
      <div class="modal-slot">
        <div v-if="confirmTitle" class="au-grid">
          <div class="rows center">
            <div class="cols s11 confirm-title">
              {{confirmTitle}}
            </div>
          </div>
          <div class="rows center">
            <div class="cols s12 space-around">
              <au-button size="small" value="取消"  @click="closeModal"/>
              <au-button variant="filled" size="small" value="确认" @click="onConfirm"/>
            </div>
          </div>
        </div>
        <slot v-else></slot>
      </div>
    </div>
</transition>
</template>

<script setup>
import { ref, defineProps, defineEmits,computed } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue:{
    type:Boolean,
    required: true
  },
  dragable: {
    type: Boolean,
    default: false
  },
  modeless: {
    type: Boolean,
    default: true
  },
  width: {
    type: [Number,String],
    default : 400
  },
  confirmTitle: {
    type: String,
    default: null
  },
  onFunction:{
    type:Function
  }
})

const modal_width = computed(()=>{
  return (typeof props.width === 'number')
  ?  `${props.width}px`
  : props.width
})

// const { modelValue } = toRefs(props);

// const draged = ref(false)
const dragedel = ref(null)
const disx = ref(0)
const disy = ref(0)
const modal = ref(null)

const onConfirm = async () => {
    if(props.confirmTitle){
      await props.onFunction()
    }
    closeModal()
}

// watch(
//   props.modelValue,
//   (newVal)=>{
//     console.log(newVal)
//     if(newVal && !props.modeless){
//       document.body.style.overflow = 'hidden'
//     }else{
//       document.body.style.overflow = 'unset'
//     }
//   }
// )



const dragdown = (e) => {
  if(props.dragable){
    dragedel.value = modal.value
    document.addEventListener('mousemove', dragmove)
    disx.value = e.pageX - dragedel.value.offsetLeft
    disy.value = e.pageY - dragedel.value.offsetTop
  }
}
const dragup = () => {
  dragedel.value = null
  document.removeEventListener('mousemove',dragmove)
}

const dragmove = (e) => {
  // var scrolltop = document.documentElement.scrollTop||document.body.scrollTop;
  if(dragedel.value){
    dragedel.value.style.left = e.pageX - disx.value + 'px';
    dragedel.value.style.top = e.pageY - disy.value + 'px';
  }      
}


const closeModal = () => {
  emit('update:modelValue', false)
}


</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 900;
}

.modal {
  padding-bottom: 10px;
  width:400px;
}

.modal-slide-enter-active, .modal-slide-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.modal-slide-enter-from, .modal-slide-leave-to /* .modal-slide-leave-active in <2.1.8 */ {
  opacity: 0;
  transform: translate(-50%,-50%) translateY(1em);
/*  transform: translateY(1em);*/
}
.modal-slide-enter-to, .modal-slide-leave-from /* .modal-slide-enter-active in <2.1.8 */ {
  opacity: 1;
/*  transform: translate(-50%,-50%);*/
/*  transform: translateY(0);*/
}
.modal-slot{
/*  overflow: hidden;*/
}

@media (max-width: 400px) {
  .modal {
    width:100%!important;
    border-radius: 0;
    bottom: 0;
    top: unset;
    left: 0;
    transform: unset;
    padding-bottom: 10px
  }
  .modal-slot {
    max-height: calc(60vh - 40px);
  }
  .modal-slide-enter-active, .modal-slide-leave-active {
    transition: transform 0.5s;
  }
  .modal-slide-enter-from, .modal-slide-leave-to /* .modal-slide-leave-active in <2.1.8 */ {
    opacity: 0;
    transform: translateY(100%);
    transition: transform 0.5s;
  /*  transform: translateY(1em);*/
  }
  .modal-slide-enter-to, .modal-slide-leave-from /* .modal-slide-enter-active in <2.1.8 */ {
    opacity: 1;
  /*  transform: translate(-50%,-50%);*/
    transition: transform 0.5s;
    transform: translateY(0);
  }
}

.confirm-title {
  padding-bottom: 1rem;
}


</style>