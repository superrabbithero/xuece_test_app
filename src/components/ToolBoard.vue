<template>
	<div class="board-container">
		<au-painter position="bottom"></au-painter>
		<div class="tool-bar board-menu">
			<div class="item" @click="goBack">
				<au-icon name="RiArrowLeftSLine" size="28"/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
	router.go(-1);
}

</script>

<style scoped>

.board-container{
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.tool-bar {
	position: fixed;
	display: flex;
    border-radius: 14px;
    border: var(--box-border);
    background: var(--box-bgc);
    padding: 4px;
    box-shadow: var(--box-shadow);
    touch-action: none;
    gap: 4px;
}

.tool-bar .item{
	width: 30px;
    height: 30px;
    
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.board-menu {
	left: 20px;
	top: 20px;
	z-index: 890;
}
</style>