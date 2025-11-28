<template>
  <view class="orders-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">×</text>
        </view>
        <text class="nav-title">我的订单</text>
        <view class="nav-right">
          <text class="more-icon">⋯</text>
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 搜索框 -->
      <view class="search-section">
        <view class="search-bar" @click="focusSearch">
          <text class="search-icon">🔍</text>
          <input v-if="isSearching" v-model="searchKeyword" class="search-input" placeholder="输入订单号搜索"
            @blur="handleSearchBlur" @input="handleSearchInput" @confirm="performSearch" :focus="isSearching" />
          <text v-else class="search-text">输入订单号搜索</text>
          <text v-if="isSearching && searchKeyword" class="clear-icon" @click.stop="clearSearch">×</text>
          <button v-if="isSearching" class="search-btn" @click.stop="performSearch">搜索</button>
        </view>

        <!-- 搜索建议 -->
        <view class="search-suggestions" v-if="isSearching && searchHistory.length > 0 && !searchKeyword">
          <view class="suggestions-title">最近搜索</view>
          <view class="suggestion-item" v-for="(item, index) in searchHistory" :key="index"
            @click="selectSuggestion(item)">
            <text class="suggestion-text">{{ item }}</text>
          </view>
        </view>

        <!-- 月份选择器 -->
        <view class="month-selector" @click="showMonthPicker">
          <text class="month-text">{{ displayedDateText }}</text>
          <text class="dropdown-arrow">▼</text>
        </view>
      </view>

      <!-- 订单统计 -->
      <view class="orders-stats" v-if="orders.length > 0">
        <text class="stats-text">
          <text v-if="searchKeyword.trim()">搜索"{{ searchKeyword }}"结果：{{ filteredOrders.length }} 个订单</text>
          <text v-else-if="startDate && endDate">
            <text v-if="formatDate(startDate) === formatDate(endDate)">
              {{ formatDate(startDate) }}：{{ filteredOrders.length }} 个订单
            </text>
            <text v-else>
              时间段 {{ formatDate(startDate) }} 至 {{ formatDate(endDate) }}：{{ filteredOrders.length }} 个订单
            </text>
          </text>
          <text v-else>{{ currentYear }}年{{ currentMonth }}月：{{ filteredOrders.length }} 个订单</text>
        </text>
      </view>

      <!-- 订单列表 -->
      <view class="orders-list" v-if="orders.length > 0">
        <view class="order-card" v-for="order in filteredOrders" :key="order.orderNo" @click="viewOrderDetail(order)">
          <view class="order-header">
            <view class="order-info">
              <text class="order-no">订单号：{{ order.orderNo }}</text>
              <text class="order-time">{{ formatTime(order.updateTime || order.createTime) }}</text>
            </view>
            <view class="order-status" :class="getStatusClass(order.status)">
              {{ getStatusText(order.status) }}
            </view>
          </view>

          <view class="order-content">
            <view class="order-desc">
              <text class="order-title">{{ order.info || '订单详情' }}</text>
              <text class="order-amount">¥{{ order.amount }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-else-if="!loading">
        <text class="empty-icon">📋</text>
        <text class="empty-text" v-if="searchKeyword.trim()">未找到相关订单</text>
        <text class="empty-text" v-else-if="startDate && endDate">
          <text v-if="formatDate(startDate) === formatDate(endDate)">该日期暂无订单</text>
          <text v-else>该时间段暂无订单</text>
        </text>
        <text class="empty-text" v-else>该月份暂无订单</text>
        <text class="empty-desc" v-if="searchKeyword.trim()">请尝试其他订单号或清空搜索</text>
        <text class="empty-desc" v-else-if="startDate && endDate">
          <text v-if="formatDate(startDate) === formatDate(endDate)">请尝试选择其他日期</text>
          <text v-else>请尝试选择其他时间段</text>
        </text>
        <text class="empty-desc" v-else>请尝试选择其他月份</text>
      </view>

      <!-- 加载更多按钮 -->
      <view class="load-more-section" v-if="orders.length > 0 && hasMore">
        <button class="load-more-btn" @click="loadMoreOrders" :disabled="loading">
          {{ loading ? '加载中...' : '加载更多' }}
        </button>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading && orders.length === 0">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 日历弹出层 -->
    <view class="calendar-modal" v-if="showCalendar" @click="closeCalendar">
      <view class="calendar-content" @click.stop>
        <!-- 日历头部 -->
        <view class="calendar-header">
          <view class="calendar-nav">
            <text class="close-btn" @click="closeCalendar">×</text>
            <text class="calendar-title">选择日期</text>
            <view class="nav-spacer"></view>
          </view>

          <!-- 选择模式标签 -->
          <view class="selection-tabs">
            <view class="tab-item" :class="{ active: selectionMode === 'month' }" @click="setSelectionMode('month')">
              <text class="tab-text">选择月份</text>
            </view>
            <view class="tab-item" :class="{ active: selectionMode === 'range' }" @click="setSelectionMode('range')">
              <text class="tab-text">选择时间段</text>
            </view>
          </view>

          <!-- 当前选择显示 -->
          <view class="current-selection" v-if="selectionMode === 'range'">
            <view class="date-range-display">
              <view class="date-item">
                <text class="date-label">开始日期</text>
                <text class="date-value">{{ startDate ? formatDate(startDate) : '请选择' }}</text>
              </view>
              <text class="date-separator">至</text>
              <view class="date-item">
                <text class="date-label">结束日期</text>
                <text class="date-value">{{ endDate ? formatDate(endDate) : '请选择' }}</text>
              </view>
            </view>
          </view>
        </view>

        <!-- 日历主体 -->
        <view class="calendar-body">
          <!-- 月份选择模式 -->
          <view v-if="selectionMode === 'month'" class="month-picker">
            <view class="picker-container">
              <!-- 年份选择 -->
              <view class="year-picker">
                <scroll-view class="picker-scroll" scroll-y="true" :scroll-top="yearScrollTop">
                  <view class="picker-item" v-for="year in yearList" :key="year"
                    :class="{ active: selectedYear === year }" @click="selectYear(year)">
                    <text class="picker-text">{{ year }}年</text>
                  </view>
                </scroll-view>
              </view>

              <!-- 月份选择 -->
              <view class="month-picker-list">
                <scroll-view class="picker-scroll" scroll-y="true" :scroll-top="monthScrollTop">
                  <view class="picker-item" v-for="month in monthList" :key="month"
                    :class="{ active: selectedMonth === month }" @click="selectMonth(month)">
                    <text class="picker-text">{{ month }}月</text>
                  </view>
                </scroll-view>
              </view>
            </view>
          </view>

          <!-- 时间段选择模式 -->
          <view v-else class="date-range-picker">
            <!-- 月份导航 -->
            <view class="month-navigation">
              <view class="nav-arrow" @click="previousMonth">
                <text class="arrow-icon">‹</text>
              </view>
              <view class="month-year" @click="showMonthYearPicker">
                <text class="month-year-text">{{ currentYear }}年 {{ currentMonth }}月</text>
                <text class="month-dropdown">▼</text>
              </view>
              <view class="nav-arrow" @click="nextMonth">
                <text class="arrow-icon">›</text>
              </view>
            </view>

            <!-- 日历网格 -->
            <view class="calendar-grid" @touchstart="handleTouchStart" @touchmove="handleTouchMove"
              @touchend="handleTouchEnd">
              <!-- 星期标题 -->
              <view class="weekdays">
                <text class="weekday" v-for="day in weekdays" :key="day">{{ day }}</text>
              </view>

              <!-- 日期网格 -->
              <view class="days-grid">
                <view class="day-item" v-for="(day, index) in calendarDays" :key="index" :class="getDayClass(day)"
                  @click="selectDate(day)">
                  <text class="day-number">{{ day.date }}</text>
                  <text v-if="day.isStart" class="day-label">开始</text>
                  <text v-if="day.isToday" class="day-label">今天</text>
                </view>
              </view>
            </view>
          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="calendar-footer">
          <view class="btn cancel-btn" @click="closeCalendar">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn confirm-btn" @click="confirmSelection">
            <text class="btn-text">确定</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getToken, getAccount } from '@/utils/request.js'
