<template>
  <view class="recharge-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">我的金币</text>
        <view class="nav-right" @click="showInstructions">
          <text class="help-text">说明</text>
        </view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 用户信息区域 -->
      <view class="user-info-section">
        <text class="user-text">当前用户: {{ currentUser }}</text>
        <view class="balance-section">
          <text class="balance-text">我的余额: </text>
          <text class="balance-amount">{{ userBalance }}金币</text>
          <button class="record-btn" @click="viewTransactionRecord">金币交易记录</button>
        </view>
      </view>
      
      <!-- 充值选项区域 -->
      <view class="recharge-section">
        <text class="section-title">充值金币</text>
        
        <!-- 预设金额选项 -->
        <view class="amount-options">
          <view 
            class="amount-option" 
            :class="{ active: selectedAmount === 10 }"
            @click="selectAmount(10)"
          >
            <text class="amount-text">10个金币</text>
            <text class="price-text">10元</text>
            <view class="check-icon" v-if="selectedAmount === 10">✓</view>
          </view>
          
          <view 
            class="amount-option" 
            :class="{ active: selectedAmount === 50 }"
            @click="selectAmount(50)"
          >
            <text class="amount-text">50个金币</text>
            <text class="price-text">50元</text>
            <view class="check-icon" v-if="selectedAmount === 50">✓</view>
          </view>
          
          <view 
            class="amount-option" 
            :class="{ active: selectedAmount === 100 }"
            @click="selectAmount(100)"
          >
            <text class="amount-text">100个金币</text>
            <text class="price-text">100元</text>
            <view class="check-icon" v-if="selectedAmount === 100">✓</view>
          </view>
        </view>
        
        <!-- 自定义金额 -->
        <view class="custom-amount-section">
          <input 
            type="number" 
            placeholder="自定义金额" 
            class="custom-input"
            v-model="customAmount"
            @input="updateCustomAmount"
          />
          <text class="conversion-text">元={{ customAmount || 0 }}金币</text>
        </view>
        
        <!-- 服务协议 -->
        <view class="agreement-section">
          <view class="agreement-checkbox" @click="toggleAgreement">
            <view class="checkbox" :class="{ checked: agreedToTerms }">
              <text class="check-mark" v-if="agreedToTerms">✓</text>
            </view>
            <text class="agreement-text">
              我已阅读并同意
              <text class="link-text" @click.stop="viewAgreement">《充值服务协议》</text>
            </text>
          </view>
        </view>
      </view>
      
      <!-- 规则说明 -->
      <view class="rules-section">
        <text class="rule-item">1、1元=1金币</text>
        <text class="rule-item">2、金币仅限于平台内部使用,充值后不可退还,不可兑换,不可提现</text>
        <text class="rule-item">3、若有疑问、请联系管理员</text>
      </view>
      
      <!-- 支付按钮 -->
      <view class="payment-section">
        <button 
          class="payment-btn" 
          :class="{ disabled: !canPay }"
          @click="handlePayment"
          :disabled="!canPay"
        >
          支付 ¥{{ paymentAmount }}元
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getToken } from '@/utils/request.js'

// 响应式数据
const currentUser = ref('vfmumq')
const userBalance = ref(0)
const selectedAmount = ref(10)
const customAmount = ref('')
const agreedToTerms = ref(false)

// 计算属性
const paymentAmount = computed(() => {
  if (customAmount.value && customAmount.value > 0) {
    return customAmount.value
  }
  return selectedAmount.value
})

