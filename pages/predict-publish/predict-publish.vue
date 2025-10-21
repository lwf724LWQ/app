<template>
  <view class="publish-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">预测</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 我的方案标题 -->
      <view class="title-section">
        <text class="title-text">我的方案</text>
      </view>
      
      <!-- 方案列表 -->
      <view class="scheme-list">
        <view 
          class="scheme-item" 
          v-for="(scheme, index) in schemes" 
          :key="index"
        >
          <view class="scheme-content">
            <view class="scheme-header">
              <text class="scheme-name">{{ scheme.name }}</text>
              <view class="scheme-type">{{ scheme.id }}</view>
            </view>
            <view class="scheme-details">
              <view class="scheme-data">
                <view 
                  class="position-info" 
                  v-for="(info, index) in getSchemeDisplayData(scheme)" 
                  :key="index"
                >
                  {{ info }}
                </view>
              </view>
            </view>
          </view>
        </view>
        
        <!-- 空状态提示 -->
        <view class="empty-state" v-if="schemes.length === 0">
          <text class="empty-text">暂无方案数据</text>
        </view>
      </view>
      
      <!-- 期号信息 -->
      <view class="period-info">
        <text class="period-text">{{ lotteryType ? lotteryType.name : '彩票类型' }} 第{{ getIssueNumber() }}期</text>
        <text class="period-status">{{ issueInfo.status }}</text>
      </view>
    </view>
    
    <!-- 底部按钮区域 -->
    <view class="bottom-section">
      <!-- 警告信息 -->
      <view class="warning-section">
        <text class="warning-text">注:帖子一旦发布,将不能进行修改或删除操作</text>
      </view>
      
      <!-- 操作按钮 -->
      <view class="action-buttons">
        <button class="modify-btn" @click="modifyScheme">修改</button>
        <button class="publish-btn" @click="publishScheme">发布</button>
      </view>
    </view>
    
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAccount } from '@/utils/request.js'
import { apiPost, apiGetIssueNo } from '@/api/apis.js'

// 方案数据
const schemes = ref([])

// 彩票类型和期号信息
const lotteryType = ref(null)
const issueInfo = ref({
  id: null,
  number: null,
  status: '待开奖',
  time: '今天 21:30'
})

// 格式化方案数据显示（保留原函数以兼容）
const formatSchemeData = (scheme) => {
  const data = scheme.data
  
  if (scheme.id === '二字现' || scheme.id === '三字现') {
    // 组合类方案
    if (data.combinations && data.combinations.length > 0) {
      return data.combinations.join(',')
    }
    return '未选择'
  } else {
    // 数字类方案 - 详细显示每位信息，包含主攻和重点
    let result = []
    
    // 千位
    if (data.thousands && data.thousands.length > 0) {
      let thousandsInfo = `千位: ${data.thousands.join('')}`
      if (data.thousandsMainAttack && data.thousandsMainAttack.length > 0) {
        thousandsInfo += ` 主攻${data.thousandsMainAttack.join('')}`
      }
      if (data.thousandsKeyPoint && data.thousandsKeyPoint.length > 0) {
        thousandsInfo += ` 重点${data.thousandsKeyPoint.join('')}`
      }
      result.push(thousandsInfo)
    }
    
    // 百位
    if (data.hundreds && data.hundreds.length > 0) {
      let hundredsInfo = `百位: ${data.hundreds.join('')}`
      if (data.hundredsMainAttack && data.hundredsMainAttack.length > 0) {
        hundredsInfo += ` 主攻${data.hundredsMainAttack.join('')}`
      }
      if (data.hundredsKeyPoint && data.hundredsKeyPoint.length > 0) {
        hundredsInfo += ` 重点${data.hundredsKeyPoint.join('')}`
      }
      result.push(hundredsInfo)
    }
    
    // 十位
    if (data.tens && data.tens.length > 0) {
      let tensInfo = `十位: ${data.tens.join('')}`
      if (data.tensMainAttack && data.tensMainAttack.length > 0) {
        tensInfo += ` 主攻${data.tensMainAttack.join('')}`
      }
      if (data.tensKeyPoint && data.tensKeyPoint.length > 0) {
        tensInfo += ` 重点${data.tensKeyPoint.join('')}`
      }
      result.push(tensInfo)
    }
    
    // 个位
    if (data.units && data.units.length > 0) {
      let unitsInfo = `个位: ${data.units.join('')}`
      if (data.unitsMainAttack && data.unitsMainAttack.length > 0) {
        unitsInfo += ` 主攻${data.unitsMainAttack.join('')}`
      }
      if (data.unitsKeyPoint && data.unitsKeyPoint.length > 0) {
        unitsInfo += ` 重点${data.unitsKeyPoint.join('')}`
      }
      result.push(unitsInfo)
    }
    
    return result.length > 0 ? result.join(' | ') : '未选择'
  }
}

