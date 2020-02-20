import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'


import axios from 'axios'
// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // axios请求拦截
axios.interceptors.request.use(config => {
    // 为请求头对象，添加token验证的Authorization字段
    config.headers.Authorization = window.sessionStorage.getItem('token')
        // // 在最后必须return config
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false


Vue.component('tree-table', TreeTable)
    // 将富文本编辑器 注册为全局可用的组件
Vue.use(VueQuillEditor)

// 定义全局时间过滤器
// padStart() 如果不足两位就补个0  加 '' 变成字符串
// dataFormat是函数名
Vue.filter('dataFormat', function(time) {
    const dt = new Date(time)
    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')
    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')
        // yyyy-mm-dd hh:mm:ss 日期格式
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')