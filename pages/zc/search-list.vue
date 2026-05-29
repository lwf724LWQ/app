<template>
  <myPage pageTitle="搜索结果">
    <view class="search-list-container">
      <!-- 搜索框 -->
      <view class="search-box-wrapper">
        <search-input
          ref="searchInputRef"
          placeholder="请输入搜索内容"
          @search="onSearch"
        />
      </view>

      <!-- 搜索结果列表 -->
      <scroll-view
        class="match-list-scroll"
        :scroll-y="true"
        :show-scrollbar="false"
        @scrolltolower="loadMore"
      >
        <view v-if="matchList.length === 0 && !isLoading" class="empty-tip">
          <text>暂无搜索结果</text>
        </view>

        <view
          v-for="match in matchList"
          :key="match.id"
        >
          <MatchScoreCard
            :leagueName="match.abbName"
            :matchTime="match.mtime"
            :matchStatus="match.numStr"
            :homeTeam="match.htname"
            :awayTeam="match.atname"
            :score="match.score"
            :matchId="match.matchId"
          />
        </view>

        <view v-if="isLoading" class="loading-tip">
          <text>加载中...</text>
        </view>

        <view v-if="!hasMore && matchList.length > 0" class="no-more-tip">
          <text>没有更多数据了</text>
        </view>
      </scroll-view>
    </view>
  </myPage>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import myPage from '@/components/myPage.vue'
import searchInput from './components/search-input.vue'
import MatchScoreCard from './components/MatchScoreCard.vue'
import { getFootBallList } from '@/api/apis.js'

// 搜索参数
const searchKeyword = ref('')
const searchStatus = ref('')
const searchDate = ref('')

// 列表数据
const matchList = ref([])
const isLoading = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const searchInputRef = ref(null)

onLoad((options) => {
  if (options.keyword) {
    searchKeyword.value = options.keyword
  }
  if (options.status !== undefined && options.status !== '') {
    searchStatus.value = options.status
  }
  if (options.date) {
    searchDate.value = options.date
  }
  fetchMatchList()
})

// 获取比赛列表
async function fetchMatchList() {
  if (isLoading.value) return
  isLoading.value = true

  try {
    const res = await getFootBallList(searchDate.value)
    let list = res.data || res || []

    // 按关键词过滤（球队名称）
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      list = list.filter(
        (item) =>
          (item.htname && item.htname.toLowerCase().includes(kw)) ||
          (item.atname && item.atname.toLowerCase().includes(kw)) ||
          (item.abbName && item.abbName.toLowerCase().includes(kw))
      )
    }

    // 按状态过滤
    if (searchStatus.value !== '' && searchStatus.value !== undefined) {
      const statusVal = Number(searchStatus.value)
      list = list.filter((item) => {
        // item.numStr 是状态文本，item.num 是状态值
        return item.num === statusVal || item.numStr === searchStatus.value
      })
    }

    matchList.value = list
    hasMore.value = false // 单天数据一次性返回
  } catch (e) {
    console.error('获取比赛列表失败', e)
    matchList.value = []
  } finally {
    isLoading.value = false
  }
}

// 搜索事件（页内重新搜索）
function onSearch(params) {
  searchKeyword.value = params.keyword
  searchStatus.value = params.status
  searchDate.value = params.date
  currentPage.value = 1
  matchList.value = []
  fetchMatchList()
}

// 加载更多
function loadMore() {
  if (!hasMore.value || isLoading.value) return
  // getFootBallList 是按日期返回全天数据的，不做分页
}
</script>

<style lang="scss" scoped>
.search-list-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-box-wrapper {
  padding: 20rpx 24rpx;
  background-color: #fff;
}

.match-list-scroll {
  flex: 1;
  padding: 0 24rpx;
}

.empty-tip {
  display: flex;
  justify-content: center;
  padding: 120rpx 0;
  font-size: 28rpx;
  color: #999;
}

.loading-tip {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #999;
}

.no-more-tip {
  display: flex;
  justify-content: center;
  padding: 40rpx 0;
  font-size: 26rpx;
  color: #ccc;
}
</style>