// 获取分行显示的方案数据
const getSchemeDisplayData = (scheme) => {
  const data = scheme.data
  const result = []
  
  if (scheme.id === '二字现' || scheme.id === '三字现') {
    // 组合类方案
    if (data.combinations && data.combinations.length > 0) {
      result.push(data.combinations.join(','))
    } else {
      result.push('未选择')
    }
  } else {
    // 数字类方案 - 每位信息单独一行
    if (data.thousands && data.thousands.length > 0) {
      let thousandsInfo = `千位: ${data.thousands.join('')}`
      if (data.thousandsMainAttack && data.thousandsMainAttack.length > 0) {
        thousandsInfo += ` 主攻${data.thousandsMainAttack.join('')}`
      }
      if (data.thousandsKeyPoint && data.thousandsKeyPoint.length > 0) {
        thousandsInfo += ` 重点${data.thousandsKeyPoint.join('')}`
      }
      result.push(thousandsInfo)
    }
    
    if (data.hundreds && data.hundreds.length > 0) {
      let hundredsInfo = `百位: ${data.hundreds.join('')}`
      if (data.hundredsMainAttack && data.hundredsMainAttack.length > 0) {
        hundredsInfo += ` 主攻${data.hundredsMainAttack.join('')}`
      }
      if (data.hundredsKeyPoint && data.hundredsKeyPoint.length > 0) {
        hundredsInfo += ` 重点${data.hundredsKeyPoint.join('')}`
      }
      result.push(hundredsInfo)
    }
    
    if (data.tens && data.tens.length > 0) {
      let tensInfo = `十位: ${data.tens.join('')}`
      if (data.tensMainAttack && data.tensMainAttack.length > 0) {
        tensInfo += ` 主攻${data.tensMainAttack.join('')}`
      }
      if (data.tensKeyPoint && data.tensKeyPoint.length > 0) {
        tensInfo += ` 重点${data.tensKeyPoint.join('')}`
      }
      result.push(tensInfo)
    }
    
    if (data.units && data.units.length > 0) {
      let unitsInfo = `个位: ${data.units.join('')}`
      if (data.unitsMainAttack && data.unitsMainAttack.length > 0) {
        unitsInfo += ` 主攻${data.unitsMainAttack.join('')}`
      }
      if (data.unitsKeyPoint && data.unitsKeyPoint.length > 0) {
        unitsInfo += ` 重点${data.unitsKeyPoint.join('')}`
      }
      result.push(unitsInfo)
    }
    
    if (result.length === 0) {
      result.push('未选择')
    }
  }
  
  return result
}

// 修改方案
const modifyScheme = () => {
  // 将当前方案数据传递回上级页面进行修改
  uni.navigateBack({
    delta: 1,
    // 通过事件总线或全局状态传递数据
    success: () => {
      // 通知上级页面有数据需要修改
      uni.$emit('modifySchemes', schemes.value)
    }
  })
}

// 发布方案
const publishScheme = async () => {
  uni.showModal({
    title: '确认发布',
    content: '确定要发布这些方案吗？发布后将无法修改或删除。',
    success: async (res) => {
      if (res.confirm) {
        await handlePublish()
      }
    }
  })
}

// 处理发布逻辑
const handlePublish = async () => {
  try {
    uni.showLoading({
      title: '发布中...'
    })
    
    // 准备发帖数据
    const postData = {
      tname: lotteryType.value ? lotteryType.value.name : '预测方案', // 彩票名称
      issueno: getIssueNumber(), // 期号 - 使用统一的期号获取函数
      content: generatePostContent(), // 发帖内容
      account: getAccount() || '', // 账号
      pimg: '', // 帖子图片（暂时为空）
      flag: true // 无需审核
    }
    
    console.log('发帖数据:', postData)
    
    const response = await apiPost(postData)
    
    uni.hideLoading()
    
    if (response.code === 200) {
      uni.showToast({
        title: '发布成功',
        icon: 'success'
      })
      
      // 清除本地存储的方案数据
      uni.removeStorageSync('predict_schemes_data')
      
      // 延迟返回论坛页面
      setTimeout(() => {
        uni.reLaunch({
          url: '/pages/forum/forum'
        })
      }, 1500)
    } else {
      uni.showToast({
        title: response.msg || '发布失败',
        icon: 'none'
      })
    }
    
  } catch (error) {
    uni.hideLoading()
    uni.showToast({
      title: '发布失败，请重试',
      icon: 'none'
    })
  }
}

// 获取期号显示
const getIssueNumber = () => {
  return issueInfo.value.number || issueInfo.value.id || '--'
}


// 加载期号信息
const loadIssueInfo = async () => {
  try {
    if (!lotteryType.value || !lotteryType.value.id) {
      return
    }
    
    uni.showLoading({ title: '加载期号中...' })
    
    const response = await apiGetIssueNo({ cpid: lotteryType.value.id })
    
    uni.hideLoading()
    
    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      let issueNumber = null
      let issueStatus = '待开奖'
      let issueTime = '今天 21:30'
      
      if (typeof response.data === 'number' || typeof response.data === 'string') {
        issueNumber = response.data.toString()
      } else if (typeof response.data === 'object') {
        issueNumber = response.data.issueno || response.data.number || response.data.id
        issueStatus = response.data.status || '待开奖'
        issueTime = response.data.time || '今天 21:30'
      }
      
      issueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime
      }
      
      uni.showToast({ title: `期号加载成功: ${issueNumber}`, icon: 'success' })
    } else {
      uni.showToast({ title: '期号数据为空', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '期号加载异常', icon: 'none' })
  }
}

