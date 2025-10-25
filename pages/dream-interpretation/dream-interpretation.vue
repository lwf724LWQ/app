<template>
  <view class="dream-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">解梦</text>
        <view class="nav-right"></view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 搜索区域 -->
      <view class="search-section">
        <view class="search-input-wrapper" @click="focusSearch">
          <uni-icons type="search" size="16" color="#999"></uni-icons>
          <input 
            type="text" 
            placeholder="梦境关键词或者号码" 
            class="search-input"
            v-model="searchKeyword"
            @confirm="searchDream"
            @focus="focusSearch"
          />
        </view>
        <button class="search-btn" @click="searchDream">搜索</button>
      </view>
      
      <!-- 搜索框获得焦点时显示的内容 -->
      <view class="search-overlay" v-if="showSearchOverlay">
        <!-- 历史搜索 -->
        <view class="history-search-section" v-if="dreamHistory.length > 0">
          <view class="section-header">
            <text class="section-title">历史搜索</text>
            <view class="clear-btn" @click="clearHistory">
              <uni-icons type="trash" size="16" color="#999"></uni-icons>
            </view>
          </view>
          <view class="history-tags">
            <view 
              class="history-tag" 
              v-for="(item, index) in dreamHistory" 
              :key="index"
              @click="selectHistoryKeyword(item.keyword)"
            >
              {{ item.keyword }}
            </view>
          </view>
        </view>
        
        <!-- 热门梦境 -->
        <view class="popular-dreams-section">
          <text class="section-title">热门梦境</text>
          <view class="popular-tags">
            <view 
              class="popular-tag" 
              v-for="(dream, index) in popularDreams" 
              :key="index"
              @click="selectPopularKeyword(dream)"
            >
              {{ dream }}
            </view>
          </view>
        </view>
        
        <!-- 温馨提示 -->
        <view class="tip-section">
          <text class="tip-title">【温馨提示】</text>
          <text class="tip-content">解梦仅提供参考,切勿深信!</text>
        </view>
      </view>
      
      <!-- 热门分类 -->
      <view class="category-section" v-if="!showSearchOverlay">
        <text class="section-title"></text>
        <view class="category-grid">
          <view 
            class="category-card" 
            v-for="(category, index) in popularCategories" 
            :key="index"
            @click="selectPopularCategory(category)"
          >
            <view class="card-icon">
              <text class="icon-text">{{ category.icon }}</text>
            </view>
            <text class="card-title">{{ category.name }}</text>
            <view class="card-numbers">
              <text class="number-text">{{ category.numbers[0] }}</text>
              <text class="number-text">{{ category.numbers[1] }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 梦境解析结果 -->
      <view class="result-section" v-if="dreamResults.length > 0">
        <text class="result-count" v-if="hasSearched && searchKeyword">为您找到 {{ dreamResults.length }} 个结果</text>
        <text class="result-count" v-else>推荐梦境解析</text>
        <view class="result-list">
          <view 
            class="result-card" 
            v-for="(item, index) in dreamResults" 
            :key="index"
          >
            <!-- 左侧图片区域 -->
            <view class="card-image-section">
              <view class="card-image">
                <image 
                  v-if="!item.imageError && item.img"
                  :src="item.currentImageUrl || getImageUrl(item.id, item.img)" 
                  mode="aspectFill" 
                  class="dream-image"
                  @error="handleImageError(item, index)"
                  @load="handleImageLoad(item, index)"
                ></image>
                <view class="default-icon" v-else>
                  <text class="icon-text"></text>
                </view>
              </view>
            </view>
            
            <!-- 右侧内容区域 -->
            <view class="card-content-section">
              <!-- 梦境标题 -->
              <text class="card-title">{{ item.content }}</text>
              
              <!-- 号码区域 -->
              <view class="card-numbers-section" v-if="item.numberOne || item.numberTwo">
                <text class="number-text" v-if="item.numberOne">{{ item.numberOne }}</text>
                <text class="number-text" v-if="item.numberTwo">{{ item.numberTwo }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 加载更多按钮 -->
      <view class="load-more-section" v-if="dreamResults.length > 0 && hasMoreData && !isLoading">
        <button class="load-more-btn" @click="loadMoreData" :disabled="isLoadingMore">
          <uni-icons v-if="isLoadingMore" type="spinner-cycle" size="16" color="#28B389"></uni-icons>
          <text v-else class="load-more-text">加载更多</text>
          <text class="page-info">({{ currentPage }}/{{ totalPages }})</text>
        </button>
      </view>
      
      <!-- 没有更多数据提示 -->
      <view class="no-more-section" v-if="dreamResults.length > 0 && !hasMoreData && !isLoading">
        <text class="no-more-text">已显示全部 {{ totalRecords }} 条结果</text>
      </view>
      
      <!-- 加载状态 -->
      <view class="loading-section" v-if="isLoading">
        <uni-icons type="spinner-cycle" size="24" color="#28B389"></uni-icons>
        <text class="loading-text">正在解析梦境...</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-section" v-if="!isLoading && dreamResults.length === 0 && hasSearched && searchKeyword">
        <uni-icons type="info" size="48" color="#ccc"></uni-icons>
        <text class="empty-text">暂无相关梦境解析</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getToken } from '@/utils/request.js'
import { apiDreamQuery } from '@/api/apis.js'

const dreamResults = ref([])
const isLoading = ref(false)
const hasSearched = ref(false)
const searchKeyword = ref('')
const dreamHistory = ref([])
const showSearchOverlay = ref(false)

// 分页相关数据
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const totalRecords = ref(0)
const isLoadingMore = ref(false)
const hasMoreData = ref(true)

const popularDreams = ref([
  '苍蝇幼虫', '走私被捕', '剪刀割手', '跳楼', '伯父死了', '失踪少女'
])

const popularCategories = ref([])

const getImageUrl = (id, imgName) => {
	
  if (!id || !imgName) return ''
  const baseUrl = 'http://video.caimizm.com'
  if (imgName.startsWith('http')) return imgName
  if (imgName.startsWith('/')) return `${baseUrl}${imgName}`
  // 尝试多种可能的图片路径
  const possiblePaths = [
    `${baseUrl}/web/image/${id}/${imgName}`,
    `${baseUrl}/web/dream/image/${id}`,
    `${baseUrl}/api/image/${id}`,
    `${baseUrl}/images/${id}/${imgName}`,
    `${baseUrl}/static/images/${imgName}`
  ]
  const url = possiblePaths[0] // 先尝试第一个路径
  console.log('构建图片URL:', { id, imgName, url, allPaths: possiblePaths })
  return url
}

const handleImageError = (item, index) => {
  console.log('图片加载失败:', item.img)
  item.imageError = true
  item.currentImageUrl = ''
  
  // 如果当前尝试的是第一个路径，可以尝试其他路径
  if (!item.triedAlternativePaths) {
    item.triedAlternativePaths = true
    const baseUrl = 'http://video.caimizm.com'
    const alternativePaths = [
      `${baseUrl}/web/dream/image/${item.id}`,
      `${baseUrl}/api/image/${item.id}`,
      `${baseUrl}/images/${item.id}/${item.img}`,
      `${baseUrl}/static/images/${item.img}`
    ]
    
    // 尝试下一个路径
    const nextPathIndex = item.currentPathIndex || 0
    if (nextPathIndex < alternativePaths.length) {
      item.currentPathIndex = nextPathIndex + 1
      item.currentImageUrl = alternativePaths[nextPathIndex]
      console.log('尝试备用图片路径:', alternativePaths[nextPathIndex])
    }
  }
}

const handleImageLoad = (item, index) => {
  item.imageLoaded = true
}

const getAuthToken = () => {
  return getToken()
}

const checkLoginStatus = () => {
  return !!getAuthToken()
}

const analyzeAPIError = (response) => {
  if (!response) return '网络请求失败'
  if (response.statusCode !== 200) return `HTTP错误: ${response.statusCode}`
  if (!response.data) return '响应数据为空'
  if (response.data.code === 500) return `服务器内部错误: ${response.data.msg || '操作失败'}`
  if (response.data.code !== 200) return `业务错误: ${response.data.msg || '未知错误'}`
  return '未知错误'
}

const checkNetworkStatus = () => {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => resolve(res.networkType !== 'none'),
      fail: () => resolve(true)
    })
  })
}


