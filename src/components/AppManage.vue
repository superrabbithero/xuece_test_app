<template>
  <div class="au-grid">
    <div class="rows space-between">
      <div class="cols filter-bar">
        <au-select class="filter-select" label="类型" :dataList="appTypeList" @change="changeAppType"></au-select>
        <!-- <au-select class="filter-select" :dataList="versionList" @change="changeVersion"></au-select> -->
        
        <au-select class="filter-select" label="设备"  :dataList="systemList" @change="changeSystem"></au-select>
        <au-select class="filter-select" label="环境" :dataList="isDebugList" @change="changeIsDebugSelect"></au-select>
      </div>
      <div class="cols">
        <au-button v-if="isLogin" class="small fill" iconName="RiAddLine" value="添加应用" @click="modal_show.fileUpload_show = true"/>
        <au-button v-else title="需登陆后才能上传和编辑文件" class="small fill" @click="toPage('/login')" value="登 录"/>
      </div>
    </div>
    <div class="rows table-content">
      <div class="cols s12">
        <table class="table">
          <thead>
            <tr>
              <th>文件名称</th>
              <th>包名</th>
              <th>大小</th>
              <th>上传时间</th>
              <th>描述</th>
              <th>调试</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>   
            <tr v-show="packageStore.isLoading">更新中请稍候</tr>           
            <tr class="table-tr" v-for="(pkg, index) in packageStore.packages" :key="pkg.id">

              <td style="display: flex;gap:10px;">
                <img :src="pkg.icon?.url || getPkgUrl(pkg.appname)" alt="应用图标" class="table-icon" />
                <div class="td-content">
                  <div class="halfline" :title="pkg.name">{{pkg.name}}</div>
                  <div class="halfline" style="color:#8e8e8e;">版本号：{{ pkg.version }}  {{ pkg.ar ? "架构：" + pkg.ar : "" }}</div>
                </div>
              </td>
              <td style="max-width: 100px;" class="text-truncate" :title="pkg.package_name">{{ pkg.package_name || '-' }}</td>
              <td class="text-truncate">{{ (pkg.size / 1024 / 1024).toFixed(2) }} MB</td>
              <td class="text-truncate">{{ formatDateTime(pkg.create_time)}}</td>
              <td style="min-width: 100px">
                <div v-if="pkg.comment" class="commentcol" :title="pkg.comment" >{{ pkg.comment }}</div>
                <div v-else class="commentcol" >-</div>
              </td>
              <td style="width:4rem">
                <input type="checkbox" v-model="pkg.is_debug" @click.prevent="openChangeIsDebugConfirm(index,pkg)"/>
              </td>
              <td style="min-width: 150px">
                <icon-wrapper class="table-do"  name="RiDownloadLine" size="20" @click="downloadFile(pkg.oss_key, pkg.name)"/>
                <!-- <a :href="'../static/app/' + pkg.packagename" download class="mybtn">下载</a> -->
                <icon-wrapper v-if="pkg.icon?.url" @click="openQrCode(pkg)" class="table-do"  name="RiQrCodeFill" size="20" />
                <!-- <a href="#"  class="mybtn" >二维码</a> -->
                <icon-wrapper v-if="isLogin" @click="openEditor(index)" class="table-do"  name="RiDraftLine" size="20" />
                <icon-wrapper v-if="isLogin" @click="openConfirmModal(`确认删除“${pkg.name}”的信息?`,() => deletePackage(pkg.id))" class="table-do"  name="RiDeleteBinLine" theme="outline" :strokeWidth='3' size="20" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="rows center">
      <div class="cols">
        <au-pagination v-if="packageStore.pagination.pages && packageStore.pagination.pages != 0" :totalPages="packageStore.pagination.pages" v-model="packageStore.curFilter.page"></au-pagination>
      </div>
    </div>
  </div> 
  <my-modal v-model="modal_show.fileUpload_show" :modeless="false">
    <!-- 自动填涂 -->
    <div class="au-grid">
      <div class="rows" style="gap: 10px">
        <div class="cols s12">
          <au-file-input accept=".ipa, .apk, .exe" dragable v-model="file"></au-file-input>
        </div>
        <div class="cols s12">
          <div v-if="isParsing || packageInfo" class="file-info au-grid">
            <div v-if="isParsing">
              正在解析...
            </div>
            <div v-else-if="packageInfo.packageName" class="rows gutter-l">
              <div class="package-icon cols s3">
                <img :src="packageInfo.icon" alt="应用图标" style="width:80px;border-radius: 8px;" />
              </div>
              <div class="package-info cols s9">
                <div class="file-name" :title="packageInfo.fileName">
                  {{packageInfo.fileName}}
                </div>
                <div class="package-name">
                  {{packageInfo.packageName}}
                </div>
                <div class="package-size">
                  {{ (packageInfo.size / 1024 / 1024).toFixed(2) }} MB
                </div>
                <div class="package-other-info">
                  <div>{{packageInfo.version}} ({{packageInfo.ar}})</div>
                  <icon-wrapper v-if="progress <= 0" class="table-do"  name="RiDeleteBin2Line" size="16" @click="clearFile"/>
                </div>
              </div>
            </div>
            <div v-else class="rows gutter-l">
              <div class="package-icon cols s3">
                <img :src="pePackageIconUrl" alt="应用图标" style="width:80px;border-radius: 8px;" />
              </div>
              <div class="package-info cols s9" style="height:auto">
                <div class="file-name" :title="packageInfo.fileName">
                  {{packageInfo.fileName}}
                </div>
                <div class="appname" >
                  <input type="radio" id="packageName1" name="appname" value="3" v-model="packageInfo.appName">
                  <label for="packageName1">识别</label>
                  <input type="radio" id="packageName2" name="appname" value="4" v-model="packageInfo.appName" >
                  <label for="packageName2">运营</label>
                  <input type="radio" id="packageName3" name="appname" value="5" v-model="packageInfo.appName">
                  <label for="packageName3">优课</label>
                </div>
                <div class="package-size">
                  {{ (packageInfo.size / 1024 / 1024).toFixed(2) }} MB
                </div>
                <div class="package-other-info">
                  <label>版本号: <input type="text" placeholder="请输入版本号" v-model="packageInfo.version" /></label>
                  <icon-wrapper v-if="ossStore.progress <= 0" class="table-do"  name="RiDeleteBin2Line" @click="clearFile"/>
                </div>
              </div>
            </div>
            <div class="progress-box" v-if="ossStore.progress > 0">
              <icon-wrapper class="rotating-element" v-if="ossStore.progress < 100" name="RiLoader2Line" size="16"/>
              <icon-wrapper v-else name="RiCheckboxCircleLine" size="16"/>
              <div class="progress-bar">
                <div class="progressing" :style="{width:ossStore.progress + '%'}"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="cols s12 end">
          <au-button class="small" value="取消" style="margin-right:5px" @click="cancelUpload()"/>
          <au-button class="small fill" value="上传" @click="uploadFile"/>
        </div>
      </div>
    </div>
  </my-modal>
  <my-modal v-model="modal_show.editor_show" :modeless="false">
    <div class="au-grid">
      <div class="rows" style="gap: 10px">
        <div class="cols s12">
          <label>文件名:</label>
          <input class="editor_name" type="text" v-model="curPackage.name"/>
        </div>
        <div class="cols s12">
          <label>描述:</label>
        </div>
        <div class="cols s12">
          <textarea class="eidtor_comment" rows="5" type="text" v-model="curPackage.comment"></textarea>
        </div>
        <div class="cols s12 end">
          <au-button value="取 消" class="small" style="margin-right:5px" @click="modal_show.editor_show = false"/>
          <!-- <input type="button" :class="{'fill':true,'unable':!curPkgIsUpdate}" @click="updatePackageInfo()" value="确认" > -->
          <!-- <au-button type="button" class="small disabled" size="small" :disabled="!curPkgIsUpdate" @click="updatePackageInfo()" value="确认" /> -->
          <au-button :class="{'fill small':true, 'disabled':!curPkgIsUpdate}" @click="updatePackageInfo()" value="确 认" />
        </div>
      </div>
    </div>
  </my-modal>
  <my-modal width="280" v-model="modal_show.qrCode_show">
    <div class="au-grid">
      <div class="rows center">
        <div class="cols s12 center">
          <div class="qr_modal_info">
              <img class="table-icon left" :src="curPackage.icon.url" alt="应用图标" />
              <div class="right">
                <div class="halfline" style="height:24px;line-height: 24px">{{curPackage.name}}</div>
                <div class="halfline" style="height:24px;line-height: 24px;color:#8e8e8e;font-size: 12px">版本号：{{ curPackage.version }}</div>
              </div>
          </div>
        </div>
        <div class="cols s12 center">
          <au-qrcode :qrValue="qrValue" :size="150" level="Q" :logo="{src:curPackage.icon.url,width:40,height:40,margin:0}"/>
        </div>
        <div class="cols s12 center" style="color:#8e8e8e;font-size: 12px;margin-top: 1rem;">
          扫描上面二维码，到移动端下载
        </div>
        <!-- <div class="cols">{{qrValue}}</div> -->
      </div>
    </div>
  </my-modal>
  <my-modal width="280" v-model="confirmData.show" :confirmTitle="confirmData.title" :onFunction="confirmData.function" :modeless="false">
  </my-modal>
