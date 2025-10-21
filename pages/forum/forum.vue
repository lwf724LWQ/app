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
          <text class="period-text">{{ currentLotteryType.name }} {{ currentLotteryType.status }}</text>
          <uni-icons type="arrowdown" size="16" color="#fff" :class="{ 'rotate': showPeriodDropdown }"></uni-icons>
        </view>
      </view>
      
      <!-- 期号下拉菜单遮罩 -->
      <view v-if="showPeriodDropdown" class="dropdown-mask" @click="closePeriodDropdown"></view>
      
      <!-- 期号下拉菜单 -->
      <view v-if="showPeriodDropdown" class="period-dropdown" @click.stop>
        <view class="dropdown-header">
          <text class="dropdown-title">选择彩票类型</text>
          <view class="close-btn" @click="closePeriodDropdown">
            <uni-icons type="close" size="16" color="#999"></uni-icons>
          </view>
        </view>
        <scroll-view scroll-y class="dropdown-list">
          <view 
            class="dropdown-item" 
            :class="{ active: lotteryType.id === currentLotteryType.id }"
            v-for="lotteryType in lotteryTypes" 
            :key="lotteryType.id"
            @click="selectLotteryType(lotteryType)"
          >
            <text class="period-item-text">{{ lotteryType.name }} {{ lotteryType.status }}</text>
            <text class="period-item-time">{{ lotteryType.time }}</text>
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
      <view class="search-input-wrapper" @click="showFilterModal">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input type="text" placeholder="搜索头尾、芝麻、靓规等帖" class="search-input" readonly />
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
          <view class="predict-item" v-for="(item, index) in predictList" :key="index">
            <!-- 帖子头部 -->
            <view class="post-header">
              <view class="user-info">
                <image :src="item.avatar" class="avatar"></image>
                <view class="username-and-url">
                  <text class="username">{{ item.username }}</text>
              </view>
              </view>
              <view class="more-options">
                <uni-icons type="more-filled" size="20" color="#999"></uni-icons>
            </view>
              </view>
              
            <!-- 期号和时间 -->
            <view class="issue-time">
              <text class="issue-no">第{{ item.period }}期</text>
              <text class="post-time">{{ item.time }}</text>
              </view>
              
            <!-- 帖子内容 -->
            <view class="post-content">
              <text class="content-text">{{ item.content }}</text>
            </view>
            
            <!-- 帖子底部操作 -->
            <view class="post-footer">
              <view class="action-item">
                <uni-icons type="hand-up" size="18" color="#999"></uni-icons>
                <text class="count">{{ item.likes }}</text>
                </view>
              <view class="action-item">
                <uni-icons type="redo" size="18" color="#999"></uni-icons>
                <text class="count">{{ item.shares }}</text>
                </view>
              <view class="action-item">
                <uni-icons type="chatbubble" size="18" color="#999"></uni-icons>
                <text class="count">{{ item.comments }}</text>
                </view>
              </view>
            </view>
          
          <!-- 暂无数据提示 -->
          <view v-if="predictList.length === 0" class="no-posts-tip">
            <text>暂无预测帖子</text>
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
    
    <!-- 测试期号按钮 -->
    <view class="test-issue-btn" @click="testIssueAPI">
      <uni-icons type="gear" size="16" color="#fff"></uni-icons>
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
    
    <!-- 筛选弹窗 -->
    <view v-if="showFilterDialog" class="filter-dialog-mask" @click="hideFilterModal">
      <view class="filter-dialog" @click.stop>
        <!-- 弹窗头部 -->
        <view class="filter-header">
          <text class="filter-title">心水预测</text>
          <text class="filter-period">第{{ currentLotteryType.name }}期 {{ currentLotteryType.status }}</text>
        </view>
        
        <!-- 心水预测筛选 -->
        <view class="filter-section">
          <view class="filter-grid">
            <view 
              class="filter-item" 
              :class="{ active: selectedPredictionFilter === filter }"
              v-for="filter in predictionFilters" 
              :key="filter"
              @click="togglePredictionFilter(filter)"
            >
              {{ filter }}
            </view>
          </view>
        </view>
        
        <!-- 其他筛选 -->
        <view class="filter-section">
          <text class="section-title">其他筛选</text>
          <text class="section-subtitle">(可结合上面选项选择一个)</text>
          <view class="filter-grid">
            <view 
              class="filter-item" 
              :class="{ active: selectedOtherFilter === filter }"
              v-for="filter in otherFilters" 
              :key="filter"
              @click="toggleOtherFilter(filter)"
            >
              {{ filter }}
            </view>
          </view>
        </view>
        
        <!-- 搜索按钮 -->
        <view class="filter-footer">
          <button class="search-btn" @click="performSearch">
            {{ getSearchButtonText() }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiGetIssueNo, apiPostListQuery } from '@/api/apis.js'

