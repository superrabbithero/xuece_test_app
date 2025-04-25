<template>
  <div class="au-layout">
    <div class="rows space-between">
      <div class="cols filter-bar">
        <au-select class="filter-select" :dataList="appTypeList" @change="changeAppType"></au-select>
        <!-- <au-select class="filter-select" :dataList="versionList" @change="changeVersion"></au-select> -->
        
        <au-select class="filter-select" :dataList="systemList" @change="changeSystem"></au-select>
        <au-select class="filter-select" :dataList="arList" @change="changeAr"></au-select>
      </div>
      <div class="cols">
        <input type="button" class="fill" value="添加应用" @click="modal_show.fileUpload_show = true"/>
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
              <!-- <th>是否稳定</th> -->
              <th style="min-width:200px;">操作</th>
            </tr>
          </thead>
          <tbody>                 
            <tr class="table-tr" v-for="pkg in packageStore.packages" :key="pkg.id">
              <td style="display: flex;gap:10px;">
                <img :src="pkg.icon.url" alt="应用图标" class="table-icon" />
                <div>
                  <div class="halfline">{{pkg.name}}</div>
                  <div class="halfline" style="color:#8e8e8e;">版本号：{{ pkg.version }}  {{ pkg.ar ? "架构：" + pkg.ar : "" }}</div>
                </div>
              </td>
              <td>{{ pkg.package_name }}</td>
              <td>{{ (pkg.size / 1024 / 1024).toFixed(2) }} MB</td>
              <td>{{ pkg.create_time}}</td>
              <td>
                <div v-if="pkg.comment" class="commentcol s-hand"  >{{ pkg.comment }}</div>
                <div v-else class="commentcol s-hand" >-</div>
              </td>
              <!-- <td>
                <input type="checkbox">
              </td> -->
              <td>

                
                <icon-wrapper class="table-do"  iconName="Download" theme="filled" :strokeWidth='3' size="20" />
                <!-- <a :href="'../static/app/' + pkg.packagename" download class="mybtn">下载</a> -->
                <icon-wrapper class="table-do"  iconName="TwoDimensionalCode" theme="outline" :strokeWidth='3' size="20" />
                <!-- <a href="#"  class="mybtn" >二维码</a> -->
                <icon-wrapper @click="openEditor(pkg)" class="table-do"  iconName="Editor" theme="outline" :strokeWidth='3' size="20" />
                <icon-wrapper @click="deletePackage(pkg.id)" class="table-do"  iconName="Delete" theme="outline" :strokeWidth='3' size="20" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="rows center">
      <div class="cols">
        <au-pagination v-if="packageStore.pagination.pages && packageStore.pagination.pages != 0" :totalPages="packageStore.pagination.pages"></au-pagination>
      </div>
    </div>
  </div> 
  <my-modal :show="modal_show.fileUpload_show" :modeless="false"  modalKey="fileUpload_show">
    <!-- 自动填涂 -->
    <div class="au-layout">
      <div class="rows" style="gap: 10px">
        <div class="cols s12">
          <au-file-input accept=".ipa, .apk" v-model="file"></au-file-input>
        </div>
        <div class="cols s12">
          <div v-if="isParsing || packageInfo" class="file-info au-layout">
            <div v-if="isParsing">
              正在解析...
            </div>
            <div v-else class="rows gutter-l">
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
                  <icon-wrapper v-if="progress <= 0" class="table-do"  iconName="DeleteOne" theme="outline" :strokeWidth='3' size="16" @click="clearFile"/>
                </div>
              </div>
            </div>
            <div class="progress-box" v-if="progress > 0">
              <icon-wrapper class="rotating-element" v-if="progress < 100" iconName="LoadingOne" theme="outline" :strokeWidth='3' size="16"/>
              <icon-wrapper v-else iconName="CheckOne" theme="outline" :strokeWidth='3' size="16"/>
              <div class="progress-bar">
                <div class="progressing" :style="{width:progress + '%'}"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="cols s12 end">
          <input type="button" value="取消" style="margin-right:5px" @click="cancelUpload()">
          <input type="button" class="fill" value="上传" @click="uploadFile">
        </div>
      </div>
    </div>
  </my-modal>
  <my-modal :show="modal_show.editor_show" :modeless="false"  modalKey="editor_show">{{curPackage}}</my-modal>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch} from 'vue';
import { usePackageStore } from '@/stores/packageStore';
import { useOssStore } from '@/stores/ossStore';
import { ossMultipartUpload } from '@/api/ossApi';
import { parseAPK } from '@/assets/js/utils'
const packageStore = usePackageStore()

const ossStore = useOssStore()