import { apiOrderQuery } from '@/api/apis.js'

// 响应式数据
const searchKeyword = ref('')
const isSearching = ref(false)
const orders = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const hasMore = ref(true)
const totalOrders = ref(0)
const searchHistory = ref([])

// 日历相关数据
const showCalendar = ref(false)
const selectionMode = ref('month') // 'month' 或 'range'
const currentYear = ref(2025)
const currentMonth = ref(9)
const startDate = ref(null)
const endDate = ref(null)
const weekdays = ['日', '一', '二', '三', '四', '五', '六']

// 月份选择相关数据
const selectedYear = ref(2023)
const selectedMonth = ref(10)
const yearScrollTop = ref(0)
const monthScrollTop = ref(0)

// 滑动相关数据
const touchStartY = ref(0)
const touchStartX = ref(0)
const isSwipeEnabled = ref(true)

// 计算属性
const filteredOrders = computed(() => {
  let result = orders.value

  // 先按日期范围过滤
  if (startDate.value && endDate.value) {
    // 日期范围模式 - 只比较日期部分，忽略时间
    result = result.filter(order => {
      const orderTimeStr = order.updateTime || order.createTime
      if (!orderTimeStr) return false

      // 解析订单时间，只取日期部分
      const orderDate = new Date(orderTimeStr)
      const orderDateOnly = new Date(orderDate.getFullYear(), orderDate.getMonth(), orderDate.getDate())

      // 解析选择日期，只取日期部分
      const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate())
      const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate())

      return orderDateOnly.getTime() >= startDateOnly.getTime() &&
        orderDateOnly.getTime() <= endDateOnly.getTime()
    })
  } else {
    // 月份模式
    result = result.filter(order => {
      const orderTimeStr = order.updateTime || order.createTime
      if (!orderTimeStr) return false

      const orderDate = new Date(orderTimeStr)
      return orderDate.getFullYear() === currentYear.value &&
        orderDate.getMonth() + 1 === currentMonth.value
    })
  }

  // 再按搜索关键词过滤
  if (searchKeyword.value.trim()) {
    result = result.filter(order =>
      order.orderNo.includes(searchKeyword.value) ||
      (order.info && order.info.includes(searchKeyword.value))
    )
  }

  return result
})

