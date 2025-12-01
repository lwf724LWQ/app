<template>
  <view class="transaction-container">
    <!-- 导航栏 -->
    <view class="navbar">
      <view class="nav-content">
        <view class="nav-left" @click="goBack">
          <text class="back-arrow">×</text>
        </view>
        <text class="nav-title">账单</text>
        <view class="nav-right">
        </view>
      </view>
    </view>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <!-- 筛选区域 -->
      <view class="filter-section">
        <view class="filter-bar">
          <view class="filter-dropdown" @click="showFilterOptions">
            <text class="filter-text">全部账单</text>
            <text class="dropdown-arrow">▼</text>
          </view>

          <view class="statistics-link" @click="goToStatistics">
            <text class="statistics-text">收支统计</text>
            <text class="chevron">></text>
          </view>
        </view>

        <!-- 月度统计 -->
        <view class="monthly-summary">
          <view class="month-selector" @click="showMonthPicker">
            <text class="month-text">{{ displayedDateText }}</text>
            <text class="dropdown-arrow">▼</text>
          </view>
          <view class="summary-amounts">
            <text class="expense-amount">支出¥{{ monthlyExpense }}</text>
            <text class="income-amount">收入¥{{ monthlyIncome }}</text>
          </view>
        </view>
      </view>

      <!-- 交易记录列表 -->
      <view class="transaction-list">
        <view class="transaction-item" v-for="(item, index) in filteredTransactions" :key="item.id || index">
          <!-- 左侧图标 -->
          <view class="transaction-icon">
            <view class="icon-wrapper" :class="getTypeClass(item.type)">
              <text class="icon-text">{{ getTypeIcon(item.type) }}</text>
            </view>
          </view>

          <!-- 中间内容 -->
          <view class="transaction-content">
            <text class="transaction-title">{{ item.remark || '账单记录' }}</text>
            <text class="transaction-desc">{{ item.account || '账单详情' }}</text>
            <text class="transaction-time">{{ formatTime(item.createTime) }}</text>
          </view>

          <!-- 右侧金额 -->
          <view class="transaction-amount" :class="getTypeClass(item.type)">
            <text class="amount-text">{{ item.type === 0 ? '+' : '-' }}{{ item.amount || 0 }}</text>
            <text class="amount-unit">金币</text>
          </view>
        </view>
      </view>


      <!-- 加载更多 -->
      <view class="load-more" v-if="filteredTransactions.length > 0">
        <text class="load-more-text" v-if="loading">加载中...</text>
        <text class="load-more-text" v-else-if="!hasMore">已显示全部记录</text>
        <text class="load-more-text" v-else @click="loadMore">点击加载更多</text>
      </view>

      <!-- 加载状态 -->
      <view class="loading-state" v-if="loading && transactions.length === 0">
        <text class="loading-text">加载中...</text>
      </view>
    </view>

    <!-- 筛选弹出层 -->
    <view class="filter-modal" v-if="showFilterModal" @click="closeFilterModal">
      <view class="filter-content" @click.stop>
        <!-- 筛选头部 -->
        <view class="filter-header">
          <text class="filter-title">选择筛选项</text>
        </view>

        <!-- 筛选内容 -->
        <view class="filter-body">
          <!-- 收支类型 -->
          <view class="filter-group">
            <text class="filter-group-title">收支类型</text>
            <view class="filter-options">
              <view class="filter-option" :class="{ active: selectedIncomeType === 'all' }"
                @click="selectIncomeType('all')">
                <text class="option-text">全部</text>
              </view>
              <view class="filter-option" :class="{ active: selectedIncomeType === 'expense' }"
                @click="selectIncomeType('expense')">
                <text class="option-text">支出</text>
              </view>
              <view class="filter-option" :class="{ active: selectedIncomeType === 'income' }"
                @click="selectIncomeType('income')">
                <text class="option-text">收入</text>
              </view>
            </view>
          </view>

          <!-- 交易类型 -->
          <view class="filter-group">


          </view>
        </view>

        <!-- 底部按钮 -->
        <view class="filter-footer">
          <view class="btn cancel-btn" @click="closeFilterModal">
            <text class="btn-text">取消</text>
          </view>
          <view class="btn confirm-btn" @click="confirmFilter">
            <text class="btn-text">确定</text>
          </view>
        </view>
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
            <view class="tab-item" :class="{ active: selectionMode === 'all' }" @click="setSelectionMode('all')">
              <text class="tab-text">全部</text>
            </view>
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
          <view v-else-if="selectionMode === 'range'" class="date-range-picker">
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
import { onShow } from '@dcloudio/uni-app'
import { getToken, getAccount } from '@/utils/request.js'
import { apiBillQuery } from '@/api/apis.js'

