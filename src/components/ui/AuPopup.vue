<template>
    <div class="popup-container" ref="popup" @pointerenter="handleHoverStart" @pointerleave="handleHoverEnd">
        <transition name="popup-fade">
            <div :class="['popup-box',placement]" v-if="visible">
                <div :class="['popup',{'show_arrow':showArrow}]">{{ message }}</div>
                <div class="popup-arrow" v-if="showArrow"></div>
            </div>
        </transition>
        <div 
            @pointerdown="handleHoverDown"
            @pointerup="handleHoverUp">
            <slot></slot>
        </div>
    </div>
</template>

<script setup>
import {defineProps, ref} from 'vue';

const props = defineProps({
    message:{
        type:String,
        default:''
    },
    trigger:{
        type:String,
        default:'hover'
    },
    showArrow:{
        type:Boolean,
        default:true
    },
    placement:{
        type:String,
        default:"top"
    }
})

const popup = ref(null)

const visible = ref(false)

const doClicking = ref(false)

const handleHoverStart = () => {
    if(props.trigger == 'hover') visible.value = true;
};

const handleHoverEnd = () => {
    if(props.trigger == 'hover') visible.value = false;
};

const handleHoverDown = () => {
    if(props.trigger == 'click'){
        doClicking.value = true
    }
}

const handleHoverUp = () => {
    if(props.trigger == 'click' && doClicking.value){
        visible.value = !visible.value;
        document.addEventListener('pointerdown', closePop)
    }
}



const closePop = (e) => {

  // const popDm = document.getElementById('menuicon') // 替换原来的 this.$refs.menu
  if(!popup.value?.contains(e.target)) {
    visible.value = false
    document.removeEventListener('pointerdown', closePop)
  }
}

</script>

<style scoped>
.popup-container {
    position: relative;
}

.popup-box {
    position: absolute;
    width:100%;
/*    filter: drop-shadow(2px 2px 3px rgba(0, 0, 0, 0.2));*/
    filter: drop-shadow(var(--filter-drop-shadow));
    display: flex;
}

.popup-arrow {
    position: absolute;
    background: var(--box-bgc);
    width: 8px;
    height: 8px;

}

.popup {
    width: fit-content;
    white-space: nowrap;
    font-size: 14px;
    background: var(--box-bgc);
    border-radius: 5px;
    padding: 4px 8px;
    line-height: 22px;
}



.popup-fade-enter-active,
.popup-fade-leave-active {
  transition: all 0.3s ease;
}
.popup-fade-enter-from,
.popup-fade-leave-to {
  opacity: 0;
}
/*top*/
.popup-box.top {
    left: 0;
    transform: translateY(-100%);
    justify-content: center;
}



/*top-left*/
.popup-box.top-left {
    left: 0;
    transform: translateY(-100%);
    justify-content: start;
}


/*top-right*/
.popup-box.top-right {
    left: 0;
    transform: translateY(-100%);
    justify-content: end;
}



.popup-box.top .popup,
.popup-box.top-left .popup,
.popup-box.top-right .popup{
    margin-bottom: 6px;
}

.popup-box.top .popup.show_arrow,
.popup-box.top-left .popup.show_arrow,
.popup-box.top-right .popup.show_arrow{
    margin-bottom: 12px!important;
}
.popup-box.top .popup-arrow,
.popup-box.top-left .popup-arrow,
.popup-box.top-right .popup-arrow {
    transform: rotate(45deg) translate(-50%, -8px);
    left: calc(50% - 5px);
    bottom:0;

}

/*bottom*/
.popup-box.bottom {
    justify-content: center;
}

/*bottom-left*/
.popup-box.bottom-left {
    justify-content: start;
}

/*bottom-right*/
.popup-box.bottom-right {
    justify-content: end;
}

.popup-box.bottom,
.popup-box.bottom-left,
.popup-box.bottom-right {
    bottom: 0;
    transform: translateY(100%);
}

.popup-box.bottom .popup
.popup-box.bottom-left .popup
.popup-box.bottom-right .popup{
    margin-top: 6px;
}

.bottom .popup.show_arrow,
.bottom-left .popup.show_arrow,
.bottom-right .popup.show_arrow{
    margin-top: 12px!important;
}

.bottom .popup-arrow,
.bottom-left .popup-arrow,
.bottom-right .popup-arrow {
    transform: rotate(45deg) translate(50%, 8px);
    left: calc(50% - 5px);
    top:0;

}

/*left*/
.popup-box.left {
    justify-content: end;
}

/*left-top*/
.popup-box.left-top {
    justify-content: end;
}

/*left-bottom*/
.popup-box.left-bottom {
    justify-content: end;
}

.popup-box.left,
.popup-box.left-top,
.popup-box.left-bottom {
    left: 0;
    transform: translateX(-100%);
}

.popup-box.left .popup
.popup-box.left-top .popup
.popup-box.left-bottom .popup{
    margin-top: 6px;
}

.left .popup.show_arrow,
.left-top .popup.show_arrow,
.left-bottom .popup.show_arrow{
    margin-top: 12px!important;
}

.left .popup-arrow,
.left-top .popup-arrow,
.left-bottom .popup-arrow {
    transform: rotate(45deg) translate(50%, 8px);
    left: calc(50% - 5px);
    top:0;

}

</style>