<template>
  <view class="login-wrapper">
    <!-- 状态栏 -->
  
    
    <!-- 头部区域 -->
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-wave">
        <text class="wave-icon">🌊</text>
      </view>
    </view>
    
    <!-- 主标题 -->
    <view class="title-section">
      <text class="main-title">欢迎登陆</text>
    </view>
    
    <!-- 登录表单 -->
    <view class="login-form">
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
            v-model="account"
            class="phone-input"
          />
        </view>
      </view>
      
      <!-- 密码输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon lock-icon">
            <view class="lock-icon-svg"></view>
          </view>
          <input 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码" 
            placeholder-class="input-placeholder" 
            v-model="password"
            class="password-input"
          />
          <view class="eye-icon" @click="togglePasswordVisibility">
            <view class="eye-icon-svg" :class="{ 'eye-open': showPassword }">
              <view class="eye-ball"></view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 链接区域 -->
      <view class="links-section">
        <text class="register-link" @click="goToReg">还没账户?去注册</text>
        <text class="forgot-link" @click="goForgetPwdPage1">忘记密码</text>
      </view>
      
      <!-- 登录按钮 -->
      <view class="login-btn-container">
        <button class="login-btn" @click="gologin">登录</button>
      </view>
      
      <!-- 用户协议 -->
      <view class="agreement-section">
        <view class="checkbox-container">
          <view class="checkbox" :class="{ checked: isAgreed }" @click="toggleAgreement">
            <text class="checkmark" v-if="isAgreed">✓</text>
          </view>
          <text class="agreement-text">
            我已阅读并同意
            <text class="link-text" @click="showUserAgreement">《用户协议》</text>
            和
            <text class="link-text" @click="showPrivacyPolicy">《隐私授权》</text>
          </text>
        </view>
      </view>
      
      <!-- 第三方登录分隔线 -->
      <view class="divider">
        <view class="divider-line"></view>
        <text class="divider-text">第三方账号登录</text>
        <view class="divider-line"></view>
      </view>
      
      <!-- 第三方登录按钮 -->
      <view class="third-party-login">
        <button class="wechat-btn" @click="wechatLogin">
          <view class="btn-icon wechat-icon">
            <view class="wechat-icon-svg"></view>
          </view>
          <text class="btn-text">微信账号登录</text>
        </button>
        
      
      </view>
    </view>
    
    <!-- 底部指示器 -->
    <view class="bottom-indicator"></view>
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
const isAgreed=ref(false);
const showPassword=ref(false);
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
	// 检查是否同意用户协议
	if (!isAgreed.value) {
		uni.showToast({
			title: '请先同意用户协议',
			icon: 'none',
			duration: 2000
		})
		return
	}
	
	// 检查输入是否完整
	if (!account.value || !password.value) {
		uni.showToast({
			title: '请输入手机号和密码',
			icon: 'none',
			duration: 2000
		})
		return
	}
	
	// 显示加载提示
	uni.showLoading({
		title: '登录中...'
	})
	
	try {
	    const success = await apilogin(Userinfo);
	    
	    // 隐藏加载提示
	    uni.hideLoading()
	    
	    if (success) {
	      // 设置全局token
	      if (success.data?.token) {
	        setToken(success.data.token);
	      } else {
	        uni.showModal({
	        	title: '登录失败',
	        	content: '未获取到token，请重试',
	        	showCancel: false
	        })
	        return;
	      }
	      
	      // 设置全局account
	      if (account.value) {
	        setAccount(account.value);
	      } else {
	        uni.showModal({
	        	title: '登录失败',
	        	content: '账号信息异常，请重试',
	        	showCancel: false
	        })
	        return;
	      }
	      
	      // 显示登录成功提示
	      uni.showToast({
	      	title: '登录成功',
	      	icon: 'success',
	      	duration: 1500
	      })
	      
	      // 延迟跳转，让用户看到成功提示
	      setTimeout(() => {
	      	// 跳转到用户页面
		  	uni.switchTab({
			  	url: '/pages/user/user',
		  	})
	      }, 1500)
	      
	    } else {
	      uni.showModal({
	      	title: '登录失败',
	      	content: '用户名或密码错误，请重试',
	      	showCancel: false
	      })
	    }
	  } catch (error) {
	  	// 隐藏加载提示
	  	uni.hideLoading()
	  	
	    uni.showModal({
	    	title: '登录失败',
	    	content: '网络错误，请检查网络连接后重试',
	    	showCancel: false
	    })
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

// 返回上一页
const goBack = () => {
  uni.navigateBack()
}

// 切换密码显示/隐藏
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
  console.log('密码显示状态:', showPassword.value ? '显示' : '隐藏')
}

// 切换用户协议同意状态
const toggleAgreement = () => {
  isAgreed.value = !isAgreed.value
}

// 显示用户协议
const showUserAgreement = () => {
  uni.showModal({
    title: '用户协议',
    content: '这里是用户协议的内容...',
    showCancel: false
  })
}

// 显示隐私政策
const showPrivacyPolicy = () => {
  uni.showModal({
    title: '隐私授权',
    content: '这里是隐私政策的内容...',
    showCancel: false
  })
}

