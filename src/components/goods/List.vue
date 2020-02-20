<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getSearchGoodsList"
            autofocus
          >
            <el-button slot="append" icon="el-icon-search" @click="getSearchGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="17">
          <el-button type="primary" class="btn" @click="getAddGoods">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="goodslist" style="width: 100%" border>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name" width="680"></el-table-column>
        <el-table-column label="商品价格(元)" prop="goods_price" width="110"></el-table-column>
        <el-table-column label="商品重量" prop="goods_weight" width="90"></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="180">
          <!-- dataFormat为调用的时间处理函数 在入口处声明 main.js -->
          <template slot-scope="scope">{{scope.row.add_time | dataFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="delGoodsList(scope.row.goods_id)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[100, 300, 500, 700]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
    ></el-pagination>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取商品列表的请求参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 20
      },
      // 存放商品列表数据
      goodslist: [],
      total: 0
    }
  },
  created() {
    this.getGoodLsit()
  },
  methods: {
    async getGoodLsit() {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status != 200) {
        return this.$message.error('获取商品列表失败')
      }
      this.goodslist = res.data.goods
      this.total = res.data.total
    },
    // 当前页面最大显示数量
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodLsit()
    },
    // 当前页码变动时触发
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodLsit()
    },
    //搜索商品列表
    getSearchGoodsList() {
      this.getGoodLsit()
    },
    //根据id删除商品列表数据
    async delGoodsList(id) {
      const comfirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(error => error)
      if (comfirmResult == 'confirm') {
        const { data: res } = await this.$http.delete('goods/' + id)
        if (res.meta.status != 200) {
          return this.$message.error('删除商品失败')
        }
        this.getGoodLsit()
        return this.$message.success('删除商品成功')
      } else {
        return this.$message.info('已取消删除')
      }
    },
    // 添加商品按钮
    getAddGoods() {
        //通过编程式导航跳转页面
        this.$router.push('/home/add')
    }
  }
}
</script>

<style lang="less" scoped>
.btn {
  margin: 0 0 10px 20px;
}
</style>