export default {
  setup() {
    const appTypeList = ref(['学生端','教师端','家长端','运营客户端','识别客户端','优课优学'])
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
    const arList = ref(['全部'])
    var filterPram = {appname: '0',system:null,page:1,per_page:10}
    // const packages = ref([])
    const modal_show = ref({fileUpload_show:false,editor_show:false})
    const file = ref(null)

    const progress = ref(0)
    const uploadResult = ref(null)
    const error = ref(null)
    const isUploading = ref(false)
    const packageInfo = ref(null)
    const isParsing = ref(false)

    //待编辑的package
    const curPackage = ref(null)

    onMounted(() => {
      packageStore.fetchPackages(filterPram)
    });

    onBeforeUnmount(() => {

    });

    watch(
      file,
      (newFile, oldFile)=>{
        parsePackage()
        console.log('file变化:', newFile, '→', oldFile);
      }
    )

    const parsePackage = () => {
      if (file.value && (file.value.name.endsWith('.apk') || file.value.name.endsWith('.ipa'))){
        isParsing.value = true
        parseAPK(file.value).then(rst => {
          isParsing.value = false
          packageInfo.value = {
            fileName : rst.name,
            packageName : rst.packageName,
            size : rst.size,
            version : rst.versionName,
            ar : rst.ar,
            icon: rst.icon
          }
          console.log(packageInfo)
        })
      }
    }

    const changeAppType = (index) => {
      filterPram.appname = `${index}`
      systemList.value = ['全部', ...Object.values(appNameInfo)
            .filter(item => item.appName === index)
            .map(item => item.system)];
      packageStore.fetchPackages(filterPram)
    }

    // const changeVersion = (index) => {
    //   console.log(`changeVersion(${index}),${versionList.value[index]}`)
    // }

    const changeAr = (index) => {
      console.log(`changeAr(${index}),${arList.value[index]}`)
    }

    const changeSystem = (index) => {
      filterPram.system = index == 0 ? null : systemList.value[index]
      packageStore.fetchPackages(filterPram)
    }

    const uploadFile = () => {
      // console.log(file.value.name)
      if(file.value == null){
            file.value = null;
            console.log(`error:请上传文件`)
            return
        }

        
      // app检查文件类型
      if (!isIpaOrApkFile(file.value)) {
          file.value = null;
          console.log(`error:请选择正确的ipa或apk文件`)
          return
      }
      // 判断包名是否正确
      if(!appNameInfo[packageInfo.value.packageName]){
        console.log('error:不存在的报名，请检查')
        return
      }
        

      const packageInfoJson = {
        'appname': appNameInfo[packageInfo.value.packageName].appName,
        'version': packageInfo.value.version,
        'name': packageInfo.value.fileName,
        'size': packageInfo.value.size,
        'system': appNameInfo[packageInfo.value.packageName].system,
        'create_time': null,
        'comment': '',
        'ar': packageInfo.value.ar,
        'status': 0,
        'package_name': packageInfo.value.packageName,
        'oss_key' : null,
        'icon' : packageInfo.value.icon
      }
      console.log(packageInfoJson)
      ossStore.getStsToken().then(() => {

        ossUpload().then(() => {
          packageInfoJson.oss_key = uploadResult.value.key
          packageInfoJson.create_time = Date.now()
          
          packageStore.createPackage(packageInfoJson).then(() => {
            packageStore.fetchPackages(filterPram)
            clearFile()
          }).catch(error => {
            console.error('上传失败', error);
          })
        }).catch((err) => {
          console.log('上传文件到oss失败',err)
        })
      }).catch( err => {
        console.log('获取stsToken失败',err)
      })
      
      
    }

    const deletePackage = async (id) => {
      packageStore.deletePackage(id).then(() => {
        
        packageStore.fetchPackages(filterPram)
      }).catch(error => {
        console.error('删除失败', error);
      })
    }

    const ossUpload = async () => {
      // console.log('ossUpload')

      if (!file.value) return;

      isUploading.value = true;
      error.value = null;

      try {
        //添加进度回调（可选）
        const options = {
          progress: (p) => {
            progress.value = Math.round(p * 100);
          }
        };

        uploadResult.value = await ossMultipartUpload(
          file.value, 
          'packages/', 
          ossStore.stsToken,
          options
        );
      } catch (err) {
        error.value = `上传失败: ${err.message}`;
      } finally {
        isUploading.value = false;
      }
    }

    const isIpaOrApkFile = (file) => {
      // 判断文件类型是否为IPA或APK
      const allowedExtensions = [".ipa", ".apk"];
      const fileExtension = file.name.substr(file.name.lastIndexOf(".")).toLowerCase();
      return allowedExtensions.includes(fileExtension);
    }

     const clearFile = () => {
      packageInfo.value = null;
      isParsing.value = false;
      uploadResult.value = null;
      progress.value = 0
      file.value = null
     }

    const cancelUpload = () => {
      modal_show.value.fileUpload_show=false;
      clearFile()
    }

    const openEditor = ( pkg ) => {
      curPackage.value = pkg
      modal_show.value.editor_show=true;
    }


    return {
      appTypeList,arList,systemList,
      changeAppType,changeAr,changeSystem,
      curPackage,
      packageStore,
      modal_show,
      uploadFile,
      file,
      progress,
      uploadResult,
      error,
      isParsing,
      packageInfo,
      cancelUpload,
      clearFile,
      deletePackage,
      openEditor
    };
  }
};
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
  }
  table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
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
    max-width: 140px;
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

  table tbody tr td .halfline {
    height: 25px;
    line-height: 25px;
  }

  .table>:not(caption)>*>*{
    background-color: transparent!important;
  }
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


</style>
