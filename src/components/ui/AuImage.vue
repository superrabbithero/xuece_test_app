<template>
    <div class="show-result">
        <div class="action-cover" @click.stop>
            <div class="action-cover-delete">
                <slot></slot>
            </div>
            <au-icon class="action-cover-eye" name="RiEyeLine" size="16" @click="showImageView"/>
        </div>
        <img :src="src"/>
    </div>
</template>

<script setup>
import { defineProps, inject } from 'vue'

const imageView = inject('imageView');

const props = defineProps({
  src: {
    type: String,
    required:true
  }
})

const showImageView = () => {
	imageView(props.src)
}
</script>

<style scoped>
	
.show-result{
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  position: relative;
  border-radius: 4px;
}

.show-result .action-cover{
  width: 100%;
  height: 100%;
  position: absolute;
  color: #eee;
  background-color: #0006;
  opacity: 0;
  transition: all 0.3s ease;
}

.action-cover-delete, .action-cover-eye{
  position: absolute;
  opacity: 0.5;
  transition: opacity 0.3s ease;
}

.action-cover-delete{
  right:4px;
  top:4px; 
}

.action-cover-eye{
  left: 50%;
  top: 50%;
  transform: translate(-50%,-50%);
}

.show-result .action-cover:hover{
  opacity: 1;
}

.action-cover-delete:hover{
  opacity: 1;
}

.action-cover-eye:hover{
  opacity: 1;
}

.show-result img{
  height: 100%;
  max-width: unset;
}
</style>