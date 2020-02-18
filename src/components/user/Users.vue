<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <!-- 作用域插槽              -->
          <template slot-scope="scope">
            <!-- 通过scooe.row能过去到一行上的对象                    -->
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="delUser(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <el-tooltip content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page.sync="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" show-password></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 用户编辑对话框 -->
    <el-dialog title="编辑用户" :visible.sync="showDialogVisible" width="50%" @close="showDialogClosed">
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="100px">
        <!-- 用户名 -->
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <!-- 邮箱 -->
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <!-- 手机号 -->
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showDialogVisible=false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="50%" @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>分配角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option v-for="item in roleslist" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 自定义验证邮箱是否合法
    const regEamil = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
    var checkEamil = (rule, value, callback) => {
      if (regEamil.test(value)) return callback()
      callback(new Error('请输入合法的邮箱'))
    }
    const regMobile = /^(13[0-9]|14[5|7]|15[0|1|2|3|4|5|6|7|8|9]|18[0|1|2|3|5|6|7|8|9])\d{8}$/
    var checkMobile = (rule, value, callback) => {
      if (regMobile.test(value)) return callback()
      callback(new Error('请输入合法的手机号'))
    }
    return {
      // 获取用户列表对象
      queryInfo: {
        query: '',
        // 当前的页数
        pagenum: 1,
        pagesize: 3
      },
      userlist: [],
      total: 0,
      // 控制用户对话框的显示与隐藏
      addDialogVisible: false,
      // 控制编辑用户对话框的显示与隐藏
      showDialogVisible: false,
      // 添加用户数据列表
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加编辑用户信息
      editForm: {},

      // 验证用户输入规则
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEamil, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 控制分配角色对话框的显示与隐藏
      setRoleDialogVisible: false,
      // 需要被分配角色的信息
      userInfo: {},
      // 获取所有角色列表数据
      roleslist: [],
      // 已选中的角色id值
      selectRoleId:''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status != 200) return this.$message.error(res.meta.msg)
      this.userlist = res.data.users
      this.total = res.data.total
      //   console.log(res)
    },
    // 监听 pagesize 改变的事件
    handleSizeChange(newSize) {
      // 每页显示多少条数据
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      // 获取最新页码
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },

    async userStateChanged(userinfo) {
      console.log(userinfo)
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      )
      if (res.meta.status != 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('更新用户状态失败')
      }
      this.$message.success('更新用户状态成功')
    },
    // 重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // vaild 为布尔值
        if (valid) {
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status != 201) return this.$message.error('添加用户失败')
          this.$message.success('添加用户成功')
          this.addDialogVisible = false
          this.getUserList()
        }
      })
    },
    async showEditDialog(id) {
      this.showDialogVisible = true
      console.log(id)
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status != 200) return this.$message.error('查询用户失败')
      this.editForm = res.data
      this.$message.success('查询用户成功')
    },
    // 关闭对话框重置表单
    showDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editUser() {
      // 预处理,验证表单输入是否正确
      this.$refs.editFormRef.validate(async valid => {
        if (valid) {
          const { data: res } = await this.$http.put(
            'users/' + this.editForm.id,
            { email: this.editForm.email, mobile: this.editForm.mobile }
          )
          if (res.meta.status != 200)
            return this.$message.error('修改用户信息失败')
          //关闭对话框
          this.showDialogVisible = false
          // 刷新用户列表
          this.getUserList()
          this.$message.success('修改用户信息成功')
        }
      })
    },
    async delUser(id) {
      const confirmInfo = await this.$confirm(
        '此操作将永久删除该用户信息, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      // 点击取消的提示
      if (confirmInfo != 'confirm') return this.$message.info('已取消删除')
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status != 200) return this.$message.error('删除用户失败')
      this.getUserList()
      this.$message.success('删除用户成功')
    },
    async setRoles(userInfo) {
      this.userInfo = userInfo
      const { data: res } = await this.$http.get('roles')
      this.roleslist = res.data
      this.setRoleDialogVisible = true
    },
    // 点击按钮，分配角色
    async saveRoleInfo() {
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,{rid:this.selectRoleId})
      if(res.meta.status != 200) return this.$message.error('分配角色失败')
      this.setRoleDialogVisible = false
      this.getUserList();
      this.$message.success('分配角色成功')
    },
    // 监听分配角色2对话框关闭事件 再次打开，显示为空
    setRoleDialogClosed() {
      // this.roleslist = [];
      this.selectRoleId = ''
    }
  }
}
</script>

<style lang="less" scoped>
</style>