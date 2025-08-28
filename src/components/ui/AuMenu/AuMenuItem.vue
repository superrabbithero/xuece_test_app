<template>
	<div :class="['au-menu-item-container cols s12',{'active':active,'disable':disable}]">
		<slot></slot>
	</div>
</template>


<script setup>
import {defineProps} from 'vue';

defineProps({
    active:{
        type: Boolean,
        default: false
    },
    disable:{
        type: Boolean,
        default: false
    }
})
</script>

<style scoped>
.au-menu-item-container {
	cursor: pointer;
	padding: 0.3rem 1rem;
	border-radius: 4px;
	font-family: 'auto';
	gap:0.5rem;
	align-items: center;
}

.au-menu-item-container:hover {
	background-color: #8882;
}

.au-menu-item-container.active {
	color:var(--main-color);
}

.au-menu-item-container.disable {
	opacity: 0.5;
	pointer-events: none;
}

</style>