<template>
  <view class="login-container">
    <text v-if="!isForgetPwd" class="login-title">欢迎登录</text>
    <text v-if="isForgetPwd" class="login-title">重置密码</text>
    <view class="login-form">
      <view class="login-form-item">
        <input type="text" placeholder="请输入手机号" placeholder-class="holder-class" v-model="phone"  />
        <view class="line"></view>
      </view>
	  <view class="login-form-item">
	   <VerificationCode
	     ref="codeRef"  
	     placeholder="请输入验证码"
	     @getCode="sendLoginCode"  
	     @input="handleCodeInput" 
	   />
	    <view class="line"></view>
	  </view>
       <!-- 引用验证码组件 -->

	  <view class="login-form-item">
	    <button type="primary" @tap="login">登 录</button>
	  </view>
      <view v-if="!isForgetPwd" class="login-form-text">
        <text class="user-login" @tap="userLogin">账号登录</text>
        <text class="h-line"></text>
        <text class="reg" @tap="goToReg">注册</text>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import VerificationCode from '@/components/VerificationCode.vue';

import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 是否显示忘记密码
const isForgetPwd = ref(false)

// 跳转到注册页面(uni.navigateTo跳转到指定页面)
const goToReg = () => {
  uni.navigateTo({
    url: '/pages/reg/reg',
  })
}

// 前往账号登录的页面
const userLogin = () => {
  uni.navigateTo({
    url: '/pages/login/login',
  })
}

onLoad((options: any) => {
  if (options.type === 'forgetPwd') {
    isForgetPwd.value = true
  } else {
    isForgetPwd.value = false
  }
})

const phone = ref('');
const code = ref('');
const codeRef = ref(null);  // 验证码组件实例

// 输入验证码时更新值
const handleCodeInput = (value) => {
  code.value = value;
};

// 发送登录验证码
const sendLoginCode = async () => {
  // 1. 验证手机号（实际项目中添加验证逻辑）
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' });
    return;
  }
  
  codeRef.value.startCountdown();
};

// 登录逻辑
const login = () => {
  // 登录验证逻辑...
  console.log('登录：', { phone: phone.value, code: code.value });
};
</script>

<style>
.holder-class {
  color: #ccc;
}
</style>
<style lang="scss" scoped>
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
