<template>
	<div class="au-grid au-menu-container" :style="{width:width}">
		<div class="rows">
			<slot></slot>
		</div>
	</div>
</template>


<script setup>
import {defineProps} from 'vue';

defineProps({
    width:{
        type: String,
        default: 'auto'
    }
})



</script>

<style scoped>
.au-menu-container {
	flex-grow: 0;
	padding: 8px;
	background: var(--box-bgc);
	border: var(--box-border);
	border-radius: 5px;

}

.au-menu-container .rows{
	gap: 2px;
}

</style>