</template>

<script setup>
import { ref, onMounted, watch, computed, inject} from 'vue';
import { usePackageStore } from '@/stores/packageStore';
import { useOssStore } from '@/stores/ossStore';
// import { ossMultipartUpload } from '@/api/ossApi';
import { parseAPK } from '@/assets/js/utils'
import router from '@/router'

// const curPage = ref(1)

const toast = inject('toast')

const packageStore = usePackageStore()

const ossStore = useOssStore()


const appTypeList = ref(['学生端','教师端','家长端','识别','运营下载','优课优学'])
const appNameInfo = {
  'com.uni.stuxueceapp':{appName:0,system:'ios'},
  'cn.unisolution.onlineexamstu':{appName:0, system:'android'},
  'com.uni.xuecestupad':{appName:0, system:'pad'},
  'com.uni.tchxueceapp':{appName:1, system:'ios'},
  'cn.unisolution.onlineexam':{appName:1, system:'android'},
  'com.uni.xuecetchpad':{appName:1, system:'pad'},
  'com.uni.parentxueceapp':{appName:2, system:'ios'},
  'cn.uni.xuece.parentapp':{appName:2, system:'android'}
}
const systemList = ref(['全部','ios','android','鸿蒙','Win','平板'])
// const versionList = ref(['全部'])
const isDebugList = ref(['全部','调试包','正式包'])
// var packageStore.curFilter = {appname: '0',system:null,page:1,per_page:10}
// const packages = ref([])
const modal_show = ref({fileUpload_show:false,editor_show:false,qrCode_show:false})