// 日历计算属性
const calendarDays = computed(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const firstDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()

  const days = []

  // 添加上个月的空白日期
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ date: '', isEmpty: true })
  }

  // 添加当前月的日期
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day)
    const today = new Date()
    const isToday = date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    const isStart = startDate.value && date.getTime() === startDate.value.getTime()
    const isEnd = endDate.value && date.getTime() === endDate.value.getTime()
    const isInRange = startDate.value && endDate.value &&
      date.getTime() >= startDate.value.getTime() &&
      date.getTime() <= endDate.value.getTime()

    days.push({
      date: day,
      fullDate: date,
      isStart,
      isEnd,
      isInRange,
      isToday,
      isEmpty: false
    })
  }

  return days
})

// 年份和月份列表
const yearList = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let year = currentYear - 5; year <= currentYear + 2; year++) {
    years.push(year)
  }
  return years
})

const monthList = computed(() => {
  return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
})

// 动态显示日期文本
const displayedDateText = computed(() => {
  if (selectionMode.value === 'range' && startDate.value && endDate.value) {
    // 选择了具体日期范围
    const startDateStr = formatDate(startDate.value)
    const endDateStr = formatDate(endDate.value)

    // 如果是同一天，只显示一个日期
    if (startDateStr === endDateStr) {
      return startDateStr
    } else {
      return `${startDateStr} - ${endDateStr}`
    }
  } else if (selectionMode.value === 'range' && startDate.value) {
    // 只选择了开始日期
    return formatDate(startDate.value)
  } else {
    // 月份模式或未选择具体日期
    return `${currentYear.value}年${currentMonth.value}月`
  }
})

