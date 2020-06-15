import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import moment from 'moment'
import VueQuillEditor from 'vue-quill-editor'

// require styles
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

Vue.config.productionTip = false
// use方法, 只适用于依赖 vue 的插件
Vue.use(ElementUI)
Vue.use(VueQuillEditor /* { default global options } */)

// 将axios挂载到Vue构造函数的原型的, 将来原型上的方法, 实例都可以使用
Vue.prototype.$axios = axios

// 配置baseURL基准地址, 请求的是 localhost:3000/aaa/login
axios.defaults.baseURL = '/aaa'

// 配置请求拦截器: 将每次的请求, 进行拦截, 可以对每次的请求进行处理
axios.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么
  config.headers.Authorization = localStorage.getItem('token')
  return config
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error)
})

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  // 对响应数据做点什么
  response = response.data
  if (response.meta.status === 401) {
    // 只要后台返回401, 说明, token 是无效的
    // 1. 清掉无效的token
    localStorage.removeItem('token')
    // 2. 拦截到登录页, this.$router.push(..)
    router.push('/login')
  }
  return response
}, function (error) {
  // 对响应错误做点什么
  return Promise.reject(error)
})

// 注册全局的过滤器  {{ msg | dateFilter }}
Vue.filter('dateFilter', value => {
  return moment(value * 1000).format('YYYY年MM月DD日 HH:mm:ss')
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
