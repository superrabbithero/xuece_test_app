<template>
	<div class="au-layout">
		<div class="au-aside">
			<div class="au-aside-group" v-for="group in menuItems" :key="group">
				<span class="au-aside-group_title">{{group.name}}</span>
				<div class="au-aside-group_children">
					<span :class="{'au-aside-group_item':true,'active':currentComponent == item.component}" v-for="item in group.list" :key="item"
					@click="currentComponent = item.component">
					{{item.label}}</span>
				</div>
			</div>
		</div>
		<div class="au-content">
			<component :is="components[currentComponent]"></component>
		</div>
	</div>
</template>

<script setup>
import {ref,shallowRef} from "vue"
import MessageDemo from "@/components/uiDemo/AuMessageDemo"
import PopupDemo from "@/components/uiDemo/PopupDemo"
import PaginationDemo from "@/components/uiDemo/PaginationDemo"
import ButtonDemo from "@/components/uiDemo/ButtonDemo"
import IconDemo from "@/components/uiDemo/IconDemo"
import PainterDemo from "@/components/uiDemo/PainterDemo"

const components = shallowRef({
  MessageDemo,
  PopupDemo,
  PaginationDemo,
  ButtonDemo,
  IconDemo,
  PainterDemo
})

const currentComponent = ref('PainterDemo')

const menuItems = [
	{
		name:"基础",
		list:[
			{ label: 'Button 按钮', component: 'ButtonDemo' },
			{ label: 'Icon 图标', component: 'IconDemo' }
		]
	},
	{
		name:"导航",
		list:[
			{ label: 'Pagination 分页', component: 'PaginationDemo' }
		]
	},
	{
		name:"组件",
		list:[
			{ label: 'Painter 涂鸦', component: 'PainterDemo' }
		]
	},
	{
		name:"消息提醒",
		list:[
			{ label: 'Alert 警告提醒', component: 'AlertDemo' },
			{ label: 'Dialog 对话框', component: 'DialogDemo' },
			{ label: 'Drawer 抽屉', component: 'DrawerDemo' },
			{ label: 'Message 全局提示', component: 'MessageDemo' },
			{ label: 'Popup 弹出层', component: 'PopupDemo' }
		]
	},

]

</script>

<style>
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
	height: 40px;
	display: flex;
	align-items: center;
	
}

.component-demo_config_content > label > *{
	width: 100%;
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