// 判断是否选择了具体日期范围
const isDateRangeSelected = computed(() => {
  return selectionMode.value === 'range' && (startDate.value || endDate.value)
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

// 日历相关方法
const showMonthPicker = () => {
  // 显示日历弹出层
  showCalendar.value = true
  // 初始化选中的年月为当前显示的年月
  selectedYear.value = currentYear.value
  selectedMonth.value = currentMonth.value
  // 设置默认日期范围（仅在时间段模式下）
  if (selectionMode.value === 'range') {
    if (!startDate.value) {
      startDate.value = new Date(2025, 8, 3) // 2025年9月3日
    }
    if (!endDate.value) {
      endDate.value = new Date(2025, 9, 2) // 2025年10月2日
    }
  }
}

const closeCalendar = () => {
  showCalendar.value = false
}

const setSelectionMode = (mode) => {
  selectionMode.value = mode
}

const selectDate = (day) => {
  if (day.isEmpty) return

  if (selectionMode.value === 'range') {
    if (!startDate.value || (startDate.value && endDate.value)) {
      // 选择开始日期
      startDate.value = day.fullDate
      endDate.value = null
    } else if (startDate.value && !endDate.value) {
      // 选择结束日期
      if (day.fullDate.getTime() >= startDate.value.getTime()) {
        endDate.value = day.fullDate
      } else {
        // 如果选择的日期早于开始日期，则重新设置开始日期
        endDate.value = startDate.value
        startDate.value = day.fullDate
      }
    }
  }
}

const getDayClass = (day) => {
  if (day.isEmpty) return 'empty'
  if (day.isStart) return 'start-date'
  if (day.isEnd) return 'end-date'
  if (day.isInRange) return 'in-range'
  return 'normal'
}

const formatDate = (date) => {
  if (!date) return ''
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

// 格式化日期为API需要的格式
const formatDateForAPI = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

const confirmSelection = async () => {
  // 确认选择，更新月份显示
  if (selectionMode.value === 'month') {
    currentYear.value = selectedYear.value
    currentMonth.value = selectedMonth.value
    // 清除日期范围选择
    startDate.value = null
    endDate.value = null
  } else if (selectionMode.value === 'range') {
    // 日期范围选择模式
    if (startDate.value && !endDate.value) {
      // 如果只选择了开始日期，将结束日期设置为同一天（单日期选择）
      endDate.value = new Date(startDate.value)
    }

    // 更新为开始日期所在的月份
    if (startDate.value) {
      currentYear.value = startDate.value.getFullYear()
      currentMonth.value = startDate.value.getMonth() + 1
    }
  }

  closeCalendar()

  // 重新获取数据
  currentPage.value = 1
  await getOrders(true)
}

// 月份选择相关方法
const selectYear = (year) => {
  selectedYear.value = year
  // 滚动到选中位置
  const yearIndex = yearList.value.indexOf(year)
  yearScrollTop.value = yearIndex * 60 // 每个项目高度约60rpx
}

const selectMonth = (month) => {
  selectedMonth.value = month
  // 滚动到选中位置
  const monthIndex = monthList.value.indexOf(month)
  monthScrollTop.value = monthIndex * 60 // 每个项目高度约60rpx
}

// 月份导航相关方法
const previousMonth = () => {
  if (currentMonth.value === 1) {
    currentMonth.value = 12
    currentYear.value -= 1
  } else {
    currentMonth.value -= 1
  }
}

const nextMonth = () => {
  if (currentMonth.value === 12) {
    currentMonth.value = 1
    currentYear.value += 1
  } else {
    currentMonth.value += 1
  }
}

const showMonthYearPicker = () => {
  // 切换到月份选择模式
  selectionMode.value = 'month'
  // 设置当前年月为选中状态
  selectedYear.value = currentYear.value
  selectedMonth.value = currentMonth.value
}

// 滑动处理方法
const handleTouchStart = (e) => {
  if (!isSwipeEnabled.value) return
  const touch = e.touches[0]
  touchStartY.value = touch.clientY
  touchStartX.value = touch.clientX
}

const handleTouchMove = (e) => {
  // 不处理触摸移动事件，避免性能警告
  // 滑动检测在 touchend 事件中处理
}

const handleTouchEnd = (e) => {
  if (!isSwipeEnabled.value) return
  const touch = e.changedTouches[0]
  const deltaY = touch.clientY - touchStartY.value
  const deltaX = touch.clientX - touchStartX.value

  // 判断是否为垂直滑动（上下滑动）
  if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
    if (deltaY > 0) {
      // 向下滑动，显示上一个月
      previousMonth()
    } else {
      // 向上滑动，显示下一个月
      nextMonth()
    }
  }
}

// 获取订单列表
const getOrders = async (isRefresh = false) => {
  try {
    loading.value = true
    const token = getToken()
    const account = getAccount()

    if (!token) {
      uni.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/login' })
      }, 1500)
      return
    }

    if (!account) {
      // 如果account为空，尝试使用token作为account（临时解决方案）
      const tokenAccount = token || 'default_user'

      // 构建查询参数
      const queryParams = {
        account: tokenAccount,
        page: currentPage.value.toString(),
        limit: pageSize.value.toString()
      }

      // 如果有搜索关键词，添加订单号查询
      if (searchKeyword.value.trim()) {
        queryParams.orderNo = searchKeyword.value.trim()
      }

      // 添加日期范围查询参数
      if (startDate.value && endDate.value) {
        // 日期范围模式
        queryParams.startDate = formatDateForAPI(startDate.value)
        queryParams.endDate = formatDateForAPI(endDate.value)
      } else {
        // 月份模式
        queryParams.year = currentYear.value.toString()
        queryParams.month = currentMonth.value.toString()
      }

      const response = await apiOrderQuery(queryParams)

      if (response.code === 200) {
        // 修复数据结构：从 response.data.records 获取订单列表
        const newOrders = response.data?.records || []

        if (isRefresh) {
          // 刷新时替换数据
          orders.value = newOrders
          currentPage.value = 1
        } else {
          // 加载更多时追加数据
          if (currentPage.value === 1) {
            orders.value = newOrders
          } else {
            orders.value = [...orders.value, ...newOrders]
          }
        }

        // 判断是否还有更多数据 - 使用接口返回的分页信息
        const totalPages = response.data?.pages || 1
        hasMore.value = currentPage.value < totalPages

        // 保存总订单数
        totalOrders.value = response.data?.total || 0
      } else {
        uni.showToast({
          title: response.msg || '获取订单失败',
          icon: 'none'
        })
      }

      loading.value = false
      return
    }

    // 构建查询参数
    const queryParams = {
      account: account,
      page: currentPage.value.toString(),
      limit: pageSize.value.toString()
    }

    // 如果有搜索关键词，添加订单号查询
    if (searchKeyword.value.trim()) {
      queryParams.orderNo = searchKeyword.value.trim()
    }

    // 获取所有数据后在前端过滤，确保数据完整性
    const response = await apiOrderQuery(queryParams)

    if (response.code === 200) {
      // 修复数据结构：从 response.data.records 获取订单列表
      const newOrders = response.data?.records || []

      if (isRefresh) {
        // 刷新时替换数据
        orders.value = newOrders
        currentPage.value = 1
      } else {
        // 加载更多时追加数据
        if (currentPage.value === 1) {
          orders.value = newOrders
        } else {
          orders.value = [...orders.value, ...newOrders]
        }
      }

      // 判断是否还有更多数据 - 使用接口返回的分页信息
      const totalPages = response.data?.pages || 1
      hasMore.value = currentPage.value < totalPages

      // 保存总订单数
      totalOrders.value = response.data?.total || 0
    } else {
      uni.showToast({
        title: response.msg || '获取订单失败',
        icon: 'none'
      })
    }
  } catch (error) {
    uni.showToast({
      title: '网络错误，请重试',
      icon: 'none'
    })
  } finally {
    loading.value = false
  }
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 获取订单状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待支付',
    1: '已支付',
    2: '已取消',
    3: '已完成'
  }
  return statusMap[status] || '未知状态'
}

