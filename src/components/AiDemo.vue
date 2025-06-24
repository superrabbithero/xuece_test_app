<template>
	<div class="au-grid container left">
		<div class="rows">
			<div class="cols s12">
				<label>API-KEY:
					<input type="text" placeholder="请输入api-key" v-model="api_key" />
				</label>
			</div>
			<div class="cols s12">
				图片风格:
				<div v-for="(style_item,index) in style_ref_url_list" :key="index" class="style_ref">
					<img :src="`${style_item}?x-oss-process=image/resize,m_lfit,h_200`"/>
					<input type="radio" v-model="style_ref_url" :value="style_item">
				</div>
			</div>
			<div class="cols s12">
				上传图片:
				<au-file-input style="width: 400px;" v-model="img_file"/>{{img_file?.name}}
			</div>
			<div class="cols s12">
				<au-button value="开始生成" @click="do_image_generation()"/>
			</div>
			<div class="cols s12">
				{{task_id}}:{{task_output}}
				<au-button value="刷新" @click="refresh_status()"/>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, onMounted } from "vue"
// import { useOssStore } from '@/stores/ossStore';
import baiLian from "@/api/endpoints/bailian"

// const ossStore = useOssStore();

const api_key = ref("")
const style_ref_url_list = ref(["https://oss.superrabbithero.xyz/image_generation/style_ref_urls/20250610152045.jpg"])
const style_ref_url = ref(style_ref_url_list.value[0])
const img_file = ref(null)
const task_output = ref()
const task_id = ref(null)

onMounted(()=>{
	task_id.value = localStorage.getItem("generation-task-id")
})

const refresh_status = async () => {
	if(task_id.value){
		const rst = await baiLian.get_task(task_id.value)
		task_output.value = rst?.data?.output
	}
}

const do_image_generation = async () => {
	// if(!img_file.value) return

	// const uploadResult = await ossStore.MultiUpload(img_file.value, 'image_generation/my_imgs/');

	// const urls = uploadResult.map(item => `https://superrabbithero-appmanage.oss-cn-beijing.aliyuncs.com/${item.data?.key}`);

	if(task_output.value?.task_status && (task_output.value?.task_status!="FAILED" || task_output.value?.task_status!="UNKNOWN")){
		return
	}

	const data = {
		"data":{
			"model": "wanx-style-repaint-v1",
			"input": {
				"image_url": `https://oss.superrabbithero.xyz/test/image_generation/my_imgs/1749543176653.jpg`,
				"style_index": -1,
				"style_ref_url": `${style_ref_url.value}`
			}
		},
		"api_key":`${api_key.value}`
	}

	const rst = await baiLian.image_generation(data)

	console.log(rst)

	task_output.value = rst?.data?.output

	task_id.value = task_output.value.task_id

	localStorage.setItem("generation-task-id", task_id.value)

}

</script>

<style scoped>
.style_ref {
	width: 150px;
	height: 150px;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	align-items: center;
}
</style>