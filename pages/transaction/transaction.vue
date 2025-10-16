<template>
  <view class="transaction-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">金币交易记录</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 筛选区域 -->
      <view class="filter-section">
        <view class="filter-tabs">
          <view 
            class="filter-tab" 
            :class="{ active: activeTab === 'all' }"
            @click="switchTab('all')"
          >
            全部
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: activeTab === 'recharge' }"
            @click="switchTab('recharge')"
          >
            充值
          </view>
          <view 
            class="filter-tab" 
            :class="{ active: activeTab === 'consume' }"
            @click="switchTab('consume')"
          >
            消费
          </view>
        </view>
      </view>
      
      <!-- 交易记录列表 -->
      <view class="transaction-list">
        <view 
          class="transaction-item" 
          v-for="(item, index) in filteredTransactions" 
          :key="index"
        >
          <!-- 左侧图标 -->
          <view class="transaction-icon">
            <view class="icon-wrapper" :class="item.type">
              <text class="icon-text">{{ item.icon }}</text>
            </view>
          </view>
          
          <!-- 中间内容 -->
          <view class="transaction-content">
            <text class="transaction-title">{{ item.title }}</text>
            <text class="transaction-desc">{{ item.description }}</text>
            <text class="transaction-time">{{ formatTime(item.time) }}</text>
          </view>
          
          <!-- 右侧金额 -->
          <view class="transaction-amount" :class="item.type">
            <text class="amount-text">{{ item.type === 'recharge' ? '+' : '-' }}{{ item.amount }}</text>
            <text class="amount-unit">金币</text>
          </view>
        </view>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredTransactions.length === 0">
        <text class="empty-icon">📝</text>
        <text class="empty-text">暂无交易记录</text>
        <text class="empty-desc">您还没有任何金币交易记录</text>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="filteredTransactions.length > 0">
        <text class="load-more-text">已显示全部记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getToken } from '@/utils/request.js'

// 响应式数据
const activeTab = ref('all')

// 模拟交易记录数据
const transactions = ref([
  {
    id: 1,
    type: 'recharge',
    title: '金币充值',
    description: '微信支付充值',
    amount: 50,
    time: '2024-01-15 14:30:25',
    icon: '💰'
  },
  {
    id: 2,
    type: 'consume',
    title: '梦境解析',
    description: '解梦服务消费',
    amount: 10,
    time: '2024-01-15 10:15:30',
    icon: '🔮'
  },
  {
    id: 3,
    type: 'recharge',
    title: '金币充值',
    description: '支付宝充值',
    amount: 100,
    time: '2024-01-14 16:45:12',
    icon: '💰'
  },
  {
    id: 4,
    type: 'consume',
    title: 'VIP服务',
    description: '大师包月服务',
    amount: 30,
    time: '2024-01-14 09:20:45',
    icon: '👑'
  }
])

// 计算属性 - 根据选中的标签过滤交易记录
const filteredTransactions = computed(() => {
  if (activeTab.value === 'all') {
    return transactions.value
  }
  return transactions.value.filter(item => item.type === activeTab.value)
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 页面加载时检查登录状态
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
.transaction-container {
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

/* 主要内容区域 */
.main-content {
  padding-top: 88rpx;
  padding: 88rpx 30rpx 30rpx;
}

/* 筛选区域 */
.filter-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.filter-tabs {
  display: flex;
  gap: 20rpx;
}

.filter-tab {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 25rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f8f9fa;
  transition: all 0.3s ease;
}

.filter-tab.active {
  background-color: #ff4757;
  color: #fff;
  font-weight: 600;
}

/* 交易记录列表 */
.transaction-list {
  background-color: #fff;
  border-radius: 15rpx;
  overflow: hidden;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.transaction-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.transaction-item:last-child {
  border-bottom: none;
}

.transaction-item:active {
  background-color: #f8f9fa;
}

/* 左侧图标 */
.transaction-icon {
  margin-right: 20rpx;
}

.icon-wrapper {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
}

.icon-wrapper.recharge {
  background-color: #e8f5e8;
}

.icon-wrapper.consume {
  background-color: #ffe8e8;
}

.icon-text {
  font-size: 28rpx;
}

/* 中间内容 */
.transaction-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.transaction-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.transaction-desc {
  font-size: 24rpx;
  color: #666;
}

.transaction-time {
  font-size: 22rpx;
  color: #999;
}

/* 右侧金额 */
.transaction-amount {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4rpx;
}

.transaction-amount.recharge .amount-text {
  color: #52c41a;
}

.transaction-amount.consume .amount-text {
  color: #ff4757;
}

.amount-text {
  font-size: 32rpx;
  font-weight: 600;
}

.amount-unit {
  font-size: 20rpx;
  color: #999;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 10rpx;
}

.empty-desc {
  font-size: 24rpx;
  color: #999;
}

/* 加载更多 */
.load-more {
  text-align: center;
  padding: 30rpx 0;
}

.load-more-text {
  font-size: 24rpx;
  color: #999;
}
</style>
