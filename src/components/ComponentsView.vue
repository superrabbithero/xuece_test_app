<template>
	<div class="au-layout">
		<div class="au-aside">
			<div class="au-aside-group">
				<span class="au-aside-group_title">消息提醒</span>
				<div class="au-aside-group_children">
					<span class="au-aside-group_item">Alert 警告提醒</span>
					<span class="au-aside-group_item">Dialog 对话框</span>
					<span class="au-aside-group_item">Drawer 抽屉</span>
					<span class="au-aside-group_item">Message 全局提示</span>
				</div>
			</div>
		</div>
		<div class="au-content">
			<h1 @click="do_message()">Message 全局提示</h1>
			<div class="component-demo">
				<div class="component-demo_view">
					<div class="component-demo_view_title">
						message
					</div>
					<div class="component-demo_view_content">
						<au-message :message="message_config.msg" 
						:type="message_type" 
						:demo="true"  
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
					</div>
				</div>
				<div v-show="false" class="component-demo_code">
					这里需要代码高亮样式，晚点再说
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import {ref, inject, computed} from 'vue'

const message = inject('message')

const message_config = ref({
	typeList:['info','warning','success','error'],
	msg:"这是一条message",
	typeIndex:0
})

const message_type = computed(() => {
	return message_config.value.typeList[message_config.value.typeIndex]
})

const do_message = () => {
	console.log("father")
	message(message_config.value.msg,{type:message_type.value})
}

</script>

<style scoped>
.component-demo {
	width: 90%;
	border-radius: 5px;
	border:var(--box-border);
	min-height: 200px;
	background-color: var(--box-bgc);
	display: flex;
	font-size: 15px;
	font-weight: 400;
	font-family: auto;
}

.component-demo_view{
	flex-grow: 1;
}

.component-demo_view,.component-demo_config{
	display: flex;
    flex-direction: column;
	/* overflow: hidden; */
}

.component-demo_view_content{
	display: flex;
	height: 100%;
	align-items: center;
    justify-content: center;
}

.component-demo_config_content{
	display: flex;
	flex-direction: column;
	padding:12px 14px
}

.component-demo_config_content > label{
	display: flex;
	align-items: center;
	
}

.component-demo_config_content > label > *{
	width: 100%;
	flex-shrink: 1;
	flex-grow: 1;
}

.component-demo_config_content > label > span{
	width: 3rem;
	flex-shrink: 0;
}

.component-demo_config{
	width: 220px;
	flex-shrink: 0;
	box-sizing: border-box;
	border-left: var(--box-border);
}

.component-demo_view_title,.component-demo_config_title {
	border-bottom: var(--box-border);
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 0 14px;
	height: 50px;
	line-height: 50px;
	box-sizing: border-box;
}
</style>