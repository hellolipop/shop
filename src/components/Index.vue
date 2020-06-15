<template>
  <el-container class="index">
    <el-header>
      <div class="logo">
        <img src="../assets/logo.png" alt="">
      </div>
      <div class="title">
        <h1>电商后台管理系统</h1>
      </div>
      <div class="logout">
        欢迎光临~
        <a href="javascript:;" @click="logout">退出</a>
      </div>
    </el-header>

    <!--
      el-menu 整个菜单
      el-submenu 子菜单
        template  v-slot:title 表示将来内容会分发给 name="title" 的插槽
        在这个组件中, 就是用于设置子菜单标题的
      el-menu-item 菜单项

        index 标记菜单项的
        default-active="1-1" 让指定的菜单高亮
        unique-opened 保证只有一个子菜单展开
     -->
    <el-container>
      <el-aside width="200px">
        <el-menu
          unique-opened
          router
          :default-active="defaultActive"
          background-color="#545c64"
          text-color="#fff"
          active-text-color="#ffd04b">

          <el-submenu :index="menu.path" v-for="menu in menuList" :key="menu.id">
            <!-- 标题 -->
            <template v-slot:title>
              <i class="el-icon-location"></i>
              <span>{{ menu.authName }}</span>
            </template>

            <el-menu-item :index="item.path" v-for="item in menu.children" :key="item.id">
              <i class="el-icon-menu"></i>
              <span slot="title">{{ item.authName }}</span>
            </el-menu-item>
          </el-submenu>

        </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>

  </el-container>
</template>

<script>
export default {
  data () {
    return {
      menuList: []
    }
  },
  async created () {
    // 发送 ajax 请求， 获取当前用户的左侧菜单信息
    const { data, meta } = await this.$axios.get('menus')
    if (meta.status === 200) {
      this.menuList = data
      // console.log(data)
    }
  },
  computed: {
    defaultActive () {
      // console.log(this.$route.path)   /user
      // /goods
      // /goods-add
      return this.$route.path.slice(1).split('-')[0]
    }
  },
  methods: {
    logout () {
      // 最好提示一下
      // 需要将 token 从本地清掉, 跳转登陆页

      // elementui- messagebox
      // this.$confirm
      // 参数1: 提示消息
      // 参数2: 标题
      // 参数3: 配置对象
      this.$confirm('亲, 你确认要退出系统吗?', '温馨提示', {
        type: 'warning'
      }).then(() => {
        // 确认提示
        this.$message.success('恭喜, 退出成功')
        // 从本地清除 token
        localStorage.removeItem('token')
        // 跳转登录路由
        this.$router.push('/login')
      }).catch(() => {
        // 取消
        this.$message('取消退出')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.index {
  height: 100%;
  .el-header {
    background-color: #d8d8d8;
    display: flex;
    .logo {
      width: 180px;
      img {
        height: 40px;
        margin: 10px;
      }
    }
    .title {
      flex: 1;
      h1 {
        text-align: center;
        height: 60px;
        line-height: 60px;
        color: #545c64;
      }
    }
    .logout {
      height: 60px;
      line-height: 60px;
      text-align: right;
      font-weight: 700;
      width: 180px;
      a {
        color: orange;
      }
    }
  }
  .el-aside {
    background-color: #545c64;
    .el-menu {
      border-right: none;
    }
  }
  .el-main {
    background-color: #ecf0f1;
  }
}

// 默认情况下, 单文件组件, 互相之间的样式, 会互相影响
// 解决方案:
// 1. 嵌套自己模块的类名
// 2. scoped: 让样式只在当前组件生效
//    如果希望样式只在当前组件生效, 也推荐加上 scoped 来实现

// 原理:
// 1. 给当前组件的所有元素, 添加上一个随机的自定义属性
// 2. 给 style中, 每个选择器, 也加上了 属性选择器
// div {
//   background-color: blue;
// }
</style>
