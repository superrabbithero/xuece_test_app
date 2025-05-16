<template>
	<div class="au-layout" style="height: calc(100% - 180px);">
    <div class="rows center" style="height: 100%;">
      <div class="cols">
        <div class="login-card rows">
          <div class="cols s12 center"><h1>Login</h1></div>
          <div class="cols s12 center">
            <label>账号：
              <input type="text" placeholder="请输入账号" v-model="userData.user_name" style="width: 150px;">
            </label>
          </div>
          <div class="cols s12 center">
            <label>密码：
              <input type="password" placeholder="请输入密码" v-model="userData.password" style="width: 150px;">
            </label>
          </div>
          <div class="cols s12 end" style="margin-right: 50px;">
            <input type="button" class="fill" value="登  录" @click="handleLogin">
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore'
import router from '@/router'
import { useRoute } from 'vue-router'

const route = useRoute()

const userData = ref({user_name:"",password:""})

const userStore = useUserStore()

const handleLogin = () => {
  userStore.login(userData.value).then((rst)=>{

    
    const redirect = route?.query?.redirect
    console.log(route)
    // 跳转逻辑
    if (rst.code == 200){
      router.replace(redirect ? decodeURIComponent(redirect) : '/')
    }else{
      console.log(rst.code)
    }
      
  })
}
</script>

<style scoped>
.login-card {
  width: 400px;
  height: 300px;
  border: var(--box-border);
  background: var(--box-bgc);
  border-radius: 5%;
  padding:20px;
}
</style>