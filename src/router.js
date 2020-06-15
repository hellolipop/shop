import Vue from 'vue'
import Router from 'vue-router'

// const Home = () => import('@/components/home/Home')  表示从 src 目录开始

// import Login from './components/Login.vue'
// import Index from './components/Index.vue'
// import Users from './components/users/Users.vue'
// import Rights from './components/rights/Rights.vue'
// import Roles from './components/rights/Roles.vue'
// import Categories from './components/products/Categories.vue'
// import Goods from './components/products/Goods.vue'
// import GoodsAdd from './components/products/GoodsAdd.vue'

// 按需异步加载组件
// const Login = () => {
//   return import('./components/Login.vue')
// }
// 异步的 login 组件, 只在函数调用的时候才会加载, 按需加载
// 打包时, 将一个个组件拆分成一个个单独文件, 需要的时候加载
// 每个组件都可以拆分
const Login = () => import(/* webpackChunkName: 'index' */'./components/Login.vue')
const Index = () => import(/* webpackChunkName: 'index' */'./components/Index.vue')

const Users = () => import(/* webpackChunkName: 'users' */'./components/users/Users.vue')

const Rights = () => import(/* webpackChunkName: 'rights' */'./components/rights/Rights.vue')
const Roles = () => import(/* webpackChunkName: 'rights' */'./components/rights/Roles.vue')

const Categories = () => import(/* webpackChunkName: 'products' */'./components/products/Categories.vue')
const Goods = () => import(/* webpackChunkName: 'products' */'./components/products/Goods.vue')
const GoodsAdd = () => import(/* webpackChunkName: 'products' */'./components/products/GoodsAdd.vue')

Vue.use(Router)

const originalPush = Router.prototype.push
Router.prototype.push = function push (location) {
  return originalPush.call(this, location).catch(err => err)
}

// name 命名路由, 给路由起一个名字
// 如果是起了名字的路由, 可以不通过路径, 通过名字跳转
// this.$router.push('/login')
// this.$router.push({ name: 'login' })

const router = new Router({
  routes: [
    {
      path: '/',
      redirect: '/index'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/index',
      name: 'index',
      component: Index,
      children: [
        { path: '/users', name: 'users', component: Users },
        { path: '/roles', name: 'roles', component: Roles },
        { path: '/rights', name: 'rights', component: Rights },
        { path: '/categories', name: 'categories', component: Categories },
        { path: '/goods', name: 'goods', component: Goods },
        { path: '/goods-add', name: 'goods-add', component: GoodsAdd }
      ]
    }
  ]
})

// to 到哪去
// from 从哪来
// next 是否放行  next() 放行    next('/login') 拦截到登录
// 如果准备去登录, 不需要拦截
// 如果已经登录过了, 有token, 不需要拦截
// 如果不是去登陆, 且没有 token, 拦截到登录页
router.beforeEach((to, from, next) => {
  // console.log(to)
  const token = localStorage.getItem('token')
  if (to.path === '/login' || token) {
    next()
  } else {
    next('/login')
  }
})

export default router
