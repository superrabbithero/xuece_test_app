<template>
    <div class="form-group">
        <div v-for="(item,index) in formObj" :key="index" class="form-item">
            <div class="form-item-label"><span v-if="item.required">*</span>{{item.name}}：</div>
            <div class="form-item-content">
                <textarea v-if="item.type == 'text'" v-model="item.value"/>
                <au-file-input type='image' v-if="item.type == 'image'" accept="image/*" v-model="item.value"/>
            </div>
        </div>
    </div>
</template>


<script setup>
import {ref,defineProps, defineEmits, watch} from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
  modelValue:{
    type:Array,
    required: true
  }
})

const formObj = ref(props.modelValue)

watch(formObj, ()=>{
    emit('update:modelValue',formObj)
})
</script>

<style scoped>
.form-group {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.form-item {
    width: 100%;
    display: flex;
}

.form-item-label{
    font-size: 0.9rem;
    width: 96px;
    text-align: right;
    height: 32px;
    line-height: 32px;
}

.form-item-content {
    flex-grow: 1;
}

.form-item-content > input,textarea {
    width: calc(100% - 32px);
}

.form-item-label > span {
    color: #ff5252;
    margin-right:5px;
    font-size: 1.2rem;
    line-height: 5px;
    height: 5px;
}

</style>