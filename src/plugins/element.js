import Vue from 'vue'
// 导入组件
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
    // 挂载到Vue原型对象上
Vue.prototype.$message = Message