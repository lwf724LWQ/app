<template>
  <view class="reg-container">
    <!-- 状态栏 -->
    <view class="status-bar"></view>

    <!-- 头部 -->
    <view class="header">
      <view class="back-btn" @click="goToLogin">
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
      <text class="main-title">欢迎注册</text>
    </view>

    <!-- 注册表单 -->
    <form class="reg-form" @submit.prevent="doReg">
      <!-- 手机号输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon phone-icon">
            <view class="phone-icon-svg"></view>
          </view>
          <text class="country-code">+86</text>
          <view class="separator"></view>
          <input type="text" name="account" placeholder="请输入手机号" placeholder-class="input-placeholder" v-model="account"
            class="phone-input" />
        </view>
      </view>

      <!-- 验证码输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon code-icon">
            <view class="code-icon-svg"></view>
          </view>
          <!-- <view class="code-container"> -->
          <VerificationCode ref="codeRef" placeholder="请输入验证码" @getCode="sendLoginCode" @input="handleCodeInput" />
          <!-- </view> -->
        </view>
      </view>

      <!-- 用户名输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon user-icon">
            <view class="user-icon-svg"></view>
          </view>
          <input type="text" name="username" placeholder="请输入用户名" placeholder-class="input-placeholder" v-model="uname"
            class="username-input" />
        </view>
      </view>

      <!-- 密码输入框 -->
      <view class="input-group">
        <view class="input-container">
          <view class="input-icon lock-icon">
            <view class="lock-icon-svg"></view>
          </view>
          <input :type="showPassword ? 'text' : 'password'" name="password" placeholder="请输入密码"
            placeholder-class="input-placeholder" v-model="password" class="password-input" />
          <view class="eye-icon" @click="togglePasswordVisibility">
            <view class="eye-icon-svg" :class="{ 'eye-open': showPassword }">
              <view class="eye-ball"></view>
            </view>
          </view>
        </view>
      </view>

      <!-- 链接区域 -->
      <view class="links-section">
        <text class="login-link" @click="goToLogin">已有账号？去登录</text>
      </view>

      <!-- 注册按钮 -->
      <view class="reg-btn-container">
        <button type="submit" class="reg-btn" @click="doReg">注册</button>
      </view>




    </form>
  </view>
</template>

<script lang="ts" setup>
// @ts-ignore
import VerificationCode from '../../components/VerificationCode.vue'
import { ref, reactive, watch } from 'vue'
import { apiRegInfo } from '../../api/apis.js'
import { apiSendCode } from '../../api/apis.js'

declare const uni: any

// 跳转到登录页面
const goToLogin = () => {
  uni.navigateBack()
}

// 切换密码显示/隐藏
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}






const account = ref('')
const code = ref('')
const codeRef = ref(null)
const uname = ref('')
const password = ref('')
const showPassword = ref(false)

const Reginfo = reactive({
  account: '',
  code: '',
  uname: '',
  password: ''
})

// 输入验证码时更新值
const handleCodeInput = (value) => {
  code.value = value
}

// 发送验证码
const sendLoginCode = async () => {
  if (!account.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }
  try {
    const response = await apiSendCode({ phone: account.value })
    if (response.code === 200) {
      codeRef.value.startCountdown()
    } else {
      uni.showToast({ title: response.errMsg, icon: 'none' })
    }
  } catch (error) {
    uni.showToast({ title: '发送验证码失败', icon: 'none' })
  }
}

watch([account, code, uname, password], ([newAccount, newCode, newUname, newPassword]) => {
  Reginfo.account = newAccount
  Reginfo.code = newCode
  Reginfo.uname = newUname
  Reginfo.password = newPassword
}, { immediate: true })

// 注册逻辑
const doReg = async () => {
  if (!account.value) {
    uni.showToast({ title: '请输入手机号', icon: 'none' })
    return
  }

  if (!code.value) {
    uni.showToast({ title: '请输入验证码', icon: 'none' })
    return
  }

  if (!uname.value) {
    uni.showToast({ title: '请输入用户名', icon: 'none' })
    return
  }

  if (!password.value) {
    uni.showToast({ title: '请输入密码', icon: 'none' })
    return
  }

  uni.showLoading({ title: '注册中...' })

  try {
    const success = await apiRegInfo(Reginfo)
    uni.hideLoading()

    if (success) {
      uni.showToast({ title: '注册成功', icon: 'success' })
      setTimeout(() => {
        uni.redirectTo({ url: '/pages/login/login' })
      }, 1500)
    } else {
      uni.showModal({ title: '注册失败', content: '注册失败，请重试', showCancel: false })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showModal({ title: '注册失败', content: '网络错误，请检查网络连接后重试', showCancel: false })
  }
}
</script>

<style>
.input-placeholder {
  color: #999;
}
</style>

<style lang="scss" scoped>
.reg-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8fffe 0%, #ffffff 100%);
  position: relative;
  padding-top: var(--status-bar-height);
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

/* 注册表单 */
.reg-form {
  padding: 0 60rpx;

  .input-group {
    margin: 0 28rpx 40rpx 28rpx;

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

        .user-icon-svg {
          width: 32rpx;
          height: 32rpx;
          border: 3rpx solid #28B389;
          border-radius: 50%;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            top: 6rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 8rpx;
            height: 8rpx;
            background: #28B389;
            border-radius: 50%;
          }

          &::after {
            content: '';
            position: absolute;
            bottom: 4rpx;
            left: 50%;
            transform: translateX(-50%);
            width: 16rpx;
            height: 8rpx;
            background: #28B389;
            border-radius: 8rpx 8rpx 0 0;
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

      .code-container {
        flex: 1;
        display: flex;
        align-items: center;
      }

      .phone-input,
      .username-input,
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
    margin: 0 42rpx 60rpx 42rpx;

    .login-link {
      font-size: 28rpx;
      color: #28B389;
    }
  }

  /* 注册按钮 */
  .reg-btn-container {
    margin-bottom: 20rpx;

    .reg-btn {
      width: 80%;
      height: 80rpx;
      background: #28B389;
      border-radius: 16rpx;
      border: none;
      color: #fff;
      font-size: 28rpx;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
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

    .wechat-btn {
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
      }

      .btn-text {
        font-size: 32rpx;
        color: #333;
        font-weight: 500;
      }
    }
  }
}
</style>