<template>
  <div class="users">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 搜索框 -->
    <el-input placeholder="请输入搜索关键字" v-model="query" class="input-with-select">
      <el-button @click="searchUser" slot="append" icon="el-icon-search"></el-button>
    </el-input>
    <el-button @click="showDialog" class="addBtn" plain type="success">添加用户</el-button>
    <!-- 表格 -->
    <!-- el-table整个表格, el-table-column表格的一列 -->
    <el-table
      :data="userList"
      style="width: 100%">
      <el-table-column
        prop="username"
        label="姓名">
      </el-table-column>

      <el-table-column
        prop="email"
        label="邮箱">
      </el-table-column>

      <el-table-column
        prop="mobile"
        label="电话">
      </el-table-column>

      <el-table-column
        label="用户状态">
        <!-- obj.row 可以拿到整个遍历的对象 -->
        <template v-slot:default="obj">
          <!-- obj.row 完整的用户数据 -->
          <el-switch
            @change="changeState(obj.row)"
            v-model="obj.row.mg_state"
            active-color="#13ce66"
            inactive-color="#ff4949">
          </el-switch>
        </template>
      </el-table-column>

      <el-table-column
        label="操作">
        <template v-slot:default="{ row }">
          <!-- {{ obj.row.id }} -->
          <el-button @click="showEditDialog(row)" plain size="small" type="primary" icon="el-icon-edit"></el-button>
          <el-button @click="delUser(row.id)" plain size="small" type="danger" icon="el-icon-delete"></el-button>
          <el-button @click="showAssignDialog(row)" plain size="small" type="success" icon="el-icon-check">分配角色</el-button>
        </template>
      </el-table-column>

    </el-table>
    <!-- 分页 -->
    <!-- @size-change 每页条数的变化
         @current-change  当前页变化时触发
         :current-page 当前页
         :page-sizes 供用户选择的, 每页条数
         :page-size  当前每页的条数
         layout 指的是控件列表
         :total 总条数
    -->
    <el-pagination
      background
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="pagenum"
      :page-sizes="[2, 4, 6, 8, 10]"
      :page-size="pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>

    <!-- 添加的 dialog -->
    <el-dialog
      @close="closeDialog"
      title="添加用户"
      :visible.sync="dialogVisible"
      width="40%">

      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="请输入用户名" v-model="form.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" placeholder="请输入密码" v-model="form.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="请输入邮箱" v-model="form.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input placeholder="请输入手机" v-model="form.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button @click="addUser" type="primary">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改的 dialog -->
    <el-dialog
      title="修改用户"
      :visible.sync="editVisible"
      width="40%">

      <el-form ref="editForm" :rules="rules" :model="editForm" label-width="80px">
        <el-form-item label="用户名">
          <el-tag type="info">{{ editForm.username }}</el-tag>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input placeholder="请输入邮箱" v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input placeholder="请输入手机" v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editVisible = false">取 消</el-button>
        <el-button @click="editUser" type="primary">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配的 dialog -->
    <el-dialog
      title="分配角色"
      :visible.sync="assignVisible"
      width="40%">

      <el-form :model="assignForm" label-width="80px">
        <el-form-item label="用户名">
          <el-tag type="info">{{ assignForm.username }}</el-tag>
        </el-form-item>
        <el-form-item label="角色列表">
          <el-select v-model="assignForm.rid" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button @click="assignRole" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created () {
    // 发送ajax请求, 获取数据进行渲染
    this.getUserList()
  },
  data () {
    return {
      // 搜索条件
      query: '',
      // 当前页
      pagenum: 1,
      // 每页显示条数
      pagesize: 2,
      // 用户列表
      userList: [],
      // 总条数
      total: 0,
      // 控制添加dialog的显示隐藏
      dialogVisible: false,
      // 准备一个用于提交的 form
      form: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 配置校验的规则
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['blur', 'change'] }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 3, max: 12, message: '长度在 3 到 12 个字符', trigger: ['blur', 'change'] }
        ],
        email: [
          { type: 'email', message: '请输入正确的邮箱', trigger: ['blur', 'change'] }
        ],
        mobile: [
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: ['blur', 'change'] }
        ]
      },
      // 控制编辑模态框的显示隐藏
      editVisible: false,
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 控制分配模态框的显示隐藏
      assignVisible: false,
      assignForm: {
        // 用户id
        id: '',
        username: '',
        // 角色 id
        rid: ''
      },
      // 角色列表
      roleList: []
    }
  },
  methods: {
    getUserList () {
      // axios.post(url, data, config)   config中一般可以配置一些额外的参数 (请求头)
      // axios.get(url, config)   可以配置params, 也可以配置请求头等额外参数
      // 发送 get 获取用户的 axios
      this.$axios.get('users', {
        // 配置 params
        params: {
          query: this.query,
          pagenum: this.pagenum,
          pagesize: this.pagesize
        }
      }).then(res => {
        const { meta, data } = res
        if (meta.status === 200) {
          // 成功
          this.userList = data.users
          this.total = data.total
          // console.log(this.userList)
        }
      })
    },
    // 修改每页的条数
    handleSizeChange (val) {
      // console.log(`每页 ${val} 条`)
      this.pagesize = val
      // 将当前页更新成第一页
      this.pagenum = 1
      // 重新渲染
      this.getUserList()
    },
    // 当前页变化时, 触发
    handleCurrentChange (val) {
      // val 用户选择的当前页
      this.pagenum = val
      // 重新渲染
      this.getUserList()
    },
    // 根据 id 进行删除
    async delUser (id) {
      try {
        await this.$confirm('亲, 你确认要进行删除吗?', '温馨提示', {
          type: 'warning'
        })
        // 确认删除, 发送ajax请求
        const { meta } = await this.$axios.delete(`users/${id}`)
        if (meta.status === 200) {
          // 删除成功
          this.$message.success('删除成功')
          // 如果当前页只有一条, 删除了仅有的一条后, 当前页-1
          if (this.userList.length === 1 && this.pagenum > 1) {
            this.pagenum--
          }
          // 重新渲染当前页
          this.getUserList()
        } else {
          // 删除失败
          this.$message.error(meta.msg)
        }
      } catch (err) {
        console.log(err)
        this.$message('取消成功')
      }
    },
    // 根据搜索关键字, 搜索数据展示
    searchUser () {
      // 搜索后, 需要将当前页改为第一页
      this.pagenum = 1
      this.getUserList()
    },
    async changeState (row) {
      const { meta } = await this.$axios.put(`users/${row.id}/state/${row.mg_state}`)
      if (meta.status === 200) {
        this.$message.success('修改成功')
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 展示添加对话框
    showDialog () {
      this.dialogVisible = true
    },
    closeDialog () {
      // 只要关闭了对话框, 就应该将内容重置掉
      // console.log('对话框关闭了')
      this.$refs.form.resetFields()
    },
    // 添加用户
    async addUser () {
      try {
        await this.$refs.form.validate()
        // 说明校验成功了
        // 发送添加的 ajax
        const { meta } = await this.$axios.post('users', this.form)
        if (meta.status === 201) {
          // 成功的提示
          this.$message.success(meta.msg)
          // 关闭对话框
          this.dialogVisible = false
          // 将当前页, 更新成最后一页    总条数1/每页多少条5
          // 先让 total + 1
          this.total++
          this.pagenum = Math.ceil(this.total / this.pagesize)
          // 重新渲染
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 展示修改模态框
    showEditDialog (row) {
      this.editVisible = true
      this.editForm.id = row.id
      this.editForm.username = row.username
      this.editForm.email = row.email
      this.editForm.mobile = row.mobile
    },
    // 编辑用户
    async editUser () {
      try {
        await this.$refs.editForm.validate()
        // 校验成功
        const { id, email, mobile } = this.editForm
        const { meta } = await this.$axios.put(`users/${id}`, { email, mobile })
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          // 关闭模态框
          this.editVisible = false
          // 重新渲染
          this.getUserList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 展示分配的对话框
    async showAssignDialog (row) {
      console.log(row)
      this.assignVisible = true
      // 回显基本数据
      this.assignForm.id = row.id
      this.assignForm.username = row.username
      // 角色 id, rid 也要回显, 发送请求
      const resUser = await this.$axios.get(`users/${row.id}`)
      if (resUser.meta.status === 200) {
        const rid = resUser.data.rid
        this.assignForm.rid = rid !== -1 ? rid : ''
      }

      // 发送ajax请求, 获取用于分配的全部角色列表
      const { meta, data } = await this.$axios.get('roles')
      if (meta.status === 200) {
        // 获取成功
        this.roleList = data
        console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 分配角色
    async assignRole () {
      // 从 assignForm, id用户id, rid角色id
      const { id, rid } = this.assignForm
      if (rid === '') {
        this.$message.error('请选择角色')
        return
      }
      // 发送 ajax 请求, 进行分配角色
      const { meta } = await this.$axios.put(`users/${id}/role`, { rid })
      if (meta.status === 200) {
        // 提示
        this.$message.success(meta.msg)
        // 关闭对话框
        this.assignVisible = false
        // 重新渲染
        this.getUserList()
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.users {
  .input-with-select {
    width: 300px;
    margin-bottom: 10px;
  }
  .addBtn {
    margin: 0 20px;
  }
}
</style>