// 获取订单状态样式类
const getStatusClass = (status) => {
  const classMap = {
    0: 'status-pending',
    1: 'status-paid',
    2: 'status-cancelled',
    3: 'status-completed'
  }
  return classMap[status] || 'status-unknown'
}

// 查看订单详情
const viewOrderDetail = (order) => {
  uni.showModal({
    title: '订单详情',
    content: `订单号：${order.orderNo}\n金额：¥${order.amount}\n状态：${getStatusText(order.status)}\n时间：${formatTime(order.updateTime || order.createTime)}`,
    showCancel: false
  })
}


// 搜索相关方法
const focusSearch = () => {
  isSearching.value = true
}

const handleSearchBlur = () => {
  // 延迟失焦，让用户有时间点击清除按钮
  setTimeout(() => {
    if (!searchKeyword.value.trim()) {
      isSearching.value = false
    }
  }, 200)
}

const handleSearchInput = () => {
  // 搜索输入时的处理
  console.log('搜索关键词:', searchKeyword.value)

  // 如果输入框为空，自动获取所有订单
  if (!searchKeyword.value.trim()) {
    currentPage.value = 1
    getOrders(true)
  }
}

const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
  // 清空搜索后重新获取所有订单
  currentPage.value = 1
  getOrders(true)
}

