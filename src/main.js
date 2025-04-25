import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import http from './api/http'
// import axios from 'axios'
import VueAxios from 'vue-axios'
// icon-park
import '@icon-park/vue-next/styles/index.css'

import components from '@/components';


const app = createApp(App)

app.use(createPinia())
app.use(VueAxios, { $http:http })
app.provide('axios', app.config.globalProperties.axios)

app.use(router)

app.use(components);


app.config.globalProperties.$constants = {
  // MY_EVN,
  DARK:false,
};

app.mount('#app')
