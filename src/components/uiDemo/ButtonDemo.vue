<template>
	<h1>Button 按钮</h1>
	<div class="component-demo">
		<div class="component-demo_view">
			<div class="component-demo_view_title">
				button
			</div>
			<div class="component-demo_view_content">
				<au-button 
					:block="config.block"
					:disabled="config.disabled"
					:loading="config.loading"
					:shape="config.shape"
					:size="config.size"
					:value="config.value"
					:iconName="config.iconName"
					:variant="config.variant"
					:isLoading="config.isLoading"/>
			</div>
		</div>
		<div class="component-demo_config">
			<div class="component-demo_config_title">
				<icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
				配置
			</div>
			<div class="component-demo_config_content">
				<label>
					<au-popup 
					message="内容" 
					:showArrow="false"
					placement="top-left"
					>
						<span>内容：</span>
					</au-popup>
					
					<input type="text" v-model="config.value"/></label>
				<label><span>图标：</span><input type="text" v-model="config.iconName" placeholder="空则不展示图标"/></label>
				<label><span>块：</span><au-switch size="small" v-model="config.block"/></label>
				<label><span>禁止：</span><au-switch size="small" v-model="config.disabled"/></label>
				<label><span>加载：</span><au-switch size="small" v-model="config.isLoading"/></label>
				<label><span>形状：</span><au-select :dataList="shapeList" v-model="shapeIndex"/></label>
				<label><span>尺寸：</span><au-select :dataList="sizeList" v-model="sizeIndex"/></label>
				<label><span>变体：</span><au-select :dataList="variantList" v-model="variantIndex"/></label>
				<!-- {{config}} -->
			</div>
		</div>
		<div v-show="false" class="component-demo_code">
			这里需要代码高亮样式，晚点再说
		</div>
	</div>
</template>

<script setup>
import {ref,computed} from 'vue'

const shapeList = ["rounded-rectangle","rectangle","square","round","circle"]
const shapeIndex = ref(0)
const sizeList = ["small","medium","large"]
const sizeIndex = ref(1)
const variantList = ["filled","outline","dashed","text"]
const variantIndex = ref(1)

const config = ref({
	block:false,
	disabled:false,
	loading:false,
	iconName:"",
	isLoading:false,
	value:"Button 按钮",
	shape:computed(()=>{return shapeList[shapeIndex.value]}),
	size:computed(()=>{return sizeList[sizeIndex.value]}),
	variant:computed(()=>{return variantList[variantIndex.value]})
})

</script>