// 当前选中的标签
const activeTab = ref('predict')

// 当前选中的标签（分类标签）
const activeTag = ref(0)

// 彩票类型下拉框状态
const showPeriodDropdown = ref(false)

// 弹出层引用
const publishPopup = ref(null)

// 协议同意状态
const agreedToTerms = ref(false)

// 选中的功能类型
const selectedFunction = ref('')

// 筛选弹窗相关
const showFilterDialog = ref(false)
const selectedPredictionFilter = ref('') // 心水预测只能选择一个
const selectedOtherFilter = ref('') // 其他筛选只能选择一个

// 心水预测筛选选项
const predictionFilters = ref([
  '头尾', '芝麻', '定头', '定百', '定十', '定尾', '杀头', '杀百', '杀十', '杀尾', 
  '稳码', '中肚', '头尾合', '中肚合', '千百合', '千十合', '百个合', '十个合', 
  'ABXD', 'ABCX', 'AXCD', 'XBCD', 'ABXX', 'AXCX', 'XXCD', 'XBXD', '死数', 
  '二字现', '三字现', '过滤王二定', '过滤王三定', '过滤王四定', 
  '头尾不合', '中肚不合', '千百不合', '千十不合', '百个不合', '十个不合'
])

// 其他筛选选项
const otherFilters = ref([
  '大师帖子', '靓规贴子', '点赞最多', '讨论最热'
])

// 分类标签列表
const tags = ref([
  '#全部', '#大师', '#靓规贴', '#过滤王', '#点赞最多'
])

// 彩票类别列表
const lotteryTypes = ref([
  { id: 16, name: '排列三', code: 'pl3', status: '待开奖', time: '今天 21:30' },
  { id: 17, name: '排列五', code: 'pl5', status: '待开奖', time: '今天 21:30' },
  { id: 15, name: '七星彩', code: 'qxc', status: '待开奖', time: '今天 21:30' },
  { id: 12, name: '福彩3D', code: 'fc3d', status: '待开奖', time: '今天 21:30' }
])

// 当前选中的彩票类别
const currentLotteryType = ref(lotteryTypes.value[0])

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
const predictList = ref([])

// 当前期号信息
const currentIssueInfo = ref({
  id: null,
  number: null,
  status: '待开奖',
  time: '今天 21:30'
})

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
  try {
    const savedLotteryType = uni.getStorageSync('currentLotteryType')
    if (savedLotteryType) {
      currentLotteryType.value = savedLotteryType
    }
  } catch (error) {
    console.error('加载保存的彩票类型失败:', error)
  }
  
  loadLotteryData(currentLotteryType.value.code)
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

// 切换彩票类型下拉框
const togglePeriodDropdown = () => {
  showPeriodDropdown.value = !showPeriodDropdown.value
}

// 关闭彩票类型下拉框
const closePeriodDropdown = () => {
  showPeriodDropdown.value = false
}

// 选择彩票类型
const selectLotteryType = (lotteryType) => {
  currentLotteryType.value = lotteryType
  showPeriodDropdown.value = false
  
  try {
    uni.setStorageSync('currentLotteryType', lotteryType)
  } catch (error) {
    console.error('保存彩票类型失败:', error)
  }
  
  loadLotteryData(lotteryType.code)
}

