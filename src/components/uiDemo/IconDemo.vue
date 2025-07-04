<template>
	<h1>Icon 图标</h1>
	<div class="component-demo">
		<div class="component-demo_view">
			<div class="component-demo_view_title">
				icon
			</div>
			<div class="component-demo_view_content">
				<au-icon :name="icon_name" :size="config.size" :color="config.color" />
			</div>
		</div>
		<div class="component-demo_config">
			<div class="component-demo_config_title">
				<icon-wrapper name="RiLightbulbFill" size="16" color="#ffc848"/>
				配置
			</div>
			<div class="component-demo_config_content">
				<label><span>图标：</span><input type="text" v-model="config.name"/></label>
				<label><span>大小：</span><input type="text" v-model="config.size"/></label>
				<label><span>颜色：</span><input type="color" v-model="config.color"/></label>
			</div>
		</div>
		<div v-show="false" class="component-demo_code">
			这里需要代码高亮样式，晚点再说
		</div>
	</div>
	<h3>全部图标<span style="font-size: 16px;margin-left: 0.5rem;color: var(--main-color);">{{count}}</span></h3>
	<div class="component-demo" style="flex-direction: column">
		<div class="show-all-icons">
			<au-button 
				variant="text" 
				v-for="icon in iconList" 
				:key="icon" 
				class="show-icon"
				@click="config.name=icon">
				<div class="icon-info">
					<au-icon :name="icon" size="40px"/>
					<div class="icon-info_name">
						{{icon.replace(/^Ri|Line$/g, '').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}}
					</div>
				</div>
			</au-button>
		</div>
		<div >
			<au-pagination v-model="curPage" :totalPages="totalPages"/>
		</div>
	</div>
</template>

<script setup>
import {ref, computed} from 'vue'
import * as RemixIcons from '@remixicon/vue'

const allList = Object.keys(RemixIcons).filter(iconName => !iconName.endsWith('Fill'));
const count = allList.length
const pageSize = 100
const totalPages = ref(Math.ceil(count / pageSize))
const curPage = ref(1)

const iconList = computed(()=>{
	const startIndex = (curPage.value - 1) * pageSize
	const endIndex = Math.min(startIndex + pageSize, count)

	return allList.slice(startIndex, endIndex)
})

const config = ref({
	name:"RiBitCoinFill",
	size:"50",
	color:"#ffc848"
})

const icon_name = computed(()=>{return config.value.name})

</script>

<style scoped>
.show-all-icons{
	width: 100%;
	display: flex;
	flex-wrap: wrap;
	padding: 20px 14px;
}

.show-icon{
	flex: 16%;
	flex-grow: 0;
	flex-shrink: 0;
	align-items: normal;
}

.icon-info{
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 20px;
	gap: 14px;
	font-size: 14px;
}

.icon-info .icon-info_name{
	width: 100%;
	word-break: break-all;
	text-align: center;
	overflow: hidden;
	text-overflow: ellipsis; /* 超出显示省略号 */
	display: -webkit-box;
	-webkit-line-clamp: 2; /* 限制两行 */
	-webkit-box-orient: vertical;
}



</style>