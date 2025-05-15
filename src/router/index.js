// import {Vue} from 'vue'
import {createRouter, createWebHashHistory} from 'vue-router'



const routes = [
    {
        path: '/AppManage',
        name: '学测应用管理',
        component: () => import("@/components/AppManage"),
        meta:{
            title: '学测应用管理'
        }
    },
    {
        path: '/BuildAnswerSheet',
        name: '答题卡生成',
        component: () => import("@/components/BuildAnswerSheet"),
        meta:{
            title: '答题卡生成',
            footerHidden: true
        }
    },
    {
        path: '/AppManage/app-detail/:id',
        name: '应用详情',
        component: () => import("@/components/AppDetail"),
        props:true,
        meta:{
            title: '应用详情',
            footerHidden: true
        }
    },
    {
        path: '/login',
        name: '登录',
        component: () => import("@/components/LoginPage"),
        props:true,
        meta:{
            title: '应用详情',
            footerHidden: true,
            headerHidden: true
        }
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
  window.document.title = to.name
  next()
})

export default router

