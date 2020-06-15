<template>
  <div class="login">
    <!--
      el-button 按钮组件
      type: 指定颜色  primary 蓝色  success 绿色  danger 红色  info 灰黑色  warning 黄色
      plain: 指定按钮是否是简约风 (朴素)
      round: 设置圆角
      circle: 圆 border-radius: 50%
     -->
     <!-- <el-button type="success" round>测试按钮</el-button>
     <el-button type="danger" plain circle>朴素按钮</el-button> -->

     <!--
       el-form: 整个表单组件
          (1) :model="form"  利用父子组件传参, 将 form 对象传入 el-form组件,
              将来内部的 input 会和 form 中的属性 双向数据绑定
          (2) label-width  设置整个form表单label的宽度

       el-form-item 表单项
          (1) label 配置的 label的文字
          (2) label-width 设置自己的 label 的宽度 (优先级更高)

       el-input 输入组件
          v-model="form.name"  将输入框的内容 和 form中的 name 双向数据绑定
          type="password" 密码
          placeholder="提示信息"
      -->

      <!-- 配置 :rules 属性 配置校验规则 -->
      <el-form ref="form"  status-icon  :rules="rules" :model="form" label-width="80px">
        <img class="logo" src="../assets/avatar.jpg" alt="">
        <el-form-item label="用户名" prop="username">
          <el-input @keyup.enter.native="login" v-model="form.username" placeholder="请输入用户名"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input @keyup.enter.native="login" type="password" v-model="form.password" placeholder="请输入密码"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
          <el-button class="resetBtn" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
  </div>
</template>

<script>
// 组件的配置, 除了 template (el) 不配, 其他都可以配
// data(是一个函数, 返回一个对象), methods, computed, watch, filters, ... 八大钩子函数
export default {
  data () {
    return {
      form: {
        username: '',
        password: ''
      },
      rules: {
        // required: true 为必填项
        // message 提示消息
        // trigger: blur 失去焦点触发校验   change 修改时就触发
        // min: 最小长度,  max: 最大长度
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '用户名长度必须是3-12位', trigger: ['change', 'blur'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 12, message: '密码长度必须是3-12位', trigger: ['change', 'blur'] }
        ]
      }
    }
  },
  methods: {
    reset () {
      // 获取到 el-form 组件, 调用它的重置方法
      this.$refs.form.resetFields()
    },
    async login () {
      try {
        // 等待校验的结果
        await this.$refs.form.validate()
        // 说明校验成功
        const { meta, data } = await this.$axios.post('login', this.form)
        if (meta.status === 200) {
          localStorage.setItem('token', data.token)
          // 登录成功, 跳转首页
          this.$message({
            message: meta.msg,
            type: 'success',
            duration: 1000
          })
          this.$router.push({ name: 'index' })
        } else {
          this.$message({
            message: meta.msg,
            type: 'error',
            duration: 1000
          })
        }
      } catch (e) {
        console.log(e)
      }
    }
  }
}
// token的实现原理, token是一个通过算法加密过的字符串 (里面有用户id, 用户信息, 签发者信息, 过期时间..)
// 服务器端签发一个token, 浏览器存储token, 下次请求, 携带token即可

// 基于token的前端登录拦截: 有token放行, 没有token直接拦截登陆页

</script>

<style lang="scss">
  // 组件定义的规范: 每个组件的根元素的类名, 一般都会和组件名一致
  .login {
    width: 100%;
    height: 100%;
    background-color: #2d434c;
    overflow: hidden;

    .el-form {
      width: 400px;
      background-color: #fff;
      padding: 20px;
      padding-top: 80px;
      border-radius: 20px;
      margin: 0 auto;
      margin-top: 200px;
      position: relative;

      .logo {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -70px;
        border-radius: 50%;
        border: 5px solid #fff;
      }

      .resetBtn {
        margin-left: 80px;
      }
    }
  }
</style>
