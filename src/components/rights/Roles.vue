<template>
  <div class="roles">
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 绿色按钮 -->
    <el-button type="success" plain class="addRole" @click="showAddDialog">添加角色</el-button>
    <!-- 表格渲染 -->
    <el-table :data="roleList">
      <el-table-column type="expand">
        <template v-slot:default="{ row }">
          <p v-if="row.children.length === 0">暂无权限</p>

          <!-- 每个row roleList 的每一项, row就是角色 -->
          <!-- 渲染一级权限, 每个一级权限应该是一行  el-row  el-col -->
          <el-row class="l1" v-for="l1 in row.children" :key="l1.id">
            <el-col :span="4">
              <el-tag @close="delRights(row, l1.id)" closable>{{ l1.authName }}</el-tag>
              <span class="el-icon-arrow-right"></span>
            </el-col>
            <el-col :span="20">
              <!-- 遍历渲染二级权限的行 -->
              <el-row class="l2" v-for="l2 in l1.children" :key="l2.id">
                <!-- 一行分成了左右两列 -->
                <el-col :span="4">
                  <el-tag @close="delRights(row, l2.id)" closable type="success">{{ l2.authName }}</el-tag>
                  <span class="el-icon-arrow-right"></span>
                </el-col>
                <el-col :span="20">
                  <!-- 右边直接一行中遍历展示多个 el-tag -->
                  <el-tag @close="delRights(row, l3.id)" class="l3" closable type="warning" v-for="l3 in l2.children" :key="l3.id">{{ l3.authName }}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作">
        <template v-slot:default="{ row }">
          <el-button @click="showEditDialog(row)" plain size="small" type="primary" icon="el-icon-edit"></el-button>
          <el-button @click="delRole(row.id, $event)" plain size="small" type="danger" icon="el-icon-delete"></el-button>
          <el-button @click="showAssignDialog(row)" plain size="small" type="success" icon="el-icon-check">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加修改的dialog -->
    <el-dialog
      @close="closeDialog"
      :title="dialogTitle"
      :visible.sync="addVisible"
      width="40%">

      <el-form ref="form" :rules="rules" :model="form" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="form.roleName" placeholder="请输入角色名称"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="form.roleDesc" placeholder="请输入角色描述"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRole">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配的 dialog -->
    <el-dialog
      title="分配权限"
      :visible.sync="assignVisible"
      width="40%">

      <!-- data 配置数据
           show-checkbox: 显示选择框
           default-expand-all: 配置默认全部展开
           node-key="id" 表示设置的key
      -->
      <el-tree
        ref="tree"
        node-key="id"
        show-checkbox
        default-expand-all
        :data="data"
        :props="defaultProps">
      </el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="assignVisible = false">取 消</el-button>
        <el-button @click="assignRights" type="primary">分 配</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      roleId: '',
      roleList: [],
      assignVisible: false,
      data: [],
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      addVisible: false,
      form: {
        id: '',
        roleName: '',
        roleDesc: ''
      },
      rules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: ['blur', 'change'] }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: ['blur', 'change'] }
        ]
      },
      dialogTitle: '添加角色'
    }
  },
  created () {
    this.getRoleList()
  },
  methods: {
    async getRoleList () {
      const { meta, data } = await this.$axios.get('roles')
      if (meta.status === 200) {
        this.roleList = data
        // console.log(data)
      } else {
        this.$message.error(meta.msg)
      }
    },
    async delRights (row, rightId) {
      // console.log(roleId, rightId)
      const { meta, data } = await this.$axios.delete(`roles/${row.id}/rights/${rightId}`)
      // data 是删除完成之后, 该角色剩余的权限
      if (meta.status === 200) {
        // 重新渲染, 这里不应该重新渲染, 所有的数据都重新渲染
        // 应该更新的是 当前角色的 对应权限
        row.children = data
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 展示分配的对话框
    async showAssignDialog (row) {
      this.roleId = row.id
      this.assignVisible = true
      // 一展示分配对话框, 就应该发送 ajax 请求, 获取的是 全部的权限列表(tree)
      const { data, meta } = await this.$axios.get('rights/tree')
      if (meta.status === 200) {
        // 成功了, 将数据存起来
        this.data = data
        // 通过 key 进行设置
        // this.$refs.tree.setCheckedKeys([105])
        // 将所有用户的 三级的权限 id, 都拿到, 进行回显
        const ids = []

        row.children.forEach(l1 => {
          // 所有的一级权限
          l1.children.forEach(l2 => {
            // 所有的二级权限
            l2.children.forEach(l3 => {
              // 所有的三级权限
              ids.push(l3.id)
            })
          })
        })
        // 通过 key 进行设置
        this.$refs.tree.setCheckedKeys(ids)
      } else {
        this.$message.error(meta.msg)
      }
    },
    // 分配权限
    async assignRights () {
      // 只能获取到全部选中的 id,  勾选中的 id
      // console.log(this.$refs.tree.getCheckedKeys())
      // 还需要获取半选中的 id
      // console.log(this.$refs.tree.getHalfCheckedKeys())
      const ids = this.$refs.tree.getCheckedKeys() // 全选的
      const halfs = this.$refs.tree.getHalfCheckedKeys() // 半选的
      const rids = [...ids, ...halfs].join(',')

      // 发送ajax请求, 需要 roleId 角色id,  rids 权限id
      // roleId => this.roleId
      const { meta } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids })
      if (meta.status === 200) {
        // 提示分配成功
        this.$message.success(meta.msg)
        // 关闭对话框
        this.assignVisible = false
        // 重新渲染
        this.getRoleList()
      } else {
        this.$message.error(meta.msg)
      }
    },
    async delRole (id, e) {
      // e.target 事件源
      // e.target.blur() // 如果是按钮, 那么bug就解决了
      // if (e.target.nodeName)
      // console.log(e.target.nodeName)
      if (e.target.nodeName === 'BUTTON') {
        e.target.blur()
      } else {
        // 点击的是子元素, 找他爹
        e.target.parentNode.blur()
      }

      try {
        // 根据传递过来的 id, 发送删除的 ajax 请求
        // 先询问, this.$confirm(内容, 标题, 配置)
        await this.$confirm('亲, 你确定要删除么?', '温馨提示', { type: 'warning' })
        // 说明确认了, 发送ajax请求
        const { meta } = await this.$axios.delete(`roles/${id}`)
        if (meta.status === 200) {
          this.$message.success(meta.msg)
          this.getRoleList()
        } else {
          this.$message.error(meta.msg)
        }
      } catch (e) {
        console.log(e)
      }
    },
    // 展示添加角色的对话框
    showAddDialog () {
      this.dialogTitle = '添加角色'
      this.addVisible = true
    },
    showEditDialog (row) {
      this.dialogTitle = '修改角色'
      // 显示模态框
      this.addVisible = true

      // 如果第一点击, 直接点修改, 还不能直接回显数据
      // this.$nextTick(函数), 函数会在下次dom更新完成之后, 执行
      this.$nextTick(() => {
        // 在显示完对话框之后, 再立即回显
        // 对于修改来说, 还需要回显数据
        this.form.id = row.id
        this.form.roleName = row.roleName
        this.form.roleDesc = row.roleDesc
      })
    },
    closeDialog () {
      // 只要一关闭dialog, element-ui 将内容重置为 初始状态 (第一次展示出来的状态)
      this.$refs.form.resetFields()
      this.form.id = ''
    },
    async saveRole () {
      const isAdd = this.dialogTitle === '添加角色'
      // const res = await this.$axios.xxx(url, data)
      // 分析两个接口的不同, 路径和方法不同, 参数在 this.form 中统一处理
      const url = isAdd ? 'roles' : `roles/${this.form.id}`
      const method = isAdd ? 'post' : 'put'

      // 发送ajax   this.$axios['post']  =>  this.$axios.post
      const { meta } = await this.$axios[method](url, this.form)
      if (meta.status === 200 || meta.status === 201) {
        // 提示
        this.$message.success('操作成功')
        // 关闭对话框
        this.addVisible = false
        // 重新渲染
        this.getRoleList()
      } else {
        this.$message.error(meta.msg)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.roles {
  .addRole {
    margin-bottom: 10px;
  }
  .l1 {
    border-bottom: 1px dotted #ccc;
    margin-bottom: 5px;
    padding: 5px 0;
  }
  .l2 {
    margin-bottom: 5px;
  }
  .l3 {
    margin-right: 10px;
    margin-bottom: 5px;
  }
}
</style>
