<template>
    <div :class="{'au-button':true,'only-text':!iconName}">
        <icon-wrapper class="button-icon" v-if="iconName"  :name="iconName" :size="size == 'small' ? 20:24" />
        <div class="button-value">{{ value }}</div>
    </div>
</template>

<script setup>
import {defineProps} from 'vue';

defineProps({

    value:{
        type:String,
        default:''
    },

    iconName:{
        type:String,
        default:''
    },
})

</script>

<style scoped>
.au-button{
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 8px 16px 8px 12px;
    box-sizing: border-box;
    border-radius: 12px;
    border:var(--box-border);
    background-color: var(--box-bgc);
    gap: 8px;
    overflow: hidden;
    transition: 0.3s;
    user-select: none;
}

.au-button:active {
    border: 1px solid #ffb60a;
    background-color: #ffb60a;
    color:#fff;
}

.au-button:hover{
    border: 1px solid var(--main-color);
}

.au-button.fill {
    border: 1px solid var(--main-color);
    background-color: var(--main-color);
    color: #fff;
}

.au-button.fill > * {
    filter: drop-shadow(2px 2px 10px #977310);
}



.au-button.disabled {
    opacity: 0.3;       /* 降低透明度 */
    cursor: not-allowed; /* 鼠标显示禁用图标 */
    pointer-events: none; /* 阻止鼠标事件（部分浏览器支持） */
}

.au-button.fill:hover {
    border: 1px solid #ffb60a;
    background-color: #ffb60a;
}

.au-button.small{
    border-radius: 8px;
    padding:6px 12px 6px 8px;
    gap: 4px
}

.au-button.large{
    border-radius: 12px;
    padding:14px 24px 14px 20px;
    gap: 8px
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


</style>