// 生成发帖内容
const generatePostContent = () => {
  if (schemes.value.length === 0) {
    return '暂无方案数据'
  }
  
  let content = '【预测方案】\n\n'
  
  schemes.value.forEach((scheme, index) => {
    content += `${index + 1}. ${scheme.name} (${scheme.id})\n`
    
    const displayData = getSchemeDisplayData(scheme)
    displayData.forEach(info => {
      content += `   ${info}\n`
    })
    content += '\n'
  })
  
      content += `期号: 第${getIssueNumber()}期\n`
  content += `发布时间: ${new Date().toLocaleString()}`
  
  return content
}

// 返回
const goBack = () => {
  uni.showModal({
    title: '提示',
    content: '返回会清空内容,确定返回吗?',
    confirmText: '确定',
    cancelText: '取消',
    confirmColor: '#ff4757',
    success: (res) => {
      if (res.confirm) {
        // 清除本地存储的方案数据
        try {
          uni.removeStorageSync('predict_schemes_data')
        } catch (error) {
          console.error('清除本地存储失败:', error)
        }
        
        // 点击确定，返回论坛页面
        uni.reLaunch({
          url: '/pages/forum/forum'
        })
      }
      // 点击取消不做任何操作
    }
  })
}

// 页面加载时获取传递的方案数据
onMounted(() => {
  // 获取页面参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = currentPage.options
  
  if (options.data) {
    try {
      const publishData = JSON.parse(decodeURIComponent(options.data))
      
      schemes.value = publishData.schemes || []
      lotteryType.value = publishData.lotteryType || null
      issueInfo.value = publishData.issueInfo || {
        id: null,
        number: null,
        status: '待开奖',
        time: '今天 21:30'
      }
      
      // 如果期号信息为空或无效，主动获取期号
      if (!issueInfo.value.number && !issueInfo.value.id) {
        loadIssueInfo()
      }
    } catch (error) {
      uni.showToast({
        title: '数据解析失败',
        icon: 'none'
      })
    }
  } else if (options.schemes) {
    // 兼容旧的URL参数格式
    try {
      const decodedSchemes = decodeURIComponent(options.schemes)
      schemes.value = JSON.parse(decodedSchemes)
    } catch (error) {
      uni.showToast({
        title: '数据解析失败',
        icon: 'none'
      })
    }
  } else {
    // 如果没有接收到数据，显示空状态
    schemes.value = []
    uni.showToast({
      title: '没有方案数据',
      icon: 'none'
    })
  }
})
</script>

<style scoped>
.publish-container {
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
  background-color: #28B389;
  z-index: 999;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  width: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  font-size: 40rpx;
  color: #fff;
  font-weight: bold;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

/* 主要内容区域 */
.main-content {
  padding-top: 88rpx;
  padding-bottom: 200rpx; /* 为底部按钮留出空间 */
  padding-left: 30rpx;
  padding-right: 30rpx;
}

/* 标题区域 */
.title-section {
  margin-bottom: 30rpx;
}

.title-text {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

/* 方案列表 */
.scheme-list {
  margin-bottom: 40rpx;
}

.scheme-item {
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.scheme-content {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.scheme-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.scheme-name {
  font-size: 32rpx;
  font-weight: 600;
  color: #ff4757;
}

.scheme-type {
  background-color: #28B389;
  color: #fff;
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  font-weight: 500;
}

.scheme-details {
  padding: 10rpx 0;
}

.scheme-data {
  background-color: #f8f9fa;
  padding: 15rpx;
  border-radius: 10rpx;
  border-left: 4rpx solid #28B389;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.position-info {
  font-size: 28rpx;
  color: #333;
  line-height: 1.4;
  word-wrap: break-word;
  word-break: break-all;
}

/* 空状态样式 */
.empty-state {
  text-align: center;
  padding: 60rpx 30rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
}


/* 期号信息 */
.period-info {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-text {
  font-size: 24rpx;
  color: #999;
  margin-bottom: 8rpx;
}

.period-status {
  font-size: 22rpx;
  color: #ff4757;
}

/* 底部区域 */
.bottom-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 20rpx 30rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 警告信息 */
.warning-section {
  margin-bottom: 20rpx;
  text-align: center;
}

.warning-text {
  font-size: 24rpx;
  color: #ff4757;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
}

.modify-btn, .publish-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
}

.modify-btn {
  background-color: #f0f0f0;
  color: #666;
}

.publish-btn {
  background-color: #ff4757;
  color: #fff;
}

</style>