const canPay = computed(() => {
  return agreedToTerms.value && paymentAmount.value > 0
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const showInstructions = () => {
  uni.showModal({
    title: '充值说明',
    content: '1元=1金币，金币仅限平台内使用，充值后不可退还。',
    showCancel: false
  })
}

const selectAmount = (amount) => {
  selectedAmount.value = amount
  customAmount.value = ''
}

const updateCustomAmount = () => {
  if (customAmount.value && customAmount.value > 0) {
    selectedAmount.value = 0
  }
}

const toggleAgreement = () => {
  agreedToTerms.value = !agreedToTerms.value
}

const viewAgreement = () => {
  uni.showModal({
    title: '充值服务协议',
    content: '这里是充值服务协议的内容...',
    showCancel: false
  })
}

const viewTransactionRecord = () => {
  uni.navigateTo({ url: '/pages/transaction/transaction' })
}

const handlePayment = () => {
  if (!canPay.value) return
  
  uni.showModal({
    title: '确认支付',
    content: `确认支付 ¥${paymentAmount.value}元 购买 ${paymentAmount.value}个金币？`,
    success: (res) => {
      if (res.confirm) {
        // 这里调用支付API
        processPayment()
      }
    }
  })
}

const processPayment = () => {
  uni.showLoading({
    title: '处理中...'
  })
  
  // 模拟支付处理
  setTimeout(() => {
    uni.hideLoading()
    uni.showToast({
      title: '充值成功',
      icon: 'success'
    })
    
    // 更新余额
    userBalance.value += parseInt(paymentAmount.value)
    
    // 重置选择
    selectedAmount.value = 10
    customAmount.value = ''
    agreedToTerms.value = false
  }, 2000)
}

// 页面加载时获取用户信息
onMounted(() => {
  const token = getToken()
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1500)
  }
})
</script>

<style scoped>
.recharge-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 导航栏 */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #fff;
  z-index: 999;
  border-bottom: 1rpx solid #e8e8e8;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  width: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #333;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.help-text {
  font-size: 24rpx;
  color: #666;
}

/* 主要内容区域 */
.main-content {
  padding-top: 88rpx;
  padding: 88rpx 30rpx 30rpx;
}

/* 用户信息区域 */
.user-info-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.user-text {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
}

.balance-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.balance-text {
  font-size: 28rpx;
  color: #333;
}

.balance-amount {
  font-size: 28rpx;
  color: #ff4757;
  font-weight: 600;
}

.record-btn {
  background-color: #f8f9fa;
  color: #666;
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  border: none;
}

/* 充值选项区域 */
.recharge-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-top: -10rpx;
  margin-bottom: 40rpx;
  padding-bottom: 15rpx;
}

.amount-options {
  display: flex;
  gap: 15rpx;
  margin-bottom: 30rpx;
}

.amount-option {
  flex: 1;
  background-color: #f8f9fa;
  border: 2rpx solid #e8e8e8;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.amount-option.active {
  border-color: #ff4757;
  background-color: #fff5f5;
}

.amount-text {
  display: block;
  font-size: 26rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.price-text {
  display: block;
  font-size: 24rpx;
  color: #666;
}

.check-icon {
  position: absolute;
  bottom: 8rpx;
  right: 8rpx;
  width: 24rpx;
  height: 24rpx;
  background-color: #ff4757;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: bold;
}

/* 自定义金额 */
.custom-amount-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.custom-input {
  flex: 1;
  background-color: #f8f9fa;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
}

.conversion-text {
  font-size: 24rpx;
  color: #666;
}

/* 服务协议 */
.agreement-section {
  margin-bottom: 30rpx;
}

.agreement-checkbox {
  display: flex;
  align-items: center;
  gap: 15rpx;
}

.checkbox {
  width: 32rpx;
  height: 32rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
}

.checkbox.checked {
  background-color: #ff4757;
  border-color: #ff4757;
}

.check-mark {
  color: #fff;
  font-size: 20rpx;
  font-weight: bold;
}

.agreement-text {
  font-size: 24rpx;
  color: #666;
}

.link-text {
  color: #007aff;
}

/* 规则说明 */
.rules-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.rule-item {
  display: block;
  font-size: 24rpx;
  color: #666;
  line-height: 1.6;
  margin-bottom: 15rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

/* 支付按钮 */
.payment-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-top: 1rpx solid #e8e8e8;
}

.payment-btn {
  width: 100%;
  height: 88rpx;
  background-color: #ff4757;
  color: #fff;
  border: none;
  border-radius: 44rpx;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.payment-btn.disabled {
  background-color: #ccc;
  color: #999;
}

.payment-btn:active:not(.disabled) {
  background-color: #ff3742;
}
</style>
