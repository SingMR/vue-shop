<template>
    <div class="login_container">
        <div class="login_box">
            <!-- 头像区域 -->
            <div class="avatar_box">
                <img src="../assets/logo.png" alt="">
            </div>
            <!-- 登录表单区域 -->
            <el-form class="login_form" :rules="loginFormRulers" ref="loginFormRef" :model="loginForm">
                <!-- 用户名 -->
                <el-form-item prop="username">
                    <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
                </el-form-item>
                <!-- 密码 -->
                <el-form-item prop="password">
                    <el-input prefix-icon="iconfont icon-3702mima" v-model="loginForm.password" type="password"></el-input>
                </el-form-item>
                <!-- 按钮 -->
                 <el-form-item class="btns">
                    <el-button type="primary" @click="submitForm('loginFormRef')">登录</el-button>
                    <el-button type="info" @click="resetForm('loginFormRef')">重置</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 这是登录表单的数据绑定对象
            loginForm:{
                username:'admin',
                password:'123456'
            },
            // 表单验证规则对象
            loginFormRulers:{
                // 验证用户是否合法
                username:[
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }],
                // 验证密码是否合法
                password:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ]
            }          
        }
    },
    methods:{
        // 提交表单
        submitForm(formName) {
            // 表单预验证
        this.$refs[formName].validate( async valid => {
            // valid 为boolean
          if (valid) {
            const {data:res} = await this.$http.post('login',this.loginForm);
            if(res.meta.status != 200) return this.$message.error('错了哦,登录失败')                       
            this.$message.success('恭喜你,登录成功')
            // 1.将登录成功之后 token，保存到客户端的sessionStorage中
            // 1.1 项目中出现了登录之外的其他API接口，必修在登录之后才能访问
            // 1.2 token只应在当前网站代开期间生效，所以讲token保存在sessionStorage中 
            window.sessionStorage.setItem('token',res.data.token);
            // 2 通过编程式导航跳转到后台主页，路由地址是/home
            this.$router.push('/home')
          } else {
            return false;
          }
        });
        },
        // 重置表单
        resetForm(formName) {
            this.$refs[formName].resetFields();
      }
    }
}
</script>

<style lang="less" scoped>
    .login_container{
        background-color: #2b4b6b;
        height: 100%;
    }
    .login_box {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
        width: 450px;
        height: 300px;
        background-color: #fff;
        border-radius: 3px;

        .avatar_box {
            position: absolute;
            left: 50%;
            transform: translate(-50%,-50%);
            width: 130px;
            height: 130px;
            border: 1px solid #eee;
            border-radius: 50%;
            padding: 10px;
            box-shadow: 0 0 10px #ddd;
            background-color: #fff;
       
            img {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background-color: #eee;
                
            }
        } 
        .btns {
            display: flex;
            justify-content: flex-end;

        }
        .login_form {
            position: absolute;
            bottom: 0;
            width: 100%;
            padding: 0 20px;
            box-sizing: border-box;
        }
    }
    

    
</style>