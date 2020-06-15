module.exports = {
  // 测试, 写了一个注释, 测试 git push
  devServer: {
    port: 3000,
    open: true,
    proxy: {
      // 所有以 /aaa 开头的请求, 都将被代理
      // 请求的是: /aaa/login  => 被代理成请求 http://localhost:8888/api/private/v1/aaa/login
      // 配置好了 pathRewrite
      // 请求的是: /aaa/login  => 被代理成请求 http://localhost:8888/api/private/v1/login
      '/aaa': {
        target: 'http://localhost:8888/api/private/v1/',
        pathRewrite: { '^/aaa': '' }
      }
    }
  },
  configureWebpack: {
    // 配置打包的排除项, 将来通过外部引入
    externals: {
      // import Vue from 'vue' 之前从 node_modules 中找
      // 配置了之后, 直接从全局找
      vue: 'Vue',
      'vue-router': 'VueRouter',
      'element-ui': 'ELEMENT'
    }
  }
}
