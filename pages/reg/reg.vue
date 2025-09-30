<template>
  <view class="reg-container">
    <text class="reg-title">欢迎注册</text>
    <!-- 用户注册表单 -->
    <view class="reg-form">
      <view class="reg-form-item">
        <input type="back" placeholder="请输入手机号" placeholder-class="holder-class" v-model="account" />
        <view class="line"></view>
      </view>
      <view class="reg-form-item">
        <view class="code-container">
        <VerificationCode
          ref="codeRef"  
          placeholder="请输入验证码"
          @getCode="sendLoginCode"
          @input="handleCodeInput" 
        />
        </view>
        <view class="line"></view>
      </view>
      <view class="reg-form-item">
        <input type="text" placeholder="用户名" placeholder-class="holder-class" v-model="uname" />
        <view class="line"></view>
      </view>
      <view class="reg-form-item">
        <input type="password" placeholder="密码" placeholder-class="holder-class" v-model="password"  />
        <view class="line"></view>
      </view>
      <view class="reg-form-item">
        <button class="reg-btn" type="primary" @click="doReg">注 册</button>
      </view>
      <view class="reg-form-text">
        <text class="reg-login">已有账号？</text>
        <text class="reg" @tap="goToLogin">登录</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import VerificationCode from '@/components/VerificationCode.vue';
import { ref,reactive,watch } from 'vue'
import {apiRegInfo} from '@/api/apis.js' 
import {apiSendCode} from '@/api/apis.js'
// 跳转到登录页面(uni.navigateTo跳转到指定页面)
const goToLogin = () => {
  uni.navigateBack()
}

const account = ref('');
const code = ref('');
const codeRef = ref(null);  // 验证码组件实例
const uname=ref('');
const password=ref('');
const Reginfo = reactive({
    account: '',
    code: '',
    uname: '',
    password: ''
});
// 输入验证码时更新值
const handleCodeInput = (value) => {
  code.value = value;
};
// 发送登录验证码
const sendLoginCode = async () => {
  // 1. 验证手机号（实际项目中添加验证逻辑）
  if (!account.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  try {
      // 调用发送验证码的API
      const response = await apiSendCode({phone:account.value});
      // 如果发送成功，启动倒计时
      if (response.code === 200) {
        codeRef.value.startCountdown();
      } else {
        uni.showToast({ title: response.errMsg, icon: 'none' });
      }
    } catch (error) {
      uni.showToast({ title: '发送验证码失败', icon: 'none' });
    }
  };
  


watch([account, code, uname, password], ([newAccount, newCode, newUname, newPassword]) => {
    Reginfo.account = newAccount;
    Reginfo.code = newCode;
    Reginfo.uname = newUname;
    Reginfo.password = newPassword;
}, { immediate: true });

// 注册逻辑
const doReg = async () => {
  // 注册验证逻辑...
  // return { account: account.value, code: code.value,uname: uname.value, password: password.value };
  console.log('注册：', {account: account.value, code: code.value,uname: uname.value, password: password.value});
  console.log(Reginfo)
 try {
        // 调用注册API
        const success =await apiRegInfo(Reginfo);
        if (success) {
            // 注册成功，显示提示框
             alert('注册成功');
			 uni.redirectTo({
				  url: '/pages/login/login',
			 })
        }
    } catch (error) {
        alert('注册过程中发生错误');
    }

};



</script>

<style>
.holder-class {
  color: #ccc;
}
</style>
<style lang="scss" scoped>
.reg-container {
  padding: 80rpx 70rpx;
  height: 100vh; // 使容器的高度为视口高度
  .reg-title {
    position: absolute;
    letter-spacing: 12rpx;
    font-size: 56rpx;
    font-weight: 600;
  }
  .reg-form {
    position: absolute;
    // top: 38%;
    margin-top: 120rpx;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    box-sizing: border-box;
    padding: 80rpx 70rpx;
    .reg-form-item {
      margin-bottom: 100rpx;
      .reg-btn {
        border-radius: 40rpx;
        background-color: #465cff;
      }
      input {
        font-size: 32rpx;
        height: 32rpx;
      }
    }
    .reg-form-text {
      text-align: center;
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
.code-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  .code-btn {
    background-color: transparent;
    padding: 0px;
    line-height: 32rpx;
    margin: 0;
    color: #465cff;
  }
}
</style>