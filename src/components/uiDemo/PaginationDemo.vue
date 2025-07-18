<template>
	<h1>Pagination 分页</h1>
	<div class="component-demo">
		<div class="component-demo_view">
			<div class="component-demo_view_title">
				popup
			</div>
			<div class="component-demo_view_content">
				<au-pagination :key="componentKey" v-model="curPage" :totalPages="Number(totalPages)"/>
			</div>
		</div>
		<div class="component-demo_config">
			<div class="component-demo_config_title">
				<icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
				配置
			</div>
			<div class="component-demo_config_content">
				<label><span>内容：</span><input type="text" v-model="totalPages"/></label>
				<!-- {{popup_config}} -->
			</div>
		</div>
		<div v-show="false" class="component-demo_code">
			这里需要代码高亮样式，晚点再说
		</div>
	</div>
</template>

<script setup>
import {ref, watch} from 'vue'

const totalPages = ref(20)
const curPage = ref(1)

const componentKey = ref(0)

watch(totalPages, ()=>{
	componentKey.value++
})

</script>