const file = ref(null)

const progress = ref(0)
// const uploadResult = ref(null)
// const error = ref(null)
// const isUploading = ref(false)
const packageInfo = ref(null)
const isParsing = ref(false)

//待编辑的package
const curPackage = ref(null)

//二次确认结构
const confirmData = ref({show:false,title:null,function:null})

const curPkgIsUpdate = computed(()=>{
  // return curPackage.value.name != "" && curPackage.value && ((curPackage.value.name != curPackage.value.origin.name ) || curPackage.value.comment != curPackage.value.origin.comment)
  const pkg = packageStore.packages[curPackage.value.index]
  return curPackage.value.name != "" && curPackage.value && ((curPackage.value.name != pkg.name ) || curPackage.value.comment != pkg.comment)
})

const toPage = (path) => {
  // router.push(path)
  router.replace({
    path: path,
    query: { 
      redirect: router.currentRoute.value.fullPath // 携带当前路径用于登录后回跳
    }
  })
}

const openConfirmModal = (title, func) => {
  confirmData.value = {
    title,
    function: func, // 直接保存函数
    show: true
  };
}

const pePackageIconUrl = computed(()=>{
  if(packageInfo.value.appName){
    let appName = packageInfo.value.appName
    if(appName == 3){
      return require("@/assets/imgs/icons/scan.png")
    }else if(appName == 4){
      return require("@/assets/imgs/icons/download.png")
    }else if(appName == 5){
      return require("@/assets/imgs/icons/youke.png")
    }else{
      return null
    }
  }else{
    return null
  }
})

const getPkgUrl = computed(() => {
  return (appName) => {
    // console.log(appName)
    if(appName == 3){
      return require("@/assets/imgs/icons/scan.png")
    }else if(appName == 4){
      return require("@/assets/imgs/icons/download.png")
    }else if(appName == 5){
      return require("@/assets/imgs/icons/youke.png")
    }else{
      return null
    }
  }
  
})

