<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" class="btn" @click="showCateDialogVisible">添加分类</el-button>
        </el-col>
      </el-row>
      <tree-table
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text
        border
        :show-row-hover="false"
      >
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" style="color:lightgreen;" v-if="scope.row.cat_deleted===false"></i>
          <i class="el-icon-error" style="color:red;" v-else></i>
        </template>
        <!-- 排序列 -->
        <template slot="paixu" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level ===0">一级</el-tag>
          <el-tag type="success" v-else-if="scope.row.cat_level===1">二级</el-tag>
          <el-tag type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="bianji" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="editCate(scope.row.cat_id,scope.row.cat_name)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="delCate(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 5, 10, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <el-dialog
      title="添加分类"
      :visible.sync="setCatDialogVisible"
      width="50%"
      @close="cateDialogClosed"
    >
      <el-form :model="cateForm" :rules="cateFormRules" ref="cateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="cateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setCatDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="修改分类" :visible.sync="editDialogVisible" width="50%">
      <el-form ref="editFormRef" :model="editForm" label-width="80px">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateDialog">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 存放商品分类数据列表
      catelist: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 表示当前这列使用的模板名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'paixu'
        },
        {
          label: '编辑',
          type: 'template',
          template: 'bianji'
        }
      ],
      // 控制对话框的显示与隐藏
      setCatDialogVisible: false,
      cateForm: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      cateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 存放父级分类列表数据
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: true
      },
      // 选中的父级分类id数组
      selectedKeys: [],
      editDialogVisible: false,
      // 存放编辑后的数据列表
      editForm: {
        cat_id: '',
        cat_name: ''
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      console.log(res)

      if (res.meta.status != 200) {
        return this.$message.error('添加商品分类失败')
      }
      this.catelist = res.data.result
      this.total = res.data.total
    },
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getCateList()
    },
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getCateList()
    },
    showCateDialogVisible() {
      // 点击添加分类按钮时，获取父级分类列表数据
      this.getParentCateList()
      this.setCatDialogVisible = true
    },
    // 获取父级分类列表数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      //   console.log(res);

      if (res.meta.status != 200) {
        return this.$message.error('获取父级分类列表失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        this.cateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        this.cateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.cateForm.cat_level = 0
        this.cateForm.cat_pid = 0
      }
    },
    // 监听添加分类对话框的关闭事件，重置表单
    cateDialogClosed() {
      this.selectedKeys = []
      this.cateForm.cat_level = 0
      this.cateForm.cat_pid = 0
      this.$refs.cateFormRef.resetFields()
    },
    // 添加商品分类
    addCate() {
      //预验证
      this.$refs.cateForm.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.cateForm)
        if (res.meta.status != 201)
          return this.$message.error('添加商品分类失败')
        this.getCateList()
        this.setCatDialogVisible = false
        this.$message.success('添加商品分类成功')
      })
    },
    editCate(id, name) {
      this.editForm.cat_id = id
      this.editForm.cat_name = name
      this.editDialogVisible = true
    },
    editCateDialog() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          { cat_name: this.editForm.cat_name }
        )
        if (res.meta.status != 200) {
          return this.$message.error('修改商品分类失败')
        }
        this.editDialogVisible = false
        this.getCateList()
        this.$message.success('修改商品分类成功')
      })
    },
    async delCate(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (confirmResult != 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status != 200) return this.$message.error('商品分类删除失败')
      this.getCateList()
      this.$message.success('删除商品分类成功')
    }
  }
}
</script>


<style lang="less" scoped>
.btn {
  margin-bottom: 10px;
}
.el-cascader {
  width: 100%;
}
</style>
