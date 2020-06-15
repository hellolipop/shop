<template>
  <div class="rights">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 表格 -->
    <el-table :data="rightList">
      <el-table-column type="index" :index="indexMethod"></el-table-column>
      <el-table-column label="权限名称" prop="authName"></el-table-column>
      <el-table-column label="路径" prop="path"></el-table-column>
      <el-table-column label="层级">
        <template v-slot:default="{ row }">
          <span v-if="row.level === '0'">一级</span>
          <span v-if="row.level === '1'">二级</span>
          <span v-if="row.level === '2'">三级</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  data () {
    return {
      rightList: []
    }
  },
  created () {
    this.getRightList()
  },
  methods: {
    async getRightList () {
      const { meta, data } = await this.$axios.get('rights/list')
      if (meta.status === 200) {
        // 获取数据成功
        this.rightList = data
        console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    },
    indexMethod (index) {
      return index + 1
    }
  }
}
</script>

<style>

</style>
