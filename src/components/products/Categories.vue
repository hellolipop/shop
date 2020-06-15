<template>
  <div class="categories">
    <el-button type="success" plain class="addCategory" @click="showAddDialog">添加分类</el-button>
    <!-- 表格 -->
    <el-table
      :data="categoryList"
      row-key="cat_id"
      element-loading-text="玩命加载中。。。"
      v-loading="loading">
      <el-table-column label="分类名称" prop="cat_name"></el-table-column>
      <el-table-column label="是否有效">
        <template v-slot:default="{ row }">
          {{ row.cat_deleted ? '否' : '是' }}
        </template>
      </el-table-column>
      <el-table-column label="排序" prop="cat_level"></el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="{ row }">
          <el-button type="primary" size="small" plain icon="el-icon-edit"></el-button>
          <el-button type="danger" size="small" plain icon="el-icon-delete"></el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[5, 10, 15, 20]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加对话框 -->
    <el-dialog
      @close="closeDialog"
      title="添加分类"
      :visible.sync="dialogVisible"
      width="40%">

      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="form.cat_name" placeholder="请输入分类名称"></el-input>
        </el-form-item>
        <el-form-item label="父级名称" prop="cat_pid">
          <el-cascader
            clearable
            :props="props"
            v-model="form.cat_pid"
            :options="options"></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button @click="addCategory" type="primary">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
export default {
  data () {
    return {
      categoryList: [],
      pagenum: 1,
      pagesize: 5,
      total: 0,
      loading: false,
      dialogVisible: false,
      form: {
        cat_pid: [],
        cat_name: '',
        cat_level: ''
      },
      rules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: ['blur', 'change'] }
        ]
      },
      options: [],
      props: {
        value: 'cat_id', // 将来提交给后台的值
        label: 'cat_name', // 级联选择器, 显示的问题
        children: 'children',
        // 可以只选择一级
        checkStrictly: true
      }
    }
  },
  created () {
    this.getCategoryList()
  },
  methods: {
    async getCategoryList () {
      this.loading = true

      // 发送ajax, get传参，是需要配置在 config中
      const { meta, data } = await this.$axios.get('categories', {
        params: {
          type: 3,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      console.log(data)
      if (meta.status === 200) {
        this.categoryList = data.result
        // 将总数存起来， 将来用于分页
        this.total = data.total
      } else {
        this.$message.error(meta.msg)
      }

      this.loading = false
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getCategoryList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getCategoryList()
    },
    async showAddDialog () {
      this.dialogVisible = true
      // 显示对话框, 立刻发送 ajax请求， 获取的是2级的分类数据
      const { data, meta } = await this.$axios.get('categories?type=2')
      if (meta.status === 200) {
        this.options = data
        console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async addCategory () {
      try {
        // 先校验
        await this.$refs.form.validate()
        // 发送ajax请求
        const { meta } = await this.$axios.post('categories', {
          // 分类的父id,找this.form.cat_pid的最后一项, 给默认值, 如果为 0 表示没有父级 id
          cat_pid: this.form.cat_pid[this.form.cat_pid.length - 1] || 0,
          cat_name: this.form.cat_name,
          // 根据 this.form.cat_pid 的长度计算
          cat_level: this.form.cat_pid.length
        })
        if (meta.status === 201) {
          // 提示
          this.$message.success(meta.msg)
          // 关闭对话框
          this.dialogVisible = false
          // 重新渲染
          this.getCategoryList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    closeDialog () {
      this.$refs.form.resetFields()
    }
  }
}
</script>

<style lang="scss" scoped>
  .categories {
    .addCategory {
      margin-bottom: 10px;
    }
  }
</style>
