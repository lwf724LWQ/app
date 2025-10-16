<template>
  <view class="forum-container">
    <!-- 主导航栏 -->
    <view class="main-navbar">
      <view class="nav-left">
        <uni-icons type="list" size="20" color="#fff"></uni-icons>
        <text class="nav-text">说明</text>
      </view>
      <view class="nav-center">
        <view class="period-selector" @click="togglePeriodDropdown">
          <text class="period-text">第{{ currentPeriod }}期 {{ currentPeriodStatus }}</text>
          <uni-icons type="arrowdown" size="16" color="#fff" :class="{ 'rotate': showPeriodDropdown }"></uni-icons>
        </view>
      </view>
      
      <!-- 期号下拉菜单遮罩 -->
      <view v-if="showPeriodDropdown" class="dropdown-mask" @click="closePeriodDropdown"></view>
      
      <!-- 期号下拉菜单 -->
      <view v-if="showPeriodDropdown" class="period-dropdown" @click.stop>
        <view class="dropdown-header">
          <text class="dropdown-title">选择期号</text>
          <view class="close-btn" @click="closePeriodDropdown">
            <uni-icons type="close" size="16" color="#999"></uni-icons>
          </view>
        </view>
        <scroll-view scroll-y class="dropdown-list">
          <view 
            class="dropdown-item" 
            :class="{ active: period.id === currentPeriodId }"
            v-for="period in periodList" 
            :key="period.id"
            @click="selectPeriod(period)"
          >
            <text class="period-item-text">第{{ period.id }}期 {{ period.status }}</text>
            <text class="period-item-time">{{ period.time }}</text>
          </view>
        </scroll-view>
      </view>
      <view class="nav-right" @click="showPublishModal">
        <view class="post-icon">
          <uni-icons type="plus" size="20" color="#fff"></uni-icons>
        </view>
        <text class="nav-text">发帖</text>
      </view>
    </view>
    
    <!-- 切换标签栏 -->
    <view class="switch-tabs">
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'headlines' }"
        @click="switchTab('headlines')"
      >
        <text class="tab-text">头条</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'follow' }"
        @click="switchTab('follow')"
      >
        <text class="tab-text">关注</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'predict' }"
        @click="switchTab('predict')"
      >
        <text class="tab-text">预测</text>
      </view>
      <view 
        class="tab-item" 
        :class="{ active: activeTab === 'soup' }"
        @click="switchTab('soup')"
      >
        <text class="tab-text">鸡汤</text>
      </view>
    </view>
    
    <!-- 搜索栏 -->
    <view class="search-header">
      <text class="search-label">搜索帖子</text>
      <view class="search-input-wrapper">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input type="text" placeholder="搜索头尾、芝麻、靓规等帖" class="search-input" />
      </view>
    </view>
    
    <!-- 分类标签栏 -->
    <view class="category-tags">
      <scroll-view scroll-x class="category-scroll">
        <view class="tag-list">
          <view 
            class="tag-item" 
            :class="{ active: activeTag === index }"
            v-for="(tag, index) in tags" 
            :key="index"
            @click="selectTag(index)"
          >
            {{ tag }}
          </view>
        </view>
      </scroll-view>
    </view>
    
    <!-- 论坛内容 -->
    <view class="forum-content">
      <!-- 头条内容 -->
      <view v-if="activeTab === 'headlines'" class="tab-content">
        <view class="headlines-list">
          <view class="headline-item" v-for="(headline, index) in headlinesList" :key="index">
            <view class="headline-header">
              <text class="headline-title">{{ headline.title }}</text>
              <text class="headline-time">{{ headline.time }}</text>
            </view>
            <text class="headline-content">{{ headline.content }}</text>
            <view class="headline-stats">
              <text class="stat-text">阅读 {{ headline.views }}</text>
              <text class="stat-text">点赞 {{ headline.likes }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 关注内容 -->
      <view v-if="activeTab === 'follow'" class="tab-content">
        <view class="follow-list">
          <view class="follow-item" v-for="(follow, index) in followList" :key="index">
            <view class="follow-header">
              <image :src="follow.avatar" class="user-avatar"></image>
              <view class="user-info">
                <text class="username">{{ follow.username }}</text>
                <text class="follow-time">{{ follow.time }}</text>
              </view>
              <view class="follow-btn">
                <text class="btn-text">已关注</text>
              </view>
            </view>
            <text class="follow-content">{{ follow.content }}</text>
          </view>
        </view>
      </view>
      
      <!-- 预测内容 -->
      <view v-if="activeTab === 'predict'" class="tab-content">
        <view class="predict-list">
          <view class="predict-item" v-for="(predict, index) in predictList" :key="index">
            <view class="predict-header">
              <image :src="predict.avatar" class="user-avatar"></image>
              <view class="user-info">
                <text class="username">{{ predict.username }}</text>
                <text class="predict-time">{{ predict.time }}</text>
              </view>
              <view class="predict-status">
                <text class="status-text">{{ predict.status }}</text>
              </view>
            </view>
            
            <view class="predict-content">
              <view class="period-info">
                <text class="period-text">第{{ predict.period }}期</text>
              </view>
              
              <!-- 中肚预测 -->
              <view class="predict-section">
                <text class="section-title">[中肚]</text>
                <view class="number-predict">
                  <text class="predict-text">百位: {{ predict.middle.hundreds }} 主攻{{ predict.middle.mainHundreds }} 重点{{ predict.middle.keyHundreds }}</text>
                  <text class="predict-text">十位: {{ predict.middle.tens }} 主攻{{ predict.middle.mainTens }} 重点{{ predict.middle.keyTens }}</text>
                </view>
              </view>
              
              <!-- 芝麻预测 -->
              <view class="predict-section">
                <text class="section-title">[芝麻] {{ predict.sesame.hitRate }}</text>
                <view class="number-predict">
                  <text class="predict-text">千位: {{ predict.sesame.thousands }} 主攻{{ predict.sesame.mainThousands }} 重点{{ predict.sesame.keyThousands }}</text>
                  <text class="predict-text">百位: {{ predict.sesame.hundreds }} 主攻{{ predict.sesame.mainHundreds }} 重点{{ predict.sesame.keyHundreds }}</text>
                  <text class="predict-text">十位: {{ predict.sesame.tens }} 主攻{{ predict.sesame.mainTens }} 重点{{ predict.sesame.keyTens }}</text>
                  <text class="predict-text">个位: {{ predict.sesame.units }} 主攻{{ predict.sesame.mainUnits }} 重点{{ predict.sesame.keyUnits }}</text>
                </view>
              </view>
            </view>
            
            <view class="predict-footer">
              <view class="post-stats">
                <view class="stat-item">
                  <uni-icons type="heart" size="14" color="#999"></uni-icons>
                  <text class="stat-text">{{ predict.likes }}</text>
                </view>
                <view class="stat-item">
                  <uni-icons type="chat" size="14" color="#999"></uni-icons>
                  <text class="stat-text">{{ predict.comments }}</text>
                </view>
                <view class="stat-item">
                  <uni-icons type="redo" size="14" color="#999"></uni-icons>
                  <text class="stat-text">{{ predict.shares }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 鸡汤内容 -->
      <view v-if="activeTab === 'soup'" class="tab-content">
        <view class="soup-list">
          <view class="soup-item" v-for="(soup, index) in soupList" :key="index">
            <view class="soup-header">
              <image :src="soup.avatar" class="user-avatar"></image>
              <view class="user-info">
                <text class="username">{{ soup.username }}</text>
                <text class="soup-time">{{ soup.time }}</text>
              </view>
            </view>
            <text class="soup-content">{{ soup.content }}</text>
            <view class="soup-footer">
              <view class="post-stats">
                <view class="stat-item">
                  <uni-icons type="heart" size="14" color="#999"></uni-icons>
                  <text class="stat-text">{{ soup.likes }}</text>
                </view>
                <view class="stat-item">
                  <uni-icons type="chat" size="14" color="#999"></uni-icons>
                  <text class="stat-text">{{ soup.comments }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 发布按钮 -->
    <view class="publish-btn" @click="showPublishModal">
      <uni-icons type="plus" size="20" color="#fff"></uni-icons>
    </view>
    
    <!-- 发布弹出层 -->
    <uni-popup ref="publishPopup" type="bottom" :safe-area="false">
      <view class="publish-modal">
        <view class="modal-header">
          <text class="modal-title">发布帖子</text>
          <view class="close-btn" @click="hidePublishModal">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>
        
        <view class="modal-content">
          <!-- 期号标题 -->
          <view class="period-title">
            <text class="period-text">彩迷</text>
          </view>
          
          <!-- 协议确认 -->
          <view class="agreement-section">
            <view class="checkbox-wrapper" @click="toggleAgreementManually">
              <view class="custom-checkbox" :class="{ checked: agreedToTerms }">
                <view v-if="agreedToTerms" class="checkmark">✓</view>
              </view>
              <text class="agreement-text">同意并遵守《彩友圈管理规范》</text>
            </view>
          </view>
          
          <!-- 功能按钮区域 -->
          <view class="function-buttons">
            <view class="button-row">
              <view class="function-btn" @click="selectFunction('predict')">
                <view class="btn-icon predict-icon">免</view>
                <text class="btn-text">预测帖(免审)</text>
              </view>
              <view class="function-btn" @click="selectFunction('pattern')">
                <view class="btn-icon pattern-icon">
                  <uni-icons type="redo" size="24" color="#fff"></uni-icons>
                </view>
                <text class="btn-text">规律帖(上传规律)</text>
              </view>
              <view class="function-btn" @click="selectFunction('filter')">
                <view class="btn-icon filter-icon">
                  <uni-icons type="gear" size="24" color="#fff"></uni-icons>
                </view>
                <text class="btn-text">过滤王帖(免审)</text>
              </view>
            </view>
            <view class="button-row">
              <view class="function-btn" @click="selectFunction('soup')">
                <view class="btn-icon soup-icon">
                  <uni-icons type="coffee" size="24" color="#fff"></uni-icons>
                </view>
                <text class="btn-text">老母鸡汤</text>
              </view>
            </view>
          </view>
        </view>
        
        <view class="modal-footer">
          <button class="close-btn-modal" @click="hidePublishModal">关闭</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 当前选中的标签
const activeTab = ref('predict')

// 当前选中的标签（分类标签）
const activeTag = ref(0)

// 期号下拉框状态
const showPeriodDropdown = ref(false)
const currentPeriodId = ref(25268)
const currentPeriod = ref(25268)
const currentPeriodStatus = ref('待开奖')

// 弹出层引用
const publishPopup = ref(null)

// 协议同意状态
const agreedToTerms = ref(false)

// 选中的功能类型
const selectedFunction = ref('')

// 分类标签列表
const tags = ref([
  '#全部', '#大师', '#靓规贴', '#过滤王', '#点赞最多'
])

// 期号列表
const periodList = ref([
  { id: 25268, status: '待开奖', time: '今天 21:30' },
  { id: 25267, status: '已开奖', time: '今天 21:30', result: '12345' },
  { id: 25266, status: '已开奖', time: '昨天 21:30', result: '67890' },
  { id: 25265, status: '已开奖', time: '昨天 21:30', result: '54321' },
  { id: 25264, status: '已开奖', time: '2天前 21:30', result: '09876' },
  { id: 25263, status: '已开奖', time: '2天前 21:30', result: '13579' },
  { id: 25262, status: '已开奖', time: '3天前 21:30', result: '24680' },
  { id: 25261, status: '已开奖', time: '3天前 21:30', result: '97531' }
])

// 头条列表
const headlinesList = ref([
  {
    id: 1,
    title: '2024年彩票行业最新政策解读',
    content: '国家彩票管理中心发布最新政策，对彩票销售和兑奖流程进行了优化调整...',
    time: '2小时前',
    views: 1256,
    likes: 89
  },
  {
    id: 2,
    title: '数字彩票中奖概率分析报告',
    content: '专业机构发布最新中奖概率分析，帮助彩民理性购彩...',
    time: '5小时前',
    views: 892,
    likes: 67
  },
  {
    id: 3,
    title: '彩票公益金使用情况公示',
    content: '本年度彩票公益金主要用于教育、医疗、体育等公益事业...',
    time: '1天前',
    views: 2156,
    likes: 156
  }
])

// 关注列表
const followList = ref([
  {
    id: 1,
    username: '彩友小王',
    avatar: '/static/images/defaultAvatar.png',
    time: '刚刚',
    content: '今天分享一个实用的选号技巧，希望对大家有帮助！'
  },
  {
    id: 2,
    username: '幸运星',
    avatar: '/static/images/defaultAvatar.png',
    time: '30分钟前',
    content: '最近在研究号码走势，发现了一些有趣的规律'
  },
  {
    id: 3,
    username: '数字达人',
    avatar: '/static/images/defaultAvatar.png',
    time: '1小时前',
    content: '新一期预测已发布，欢迎大家参考讨论'
  }
])

// 预测列表
const predictList = ref([
  {
    id: 1,
    username: '致富取经',
    avatar: '/static/images/defaultAvatar.png',
    time: '刚刚',
    status: '稳码',
    period: 25268,
    middle: {
      hundreds: '134579',
      mainHundreds: '1347',
      keyHundreds: '13',
      tens: '012589',
      mainTens: '1289',
      keyTens: '18'
    },
    sesame: {
      hitRate: '近10中2',
      thousands: '024589',
      mainThousands: '0459',
      keyThousands: '09',
      hundreds: '134579',
      mainHundreds: '1347',
      keyHundreds: '13',
      tens: '012589',
      mainTens: '1289',
      keyTens: '18',
      units: '023459',
      mainUnits: '2459',
      keyUnits: '25'
    },
    likes: 0,
    comments: 0,
    shares: 0
  },
  {
    id: 2,
    username: '暴富精英2026',
    avatar: '/static/images/defaultAvatar.png',
    time: '10分钟前',
    status: '预测中',
    period: 25268,
    middle: {
      hundreds: '02468',
      mainHundreds: '0246',
      keyHundreds: '02',
      tens: '13579',
      mainTens: '1357',
      keyTens: '13'
    },
    sesame: {
      hitRate: '近10中5',
      thousands: '13579',
      mainThousands: '1357',
      keyThousands: '13',
      hundreds: '02468',
      mainHundreds: '0246',
      keyHundreds: '02',
      tens: '13579',
      mainTens: '1357',
      keyTens: '13',
      units: '02468',
      mainUnits: '0246',
      keyUnits: '02'
    },
    likes: 12,
    comments: 8,
    shares: 3
  }
])

// 鸡汤列表
const soupList = ref([
  {
    id: 1,
    username: '心灵导师',
    avatar: '/static/images/defaultAvatar.png',
    time: '1小时前',
    content: '生活就像彩票，不买永远没有中奖的机会，但买了也不一定中奖。重要的是保持一颗平常心，享受过程，期待美好。',
    likes: 45,
    comments: 12
  },
  {
    id: 2,
    username: '正能量小王',
    avatar: '/static/images/defaultAvatar.png',
    time: '3小时前',
    content: '每一次失败都是成功的垫脚石，每一次尝试都是成长的机会。相信自己，坚持下去，好运总会降临。',
    likes: 67,
    comments: 23
  },
  {
    id: 3,
    username: '励志达人',
    avatar: '/static/images/defaultAvatar.png',
    time: '6小时前',
    content: '人生就像选号，没有标准答案，但有无数种可能。勇敢尝试，坚持梦想，你就是自己的幸运星。',
    likes: 89,
    comments: 34
  }
])

// 页面加载完成
onMounted(() => {
  console.log('论坛页面加载完成')
})

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab
  console.log('切换到标签:', tab)
  // 这里可以根据标签加载不同的内容
}

// 选择分类标签
const selectTag = (index) => {
  activeTag.value = index
  console.log('选择标签:', tags.value[index])
  // 这里可以根据标签加载不同的帖子
}

// 切换期号下拉框
const togglePeriodDropdown = () => {
  showPeriodDropdown.value = !showPeriodDropdown.value
}

// 关闭期号下拉框
const closePeriodDropdown = () => {
  showPeriodDropdown.value = false
}

// 选择期号
const selectPeriod = (period) => {
  currentPeriodId.value = period.id
  currentPeriod.value = period.id
  currentPeriodStatus.value = period.status
  showPeriodDropdown.value = false
  console.log('选择期号:', period)
  // 这里可以根据期号加载不同的数据
}

// 预览图片
const previewImage = (current, urls) => {
  uni.previewImage({
    current,
    urls
  })
}

// 显示发布弹出层
const showPublishModal = () => {
  publishPopup.value.open()
}

// 隐藏发布弹出层
const hidePublishModal = () => {
  publishPopup.value.close()
}

// 切换协议同意状态
const toggleAgreementManually = () => {
  agreedToTerms.value = !agreedToTerms.value
  console.log('协议状态变更:', agreedToTerms.value)
  console.log('当前协议状态:', agreedToTerms.value ? '已同意' : '未同意')
}

// 选择功能类型
const selectFunction = (type) => {
  console.log('选择功能类型:', type, '协议状态:', agreedToTerms.value)
  
  // 所有功能都需要先同意协议
  if (!agreedToTerms.value) {
    console.log('协议未同意，显示提示')
    uni.showToast({
      title: '请先同意管理规范',
      icon: 'none'
    })
    return
  }
  
  console.log('协议已同意，准备跳转')
  
  selectedFunction.value = type
  
  // 根据选择的类型跳转到不同的发布页面
  switch (type) {
    case 'predict':
      console.log('准备跳转到设置方案页面')
      // 跳转到设置方案页面
      uni.navigateTo({
        url: '/pages/predict-scheme/predict-scheme',
        success: () => {
          console.log('跳转成功')
          hidePublishModal()
        },
        fail: (err) => {
          console.error('跳转失败:', err)
          uni.showToast({
            title: '跳转失败',
            icon: 'none'
          })
        }
      })
      break
    case 'pattern':
      uni.showToast({
        title: '跳转到规律帖发布',
        icon: 'none'
      })
      break
    case 'filter':
      uni.showToast({
        title: '跳转到过滤王帖发布',
        icon: 'none'
      })
      break
    case 'soup':
      uni.showToast({
        title: '跳转到老母鸡汤发布',
        icon: 'none'
      })
      break
  }
  
  // 关闭弹出层
  hidePublishModal()
}
</script>

<style scoped>
.forum-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 主导航栏 */
.main-navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #28B389;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
}

.nav-left, .nav-right {
  display: flex;
  align-items: center;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.period-selector {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.period-text {
  font-size: 24rpx;
  color: #fff;
  margin-right: 8rpx;
}

.period-selector {
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-selector:active {
  opacity: 0.8;
}

.rotate {
  transform: rotate(180deg);
}

/* 下拉菜单遮罩 */
.dropdown-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* 期号下拉菜单 */
.period-dropdown {
  position: fixed;
  top: 88rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 600rpx;
  max-height: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dropdown-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.dropdown-list {
  max-height: 500rpx;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f8f8f8;
  transition: background-color 0.2s ease;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background-color: #f8f8f8;
}

.dropdown-item.active {
  background-color: #fff2f0;
}

.period-item-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.dropdown-item.active .period-item-text {
  color: #ff4757;
}

.period-item-time {
  font-size: 24rpx;
  color: #999;
}

.post-icon {
  width: 32rpx;
  height: 32rpx;
  background-color: #ff4757;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #fff;
}

/* 切换标签栏 */
.switch-tabs {
  position: fixed;
  top: 88rpx;
  left: 0;
  right: 0;
  height: 88rpx;
  background-color: #fff;
  z-index: 998;
  display: flex;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 4rpx solid transparent;
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #ff4757;
}

/* 搜索栏 */
.search-header {
  position: fixed;
  top: 176rpx;
  left: 0;
  right: 0;
  height: 80rpx;
  background-color: #fff;
  z-index: 997;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
}

.search-label {
  font-size: 24rpx;
  color: #333;
  margin-right: 20rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 24rpx;
  background: transparent;
  border: none;
}

/* 分类标签栏 */
.category-tags {
  position: fixed;
  top: 256rpx;
  left: 0;
  right: 0;
  height: 80rpx;
  background-color: #fff;
  z-index: 996;
  padding: 20rpx 0;
}

.category-scroll {
  white-space: nowrap;
}

.tag-list {
  display: flex;
  padding: 0 30rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  white-space: nowrap;
}

.tag-item.active {
  background-color: #ff4757;
  color: #fff;
}

.forum-content {
  padding: 20rpx;
  padding-top: 356rpx; /* 为四个固定区域留出空间 */
}

/* 标签内容区域 */
.tab-content {
  padding-bottom: 100rpx;
}

/* 头条样式 */
.headline-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.headline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.headline-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.headline-time {
  font-size: 24rpx;
  color: #999;
}

.headline-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
  margin-bottom: 20rpx;
}

.headline-stats {
  display: flex;
  gap: 30rpx;
}

.headline-stats .stat-text {
  font-size: 24rpx;
  color: #999;
}

/* 关注样式 */
.follow-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.follow-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.follow-time, .predict-time, .soup-time {
  font-size: 24rpx;
  color: #999;
}

.follow-btn {
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
}

.btn-text {
  font-size: 22rpx;
  color: #666;
}

.follow-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

/* 预测样式 */
.predict-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
  position: relative;
}

.predict-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.predict-status {
  background-color: #ff4757;
  padding: 6rpx 12rpx;
  border-radius: 12rpx;
}

.status-text {
  font-size: 20rpx;
  color: #fff;
}

.predict-content {
  margin-bottom: 20rpx;
}

.period-info {
  text-align: center;
  margin-bottom: 20rpx;
}

.period-text {
  font-size: 24rpx;
  color: #ff4757;
  font-weight: 500;
}

.predict-section {
  margin-bottom: 20rpx;
}

.section-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.number-predict {
  background-color: #f8f8f8;
  padding: 15rpx;
  border-radius: 10rpx;
}

.predict-text {
  display: block;
  font-size: 24rpx;
  color: #333;
  margin-bottom: 8rpx;
  line-height: 1.4;
}

.predict-footer {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

.post-stats {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  align-items: center;
}

.stat-text {
  margin-left: 8rpx;
  font-size: 24rpx;
  color: #999;
}

/* 鸡汤样式 */
.soup-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.1);
}

.soup-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.soup-content {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20rpx;
  font-style: italic;
}

.soup-footer {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  right: 30rpx;
  bottom: 120rpx;
  width: 100rpx;
  height: 100rpx;
  background-color: #28B389;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(40, 179, 137, 0.3);
  z-index: 999;
}

.publish-btn:active {
  transform: scale(0.95);
}

/* 发布弹出层样式 */
.publish-modal {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 65vh;
  min-height: 400rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.modal-content {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

/* 期号标题 */
.period-title {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

/* 协议确认 */
.agreement-section {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 15rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.custom-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  transition: all 0.3s ease;
}

.custom-checkbox.checked {
  background-color: #ff4757;
  border-color: #ff4757;
}

.checkmark {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.agreement-text {
  font-size: 26rpx;
  color: #ff4757;
}

/* 功能按钮区域 */
.function-buttons {
  margin-bottom: 10rpx;
}

.button-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.button-row:last-child {
  margin-bottom: 10rpx;
}

.function-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 15rpx;
}

.btn-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.predict-icon {
  background-color: #28B389;
}

.pattern-icon {
  background-color: #ff6b35;
}

.filter-icon {
  background-color: #9b59b6;
}

.soup-icon {
  background-color: #3498db;
}

.btn-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}

/* 底部按钮 */
.modal-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  text-align: center;
  flex-shrink: 0;
}

.close-btn-modal {
  background: transparent;
  border: none;
  color: #333;
  font-size: 32rpx;
  padding: 20rpx 40rpx;
}
</style>
