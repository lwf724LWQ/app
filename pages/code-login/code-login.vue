<template>
  <view class="code-login-container">
    <!-- 状态栏 -->
    <view class="status-bar"></view>
    
    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <view class="back-icon">
          <text class="back-arrow">←</text>
          <view class="logo-lines">
            <view class="line line-1"></view>
            <view class="line line-2"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 主标题 -->
    <view class="title-section">
      <text class="main-title" v-if="!isForgetPwd">验证码登录</text>
      <text class="main-title" v-if="isForgetPwd">重置密码</text>
    </view>
    
    <!-- 登录表单 -->
    <view class="code-login-form">
      <!-- 手机号输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon phone-icon">
            <view class="phone-icon-svg"></view>
          </view>
          <text class="country-code">+86</text>
          <view class="separator"></view>
          <input 
            type="text" 
            placeholder="请输入手机号" 
            placeholder-class="input-placeholder" 
            v-model="phone"
            class="phone-input"
          />
        </view>
      </view>
      
      <!-- 验证码输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon code-icon">
            <view class="code-icon-svg"></view>
          </view>
          <view class="code-container">
            <VerificationCode
              ref="codeRef"  
              placeholder="请输入验证码"
              @getCode="sendLoginCode"  
              @input="handleCodeInput" 
            />
          </view>
        </view>
      </view>
      
      <!-- 链接区域 -->
      <view class="links-section" v-if="!isForgetPwd">
        <text class="user-login" @click="userLogin">账号登录</text>
        <text class="register-link" @click="goToReg">注册</text>
      </view>
      
      <!-- 登录按钮 -->
      <view class="login-btn-container">
        <button class="login-btn" @click="login">
          {{ isForgetPwd ? '重置密码' : '登录' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
// @ts-ignore
import VerificationCode from '../../components/VerificationCode.vue'
// @ts-ignore
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { apiSendCode } from '../../api/apis.js'
import { apilogin } from '../../api/apis.js'
import { setToken, setAccount } from '../../utils/request.js'

declare const uni: any

// 是否显示忘记密码
const isForgetPwd = ref(false)

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 跳转到注册页面
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

// 发送验证码
const sendLoginCode = async () => {
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  try {
    const response = await apiSendCode({phone: phone.value})
    if (response.code === 200) {
      codeRef.value.startCountdown()
      uni.showToast({ title: '验证码已发送', icon: 'success' })
    } else {
      uni.showToast({ title: response.errMsg || '发送失败', icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '发送验证码失败', icon: 'none' })
  }
}

// 登录逻辑
const login = async () => {
  if (!phone.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  
  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }
  
  uni.showLoading({ title: '登录中...' })
  
  try {
    const loginData = {
      type: '1', // 验证码登录
      account: phone.value,
      code: code.value
    }
    
    const success = await apilogin(loginData)
    uni.hideLoading()
    
    if (success) {
      // 打印登录返回的完整数据，用于调试
      console.log('验证码登录API返回的完整数据:', success);
      
      // 设置全局token
      if (success.data?.token) {
        setToken(success.data.token)
      }
      
      // 设置全局account
      if (phone.value) {
        setAccount(phone.value)
      }
      
      // 直接使用登录返回的用户信息
      try {
        // 从登录返回的数据中提取用户信息
        const loginData = success.data || {};
        
        // 处理头像URL - 如果是相对路径，拼接完整URL
        let avatarUrl = 'http://video.caimizm.com/himg/user.png'; // 默认头像
        if (loginData.himg) {
          if (loginData.himg.startsWith('http')) {
            // 已经是完整URL
            avatarUrl = loginData.himg;
          } else {
            // 相对路径，拼接完整URL
            avatarUrl = `http://video.caimizm.com/himg/${loginData.himg}`;
          }
        }
        
        // 保存用户信息到本地存储
        const userInfo = {
          nickname: loginData.uname || '用户',
          avatar: avatarUrl,
          phone: phone.value
        };
        
        // 保存到本地存储，供用户页面使用
        uni.setStorageSync('userInfo', userInfo);
        uni.setStorageSync('loginData', {
          uname: loginData.uname,
          himg: loginData.himg,
          account: phone.value
        });
        
        console.log('验证码登录成功，用户信息已保存:', userInfo);
        console.log('登录数据已保存:', {
          uname: loginData.uname,
          himg: loginData.himg,
          account: phone.value
        });
        
      } catch (error) {
        console.error('保存用户信息失败:', error);
        // 使用默认用户信息
        const defaultUserInfo = {
          nickname: '用户',
          avatar: 'http://video.caimizm.com/himg/user.png',
          phone: phone.value
        };
        uni.setStorageSync('userInfo', defaultUserInfo);
        uni.setStorageSync('loginData', {
          uname: '用户',
          himg: 'http://video.caimizm.com/himg/user.png',
          account: phone.value
        });
      }
      
      uni.showToast({ title: '登录成功', icon: 'success' })
      
      setTimeout(() => {
        uni.switchTab({ url: '/pages/user/user' })
      }, 1500)
    } else {
      uni.showModal({ title: '登录失败', content: '验证码错误或已过期，请重试', showCancel: false })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showModal({ title: '登录失败', content: '网络错误，请检查网络连接后重试', showCancel: false })
  }
}
</script>

<style>
.input-placeholder {
  color: #999;
}
</style>

<style lang="scss" scoped>
.code-login-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fffe 0%, #ffffff 100%);
  position: relative;
}

/* 状态栏 */
.status-bar {
  height: 44rpx;
  background: transparent;
}

/* 头部区域 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  margin-bottom: 40rpx;
  
  .back-btn {
    width: 60rpx;
    height: 60rpx;
    background: #e8f5e8;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    .back-icon {
      position: relative;
      width: 40rpx;
      height: 40rpx;
      
      .back-arrow {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 32rpx;
        color: #28B389;
        font-weight: bold;
        z-index: 2;
      }
      
      .logo-lines {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        
        .line {
          position: absolute;
          background: #28B389;
          border-radius: 2rpx;
          opacity: 0.3;
          
          &.line-1 {
            width: 20rpx;
            height: 2rpx;
            top: -8rpx;
            left: -10rpx;
            transform: rotate(-15deg);
          }
          
          &.line-2 {
            width: 16rpx;
            height: 2rpx;
            top: 4rpx;
            left: -8rpx;
            transform: rotate(15deg);
          }
        }
      }
    }
  }
}

/* 主标题 */
.title-section {
  text-align: center;
  margin-bottom: 80rpx;
  
  .main-title {
    font-size: 56rpx;
    font-weight: 700;
    color: #000;
    letter-spacing: 4rpx;
  }
}

/* 登录表单 */
.code-login-form {
  padding: 0 60rpx;
  
  .input-group {
    margin-bottom: 40rpx;
    
    .input-container {
      background: #fff;
      border-radius: 20rpx;
      padding: 30rpx 40rpx;
      display: flex;
      align-items: center;
      box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
      
      .input-icon {
        width: 40rpx;
        height: 40rpx;
        margin-right: 20rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .phone-icon-svg {
          width: 32rpx;
          height: 48rpx;
          border: 3rpx solid #28B389;
          border-radius: 8rpx;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: 4rpx;
            left: 4rpx;
            right: 4rpx;
            bottom: 8rpx;
            border: 2rpx solid #28B389;
            border-radius: 4rpx;
          }
          
          &::after {
            content: '';
            position: absolute;
            bottom: 2rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 8rpx;
            height: 8rpx;
            background: #28B389;
            border-radius: 50%;
          }
        }
        
        .code-icon-svg {
          width: 32rpx;
          height: 32rpx;
          border: 3rpx solid #28B389;
          border-radius: 6rpx;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: 4rpx;
            left: 4rpx;
            width: 6rpx;
            height: 6rpx;
            background: #28B389;
            border-radius: 50%;
          }
          
          &::after {
            content: '';
            position: absolute;
            bottom: 4rpx;
            right: 4rpx;
            width: 8rpx;
            height: 8rpx;
            background: #28B389;
            border-radius: 50%;
          }
        }
      }
      
      .country-code {
        font-size: 32rpx;
        color: #000;
        font-weight: 500;
        margin-right: 20rpx;
      }
      
      .separator {
        width: 2rpx;
        height: 40rpx;
        background: #ddd;
        margin-right: 20rpx;
      }
      
      .code-container {
        flex: 1;
        display: flex;
        align-items: center;
      }
      
      .phone-input {
        flex: 1;
        font-size: 32rpx;
        color: #000;
        border: none;
        outline: none;
        background: transparent;
      }
    }
  }
  
  /* 链接区域 */
  .links-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 60rpx;
    
    .user-login {
      font-size: 28rpx;
      color: #28B389;
    }
    
    .register-link {
      font-size: 28rpx;
      color: #28B389;
    }
  }
  
  /* 登录按钮 */
  .login-btn-container {
    margin-bottom: 40rpx;
    
    .login-btn {
      width: 100%;
      height: 100rpx;
      background: #28B389;
      border-radius: 20rpx;
      border: none;
      color: #fff;
      font-size: 36rpx;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
