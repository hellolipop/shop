<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
// sass中有两种语法,  sass  scss
// 1. scss 和 less 写起来差不多, 该嵌套还是嵌套, 区别: 定义变量, 使用的是 $
// $color: blue;
// * {
//   margin: 0;
//   padding: 0;
//   list-style: none;
// }
// body {
//   background-color: pink;
//   p {
//     color: $color;
//     font-size: 50px;
//   }
// }

// 2. sass 语法, 不太友好, 特征: 必须省略 {} 和 ;
// *
//   margin: 0
//   padding: 0
//   list-style: none

// body
//   background-color: pink
//   p
//     color: red
//     font-size: 50px

* {
  margin: 0;
  padding: 0;
  list-style: none;
}
html, body, #app {
  width: 100%;
  height: 100%;
}
#app {
  // 统一设置面包屑
  .el-breadcrumb {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #ccc;
    margin-bottom: 10px;
  }
}
</style>