// 执行搜索
const performSearch = async () => {
  if (!searchKeyword.value.trim()) {
    // 如果搜索框为空，获取所有订单
    uni.showToast({
      title: '请输入订单号',
      icon: 'none'
    })
    return
  }

  // 添加到搜索历史
  addToSearchHistory(searchKeyword.value.trim())

  // 执行搜索
  console.log('执行订单搜索:', searchKeyword.value.trim())
  currentPage.value = 1
  await getOrders(true)
}

// 添加到搜索历史
const addToSearchHistory = (keyword) => {
  if (!keyword || keyword.length < 3) return

  // 移除重复项
  const index = searchHistory.value.indexOf(keyword)
  if (index > -1) {
    searchHistory.value.splice(index, 1)
  }

  // 添加到开头
  searchHistory.value.unshift(keyword)

  // 限制历史记录数量
  if (searchHistory.value.length > 5) {
    searchHistory.value = searchHistory.value.slice(0, 5)
  }

  // 保存到本地存储
  uni.setStorageSync('orderSearchHistory', searchHistory.value)
}

// 从本地存储加载搜索历史
const loadSearchHistory = () => {
  try {
    const history = uni.getStorageSync('orderSearchHistory')
    if (history && Array.isArray(history)) {
      searchHistory.value = history
    }
  } catch (error) {
    console.error('加载搜索历史失败:', error)
  }
}

// 选择搜索建议
const selectSuggestion = (keyword) => {
  searchKeyword.value = keyword
  performSearch()
}

// 加载更多订单
const loadMoreOrders = async () => {
  if (!hasMore.value || loading.value) return

  currentPage.value++
  await getOrders(false)
}

// 页面加载时检查登录状态并获取订单
onMounted(async () => {
  const token = getToken()
  const account = getAccount()

  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1500)
  } else if (!account) {
    uni.showToast({
      title: '用户信息异常，请重新登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1500)
  } else {
    // 加载搜索历史
    loadSearchHistory()
    // 获取订单列表
    await getOrders()
  }
})
</script>