// 响应式数据
const activeTab = ref('all')
const searchKeyword = ref('')
const isSearching = ref(false)

// 数据加载相关
const loading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const pageSize = ref(20)
const totalRecords = ref(0)
const isLoadingBill = ref(false) // 添加请求锁

// 筛选相关数据
const showFilterModal = ref(false)
const selectedIncomeType = ref('all')
const selectedTransactionType = ref('all')

// 日历相关数据
const date = new Date()

const showCalendar = ref(false)
const selectionMode = ref('all') // 'month' 或 'range'
const currentYear = ref(date.getFullYear())
const currentMonth = ref(date.getMonth() + 1)
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

// 账单记录数据
const transactions = ref([])

// 计算属性 - 根据选中的标签、搜索关键词和日期范围过滤交易记录
const filteredTransactions = computed(() => {
  let result = transactions.value
  // 先按日期范围过滤
  if (selectionMode.value === 'range' && startDate.value && endDate.value) {
    // 日期范围模式 - 只比较日期部分，忽略时间
    result = result.filter(item => {
      const itemTimeStr = item.createTime
      if (!itemTimeStr) return false

      // 解析交易时间，只取日期部分
      const itemDate = new Date(itemTimeStr)
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())

      // 解析选择日期，只取日期部分
      const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate())
      const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate())

      return itemDateOnly.getTime() >= startDateOnly.getTime() &&
        itemDateOnly.getTime() <= endDateOnly.getTime()
    })
  } else if (selectionMode.value === 'month') {
    // 月份模式
    result = result.filter(item => {
      const itemTimeStr = item.createTime
      if (!itemTimeStr) return false

      const itemDate = new Date(itemTimeStr)
      return itemDate.getFullYear() === currentYear.value &&
        itemDate.getMonth() + 1 === currentMonth.value
    })
  }

  // 再按标签过滤
  if (activeTab.value !== 'all') {
    const typeMap = {
      'income': 0,    // 收入
      'expense': 1    // 支出
    }
    result = result.filter(item => item.type === typeMap[activeTab.value])
  }

  // 最后按搜索关键词过滤
  if (searchKeyword.value.trim()) {
    const keyword = searchKeyword.value.trim().toLowerCase()
    result = result.filter(item =>
      (item.remark && item.remark.toLowerCase().includes(keyword)) ||
      (item.account && item.account.toLowerCase().includes(keyword))
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
  if (selectionMode.value === 'all') {
    return '全部'
  }
  else if (selectionMode.value === 'range' && startDate.value && endDate.value) {
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

// 月度收支统计
const monthlyExpense = computed(() => {
  let currentTransactions = []

  if (selectionMode.value === 'range' && startDate.value && endDate.value) {
    // 日期范围模式（包括单日期选择）- 使用精确的日期比较
    currentTransactions = transactions.value.filter(item => {
      const itemTimeStr = item.createTime
      if (!itemTimeStr) return false

      // 解析交易时间，只取日期部分
      const itemDate = new Date(itemTimeStr)
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())

      // 解析选择日期，只取日期部分
      const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate())
      const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate())

      return itemDateOnly.getTime() >= startDateOnly.getTime() &&
        itemDateOnly.getTime() <= endDateOnly.getTime() &&
        item.type === 1  // 支出
    })
  } else if (selectionMode.value === 'month') {
    // 月份模式
    currentTransactions = transactions.value.filter(item => {
      const itemTimeStr = item.createTime
      if (!itemTimeStr) return false

      const itemDate = new Date(itemTimeStr)
      return itemDate.getFullYear() === currentYear.value &&
        itemDate.getMonth() + 1 === currentMonth.value &&
        item.type === 1  // 支出
    })
  } else {
    currentTransactions = transactions.value
  }

  const total = currentTransactions.reduce((sum, item) => sum + (item.amount || 0), 0)
  return total.toFixed(2)
})

const monthlyIncome = computed(() => {
  let currentTransactions = []

  if (startDate.value && endDate.value) {
    // 日期范围模式（包括单日期选择）- 使用精确的日期比较
    currentTransactions = transactions.value.filter(item => {
      const itemTimeStr = item.createTime
      if (!itemTimeStr) return false

      // 解析交易时间，只取日期部分
      const itemDate = new Date(itemTimeStr)
      const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate())

      // 解析选择日期，只取日期部分
      const startDateOnly = new Date(startDate.value.getFullYear(), startDate.value.getMonth(), startDate.value.getDate())
      const endDateOnly = new Date(endDate.value.getFullYear(), endDate.value.getMonth(), endDate.value.getDate())

      return itemDateOnly.getTime() >= startDateOnly.getTime() &&
        itemDateOnly.getTime() <= endDateOnly.getTime() &&
        item.type === 0  // 收入
    })
  } else {
    // 月份模式
    currentTransactions = transactions.value.filter(item => {
      const itemTimeStr = item.createTime
      if (!itemTimeStr) return false

      const itemDate = new Date(itemTimeStr)
      return itemDate.getFullYear() === currentYear.value &&
        itemDate.getMonth() + 1 === currentMonth.value &&
        item.type === 0  // 收入
    })
  }

  const total = currentTransactions.reduce((sum, item) => sum + (item.amount || 0), 0)
  return total.toFixed(2)
})

