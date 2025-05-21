<template>
  <!-- 确保 QRCodeVue 被正确使用 -->
  <div class="au-layout container" style="padding:1rem">
    <div v-if="packageInfo" class="rows center">
      <div class="cols center s12">
        <img :src="packageInfo.icon_url" alt="应用图标" class="app-icon" />
      </div>
      <div class="cols center s12">
        <h3>{{appTypeList[parseInt(packageInfo.appname)]}}</h3>
      </div>
      <div class="cols center s12">
        <icon-wrapper class="table-do"  :name="systemInfo.iconName" size="20"/>
        <div style="font-size: 14px;margin-left: 5px">{{systemInfo.content}}</div>
      </div>
      <div class="cols center s12">
          <au-qrcode class="qrcode" :qrValue="qrCodeValue" :size="100" level="Q" :logo="{src:packageInfo.icon_url,width:32,height:32,margin:0}"/>
        
      </div>
      <div class="cols center s12">
        <input type="button" value="安装" class="fill download-btn" @click="installer()" />
      </div>
    </div>
    <div v-if="packageInfo" class="rows space-between" style="width:calc(100% - 100px);max-width: 500px;">
      <div class="cols s12 "><h4>安装包信息</h4></div>
      <div class="cols xs12 sm12 md5 space-between info-item">
        <div>大小</div>
        <div>{{ (packageInfo.size / 1024 / 1024).toFixed(2) }} MB</div>
      </div>
      <div class="cols xs12 sm12 md5 space-between info-item">
        <div>更新时间</div>
        <div>{{formattedTime}}</div>
      </div>
      <div class="cols xs12 sm12 md5 space-between info-item">
        <div>版本</div>
        <div>{{packageInfo.version}}</div>
      </div>
      <div class="cols xs12 sm12 md5 space-between info-item">
        <div>包名</div>
        <div>{{packageInfo.package_name}}</div>
      </div>
      <div class="cols s12 gap"><h4>描述</h4></div>
      <div class="cols s12">
        <div>{{packageInfo.comment?packageInfo.comment:'-'}}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, toRef, computed } from 'vue';

import { usePackageStore } from '@/stores/packageStore';
// import { useOssStore } from '@/stores/ossStore';

const packageStore = usePackageStore()

const appTypeList = ref(['学测学生端','学测教师端','学测家长端','学测运营客户端','学测识别客户端','优课优学'])


const props = defineProps({
  id: String // 自动接收路由参数
})

const idRef = toRef(props, 'id')


const qrCodeValue = ref(`${process.env.VUE_APP_BASE_URL}#/AppManage/app-detail/${idRef.value}`); // 动态生成二维码内容
// console.log(qrCodeValue.value)

const packageInfo = ref(null)



const systemInfo = computed(() => {
  if(packageInfo.value.system == 'ios'){
    return {
      iconName : 'RiAppleLine',
      content : '适用于苹果设备'
    }
  }else if(packageInfo.value.system == 'android' || packageInfo.value.system == 'pad'){
    return {
      iconName : 'RiAndroidLine',
      content : '适用于Android设备'
    }
  }else if(packageInfo.value.system == 'win'){
    return {
      iconName : 'RiWindowsLine',
      content : '适用于win系统pc设备'
    }
  }else{
    return {
      iconName : 'RiQuestionLine',
      content : '适用于鸿蒙设备'
    }
  }
})

const formattedTime = computed(() => {
  const createTime = new Date(packageInfo.value.create_time); // 转换为 Date 对象
  const now = new Date(); // 当前时间
  
  // 计算时间差（毫秒）
  const diffInMs = now - createTime;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // 如果是今天
  if (diffInDays === 0) {
    // 返回时:分
    const hours = String(createTime.getHours()).padStart(2, '0');
    const minutes = String(createTime.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  
  // 如果是1天前
  if (diffInDays === 1) {
    return '1天前';
  }
  
  // 如果是2天前
  if (diffInDays === 2) {
    return '2天前';
  }
  
  // 超过2天，返回原始日期（可选）
  return packageInfo.value.create_time.split('T')[0]; // 返回 "2025-04-27"
});

const installer = () => {
  // 判断是否为 iOS 设备
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); // 兼容 M1 iPad 模式

  if (isIOS && packageInfo.value.plist_url) {
    // iOS 设备：通过 itms-services 协议触发安装
    window.location.href = packageInfo.value.plist_url;
  } else {
    // 非 iOS 设备：创建隐藏链接强制下载 IPA
    const a = document.createElement('a');
    a.href = packageInfo.value.download_url;
    a.download = packageInfo.value.name || 'app.ipa'; // 设置默认文件名
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // 可选：添加下载失败的回退逻辑
    setTimeout(() => {
      if (!a.visited) {
        window.open(packageInfo.value.download_url, '_blank');
      }
    }, 500);
  }
};

onMounted(() => {
  packageStore.getPackage(idRef.value).then( pkg => {
    packageInfo.value = pkg
  })
})


</script>

<style scoped>
  .download-btn {
    width: 120px;
    border-radius: 16px;
  }
  .app-icon {
    width: 90px;
    height: 90px;
    border-radius: 20px;
  }
  .qrcode {
    margin: 1rem 0;
    transition: 0.3s ease-in-out;
  }

  .qrcode:hover {
    box-shadow: var(--box-shadow);
    transform: scale(1.1);
    
  }

  .gap {
    margin-top: 3rem;
  }

  .info-item {
    line-height: 2rem;
    border-bottom: var(--box-border);
    font-size: 15px;
  }
</style>