<style scoped>
.orders-container {
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
  padding-top: var(--status-bar-height);
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 30rpx;
}

.nav-left,
.nav-right {
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

.more-icon {
  font-size: 32rpx;
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
  margin-top: calc(40rpx + var(--status-bar-height));
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30rpx;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-radius: 25rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 24rpx;
  color: #333;
  filter: grayscale(100%);
}

.search-text {
  font-size: 28rpx;
  color: #999;
}

.search-input {
  flex: 1;
  font-size: 28rpx;
  color: #333;
  background: transparent;
  border: none;
  outline: none;
}

.clear-icon {
  font-size: 32rpx;
  color: #999;
  margin-left: 10rpx;
  padding: 5rpx;
}

.search-btn {
  padding: 8rpx 20rpx;
  background-color: #007aff;
  color: #fff;
  border: none;
  border-radius: 15rpx;
  font-size: 24rpx;
  margin-left: 10rpx;
}

/* 搜索建议 */
.search-suggestions {
  background-color: #fff;
  border-radius: 15rpx;
  margin-top: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* 月份选择器 */
.month-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-radius: 25rpx;
  margin-top: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.month-selector:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
}

.month-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
}

.dropdown-arrow {
  font-size: 20rpx;
  color: #666;
}

.suggestions-title {
  padding: 20rpx 30rpx 10rpx;
  font-size: 24rpx;
  color: #999;
  border-bottom: 1rpx solid #f0f0f0;
}

