<template>
  <div class="goods-add">
    <!-- 步骤条 -->
    <el-steps :active="active" finish-status="success">
      <el-step title="步骤 1" description="基本信息"></el-step>
      <el-step title="步骤 2" description="商品图片"></el-step>
      <el-step title="步骤 3" description="商品内容"></el-step>
    </el-steps>

    <!-- tab栏 -->
    <el-tabs v-model="activeTab" tab-position="left" @tab-click="handleClick">
      <el-tab-pane name="0" label="基本信息">
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="商品名称">
            <el-input v-model="form.goods_name" placeholder="请输入商品名称"></el-input>
          </el-form-item>
          <el-form-item label="商品价格">
            <el-input v-model="form.goods_price" placeholder="请输入商品价格"></el-input>
          </el-form-item>
          <el-form-item label="商品重量">
            <el-input v-model="form.goods_weight" placeholder="请输入商品重量"></el-input>
          </el-form-item>
          <el-form-item label="商品数量">
            <el-input v-model="form.goods_number" placeholder="请输入商品数量"></el-input>
          </el-form-item>
          <el-form-item label="商品分类">
            <el-cascader
              :props="props"
              v-model="form.goods_cat"
              :options="options"></el-cascader>
          </el-form-item>
        </el-form>
        <el-button type="primary" @click="next">下一步</el-button>
      </el-tab-pane>
      <el-tab-pane name="1" label="商品图片">
        <!--
          action: 提交图片到后台的接口地址
          list-type: 照片墙
          multiple 配置多文件上传 (让input:file可以选择多个文件)

          注意点: 这个是插件自己发送的请求, 1. 需要补全路径, 2. 配置 token headers
         -->
        <el-upload
          action="http://localhost:8888/api/private/v1/upload"
          name="file"
          multiple
          :headers="headers"
          :on-success="handleSuccess"
          list-type="picture-card">
          <i class="el-icon-plus"></i>
          <div slot="file" slot-scope="{file}">
            <img
              class="el-upload-list__item-thumbnail"
              :src="file.url" alt=""
            >
            <span class="el-upload-list__item-actions">
              <!-- 预览按钮 -->
              <span
                class="el-upload-list__item-preview"
                @click="handlePreview(file)">
                <i class="el-icon-zoom-in"></i>
              </span>
              <!-- 删除按钮 -->
              <span
                class="el-upload-list__item-delete"
                @click="handleRemove(file)">
                <i class="el-icon-delete"></i>
              </span>
            </span>
          </div>
        </el-upload>
        <el-button type="primary" @click="next">下一步</el-button>
      </el-tab-pane>
      <el-tab-pane name="2" label="商品内容">
        <!-- 双向数据绑定 -->
        <quill-editor v-model="form.goods_introduce"></quill-editor>
        <el-button type="primary" @click="addGoods">提交</el-button>
      </el-tab-pane>
    </el-tabs>

    <!-- 用于预览的dialog, 存放img -->
    <el-dialog :visible.sync="dialogVisible">
      <img width="100%" :src="dialogImageUrl" alt="">
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      dialogImageUrl: '',
      dialogVisible: false,
      active: 0,
      form: {
        goods_name: '',
        goods_cat: [],
        goods_price: '',
        goods_number: '',
        goods_weight: '',
        goods_introduce: '',
        pics: []
      },
      options: [],
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      activeTab: '0',
      headers: {
        Authorization: localStorage.getItem('token')
      },
      fileList: []
    }
  },
  async created () {
    // 发送ajax请求， 获取分类数据 三级分类
    const { meta, data } = await this.$axios.get('categories?type=3')
    if (meta.status === 200) {
      this.options = data
      console.log(data)
    } else {
      this.$message.error(meta.msg)
    }
  },
  methods: {
    handleClick (tab, event) {
      // console.log(tab)
      // console.log(event)
      // 点击tab栏， 同步显示步骤条
      this.active = +tab.index
    },
    next () {
      // 控制步骤条
      this.active++
      this.activeTab = this.active + ''
    },
    // 文件上传完成时调用
    handleSuccess (res, file, fileList) {
      // console.log('res:', res) // 后台返回的数据
      // console.log('file:', file) // 当前上传的文件对象
      // console.log('fileList:', fileList) // 所有的已上传的用于预览的文件对象
      if (res.meta.status === 200) {
        this.form.pics.push({
          pic: res.data.tmp_path
        })
        this.fileList = fileList
        console.log(fileList)
      }
    },
    handleRemove (file) {
      // console.log(file)
      // 需要提交的图片路径
      const path = file.response.data.tmp_path
      // 根据路径, 从 pics 中将相同路径的移除
      this.form.pics = this.form.pics.filter(item => item.pic !== path)

      // 还要将用于预览的 fileList 中对应的 file 删除
      // 需要的是将插件内容的用于预览的 fileList 里面的内容删除, 所以不能改变地址
      // this.fileList.splice(从哪开始删, 删几个)
      const index = this.fileList.findIndex(item => item.uid === file.uid)
      this.fileList.splice(index, 1)
    },
    handlePreview (file) {
      this.dialogImageUrl = file.url
      this.dialogVisible = true
    },
    async addGoods () {
      const { meta } = await this.$axios.post('goods', {
        ...this.form,
        goods_cat: this.form.goods_cat.join(',')
      })
      if (meta.status === 201) {
        this.$message.success('添加成功')
        this.$router.push('/goods')
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
// scoped
// 1. 给当前模板中的元素, 添加上一个自定义属性 data-v-09fe4af6
//    重点: 只会给当前模板中的元素加, 如果是子组件的, 不管
// 2. 给选择器, 加上属性选择器  .quill-editor[data-v-09fe4af6]
.quill-editor {
  background-color: #fff;
  ::v-deep .ql-editor {
    min-height: 300px;
  }
}
</style>

<style lang="scss">
// .goods-add {
//   .quill-editor {
//     background-color: #fff;
//     .ql-editor {
//       min-height: 300px;
//     }
//   }
// }
</style>
