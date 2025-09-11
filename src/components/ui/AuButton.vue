<template>
    <div :class="buttonStyle" @click="rippleEffect" ref="button">
        <au-icon class="button-icon" v-if="iconName"  :name="iconName" :size="size == 'small' ? 20:24" />
        <div v-if="value && value != ''" class="button-value">{{ value }}</div>
        <div v-else class="button-slot">
            <slot></slot>
        </div>
        <au-icon v-if="isLoading" name="RiLoader5Line" class="ani-circle" :size="size == 'small' ? 20:24" />
    </div>
</template>

<script setup>
import {defineProps, computed, ref} from 'vue';

const props = defineProps({

    value:{
        type:String,
        default:''
    },

    iconName:{
        type:String,
        default:''
    },

    block:{
        type:Boolean,
        default:false
    },

    shape:{
        type:String,
        default:"rounded-rectangle"
    },

    size:{
        type:String,
        default:"medium"
    },

    disabled:{
        type:Boolean,
        default:false
    },

    variant:{
        type:String,
        default:"outline"
    },

    isLoading:{
        type:Boolean,
        default:false
    }

})

const button = ref(null)

const buttonStyle = computed(()=>{
    return [{
        'au-button':true,
        'only-text':!props.iconName,
        'block':props.block,
        'disabled':props.disabled,
        'isLoading':props.isLoading
    },
    props.shape,
    props.size,
    props.variant]
})

const rippleEffect = (e) => {
    // 创建波纹元素

    const ripple = document.createElement('span');
    ripple.classList.add('ripple-effect');

    // 定位到点击位置
    const rect = button.value.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left - 10}px`;
    ripple.style.top = `${e.clientY - rect.top - 10}px`;

    button.value.appendChild(ripple);

    // 动画结束后移除元素
    ripple.addEventListener('animationend', () => ripple.remove());
}

</script>

<style scoped>
.au-button{
    cursor: pointer;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    overflow: hidden;
    transition: 0.3s;
    user-select: none;
    justify-content: center;
    position: relative;
}
/*variant*/
.au-button.outline{
    border:var(--box-border);
    background-color: var(--box-bgc);
}

.au-button.dashed{
    border:var(--box-border);
    background-color: var(--box-bgc);
    border-style: dashed;
}

.au-button.text{
    border:var(--box-border);
    border-color: #0000;
}


/*size*/
.au-button.small{
/*    height: 32px;*/
    padding: 6px 12px 6px 8px;
    font-size: 14px;
    border-radius: 4px;
    gap: 4px
}

.au-button.medium{
/*    height:40px;*/
    padding: 8px 16px 8px 12px;
    font-size: 16px;
    border-radius: 6px;
    gap:8px;
}

.au-button.large{
/*    height:48px;*/
    padding: 14px 24px 14px 20px;
    font-size: 18px;
    border-radius: 8px;
    gap: 8px
}

/*shape-rectangle*/
.au-button.block {
    width: 100%;
}

.au-button.rectangle{
    border-radius: 2px;
}

/*square*/
.au-button.square{
    padding: 0;
    overflow: unset;
    overflow: hidden;
}

.au-button.square.small{
    width: 32px;
}

.au-button.square.medium{
    width: 40px;
}

.au-button.square.large{
    width: 48px;
}
/*round*/
.au-button.round.small{
    border-radius:16px
}

.au-button.round.medium{
    border-radius:20px
}

.au-button.round.large{
    border-radius:24px
}
/*circle*/
.au-button.circle.small{
    width: 32px;
    height: 32px;
    padding: 0;
    border-radius:50%
}

.au-button.circle.medium{
    width: 40px;
    height:40px;
    padding: 0;
    border-radius:50%
}

.au-button.circle.large{
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius:50%
}


.au-button.outline:hover{
    border: 1px solid var(--main-color);
}

.au-button.dashed:hover{
    border: 1px solid var(--main-color);
    border-style: dashed;
}

.au-button.filled {
    border: 1px solid var(--main-color);
    background-color: var(--main-color);
    color: #fff;
}

.au-button.filled > * {
    filter: drop-shadow(2px 2px 10px #977310);
}



.au-button.disabled {
    opacity: 0.3;       /* 降低透明度 */
    cursor: not-allowed; /* 鼠标显示禁用图标 */
    pointer-events: none; /* 阻止鼠标事件（部分浏览器支持） */
}

.au-button.isLoading {
    cursor: not-allowed; 
    pointer-events: none; 
}

.au-button.filled:hover{
    border: 1px solid #ffb60a;
    background-color: #ffb60a;
    color: #fff;
}

.au-button.text:hover{
    background-color: #8882;;
}



.au-button.small .button-value,.au-button.small .button-icon {
    height: 20px;
    font-size: 0.9rem;
    line-height: 20px;
}

.au-button.large .button-value,.au-button.large .button-icon {
    /* height: 20px; */
    font-size: 1.1rem;
    /* line-height: 20px; */
}

.button-value, .button-icon {
    height: 24px;
    font-size: 1rem;
    line-height: 24px;
}

.au-button.only-text{
    padding-left: 20px;
    padding-right: 20px;
}



.button-slot:empty {
    display: none;
}

.ani-circle {
    animation: loading 1.5s infinite;
}



/* 动画效果 */
@keyframes loading {
  0% {
    transform: rotate(-45deg);
  }
  100% {
    transform: rotate(315deg);
  }
}


</style>