const qrValue = ref("")
const isLogin = ref(false)


onMounted(() => {
  // console.log(process.env.VUE_APP_BASE_URL)
  packageStore.fetchPackages().then().catch(err => {console.log(err)})
  if(localStorage.getItem('token')){
    isLogin.value = true
  }
  
});



watch(
  file,
  ()=>{
    parsePackage()
    // console.log('file变化:', oldFile, '→', newFile);
  }
)

watch(
  packageStore.curFilter,
  ()=>{
    packageStore.fetchPackages().then().catch(err => {console.log(err)})
    // console.log('file变化:', oldFile, '→', newFile);
  }
)


const parsePackage = () => {
  if (file.value){
    if(file.value.name.endsWith('.apk') || file.value.name.endsWith('.ipa')){
      isParsing.value = true
      parseAPK(file.value).then(rst => {
        isParsing.value = false
        console.log(rst)
        packageInfo.value = {
          fileName : rst.name,
          packageName : rst.packageName,
          size : rst.size,
          version : rst.versionName,
          ar : rst.ar,
          icon: rst.icon
        }
        // console.log(packageInfo)
      })
    }else if(file.value.name.endsWith('.exe')){
      // console.log(file.value)
      packageInfo.value = {
        fileName : file.value.name,
        appName : 3, //默认识别客户端
        size : file.value.size,
        version : null,
        ar : null,
        icon: null,
      }
    }else{
      toast('仅支持上传.apk、.ipa、.exe文件', { type: 'error' })
    }
  }else{
    // toast('没有找到文件', { type: 'error' })
  }
}

const changeAppType = (index) => {
  console.log(packageStore.curFilter)
  packageStore.curFilter.appname = `${index}`
  systemList.value = ['全部', ...Object.values(appNameInfo)
        .filter(item => item.appName === index)
        .map(item => item.system)];
  packageStore.fetchPackages()
}

// const changeVersion = (index) => {
//   console.log(`changeVersion(${index}),${versionList.value[index]}`)
// }

const changeIsDebugSelect = (index) => {
  if(index == 0){
    packageStore.curFilter.is_debug = null
  }else if(index == 1){
    packageStore.curFilter.is_debug = 1
  }else if(index == 2){
    packageStore.curFilter.is_debug = 0
  }
  packageStore.fetchPackages()
}

const changeSystem = (index) => {
  packageStore.curFilter.system = index == 0 ? null : systemList.value[index]
  packageStore.fetchPackages()
}

const uploadFile = () => {
  // console.log(file.value.name)
  if(file.value == null){
        file.value = null;
        console.log(`error:请上传文件`)
        // console.log(typeof toast )
        toast('请上传文件', { type: 'info' })
        return
    }

  // app检查文件类型
  if (!isIpaOrApkOrPeFile(file.value)) {
      file.value = null;
      toast('请选择正确的ipa或apk文件', { type: 'error' })
      return
  }
  // 判断包名是否正确
  if(packageInfo.value.packageName && !appNameInfo[packageInfo.value.packageName]){
    toast('不存在的包名，请检查', { type: 'error' })
    return
  }
    

  const packageInfoJson = {
    'appname': packageInfo.value.appName || appNameInfo[packageInfo.value.packageName].appName,
    'version': packageInfo.value.version,
    'name': packageInfo.value.fileName,
    'size': packageInfo.value.size,
    'system': appNameInfo[packageInfo.value.packageName]?.system || 'win',
    'create_time': null,
    'comment': '',
    'ar': packageInfo.value.ar || 'x86',
    'status': 0,
    'package_name': packageInfo.value.packageName || '',
    'oss_key' : null,
    'icon' : packageInfo.value.icon
  }
  // ossStore.getStsToken().then(() => {

  //   ossUpload().then(() => {
  //     packageInfoJson.oss_key = uploadResult.value.key
  //     packageInfoJson.create_time = Date.now()
      
  //     packageStore.createPackage(packageInfoJson).then(() => {
  //       packageStore.fetchPackages()
  //       clearFile()
  //       modal_show.value.fileUpload_show = false
  //     }).catch(error => {
  //       console.error('上传失败', error);
  //     })
  //   }).catch((err) => {
  //     console.log('上传文件到oss失败',err)
  //   })
  // }).catch( err => {
  //   console.log('获取stsToken失败',err)
  // })
  
  ossStore.MultiUpload(file.value).then((rst) => {
    console.log(rst)
    packageInfoJson.oss_key = rst[0].data.key
    console.log(packageInfoJson.oss_key)
    packageInfoJson.create_time = Date.now()
    
    packageStore.createPackage(packageInfoJson).then(() => {
      packageStore.fetchPackages()
      clearFile()
      modal_show.value.fileUpload_show = false
    }).catch(error => {
      console.error('上传失败', error);
    })
  }).catch( err => {
    console.error('文件上传失败',err)
  })
  
}

