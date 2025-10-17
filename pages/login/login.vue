<template>
  <view class="login-wrapper">
    <view class="login-container">
      <text class="login-title">欢迎登录</text>
      <view class="login-form">
        <view class="login-form-item">
          <input type="text" placeholder="请输入手机号" placeholder-class="holder-class" v-model='account'/>
          <view class="line"></view>
        </view>
        <view class="login-form-item">
          <input type="password" placeholder="请输入密码" placeholder-class="holder-class" v-model='password'/>
          <view class="line"></view>
          <text style="float: right; margin-top: 4rpx" @tap="goForgetPwdPage1">忘记密码</text>
        </view>
        <view class="login-form-item">
          <button type="primary" @click="gologin">登 录</button>
        </view>
        <view class="login-form-text">
          <text class="code-login" @tap="goToCodeLogin">验证码登录</text>
          <text class="h-line"></text>
          <text class="reg" @tap="goToReg">注册</text>
        </view>
      </view>
    </view>
    <oss></oss>
  </view>
</template>

<script lang="ts" setup>
import { ref,reactive,watch } from 'vue'
import {apilogin} from '../../api/apis.js'
import { apigetsts } from '../../api/apis.js';
import { setToken,getToken,setAccount,getAccount } from '../../utils/request.js'; // 导入setToken和setAccount方法

// 声明uni类型
declare const uni: any;


//----------------------------------


const type=ref('0');//0代表用户密码登录
const account=ref('');
const password=ref('');
const code=ref('');
const tocken=ref('');
const Userinfo = reactive({
    type: '',
    account: '',
    password: '',
});
//同步输入的参数
watch([type, account, password, code], ([newtype, newaccount, newpassword]) => {
    Userinfo.type = newtype;
    Userinfo.account = newaccount;
    Userinfo.password = newpassword;
}, { immediate: true });

// 点击登录从这里拿到tocken信息
const gologin=async ()=>{
	try {
	    const success = await apilogin(Userinfo);
	    if (success) {
	      // 设置全局token
	      if (success.data?.token) {
	        setToken(success.data.token);
	      } else {
	        alert('登录失败：未获取到token');
	        return;
	      }
	      
	      // 设置全局account
	      if (account.value) {
	        setAccount(account.value);
	      } else {
	        alert('登录失败：账号信息异常');
	        return;
	      }
	      
	      alert('登录成功');
	      
	      // 跳转到用户页面
		  uni.switchTab({
			   url: '/pages/user/user',
		  })
	    } else {
	      alert('登录失败');
	    }
	  } catch (error) {
	    alert('登录过程中发生错误: ' + (error.message || error));
	  }
}

//-------------------------------------------------------------
//上传文件




// 跳转到注册页面(uni.navigateTo跳转到指定页面)
const goToReg = () => {
  uni.navigateTo({
    url: '/pages/reg/reg',
  })
}

// 跳转到验证码登录页面(uni.navigateTo跳转到指定页面)
const goToCodeLogin = () => {
  uni.navigateTo({
    url: '/pages/code-login/code-login',
  })
}

// 跳转到验证码页面(uni.navigateTo跳转到指定页面)
const goForgetPwdPage1 = () => {
  uni.navigateTo({
    url: '/pages/code-login/code-login?type=forgetPwd',
  })
}

// 跳转到首页
const login = () => {
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<!-- placeholder-class这个属性如果使用了<style scoped>就不生效，所以我们可以单独再写一个style -->
<style>
.holder-class {
  color: #ccc;
}
</style>
<style lang="scss" scoped>
.login-wrapper {
  height: 100vh;
}

.login-container {
  padding: 80rpx 70rpx;
  height: 100vh; // 使容器的高度为视口高度
  .login-title {
    position: absolute;
    letter-spacing: 12rpx;
    font-size: 56rpx;
    font-weight: 600;
  }
  .login-form {
    position: absolute;
    margin-top: 120rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    box-sizing: border-box;
    padding: 80rpx 70rpx;
    .login-form-item {
      margin-bottom: 100rpx;
      button {
        border-radius: 40rpx;
        background-color: #465cff;
      }
      input {
        font-size: 32rpx;
        height: 32rpx;
      }
    }
    .login-form-text {
      text-align: center;
      .h-line {
        margin: 0 20rpx;
        border: 1px solid #ccc;
      }
      .reg {
        color: #465cff;
      }
    }
  }
}
.line {
  margin-top: 20rpx;
  box-shadow: 0 0 0 0.5px rgba(241, 241, 241, 1);
}
</style>
