<template>

    <div v-if="imgList.length > 0" class="image-viewer-container au-grid space-between">
        <div class="image-viewer-header rows center">
            <au-button class='out-icon' iconName="RiCloseLine" shape="circle" size="small" @click="outFromImageViewer"/>
        </div>
        <!-- 这里可以放置你的图片展示逻辑 -->
        <div v-for="(img, index) in imgList" :key="index" class="rows center">
            <img :src="img" alt="图片" :style="{maxWidth: 'unset',height:`calc(80% * ${scale/100})`,transform: `rotate(${degCount}deg) rotateY(${flip}deg)`}">
        </div>
        <div class="image-viewer-footer rows center">
            <div class="image-viewer-tools">
                <au-button iconName="RiFlipHorizontalLine" variant="text" shape="circle" size="small" @click="flipImage"/>
                <au-button iconName="RiAnticlockwiseLine" variant="text" shape="circle" size="small" @click="changeDeg(-90)"/>
                <au-button iconName="RiClockwiseLine" variant="text" shape="circle" size="small" @click="changeDeg(90)"/>
                <au-button iconName="RiZoomOutLine" variant="text" shape="circle" size="small" @click="changeScale(-10)"/>
                <div class="scale-span">{{scale}}%</div>
                <au-button iconName="RiZoomInLine" variant="text" shape="circle" size="small" @click="changeScale(+10)"/>
                <au-button iconName="RiDownloadCloudLine" variant="text" shape="circle" size="small" @click="download"/>
            </div>
        </div>
    </div>
</template>

<script setup>
import { defineProps, computed, inject, ref } from 'vue'

const imageView = inject('imageView');

const scale = ref(100)

const degCount = ref(0)

const flip = ref(0)

const props = defineProps({
  imgData: {
    type: [String, Array],
    default: () => []
  }
})

const curIndex = ref(0)

const imgList = computed(() => {
  // 处理传入的imgData，统一转换为数组格式
  console.log(props.imgData)

  if (!props.imgData) return []
  
  if (typeof props.imgData === 'string') {
    // 如果是字符串，转为单元素数组
    return props.imgData.trim() ? [props.imgData] : []
  } else if (Array.isArray(props.imgData)) {
    // 如果是数组，直接返回（过滤掉非字符串元素）
    return props.imgData.filter(item => typeof item === 'string' && item.trim())
  }
  
  // 其他情况返回空数组
  return []
})

const changeScale = (step) => {
	const newV = scale.value + step
	if(newV >= 50 && newV < 200)
		scale.value = newV
}

const changeDeg = (step) => {
	degCount.value = (degCount.value + step)%360
}

const flipImage = () => {
	flip.value = flip.value ? 0 : 180
}

const outFromImageViewer = () => {
	imageView(null)
}

const download = ()=>{
	downloadImage(imgList.value[curIndex.value],null)
}

/**
 * 下载图片方法（支持跨域/重命名/错误处理）
 * @param {string} url - 图片URL
 * @param {string} [filename] - 自定义文件名（可选）
 * @returns {Promise<void>}
 */
const downloadImage = async (url, filename) => {
  try {
    // 1. 验证URL有效性
    if (!url || !/^https?:\/\//i.test(url)) {
      throw new Error('无效的图片URL');
    }

    // 2. 发起跨域请求（需要后端支持CORS）
    const response = await fetch(url, {
      mode: 'cors', // 强制CORS模式
      credentials: 'same-origin' // 根据实际情况调整
    });

    if (!response.ok) {
      throw new Error(`下载失败: ${response.status} ${response.statusText}`);
    }

    // 3. 获取Blob数据
    const blob = await response.blob();
    if (!blob.type.startsWith('image/')) {
      throw new Error('下载内容不是有效图片');
    }

    // 4. 自动生成文件名逻辑
    const finalFilename = filename || 
      (url.match(/\/([^?]+)\.[a-z]{3,4}(?:$|\?)/i)?.[1] || `image_${Date.now()}`) + 
      `.${blob.type.split('/')[1] || 'jpg'}`;

    // 5. 创建下载链接
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = finalFilename;
    a.style.display = 'none';

    // 6. 触发下载并清理
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    console.error('图片下载失败:', error);
    // 可根据需要添加UI提示
    alert(`下载失败: ${error.message}`);
  }
};
</script>

<style scoped>
.image-viewer-container {
	position: fixed;
	inset:0;
	z-index: 9999;
	background-color: #0004;
	backdrop-filter: blur(5px);

}

.image-viewer-header,.image-viewer-footer {

	width: 100%;
	height: 5rem;
/*	background-color: red;*/
}

.image-viewer-tools{
	position: absolute;
	z-index: 99;
    display: flex;
    gap: 4px;
    padding: 5px 6px;
    background: var(--box-bgc);
    border: var(--box-border);
    border-radius: 22px;
    box-shadow: var(--box-shadow);

}

.out-icon {
	position: absolute;
	z-index: 99;
}

.scale-span {
	display: flex;
	align-items: center;
	justify-content: center;
	/*height: 32px;
	line-height: 32px;*/
	font-size: 0.9rem;
	width: 50px;
}


</style>