const deletePackage = async (id) => {
  packageStore.deletePackage(id).then(() => {
    
    packageStore.fetchPackages()
  }).catch(error => {
    console.error('删除失败', error);
  })
}

// const ossUpload = async () => {
//   // console.log('ossUpload')

//   if (!file.value) return;

//   isUploading.value = true;
//   error.value = null;

//   try {
//     //添加进度回调（可选）
//     const options = {
//       progress: (p) => {
//         progress.value = Math.round(p * 100);
//       }
//     };

//     const path = process.env.NODE_ENV === 'development' ? 'test/packages/' : 'packages/'

//     uploadResult.value = await ossMultipartUpload(
//       file.value, 
//       path, 
//       ossStore.stsToken,
//       options
//     );
//   } catch (err) {
//     error.value = `上传失败: ${err.message}`;
//   } finally {
//     isUploading.value = false;
//   }
// }

const isIpaOrApkOrPeFile = (file) => {
  // 判断文件类型是否为IPA或APK
  const allowedExtensions = [".ipa", ".apk", ".exe"];
  const fileExtension = file.name.substr(file.name.lastIndexOf(".")).toLowerCase();
  return allowedExtensions.includes(fileExtension);
}

 const clearFile = () => {
  packageInfo.value = null;
  isParsing.value = false;
  ossStore.progress = 0
  file.value = null
 }

const cancelUpload = () => {
  modal_show.value.fileUpload_show=false;
  clearFile()
}

const openEditor = ( index ) => {
  // curPackage.value = {id:pkg.id, name:pkg.name,comment:pkg.comment,origin:{name:pkg.name,comment:pkg.comment}}
  const pkg = packageStore.packages[index]
  curPackage.value = {id:pkg.id, name:pkg.name,comment:pkg.comment,index:index}
  modal_show.value.editor_show = true;
  // console.log(modal_show.value.editor_show)
}

