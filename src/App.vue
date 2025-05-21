<template>
  <div class="au-container">
    <div class="au-header header clipdemo" v-if="!$route.meta.headerHidden">
      <!-- <div class="head-list"> -->
        <transition name="fade-slide">
          <div class="menu" v-if="menuisshow" ref="menu">
            <div class="menu-list">
              <div class="menu-list-title">工具</div>
              <div class="menu-item" @click="goto('/buildanswersheet')">
                <icon-wrapper name="RiFilePdfLine" size="19" />
                答题卡生成
              </div>
              <div class="menu-item" @click="goto('/AppManage')">
                <icon-wrapper name="RiApps2AddLine"  size="19" />
                学测应用管理
              </div>
              <div class="menu-item" @click="goto('/AppManage')">
                <icon-wrapper name="RiCommandLine"  size="19" />
                脚本管理
              </div>
              
              <div class="menu-item" >
                <!-- <svg-icon name="roadblock11" /> -->
                待定...
              </div>
            </div>
          </div>
        </transition>
        <div class="head-item"  @click="openmenu" id="menuicon">
          <icon-wrapper name="RiApps2Fill"/>
          <!-- <svg-icon name="menu01"></svg-icon> -->
        </div>
        <div class="head-item home" @click="goto('/')">
          <!-- <svg-icon name="home01"></svg-icon> -->
        </div>
        <div class="head-item"  style="margin-left: auto;">
          <div class="pagetitle">{{$route.meta.title?$route.meta.title:decodeURIComponent($route.path).slice(6)}}</div>
        </div>
        <div class="head-item" @click="changeStyle" style="margin-left: auto;">
          <icon-wrapper name="RiContrast2Line" />
          <!-- <svg-icon name="dark"></svg-icon> -->
        </div>  
      <!-- </div> -->
      
    </div>
    <div class="au-main">
      <div class="header-block" v-if="!$route.meta.headerBlockHidden"></div>
      <router-view @toggle-header="setHeaderVisibility"></router-view>
    </div>
    <div v-if="!$route.meta.footerHidden" class="au-footer footer" >
      <div class="footer-link">
      </div>
      <div class="footer-bar">
        <div>
          <p> ©2023 - 2025 By SuperRabbitHero </p>
          <a href="https://beian.miit.gov.cn" target="_blank">苏ICP备2025178576号-1</a>
        </div>
      </div>
    </div>
</div>
<GlobalToast ref="toastRef"/>
</template>

<script setup>
import { ref, onMounted, onUnmounted, getCurrentInstance, provide } from 'vue'
import { useRouter } from 'vue-router'
import GlobalToast from '@/components/GlobalToast.vue'

const { proxy } = getCurrentInstance()
const router = useRouter()

// 响应式数据
const menuisshow = ref(false)
const isDark = ref(proxy.$constants.DARK) // 使用全局默认值
// const pagetitle = ref('')
const headerShow = ref(true)
const menu = ref(null)

// 将toast方法provide给子组件
const toastRef = ref(null)

const showToast = (msg, option = {}) => {
  toastRef.value?.show(msg,option)
}
// 将方法提供给所有子组件
provide('toast', showToast)

// 生命周期
onMounted(() => {
  document.addEventListener("touchstart", function() {}, false)
  
  if(localStorage.getItem('isDark')) {
    const darkMode = localStorage.getItem('isDark') === 'true'
    isDark.value = darkMode
    proxy.$constants.DARK = darkMode // 同步到全局
  }
  
  if(isDark.value) {
    document.body.classList.add('dark')
  }
  
  console.log(`当前是${process.env.NODE_ENV === 'production' ? '生产' : '开发'}环境`)
})

onUnmounted(() => {
  document.removeEventListener('click', closemenu)
})

// 方法
const setHeaderVisibility = (visible) => {
  headerShow.value = visible
}

const goto = (path) => {
  router.push(path)
  menuisshow.value = false
  document.documentElement.scrollTop = 0
  document.removeEventListener('click', closemenu)
}

const openmenu = () => {
  menuisshow.value = !menuisshow.value
  if(menuisshow.value) {
    document.addEventListener('click', closemenu)
  } else {
    document.removeEventListener('click', closemenu)
  }
}

