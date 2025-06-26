<template>
	<h1>Message 全局提示</h1>
	<div class="component-demo">
		<div class="component-demo_view">
			<div class="component-demo_view_title">
				message
			</div>
			<div class="component-demo_view_content">
				<au-message :message="message_config.msg" 
				:type="message_type" 
				:demo="true"
				:closeBtn="message_config.closeBtn"  
				@click="do_message()"/>
			</div>
		</div>
		<div class="component-demo_config">
			<div class="component-demo_config_title">
				<icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
				配置
			</div>
			<div class="component-demo_config_content">
				<label><span>内容：</span><input type="text" v-model="message_config.msg"/></label>
				<label><span>类型：</span>
					<au-select :dataList="message_config.typeList" v-model="message_config.typeIndex"/>
				</label>
				<label><span>关闭：</span>
					<au-switch size="small" v-model="message_config.closeBtn"/>
				</label>
				<label><span>定时：</span>
					<input type="text" v-model="message_config.duration"/>ms
				</label>
				<!-- {{message_config}} -->
			</div>
		</div>
		<div v-show="false" class="component-demo_code">
			这里需要代码高亮样式，晚点再说
		</div>
	</div>
</template>

<script setup>
import {ref, inject, computed} from 'vue'

const message = inject('message')

const message_config = ref({
	typeList:['info','warning','success','error'],
	msg:"这是一条message",
	typeIndex:0,
	closeBtn:false,
	duration:3000
})

const message_type = computed(() => {
	return message_config.value.typeList[message_config.value.typeIndex]
})

const do_message = () => {
	console.log("father")
	message(message_config.value.msg,{
		type:message_type.value,
		duration:message_config.value.duration,
		closeBtn:message_config.value.closeBtn
	})
}
</script>