const formatDateTime = (dateStr) => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${month}月${day}日 ${hours}:${minutes}:${seconds}`;
}

const updatePackageInfo = () => {

  const pkg = packageStore.packages[curPackage.value.index]

  const updateData = {
    name:curPackage.value.name == pkg.name ? null:curPackage.value.name, 
    comment:curPackage.value.comment == pkg.comment ? null:curPackage.value.comment
  }

  packageStore.updatePackage(curPackage.value.index, curPackage.value.id, updateData).then(()=>{
    modal_show.value.editor_show = false
  }).catch(error => {
    console.error('修改失败',error)
  })

}

const openChangeIsDebugConfirm = (index, pkg) => {
  if(isLogin.value){
    curPackage.value = pkg
    openConfirmModal(`确认将“${pkg.name}”变更为${pkg.is_debug? '正式包':'调试包'}?`, ()=>changeIsDebug(index))
  }
}

const changeIsDebug = (index) => {
  // console.log(index)
  // packageStore.packages[index].is_debug = !packageStore.packages[index].is_debug
  // packageStore.packages[index]

  packageStore
    .updatePackage(index, curPackage.value.id, {
      is_debug:!curPackage.value.is_debug
    })
    .then(()=>{
      modal_show.value.editor_show = false
      console.log(packageStore.packages)
    })
    .catch(error => {
      console.error('修改失败',error)
    })

}

const downloadFile = (oss_key, fileName) => {
  ossStore.getDownloadUrl(oss_key).then(rst=>{
    // console.log(rst.url)
    const a = document.createElement('a');
    a.href = rst.url;
    a.download = fileName; // 设置下载文件名（默认 app.apk）
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  })
}

const openQrCode = (pkg) => {
  curPackage.value = pkg
  modal_show.value.qrCode_show = true
  qrValue.value = `${process.env.VUE_APP_BASE_URL}#/AppManage/app-detail/${curPackage.value.id}`
}


    
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .filter-select {
    margin-right: 0.8rem;
    width: 100px;
    
  }
  .table-content {
    background: var(--box-bgc);
    padding: 10px;
    border-radius: 10px;
    border: var(--box-border);
    overflow: auto;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
    min-width: 600px;
  }
 
  .table-fixed {
    position: absolute;
    right: 0;
    background: var(--box-bgc);
    width:200px;
    z-index: 9;
  }

  /*表格*/
  table thead tr th{
    font-size: 15px;
    border-bottom: var(--box-border);
    margin: 0;
  }


  table tbody td {
    height: 50px;
  /*  line-height: 50px;*/
    vertical-align: middle!important;
    border: none;
    text-align: left;
  }

  .commentcol {
    display:-webkit-box;
    max-width: 200px;
    line-height: 25px;
    overflow: hidden;
    text-overflow:ellipsis;
    -webkit-line-clamp: 2;
    -webkit-box-orient:vertical;
  }

  thead>tr>th{
    padding: 10px 16px;
  }


  tbody>tr>td {
      padding: 10px 16px;
      color: #606266 !important;
      border-bottom: var(--box-border-dash);
      font-size: 14px;
  }

  .halfline {
    height: 25px;
    line-height: 25px;
    white-space: nowrap; 
    overflow: hidden;         /* 隐藏超出部分 */
    text-overflow: ellipsis;  /* 超出时显示省略号 */
  }

  /*.table>:not(caption)>*>*{
    background-color: transparent!important;
  }*/
  /*修改table-hover颜色*/
  .table-tr:hover { 
    background-color: var(--card-hightlight);
  }

  .table-do {
    margin-right: 8px;
  }

  .table-do:hover {
    color: #ffc848;
  }

  .file-info {
    width: 100%;
/*    background: var(--content-bgc);*/
    padding: 10px;
    border-radius: 10px;
    border: var(--box-border);
  }

  .package-info {
    flex-direction: column;
    align-items: normal!important;
    font-size: 0.9rem;
    height: 80px; /* 需要固定高度 */
    justify-content: space-between; /* 子元素均匀分布 */
  }

  .file-name {
    font-size: 1rem;
    font-weight: bold;
    width: 100%;
    white-space: nowrap;      /* 禁止换行 */
    overflow: hidden;         /* 隐藏超出部分 */
    text-overflow: ellipsis;  /* 超出时显示省略号 */
  }

  .package-name {
    font-weight: 100;
  }

  .package-other-info {
    display: flex;
    justify-content: space-between;
    align-items: center
  }

  .progress-box {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    overflow: hidden;
    position: relative;
    border-radius: 3px;
    border: var(--box-border);
  }

  .progressing {
    position: absolute;
    left: 0;
    top: 0px;
    height: 10px;
    width: 0%;
    background-color: #ea9c65;
  }
  
  .table-icon {
    width: 50px;
    border-radius: 8px;
    /* box-shadow: var(--box-shadow); */
    border: var(--box-border);
    flex-shrink: 0;
  }

  /* 定义旋转动画 */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 应用动画到元素 */
.rotating-element {
  animation: spin 3s linear infinite;
}
.eidtor_comment, .editor_name{
  width: 100%;
}

label {
  white-space: nowrap;
  margin-right: 10px;
}

.qr_modal_info {
  width: 80%;
  display: flex;
  gap:10px;
  font-size: 14px;
  padding-bottom: 1rem;
  border-bottom: var(--box-border);
  margin-bottom: 1.8rem;
}

.qr_modal_info .left{
  width:48px;
  height: 48px;
  
}

.qr_modal_info .right{
  flex-grow: 1; /* 撑满剩余空间 */
  min-width: 0; /* 防止内容溢出（可选） */
}

.td-content{
  flex-grow: 1; /* 撑满剩余空间 */
  min-width: 0;
}

.appname {
  gap: 3px;
  display: flex;
  align-items: center;
}

.appname input{
  width: 16px;
  height: 16px;
}

.appname label{
  height: 16px;
  line-height: 16px;
}

</style>