.suggestion-item {
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:active {
  background-color: #f5f5f5;
}

.suggestion-text {
  font-size: 28rpx;
  color: #333;
}

/* 订单统计 */
.orders-stats {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.stats-text {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-card {
  background-color: #fff;
  border-radius: 15rpx;
  padding: 30rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.order-card:active {
  transform: scale(0.98);
  box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20rpx;
}

.order-info {
  flex: 1;
}

.order-no {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 8rpx;
}

.order-time {
  font-size: 24rpx;
  color: #999;
}

.order-status {
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
  font-weight: 500;
}

.status-pending {
  background-color: #fff3cd;
  color: #856404;
}

.status-paid {
  background-color: #d4edda;
  color: #155724;
}

.status-cancelled {
  background-color: #f8d7da;
  color: #721c24;
}

.status-completed {
  background-color: #d1ecf1;
  color: #0c5460;
}

.status-unknown {
  background-color: #e2e3e5;
  color: #383d41;
}

.order-content {
  margin-bottom: 20rpx;
}

.order-desc {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-title {
  font-size: 28rpx;
  color: #333;
  flex: 1;
  margin-right: 20rpx;
}

.order-amount {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: 600;
}

/* 加载更多 */
.load-more-section {
  margin-top: 30rpx;
  display: flex;
  justify-content: center;
}

.load-more-btn {
  padding: 20rpx 60rpx;
  background-color: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 25rpx;
  font-size: 28rpx;
}

.load-more-btn:disabled {
  background-color: #e0e0e0;
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

/* 加载状态 */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  background-color: #fff;
  border-radius: 15rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

/* 日历弹出层样式 */
.calendar-modal {
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
  padding: 40rpx;
}

.calendar-content {
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  max-height: 80vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
  /* 优化触摸性能 */
  touch-action: pan-y;
}

/* 日历头部 */
.calendar-header {
  padding: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  font-size: 36rpx;
  color: #333;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.close-btn:active {
  background-color: #e8e8e8;
}

.calendar-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.nav-spacer {
  width: 60rpx;
}

/* 选择模式标签 */
.selection-tabs {
  display: flex;
  margin-bottom: 20rpx;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  position: relative;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60rpx;
  height: 4rpx;
  background-color: #28B389;
  border-radius: 2rpx;
}

.tab-text {
  font-size: 30rpx;
  color: #333;
}

.tab-item.active .tab-text {
  color: #28B389;
  font-weight: 600;
}

/* 当前选择显示 */
.current-selection {
  padding: 20rpx 0;
}

.date-range-display {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.date-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.date-label {
  font-size: 24rpx;
  color: #999;
}

.date-value {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.date-separator {
  font-size: 28rpx;
  color: #666;
  margin: 0 10rpx;
}

/* 日历主体 */
.calendar-body {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
}

/* 月份选择器 */
.month-picker {
  height: 100%;
}

.picker-container {
  display: flex;
  height: 400rpx;
  gap: 20rpx;
}

.year-picker,
.month-picker-list {
  flex: 1;
  border: 1rpx solid #f0f0f0;
  border-radius: 10rpx;
  overflow: hidden;
}

.picker-scroll {
  height: 100%;
}

.picker-item {
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20rpx;
  border-bottom: 1rpx solid #f8f8f8;
  transition: background-color 0.2s ease;
}

.picker-item:last-child {
  border-bottom: none;
}

.picker-item.active {
  background-color: #f0f0f0;
}

.picker-text {
  font-size: 28rpx;
  color: #333;
}

.picker-item.active .picker-text {
  color: #28B389;
  font-weight: 600;
}

/* 时间段选择器 */
.date-range-picker {
  height: 100%;
}

.month-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
  padding: 0 20rpx;
}

.nav-arrow {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
  transition: background-color 0.2s ease;
}

.nav-arrow:active {
  background-color: #e8e8e8;
}

.arrow-icon {
  font-size: 32rpx;
  color: #333;
  font-weight: bold;
}

.month-year {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 10rpx 20rpx;
  border-radius: 25rpx;
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

.month-year:active {
  background-color: #e8e8e8;
}

.month-year-text {
  font-size: 32rpx;
  color: #333;
  font-weight: 600;
}

.month-dropdown {
  font-size: 20rpx;
  color: #666;
}

/* 日历网格 */
.calendar-grid {
  background-color: #fff;
  touch-action: pan-y;
  user-select: none;
}

.weekdays {
  display: flex;
  margin-bottom: 20rpx;
}

.weekday {
  flex: 1;
  text-align: center;
  font-size: 24rpx;
  color: #999;
  padding: 10rpx 0;
}

.days-grid {
  display: flex;
  flex-wrap: wrap;
}

.day-item {
  width: calc(100% / 7);
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
}

.day-item.empty {
  cursor: default;
}

.day-number {
  font-size: 28rpx;
  color: #333;
}

.day-label {
  font-size: 18rpx;
  color: #28B389;
  margin-top: 2rpx;
}

/* 日期状态样式 */
.day-item.normal .day-number {
  color: #333;
}

.day-item.start-date {
  background-color: #28B389;
  border-radius: 50%;
}

.day-item.start-date .day-number {
  color: #fff;
}

.day-item.end-date {
  background-color: #28B389;
  border-radius: 50%;
}

.day-item.end-date .day-number {
  color: #fff;
}

.day-item.in-range {
  background-color: #e8f5e8;
}

.day-item.in-range .day-number {
  color: #28B389;
}

/* 日历底部 */
.calendar-footer {
  display: flex;
  gap: 20rpx;
  padding: 40rpx;
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.btn {
  flex: 1;
  text-align: center;
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 40rpx;
  transition: all 0.2s ease;
}

.cancel-btn {
  background-color: #f5f5f5;
  border: 1rpx solid #ddd;
}

.cancel-btn:active {
  background-color: #e0e0e0;
}

.confirm-btn {
  background-color: #28B389;
  border: none;
}

.confirm-btn:active {
  background-color: #239974;
}

.btn-text {
  font-size: 32rpx;
  font-weight: 600;
}

.cancel-btn .btn-text {
  color: #666;
}

.confirm-btn .btn-text {
  color: #fff;
}
</style>
