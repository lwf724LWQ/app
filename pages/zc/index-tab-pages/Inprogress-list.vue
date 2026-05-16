<template>
  <!-- 赛程列表 -->
  <scroll-view
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="true"
    :refresher-triggered="isLoading && currentPage == 1"
    :lower-threshold="150"
    :scroll-top="scrollTop"
    @refresherrefresh="refreshVideoList"
    @scrolltolower="loadMore"
    @scroll="scroll"
  >
    <!-- 近期选项 -->
    <view class="recent-options">
      <view
        class="recent-option"
        v-for="option in recentOptions"
        :key="option.date"
        :class="{ active: option.time === currentPageDate }"
        @click="fetchVideoListByDate(option.time)"
      >
        <text class="recent-option-text">{{ option.date }}</text>
        <text class="recent-option-text">{{ option.weekday }}</text>
      </view>
    </view>

    <view v-if="filteredFootBallList.length === 0">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <view class="area">
      <view v-for="(matchDay, index) in filteredFootBallList" :key="index" class="day-group">
        <MatchScoreCard
          v-for="match in matchDay.subMatchList"
          :key="match.id"
          :match="match"
          :homeTeam="match.htname"
          :awayTeam="match.atname"
          :matchTime="match.mtime"
          :leagueName="match.abbName"
          :matchStatus="match.numStr"
        />
      </view>
    </view>

    <!-- 没有更多数据提示 -->
    <view class="no-more">
      <text>没有更多数据了</text>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { getFootBallNewList } from "@/api/apis";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import dayjs from "dayjs";

// 定义事件
const emit = defineEmits(["video-click"]);

// 响应式数据
const footBallList = ref([]);
const filteredFootBallList = ref([]); // 过滤后的比赛列表
const currentPage = ref(1);
const hasMore = ref(false);
const isLoading = ref(false);
const currentPageDate = ref(""); // 当前选中的日期
const recentOptions = ref([]); // 近期选项

// 初始化近期选项 - 根据接口返回的数据生成
function initRecentOptions() {
  if (footBallList.value.length === 0) {
    recentOptions.value = [];
    return;
  }

  // 从接口数据中提取所有唯一的日期
  const uniqueDates = [...new Set(footBallList.value.map((item) => item.businessDate))];

  // 按日期排序
  uniqueDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  // 构建近期选项
  recentOptions.value = uniqueDates.map((date) => ({
    time: date,
    date: formatDate(new Date(date)),
    weekday: dayjs(date).format("dddd"),
  }));

  // 默认选中第一个日期（最早的日期）
  if (recentOptions.value.length > 0) {
    currentPageDate.value = recentOptions.value[0].time;
  }
}

// 刷新视频列表
const refreshVideoList = async () => {
  await fetchVideoList(1);
};

// 加载更多
const loadMore = async () => {
  if (!hasMore.value || isLoading.value) return;
  currentPage.value++;
  await fetchVideoList(currentPage.value);
};

// 根据日期获取比赛列表
const fetchVideoListByDate = async (dateStr) => {
  currentPageDate.value = dateStr;
  filterMatchesByDate(dateStr);
};

// 按日期过滤比赛
const filterMatchesByDate = (dateStr) => {
  if (!dateStr || footBallList.value.length === 0) {
    filteredFootBallList.value = [];
    return;
  }

  filteredFootBallList.value = footBallList.value.filter((matchDay) => {
    return matchDay.businessDate === dateStr;
  });
};

const formatDate = (date) => {
  const d = new Date(date);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
};

const oldScrollTop = ref(0);
function scroll(e) {
  oldScrollTop.value = e.detail.scrollTop;
}
const scrollTop = ref(0);
// 获取视频列表的函数
const fetchVideoList = async (page = 1) => {
  try {
    if (isLoading.value) return;
    isLoading.value = true;
    if (page == 1) {
      scrollTop.value = oldScrollTop.value;
      nextTick(() => {
        scrollTop.value = 0;
      });
    }

    currentPage.value = page;
    const res = await getFootBallNewList();

    if (res.code === 200 && res.data && Array.isArray(res.data)) {
      const newArr = [];
      console.log(1);
      res.data.forEach((match) => {
        const mL = newArr.find((item) => item.businessDate === match.fdate);
        match.isNew = true;
        if (mL) {
          mL.subMatchList.push(match);
          mL.matchCount++;
          return;
        } else {
          newArr.push({
            businessDate: match.fdate,
            weekday: dayjs(match.fdate).format("dddd"),
            matchCount: 1,
            subMatchList: [match],
          });
        }
      });
      console.log(2);
      footBallList.value = newArr.sort(
        (a, b) => new Date(a.businessDate).getTime() - new Date(b.businessDate).getTime()
      );

      // 初始化近期选项并设置默认选中日期
      if (page === 1) {
        initRecentOptions();
        // 默认显示第一个日期的比赛
        if (recentOptions.value.length > 0) {
          filterMatchesByDate(recentOptions.value[0].time);
        }
      }
    } else {
      console.warn("API 返回数据格式不符合预期:", res);
      uni.showToast({
        title: res.msg || "数据格式错误",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("获取视频失败:", error);
    uni.showToast({
      title: error.msg || "获取视频失败，请检查网络",
      icon: "none",
    });
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 300);

    // 停止下拉刷新
    uni.stopPullDownRefresh();
  }
};

// 组件挂载时加载数据
onMounted(() => {
  refreshVideoList();
});

// 暴露 refreshVideoList 函数给父组件
defineExpose({
  refreshVideoList,
});
</script>

<style lang="scss" scoped>
.area {
  padding: 10rpx;
  display: grid;
  grid-template-columns: 1fr;
  /* 两列等宽 */
  gap: 10rpx;
  /* 间距 */
  .title {
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin-bottom: 10rpx;
    box-sizing: border-box;
  }
}

.video-image {
  width: 100%;
  height: 200rpx;
}

.video-title {
  padding: 10rpx 20rpx 5rpx 20rpx;
  flex: 1;
  font-size: 32rpx;
  font-weight: bold;
}

.video-clicked {
  .video-title {
    color: #192afe;
  }
}

.video-info {
  padding: 5rpx 20rpx;
  > text {
    padding: 5rpx 10rpx;
    border-radius: 6rpx;
    font-size: 26rpx;
  }

  .video-price {
    background-color: #e74c3c;
    color: #fff;
  }

  .video-free {
    background-color: #2ecc71;
    color: #fff;
  }
}

.scroll-view {
  height: 100%;
}

.no-data-container {
  .no-data-text {
    text-align: center;
    font-size: 32rpx;
    color: #666;
    margin-top: 50rpx;
  }
}

.loading-more,
.no-more {
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 28rpx;
  padding-bottom: 150rpx;
}

.day-header {
  position: sticky;
  top: 0;
  z-index: 1;

  background-color: #fff;

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  margin-bottom: 16rpx;
}

.day-title {
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.day-count {
  font-size: 24rpx;
  color: #999;
}

.recent-options {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10rpx;

  position: sticky;
  top: 0;
  z-index: 1;

  padding: 10rpx 0;

  background-color: #fff;

  border-bottom: 1rpx solid #eaeaea;

  .recent-option {
    padding: 10rpx;
    border-radius: 6rpx;
    background-color: #f5f5f5;
    color: #111;
    font-size: 28rpx;
    text-align: center;

    &.active {
      background-color: hsl(92, 100%, 84%);
    }
  }
}
</style>
