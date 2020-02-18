<template>
    <el-container class="home-container">
        <el-header>
            <div>
                <img src="../assets/heima.png" alt="">
                <span>电商后台管理系统</span>
            </div>
            <el-button type="info" @click="logout">退出</el-button>
        </el-header>
        <!-- 页面主体区域 -->
        <el-container>
            <!-- 侧边栏 -->
            <el-aside :width="isCollapse ? '64px':'200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <!-- 侧边栏菜单区域 -->
                <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" 
                :collapse-transition="false" router :default-active="activePath">
                    <!-- 一级菜单 -->
                    <el-submenu :index="item.id + ''" :key="item.id" v-for="item in menulist">
                        <template slot="title">
                            <!-- 图标 -->
                            <i :class="iconlist[item.id]"></i>
                            <!-- 文本 -->
                            <span>{{item.authName}}</span>
                        </template>
                
                        <!-- 二级菜单 -->
                        <el-menu-item :index="'/' + subItem.path" :key="subItem.id" 
                        v-for="subItem in item.children" @click="saveNavState('/' + subItem.path)">
                            <!-- 图标 -->
                            <i class="el-icon-menu"></i>
                            <!-- 文本 -->
                            <span>{{subItem.authName}}</span>
                        </el-menu-item> 
                    </el-submenu>
                    
                </el-menu>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
export default {
    data() {
        return {
            // 左侧菜单数据
            menulist:[],     
            iconlist:{
                '125':'iconfont icon-users',
                '103':'iconfont icon-tijikongjian',
                '101':'iconfont icon-shangpin',
                '102':'iconfont icon-danju',
                '145':'iconfont icon-baobiao',
            },
            // 是否折叠
            isCollapse:false,
            // 被激活的链接地址
            activePath:''
        }
    },
    // 生命周期函数
    created() {
        this.getMenuList()
        this.activePath = window.sessionStorage.getItem('activePath')
    },
    methods:{
        logout(){
            window.sessionStorage.clear();
            this.$router.push('/login');
        },
        // 获取所有的菜单
        async getMenuList() {
            const {data:res} = await this.$http.get('menus');
            if(res.meta.status != 200) return this.$message.error(res.meta.msg);
            this.menulist = res.data;  
            console.log(res);
                           
        },
        toggleCollapse() {
            this.isCollapse = !this.isCollapse;
        },
        // 保存链接的激活状态
        saveNavState(activePath) {
            window.sessionStorage.setItem('activePath',activePath);
            // 点击后高亮显示
            this.activePath = activePath;
        }
    } 
}
</script>

<style lang="less" scoped>
    .el-header {     
        display: flex;
        justify-content: space-between; 
        background-color: #373d41;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;
        > div {
            display: flex;
            align-items: center;
            span {
                margin-left: 15px;
                
            }          
        }
    }
    .el-aside {
         background-color: #333744;
    }
    .el-main {
        background-color: #eaedf1;
    }
    .home-container{
        height: 100%;
    }
    .el-menu {
        border-right: 0;
    }
    .toggle-button {
        background-color: #4a5064;
        color: #fff;
        font-size: 10px;       
        text-align: center;
        line-height: 24px;
        // 文本间距
        letter-spacing: 0.2em;
        cursor: pointer;
    }
    
</style>