// 微信登录
const wechatLogin = () => {
  // 检查是否同意用户协议
  if (!isAgreed.value) {
    uni.showToast({
      title: '请先同意用户协议',
      icon: 'none',
      duration: 2000
    })
    return
  }
  
  uni.showModal({
    title: '微信登录',
    content: '微信登录功能正在开发中，敬请期待',
    showCancel: false,
    confirmText: '知道了'
  })
}


</script>

<!-- placeholder-class这个属性如果使用了<style scoped>就不生效，所以我们可以单独再写一个style -->
<style>
.input-placeholder {
  color: #999;
}
</style>
<style lang="scss" scoped>
.login-wrapper {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fffe 0%, #ffffff 100%);
  position: relative;
}

/* 状态栏 */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 40rpx;
  height: 60rpx;
  
  .time {
    font-size: 28rpx;
    font-weight: 600;
    color: #000;
  }
  
  .status-icons {
    display: flex;
    gap: 10rpx;
    
    .signal-icon,
    .wifi-icon,
    .battery-icon {
      font-size: 24rpx;
    }
  }
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
      font-size: 32rpx;
      color: #28B389;
      font-weight: bold;
    }
  }
  
  .header-wave {
    .wave-icon {
      font-size: 32rpx;
      color: #28B389;
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
.login-form {
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
        
        .lock-icon-svg {
          width: 32rpx;
          height: 32rpx;
          position: relative;
          
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 20rpx;
            height: 16rpx;
            border: 3rpx solid #28B389;
            border-bottom: none;
            border-radius: 10rpx 10rpx 0 0;
          }
          
          &::after {
            content: '';
            position: absolute;
            top: 12rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 24rpx;
            height: 20rpx;
            border: 3rpx solid #28B389;
            border-radius: 4rpx;
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
      
      .phone-input,
      .password-input {
        flex: 1;
        font-size: 32rpx;
        color: #000;
        border: none;
        outline: none;
        background: transparent;
      }
      
      .eye-icon {
        margin-left: 20rpx;
        cursor: pointer;
        
        .eye-icon-svg {
          width: 32rpx;
          height: 20rpx;
          position: relative;
          border: 2rpx solid #666;
          border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
          transition: all 0.3s ease;
          
          .eye-ball {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 8rpx;
            height: 8rpx;
            background: #666;
            border-radius: 50%;
            transition: all 0.3s ease;
          }
          
          &.eye-open {
            border-color: #28B389;
            
            .eye-ball {
              background: #28B389;
              width: 10rpx;
              height: 10rpx;
            }
          }
        }
      }
    }
  }
  
  /* 链接区域 */
  .links-section {
    display: flex;
    justify-content: space-between;
    margin-bottom: 60rpx;
    
    .register-link {
      font-size: 28rpx;
      color: #28B389;
    }
    
    .forgot-link {
      font-size: 28rpx;
      color: #999;
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
  
  /* 用户协议 */
  .agreement-section {
    margin-bottom: 60rpx;
    
    .checkbox-container {
      display: flex;
      align-items: flex-start;
      gap: 20rpx;
      
      .checkbox {
        width: 32rpx;
        height: 32rpx;
        border: 2rpx solid #ddd;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 4rpx;
        
        &.checked {
          background: #28B389;
          border-color: #28B389;
          
          .checkmark {
            color: #fff;
            font-size: 20rpx;
            font-weight: bold;
          }
        }
      }
      
      .agreement-text {
        flex: 1;
        font-size: 24rpx;
        color: #999;
        line-height: 1.5;
        
        .link-text {
          color: #28B389;
        }
      }
    }
  }
  
  /* 分隔线 */
  .divider {
    display: flex;
    align-items: center;
    margin: 60rpx 0 40rpx;
    
    .divider-line {
      flex: 1;
      height: 2rpx;
      background: #ddd;
    }
    
    .divider-text {
      margin: 0 30rpx;
      font-size: 24rpx;
      color: #999;
    }
  }
  
  /* 第三方登录 */
  .third-party-login {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
    
    .wechat-btn,
    .qq-btn {
      width: 100%;
      height: 100rpx;
      background: #fff;
      border-radius: 50rpx;
      border: 2rpx solid #E5E5E5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 40rpx;
      gap: 20rpx;
      
      .btn-icon {
        font-size: 40rpx;
        
        &.wechat-icon {
          .wechat-icon-svg {
            width: 40rpx;
            height: 40rpx;
            position: relative;
            
            &::before {
              content: '';
              position: absolute;
              top: 8rpx;
              left: 4rpx;
              width: 16rpx;
              height: 16rpx;
              background: #07C160;
              border-radius: 50%;
              border: 2rpx solid #07C160;
            }
            
            &::after {
              content: '';
              position: absolute;
              top: 4rpx;
              right: 4rpx;
              width: 20rpx;
              height: 20rpx;
              background: #07C160;
              border-radius: 50%;
              border: 2rpx solid #07C160;
            }
          }
        }
        
        &.qq-icon {
          color: #007aff;
        }
      }
      
      .btn-text {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}

/* 底部指示器 */
.bottom-indicator {
  position: absolute;
  bottom: 20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 120rpx;
  height: 8rpx;
  background: #000;
  border-radius: 4rpx;
}
</style>