const closemenu = (e) => {
  const md = document.getElementById('menuicon') // 替换原来的 this.$refs.menu
  if(!md?.contains(e.target) && !menu.value?.contains(e.target)) {
    menuisshow.value = false
    document.removeEventListener('click', closemenu)
  }
}

const changeStyle = () => {
  isDark.value = !isDark.value
  proxy.$constants.DARK = isDark.value // 更新全局状态
  localStorage.setItem('isDark', isDark.value)
  document.body.classList.toggle('dark', isDark.value)
}
</script>


<style>

/*@import url('@/assets/fonts/index.css');*/
@import url('@/assets/css/index.css');
/*@import url('@/assets/css/hljs-atom-one.css');*/


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  background-color: var(--content-bgc);
  color: var(--icon-color);
  height: 100vh;
  /*display: flex;
  flex-direction: column;
  justify-content: space-between;*/
}



.header {
/*  background-color: var(--content-bgc);*/
  height: 60px;
  border-bottom: var(--box-border);
  position: fixed;
  z-index: 998;
  box-sizing: border-box;
  width: 100%;
  top: 0;
  left: 0;
  display: flex;
  justify-content: start;
  align-items: center;
}

.header.clipdemo{
  background-image: radial-gradient(transparent 1px, var(--content-bgc) 1px);
  background-size: 4px 4px;
  backdrop-filter: saturate(50%) blur(4px);
}

.head-list {
  width: 100%;
}



.head-item {
  display: inline-block;
  margin-right: 5px;
}

.header .head-item:last-child {
  margin-right: 0;
}

.header-block {
  height: 60px;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.5s, transform 0.5s;
}
.fade-slide-enter-from, .fade-slide-leave-to /* .fade-slide-leave-active in <2.1.8 */ {
  opacity: 0;
  transform: translateY(1em);
}
.fade-slide-enter-to, .fade-slide-leave-from /* .fade-slide-enter-active in <2.1.8 */ {
  opacity: 1;
  transform: translateY(0);
}

.menu{
  position: absolute;
  width: 342px;
  top:55px;
  border: var(--box-border);
  border-radius:12px;
  padding: 15px 0;
  background-color: var(--content-bgc);
}

@media (any-hover:hover){
  .menu:hover {
    border-color: #425aef;
  }
  .menu-item:hover {
    background-color: #425aef;
    color: #fff;
  }
}

.menu-item:active {
  background-color: #425aef;
  color: #fff;
}


.menu-list-title {
  font-size: 12px;
  margin: 0 10px;
  padding: 0 5px;
}

.menu-item {
  display: flex;
  justify-content: start;
  align-items: center;
  float: left;
  width: 141px;
  font-size: 16px;
  line-height: 30px;
  height: 30px;
  margin: 5px 10px;
  padding: 5px;
  border-radius:10px;
  cursor: pointer;
}

.menu-item > :first-child {
  margin-right: 6px;
}

.pagetitle{
  font-size: 1.25rem;
  font-family: SmileySans-Oblique;
}
.footer {
  width: 100%;
}

.footer-link{
/*  height: 300px;*/
}

.footer-bar {
  background-color: var(--content-bgc);
  height: 80px;
  border-top: var(--box-border);

  width: 100%;
  width: fill-available;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/*.footer-bar > div:nth-child(2) > *{
  cursor: pointer;
  margin-left: 5px;
}
.footer-bar > div > *:hover{
  color:#ffc848;
}*/

.footer-bar > div {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  align-items: flex-start;
}

.footer-bar a {
  font-size: 12px;
  text-decoration: none;
  transition: 0.3s;
  color: inherit;
}

.footer-bar a:hover {
  color:#ffc848;
}

.footer-bar p {
  font-size: 16px;
  margin: 0 0 8px 0;
  transition: 0.3s;
}



/*.logo {
  font-size: 20px;
  font-family: cursive;
  font-weight: 400;
  vertical-align: 1px;
}

.head-item.home:hover >.logo{
  display: none;
}

.homeicon {
  display: none!important;
}

.head-item.home:hover > .homeicon{
  display: inline-block!important;
}*/

code{
  border-radius: 5px;
}



</style>