const queryDreamAPI = async (content, page = '1', limit = '10', isLoadMore = false) => {
  try {
    if (isLoadMore) {
      isLoadingMore.value = true
    } else {
      isLoading.value = true
    }
    
    if (!checkLoginStatus()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const hasNetwork = await checkNetworkStatus()
    if (!hasNetwork) {
      uni.showToast({ title: '网络连接不可用', icon: 'none' })
      return
    }
    
    const response = await apiDreamQuery({ content, page, limit })
    
    const newRecords = response.data.records || []
    
    if (isLoadMore) {
      // 加载更多时，追加到现有数据
      dreamResults.value = [...dreamResults.value, ...newRecords]
    } else {
      // 新搜索时，替换数据
      dreamResults.value = newRecords
      currentPage.value = 1
    }
    
    // 更新分页信息
    totalRecords.value = response.data.total || 0
    totalPages.value = Math.ceil(totalRecords.value / pageSize.value)
    currentPage.value = parseInt(page)
    hasMoreData.value = currentPage.value < totalPages.value
    
    hasSearched.value = true
    
    // 调试信息
    console.log('API返回的数据:', response.data)
    console.log('梦境解析结果:', dreamResults.value)
    console.log('分页信息:', { currentPage: currentPage.value, totalPages: totalPages.value, totalRecords: totalRecords.value })
    
    if (!isLoadMore) {
      uni.showToast({ title: '查询成功', icon: 'success' })
    }
    
  } catch (error) {
    // request.js已经处理了token过期，这里只需要处理其他错误
    uni.showToast({ 
      title: error.errMsg || error.msg || '查询失败，请重试', 
      icon: 'none' 
    })
  } finally {
    if (isLoadMore) {
      isLoadingMore.value = false
    } else {
      isLoading.value = false
    }
  }
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

const searchDream = async () => {
  if (!searchKeyword.value.trim()) {
    uni.showToast({ title: '请输入梦境关键词', icon: 'none' })
    return
  }
  
  if (!checkLoginStatus()) {
    uni.showToast({ title: '请先登录', icon: 'none' })
    return
  }
  
  showSearchOverlay.value = false
  await queryDreamAPI(searchKeyword.value, '1', pageSize.value.toString(), false)
  addToHistory(searchKeyword.value)
}

// 加载更多数据
const loadMoreData = async () => {
  if (!hasMoreData.value || isLoadingMore.value) {
    return
  }
  
  const nextPage = currentPage.value + 1
  await queryDreamAPI(searchKeyword.value, nextPage.toString(), pageSize.value.toString(), true)
}

const selectPopularCategory = (category) => {
  searchKeyword.value = category.keyword
  searchDream()
}

const focusSearch = () => {
  showSearchOverlay.value = true
}

const addToHistory = (keyword) => {
  const now = new Date()
  const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`
  
  const historyItem = { keyword, time: timeStr }
  
  const existingIndex = dreamHistory.value.findIndex(item => item.keyword === keyword)
  if (existingIndex > -1) {
    dreamHistory.value.splice(existingIndex, 1)
  }
  
  dreamHistory.value.unshift(historyItem)
  
  if (dreamHistory.value.length > 10) {
    dreamHistory.value = dreamHistory.value.slice(0, 10)
  }
  
  uni.setStorageSync('dream_history', dreamHistory.value)
}

const selectHistoryKeyword = (keyword) => {
  searchKeyword.value = keyword
  showSearchOverlay.value = false
  searchDream()
}

const clearHistory = () => {
  uni.showModal({
    title: '提示',
    content: '确定要清除所有历史记录吗？',
    success: (res) => {
      if (res.confirm) {
        dreamHistory.value = []
        uni.removeStorageSync('dream_history')
        uni.showToast({ title: '已清除历史记录', icon: 'success' })
      }
    }
  })
}

const selectPopularKeyword = (keyword) => {
  searchKeyword.value = keyword
  showSearchOverlay.value = false
  searchDream()
}

const goBack = () => {
  uni.navigateBack()
}

onMounted(async () => {
  const savedHistory = uni.getStorageSync('dream_history')
  if (savedHistory) {
    dreamHistory.value = savedHistory
  }
  
  // 页面加载时默认显示第一页数据
  await loadDefaultData()
})

const loadDefaultData = async () => {
  try {
    isLoading.value = true
    
    if (!checkLoginStatus()) {
      uni.showToast({ title: '请先登录', icon: 'none' })
      return
    }
    
    const hasNetwork = await checkNetworkStatus()
    if (!hasNetwork) {
      uni.showToast({ title: '网络连接不可用', icon: 'none' })
      return
    }
    
    const response = await apiDreamQuery({ 
      content: '', // 空内容获取默认数据
      page: '1', 
      limit: '4' // 只获取4条数据
    })
    
    dreamResults.value = response.data.records || []
    hasSearched.value = true
    
    console.log('默认加载的数据:', response.data)
    console.log('梦境解析结果:', dreamResults.value)
    
  } catch (error) {
    console.log('默认数据加载失败:', error)
    // 不显示错误提示，静默处理
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.dream-container {
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
  line-height: 1;
}

.nav-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #fff;
}

/* 主要内容区域 */
.main-content {
  padding-top: 88rpx;
  padding: 88rpx 30rpx 30rpx;
}

/* 搜索区域 */
.search-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 40rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #fff;
  border-radius: 25rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-input {
  flex: 1;
  margin-left: 20rpx;
  font-size: 28rpx;
  background: transparent;
  border: none;
}

.search-btn {
  background: linear-gradient(135deg, #28B389 0%, #20a085 100%);
  color: #fff;
  padding: 20rpx 30rpx;
  border-radius: 25rpx;
  font-size: 15rpx;
  font-weight: 400;
  border: none;
  box-shadow: 0 4rpx 15rpx rgba(40, 179, 137, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.search-btn:active {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(40, 179, 137, 0.4);
}

.search-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.5s;
}

.search-btn:hover::before {
  left: 100%;
}

/* 结果区域 - 列表布局 */
.result-section {
  margin-bottom: 40rpx;
}

.result-count {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 20rpx;
  padding: 0 10rpx;
}

.result-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.result-card {
  background-color: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  box-shadow: 0 1rpx 8rpx rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  transition: all 0.2s ease;
  border: 1rpx solid #f0f0f0;
  text-align: center;
}

.result-card:active {
  transform: scale(0.99);
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.1);
}

/* 左侧图片区域 */
.card-image-section {
  flex-shrink: 0;
}

.card-image {
  width: 120rpx;
  height: 120rpx;
  border-radius: 8rpx;
  overflow: hidden;
  position: relative;
  background-color: #f8f8f8;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1rpx solid #e8e8e8;
}

.dream-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.default-icon {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f8ff;
}

.icon-text {
  font-size: 32rpx;
  color: #28B389;
}

/* 内容区域 */
.card-content-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
  align-items: center;
}

.card-title {
  font-size: 26rpx;
  color: #333;
  line-height: 1.3;
  font-weight: 500;
  text-align: center;
  word-break: break-all;
  max-height: 80rpx;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* 号码区域 */
.card-numbers-section {
  display: flex;
  flex-direction: row;
  gap: 8rpx;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.number-text {
  font-size: 22rpx;
  color: #28B389;
  font-weight: 600;
  background-color: #f0f8f5;
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  border: 1rpx solid #28B389;
  min-width: 40rpx;
  text-align: center;
  line-height: 1;
}

/* 加载状态 */
.loading-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60rpx 0;
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.loading-text {
  font-size: 28rpx;
  color: #666;
  margin-top: 20rpx;
}

/* 加载更多区域 */
.load-more-section {
  display: flex;
  justify-content: center;
  margin: 40rpx 0;
}

.load-more-btn {
  background: linear-gradient(135deg, #28B389 0%, #20a085 100%);
  color: #fff;
  padding: 20rpx 40rpx;
  border-radius: 25rpx;
  font-size: 28rpx;
  font-weight: 500;
  border: none;
  box-shadow: 0 4rpx 15rpx rgba(40, 179, 137, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 200rpx;
  justify-content: center;
}

.load-more-btn:disabled {
  background: #ccc;
  box-shadow: none;
  cursor: not-allowed;
}

.load-more-btn:active:not(:disabled) {
  transform: translateY(2rpx);
  box-shadow: 0 2rpx 8rpx rgba(40, 179, 137, 0.4);
}

.load-more-text {
  font-size: 28rpx;
}

.page-info {
  font-size: 22rpx;
  opacity: 0.8;
  margin-left: 10rpx;
}

/* 没有更多数据提示 */
.no-more-section {
  display: flex;
  justify-content: center;
  margin: 40rpx 0;
  padding: 20rpx;
}

.no-more-text {
  font-size: 24rpx;
  color: #999;
  background-color: #f8f8f8;
  padding: 15rpx 30rpx;
  border-radius: 20rpx;
  border: 1rpx solid #e8e8e8;
}

/* 空状态 */
.empty-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background-color: #fff;
  border-radius: 15rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 20rpx;
}

/* 分类区域 */
.category-section {
  margin-bottom: 40rpx;
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.category-card {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  text-align: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15rpx;
}

.category-card:active {
  transform: scale(0.95);
  background-color: #f0f8ff;
}

.card-icon {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f8f8f8;
}

.icon-text {
  font-size: 32rpx;
}

.card-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}


/* 搜索覆盖层样式 */
.search-overlay {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 历史搜索区域 */
.history-search-section {
  margin-bottom: 30rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.clear-btn {
  padding: 10rpx;
}

.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.history-tag {
  background-color: #f5f5f5;
  padding: 15rpx 25rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.history-tag:active {
  background-color: #e8e8e8;
}

/* 热门梦境区域 */
.popular-dreams-section {
  margin-bottom: 30rpx;
}

.popular-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.popular-tag {
  background-color: #f5f5f5;
  padding: 15rpx 25rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.popular-tag:active {
  background-color: #e8e8e8;
}

/* 温馨提示区域 */
.tip-section {
  background-color: #f8f8f8;
  padding: 20rpx;
  border-radius: 10rpx;
  text-align: center;
}

.tip-title {
  font-size: 24rpx;
  color: #999;
  margin-right: 10rpx;
}

.tip-content {
  font-size: 24rpx;
  color: #999;
}
</style>