// 根据彩票类型加载数据
const loadLotteryData = async (lotteryCode) => {
  try {
    const lotteryType = lotteryTypes.value.find(type => type.code === lotteryCode)
    if (!lotteryType) {
      return
    }
    
    uni.showLoading({ title: '加载中...' })
    
    const response = await apiGetIssueNo({ cpid: lotteryType.id })
    
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
      
      lotteryType.status = issueStatus
      lotteryType.time = issueTime
      
      if (currentLotteryType.value.code === lotteryCode) {
        currentLotteryType.value.status = lotteryType.status
        currentLotteryType.value.time = lotteryType.time
      }
      
      currentIssueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime
      }
      
      try {
        uni.setStorageSync('currentIssueInfo', currentIssueInfo.value)
      } catch (error) {
        console.error('保存期号信息失败:', error)
      }
      
      loadPredictPosts()
      uni.showToast({ title: '数据加载成功', icon: 'success' })
    } else {
      uni.showToast({ title: response.msg || '数据加载失败', icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    uni.showToast({ title: '网络错误，请重试', icon: 'none' })
  }
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

// 显示筛选弹窗
const showFilterModal = () => {
  showFilterDialog.value = true
}

// 隐藏筛选弹窗
const hideFilterModal = () => {
  showFilterDialog.value = false
}

// 切换筛选选项
// 切换心水预测筛选
const togglePredictionFilter = (filter) => {
  if (selectedPredictionFilter.value === filter) {
    selectedPredictionFilter.value = '' // 取消选择
  } else {
    selectedPredictionFilter.value = filter // 选择新的
  }
}

// 切换其他筛选
const toggleOtherFilter = (filter) => {
  if (selectedOtherFilter.value === filter) {
    selectedOtherFilter.value = '' // 取消选择
  } else {
    selectedOtherFilter.value = filter // 选择新的
  }
}

// 执行搜索
const performSearch = () => {
  const filters = []
  if (selectedPredictionFilter.value) {
    filters.push(selectedPredictionFilter.value)
  }
  if (selectedOtherFilter.value) {
    filters.push(selectedOtherFilter.value)
  }
  
  console.log('执行搜索，选中的筛选条件:', filters)
  
  // 这里可以根据选中的筛选条件进行搜索
  if (filters.length === 0) {
    uni.showToast({
      title: '请选择筛选条件',
      icon: 'none'
    })
    return
  }
  
  uni.showToast({
    title: `搜索${filters.join('+')}`,
    icon: 'success'
  })
  
  // 关闭弹窗
  hideFilterModal()
  
  // 这里可以调用搜索API
  // searchPosts(filters)
}

// 获取搜索按钮文本
const getSearchButtonText = () => {
  const filters = []
  if (selectedPredictionFilter.value) {
    filters.push(selectedPredictionFilter.value)
  }
  if (selectedOtherFilter.value) {
    filters.push(selectedOtherFilter.value)
  }
  
  if (filters.length === 0) {
    return '搜索'
  }
  
  return filters.join('+')
}

// 加载预测帖子数据
const loadPredictPosts = async () => {
  try {
    const queryData = {
      tname: currentLotteryType.value.name,
      issueno: currentIssueInfo.value.number || currentIssueInfo.value.id || '--',
      page: '1',
      limit: '20'
    }
    
    const response = await apiPostListQuery(queryData)
    
    if (response.code === 200) {
      if (response.data && response.data.records && Array.isArray(response.data.records)) {
        predictList.value = response.data.records.map((post) => {
          return {
            id: post.id,
            username: post.account || '匿名用户',
            avatar: post.pimg ? (post.pimg.startsWith('http') ? post.pimg : `http://video.caimizm.com/himg/${post.pimg}`) : '/static/images/defaultAvatar.png',
            time: formatTime(post.createTime),
            status: '预测中',
            period: post.issueno || currentIssueInfo.value.number,
            content: post.content || '',
            likes: post.likeCount || 0,
            comments: post.comment || 0,
            shares: 0
          }
        })
      } else {
        predictList.value = []
      }
    } else {
      predictList.value = []
    }
  } catch (error) {
    predictList.value = []
  }
}

// 解析预测内容
const parsePredictionContent = (content) => {
  // 这里可以根据实际的内容格式来解析预测数据
  // 暂时返回空对象，后续可以根据实际数据结构调整
  return {}
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '刚刚'
  
  try {
    const time = new Date(timeStr)
    const now = new Date()
    const diff = now - time
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return `${Math.floor(diff / 86400000)}天前`
  } catch (error) {
    return '刚刚'
  }
}

// 测试期号API
const testIssueAPI = async () => {
  try {
    console.log('=== 开始测试期号API ===')
    console.log('当前彩票类型:', currentLotteryType.value)
    
    uni.showLoading({ title: '测试中...' })
    
    const response = await apiGetIssueNo({ cpid: currentLotteryType.value.id })
    
    uni.hideLoading()
    
    console.log('=== 期号API测试结果 ===')
    console.log('请求参数:', { cpid: currentLotteryType.value.id })
    console.log('响应状态码:', response.code)
    console.log('响应消息:', response.msg)
    console.log('完整响应:', response)
    
    if (response.code === 200) {
      console.log('✅ 期号API调用成功')
      console.log('响应数据结构:', {
        hasData: !!response.data,
        dataType: typeof response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      })
      
      if (response.data) {
        console.log('期号数据详情:', response.data)
        console.log('期号字段值:', {
          issueno: response.data.issueno,
          number: response.data.number,
          id: response.data.id,
          status: response.data.status,
          time: response.data.time
        })
        
        // 更新期号信息
        currentIssueInfo.value = {
          id: response.data.id || null,
          number: response.data.issueno || response.data.number || null,
          status: response.data.status || '待开奖',
          time: response.data.time || '今天 21:30'
        }
        
        console.log('更新后的期号信息:', currentIssueInfo.value)
        
        uni.showToast({ title: '期号API测试成功', icon: 'success' })
      } else {
        console.log('⚠️ 响应中没有data字段')
        uni.showToast({ title: '响应无数据', icon: 'none' })
      }
    } else {
      console.log('❌ 期号API调用失败:', response.msg)
      uni.showToast({ title: `测试失败: ${response.msg}`, icon: 'none' })
    }
  } catch (error) {
    uni.hideLoading()
    console.error('❌ 期号API测试异常:', error)
    uni.showToast({ title: '测试异常', icon: 'none' })
  }
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

/* 预测列表样式 */
.predict-list {
  padding: 20rpx;
  background-color: #f8f8f8;
}

.predict-item {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background-color: #eee;
  flex-shrink: 0;
}

.username-and-url {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-options {
  padding: 10rpx;
}

.issue-time {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.issue-no {
  font-weight: bold;
  margin-right: 10rpx;
  color: #333;
}

.post-time {
  color: #999;
}

.post-content {
  margin-bottom: 20rpx;
  line-height: 1.6;
  font-size: 28rpx;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

.post-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.action-item {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 24rpx;
}

.action-item .count {
  margin-left: 8rpx;
}

.no-posts-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
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

/* 测试期号按钮 */
.test-issue-btn {
  position: fixed;
  right: 30rpx;
  bottom: 240rpx;
  width: 80rpx;
  height: 80rpx;
  background-color: #ff6b35;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 107, 53, 0.3);
  z-index: 999;
}

.test-issue-btn:active {
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

/* 筛选弹窗样式 */
.filter-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-dialog {
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  max-height: 80vh;
  overflow-y: auto;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.filter-period {
  font-size: 24rpx;
  color: #666;
}

.filter-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.section-subtitle {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.filter-item {
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.filter-item.active {
  background-color: #ff4757;
  color: #fff;
  border-color: #ff4757;
}

.filter-footer {
  margin-top: 30rpx;
  text-align: center;
}

.search-btn {
  width: 100%;
  height: 80rpx;
  background-color: #ff4757;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
}
</style>