// 方法
const goBack = () => {
  uni.navigateBack()
}

const switchTab = (tab) => {
  activeTab.value = tab
}

const showFilterOptions = () => {
  showFilterModal.value = true
}

const goToStatistics = () => {
  // 跳转到统计页面
  console.log('跳转到统计页面')
}

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
  // 搜索输入时的处理，可以在这里添加防抖逻辑
  console.log('搜索关键词:', searchKeyword.value)
}

const clearSearch = () => {
  searchKeyword.value = ''
  isSearching.value = false
}

// 筛选相关方法
const closeFilterModal = () => {
  showFilterModal.value = false
}

const selectIncomeType = (type) => {
  selectedIncomeType.value = type
}

const selectTransactionType = (type) => {
  selectedTransactionType.value = type
}

const confirmFilter = () => {
  // 应用筛选条件
  activeTab.value = selectedIncomeType.value
  closeFilterModal()

  // 重新获取数据
  currentPage.value = 1
  getBillData(true)
}

// 日历相关方法
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

const formatDateRange = () => {
  if (!startDate.value) return ''
  if (!endDate.value) {
    return formatDate(startDate.value)
  }
  return `${formatDate(startDate.value)} 至 ${formatDate(endDate.value)}`
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
  await getBillData(true)
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

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${month}-${day} ${hours}:${minutes}`
}

// 获取类型样式类
const getTypeClass = (type) => {
  // type: 0=收入, 1=支出
  return type === 0 ? 'recharge' : 'consume'
}

// 获取类型图标
const getTypeIcon = (type) => {
  // type: 0=收入, 1=支出
  return type === 0 ? '💰' : '💸'
}

// 格式化日期为API需要的格式
const formatDateForAPI = (date) => {
  if (!date) return ''
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}


// Token验证函数
const validateToken = () => {
  const token = getToken()
  const account = getAccount()

  // 检查token是否存在且有效
  if (!token || token.trim() === '') {
    return { isValid: false, reason: 'token_missing' }
  }

  // 检查token格式（JWT通常包含点号）
  if (!token.includes('.')) {
    return { isValid: false, reason: 'token_format_invalid' }
  }

  // 检查token长度（JWT通常比较长）
  if (token.length < 50) {
    return { isValid: false, reason: 'token_too_short' }
  }

  return { isValid: true, token, account }
}

// 获取账单数据
const getBillData = async (isRefresh = false) => {
  // 防止重复请求
  if (isLoadingBill.value) {
    console.log('正在加载账单数据，跳过重复请求')
    return
  }

  try {
    isLoadingBill.value = true
    loading.value = true

    // 验证token
    const tokenValidation = validateToken()
    if (!tokenValidation.isValid) {
      let errorMessage = '请先登录'
      if (tokenValidation.reason === 'token_format_invalid') {
        errorMessage = '登录状态异常，请重新登录'
      } else if (tokenValidation.reason === 'token_too_short') {
        errorMessage = '登录信息不完整，请重新登录'
      }

      uni.showToast({
        title: errorMessage,
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateTo({ url: '/pages/login/login' })
      }, 1500)
      return
    }

    const { token, account } = tokenValidation

    // 构建查询参数 - 完全按照订单查询的成功模式
    const queryParams = {
      account: account || token, // 使用account，如果为空则使用token
      page: currentPage.value.toString(),
      limit: pageSize.value.toString()
    }

    // 获取所有数据后在前端过滤，确保数据完整性
    const response = await apiBillQuery(queryParams)

    if (response.code === 200) {
      const newBills = response.data?.records || []

      if (isRefresh) {
        transactions.value = newBills
        currentPage.value = 1
      } else {
        if (currentPage.value === 1) {
          transactions.value = newBills
        } else {
          transactions.value = [...transactions.value, ...newBills]
        }
      }

      const totalPages = response.data?.pages || 1
      hasMore.value = currentPage.value < totalPages
      totalRecords.value = response.data?.total || 0

      if (newBills.length === 0 && currentPage.value === 1) {
        uni.showToast({
          title: '暂无账单数据',
          icon: 'none',
          duration: 2000
        })
      }
    } else {
      uni.showToast({
        title: response.msg || '获取账单失败',
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
    isLoadingBill.value = false
  }
}

// 加载模拟数据
const loadMockData = () => {

  // 模拟账单数据 - 根据API文档结构
  const mockBills = [
    {
      id: "1979093961854242817",
      account: "13637666646",
      type: 0, // 0:收入
      amount: 0.01,
      gold: 0.01,
      remark: "充值",
      createTime: "2025-10-17 15:55:45"
    },
    {
      id: "1979098793428209665",
      account: "13637666646",
      type: 1, // 1:支出
      amount: 10,
      gold: 10,
      remark: "梦境解析",
      createTime: "2025-10-17 10:15:30"
    },
    {
      id: "1979093961854242818",
      account: "13637666646",
      type: 0, // 0:收入
      amount: 100,
      gold: 100,
      remark: "支付宝充值",
      createTime: "2025-10-16 16:45:12"
    },
    {
      id: "1979093961854242819",
      account: "13637666646",
      type: 1, // 1:支出
      amount: 30,
      gold: 30,
      remark: "VIP服务",
      createTime: "2025-10-16 09:20:45"
    }
  ]

  // 设置模拟数据
  transactions.value = mockBills
  hasMore.value = false
  totalRecords.value = mockBills.length

  uni.showToast({
    title: '已加载模拟数据',
    icon: 'success',
    duration: 2000
  })
}

// 加载更多数据
const loadMore = () => {
  if (!loading.value && hasMore.value) {
    currentPage.value++
    getBillData(false)
  }
}

// 页面加载时检查登录状态并获取账单
// 检查登录状态
const checkLoginStatus = () => {
  const tokenValidation = validateToken()
  return tokenValidation.isValid
}

onMounted(async () => {
  if (checkLoginStatus()) {
    await getBillData(true)
  } else {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    })
    setTimeout(() => {
      uni.navigateTo({ url: '/pages/login/login' })
    }, 1500)
  }
})

// 页面显示时检查登录状态（从其他页面返回时）
onShow(async () => {
  if (checkLoginStatus()) {
    if (transactions.value.length === 0 && !loading.value) {
      await getBillData(true)
    }
  } else {
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

/* 筛选区域 */
.filter-section {
  background-color: #fff;
  padding: 30rpx;
  border-radius: 15rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.filter-dropdown {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 25rpx;
  flex: 1;
}

.filter-text {
  font-size: 28rpx;
  color: #333;
}

.dropdown-arrow {
  font-size: 20rpx;
  color: #666;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 10rpx;
  padding: 15rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 25rpx;
  flex: 1;
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

.statistics-link {
  display: flex;
  align-items: center;
  gap: 5rpx;
}

.statistics-text {
  font-size: 28rpx;
  color: #333;
}

.chevron {
  font-size: 24rpx;
  color: #666;
}

/* 月度统计 */
.monthly-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
  border-top: 1rpx solid #f0f0f0;
  flex-wrap: wrap;
  gap: 20rpx;
}

.month-selector {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.month-text {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  white-space: nowrap;
}

.summary-amounts {
  display: flex;
  gap: 30rpx;
}

.expense-amount {
  font-size: 28rpx;
  color: #ff4757;
}

.income-amount {
  font-size: 28rpx;
  color: #52c41a;
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

.clear-search-btn {
  margin-top: 30rpx;
  padding: 15rpx 30rpx;
  background-color: #ff4757;
  border-radius: 25rpx;
}

.clear-search-text {
  font-size: 28rpx;
  color: #fff;
}

.retry-btn {
  margin-top: 30rpx;
  padding: 15rpx 30rpx;
  background-color: #007aff;
  border-radius: 25rpx;
}

.retry-text {
  font-size: 28rpx;
  color: #fff;
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

/* 筛选弹出层样式 */
.filter-modal {
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

.filter-content {
  width: 100%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
}

.filter-header {
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  text-align: center;
}

.filter-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.filter-body {
  flex: 1;
  padding: 30rpx;
  overflow-y: auto;
}

.filter-group {
  margin-bottom: 40rpx;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-group-title {
  font-size: 30rpx;
  color: #333;
  font-weight: 500;
  margin-bottom: 20rpx;
  display: block;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.transaction-types {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15rpx;
}

.filter-option {
  padding: 15rpx 25rpx;
  background-color: #f5f5f5;
  border-radius: 25rpx;
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-option.active {
  background-color: #e8f5e8;
}

.filter-option.active .option-text {
  color: #28B389;
  font-weight: 600;
}

.option-text {
  font-size: 28rpx;
  color: #333;
}

.filter-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
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
