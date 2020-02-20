<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
      <el-row>
        <el-col>
          <span>选择商品分类</span>
          <el-cascader
            v-model="selectKeys"
            :options="catelist"
            :props="cascaderProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="动态参数" name="many">
          <el-row>
            <el-col>
              <el-button
                type="primary"
                size="small"
                :disabled="isBtnDisable"
                @click="addDialogVisible=true"
              >添加参数</el-button>
            </el-col>
          </el-row>
          <p></p>
          <el-table :data="manyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagClosed(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="showDelDialog(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <el-row>
            <el-col>
              <el-button
                type="primary"
                size="small"
                :disabled="isBtnDisable"
                @click="addDialogVisible=true"
              >添加属性</el-button>
            </el-col>
          </el-row>
          <p></p>
          <el-table :data="onlyTableData" style="width: 100%" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="tagClosed(scope.row,i)"
                >{{item}}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="small"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="small"
                  @click="showDelDialog(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog :title="'修改'+titleText" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 存放所有商品分类数据列表
      catelist: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中父级分类id数组
      selectKeys: [],
      // 被激活的tab标签页
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入对应名称', trigger: 'blur' }
        ]
      },
      //控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 存放编辑的数据
      editForm: {},
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入对应名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有分类数据列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status != 200) {
        return this.$message.error('获取商品分类数据列表失败')
      }
      this.catelist = res.data
    },
    handleChange() {
      this.getParamsData()
    },
    handleClick() {
      this.getParamsData()
    },
    // 获取所有参数列表
    async getParamsData() {
      // 选中的不是三级分类
      if (this.selectKeys.length != 3) {
        this.selectKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 选中的时三级分类
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('获取参数列表失败')
      }
      // 让attr_vals的以空格分隔遍历成数组
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 为res.data添加属性，让每个item单独享用
        item.inputVisible = false
        item.inputValue = ''
      })
      console.log(res.data)
      if (this.activeName == 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听对话框关闭事件进行重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加参数或属性
    addParams() {
      //预验证
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status != 201) {
          return this.$message.error('添加' + this.titleText + '失败')
        }
        this.addDialogVisible = false
        this.getParamsData()
        this.selectKeys = []
        this.$message.success('添加' + this.titleText + '成功')
      })
    },
    // 编辑按钮
    async showEditDialog(val) {
      // 查询当前参数的信息
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${val.attr_id}`,
        { params: { attr_sel: this.activeName } }
      )
      if (res.meta.status != 200) {
        return this.$message.error('查询失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },

    editParams() {
      // 预处理
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status != 200) {
          return this.$message.error('修改' + this.titleText + '失败')
        }
        this.editDialogVisible = false
        this.getParamsData()
        this.$message.success('修改' + this.titleText + '成功')
      })
    },
    //删除按钮
    async showDelDialog(val) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (confirmResult == 'confirm') {
        const { data: res } = await this.$http.delete(
          `categories/${this.cateId}/attributes/${val.attr_id}`
        )
        if (res.meta.status != 200) {
          return this.$message.error('删除' + this.titleText + '失败')
        }
        this.getParamsData()
        return this.$message.success('删除' + this.titleText + '成功')
      } else {
        return this.$message.info('已取消删除')
      }
    },
    // 当按下enter或离开焦点是触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length == 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return 则证明输入的内容，需要做后续的处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    showInput(row) {
      row.inputVisible = true
      // 让文本自动获得焦点
      // $nextTick 当页面上的元素被重新渲染之后，才会指定回调函数中代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除tag标签
    tagClosed(row, i) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    },
    // 对attr_vals的操作，保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status != 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    }
  },
  computed: {
    // 判断是添加按钮是否禁用 根据selectKeys的长度,禁用则返回true
    isBtnDisable() {
      if (this.selectKeys.length != 3) {
        return true
      }
      return false
    },
    // 获取分类id
    cateId() {
      if (this.selectKeys.length == 3) {
        return this.selectKeys[2]
      }
      return null
    },
    // 添加参数，属性对话框的选择
    titleText() {
      if (this.activeName == 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.el-alert {
  margin-bottom: 20px;
}
.el-cascader {
  margin-left: 15px;
}
.el-tabs {
  margin-top: 20px;
}

.input-new-tag {
  width: 120px;
}
</style>