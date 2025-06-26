<template>
	<h1>Popup 弹出层</h1>
	<div class="component-demo">
		<div class="component-demo_view">
			<div class="component-demo_view_title">
				popup
			</div>
			<div class="component-demo_view_content">
				<au-popup 
				:message="popup_config.content" 
				:trigger="popup_config.triggerList[popup_config.triggerIndex]"
				:showArrow="popup_config.showArrow"
				:placement="popup_config.placementList[popup_config.placementIndex]"
				>
					<au-button class="small" value="popup"/>
				</au-popup>
			</div>
		</div>
		<div class="component-demo_config">
			<div class="component-demo_config_title">
				<icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
				配置
			</div>
			<div class="component-demo_config_content">
				<label><span>内容：</span><input type="text" v-model="popup_config.content"/></label>
				<label>
					<span>触发:</span>
					<au-select :dataList="popup_config.triggerList" v-model="popup_config.triggerIndex"/>
				</label>
				<label>
					<span>箭头：</span>
					<au-switch size="small" v-model="popup_config.showArrow"/>
				</label>
				<label>
					<span>位置:</span>
					<au-select :dataList="popup_config.placementList" v-model="popup_config.placementIndex"/>
				</label>
				{{popup_config}}
			</div>
		</div>
		<div v-show="false" class="component-demo_code">
			这里需要代码高亮样式，晚点再说
		</div>
	</div>
</template>

<script setup>
import {ref} from 'vue'

// const trigger = computed(()=>{
// 	return
// })

const popup_config = ref({
	content:"这是一条pop内容",
	triggerList:["hover","click"],
	triggerIndex:0,
	showArrow:true,
	placementList:[
		"top",
		"top-left",
		"top-right",
		"bottom",
		"bottom-left",
		"bottom-right",
		"left",
		"left-top",
		"left-bottom"
		],
	placementIndex:0
})

</script>