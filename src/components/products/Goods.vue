<template>
  <div class="goods">
    <el-button type="success" plain @click="goAdd">添加商品</el-button>
    <!-- 表格 -->
    <el-table :data="goodsList">
      <el-table-column type="index" :index="indexMethod"></el-table-column>
      <el-table-column label="商品名称" prop="goods_name" ></el-table-column>
      <el-table-column label="商品价格" prop="goods_price" ></el-table-column>
      <el-table-column label="商品重量" prop="goods_weight" ></el-table-column>
      <el-table-column label="创建时间">
        <template v-slot:default="{ row }">
          {{ row.add_time | dateFilter }}
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <el-button type="primary" size="small" plain icon="el-icon-edit"></el-button>
        <el-button type="danger" size="small" plain icon="el-icon-delete"></el-button>
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
  </div>
</template>

<script>
export default {
  data () {
    return {
      goodsList: [],
      pagenum: 1,
      pagesize: 5,
      total: 0
    }
  },
  created () {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList () {
      const { meta, data } = await this.$axios.get('goods', {
        params: {
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      })
      if (meta.status === 200) {
        this.goodsList = data.goods
        this.total = data.total
        console.log(this.goodsList)
      } else {
        this.$message.error(meta.msg)
      }
    },
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      this.pagenum = 1
      this.getGoodsList()
    },
    handleCurrentChange (val) {
      // console.log(`当前页: ${val}`)
      this.pagenum = val
      this.getGoodsList()
    },
    indexMethod (index) {
      return index + 1 + (this.pagenum - 1) * this.pagesize
    },
    goAdd () {
      // 获取的是当前的路由信息， this.$route
      // 实现路由跳转， this.$router.push(...)
      this.$router.push('/goods-add')
    }
  }
}
</script>

<style>

</style>
