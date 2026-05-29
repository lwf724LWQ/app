<template>
  <!-- 结果列表 -->
  <scroll-view
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="false"
    :refresher-triggered="isLoading"
    :scroll-top="scrollTop"
    @scroll="scroll"
  >
    <!-- 近期选项 -->
    <view class="recent-options">
      <view
        class="recent-option"
        v-for="option in recentOptions"
        :key="option.date"
        :class="{ active: option.time === currentPageDate }"
        @click="fetchVideoList(option.time)"
      >
        <text class="recent-option-text">{{ option.date }}</text>
        <text class="recent-option-text">{{ option.weekday }}</text>
      </view>
    </view>
    <view v-if="matchInfoList.length === 0">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <view class="area">
      <view class="day-group">
        <!-- <view class="day-header">
          <text class="day-title">
            {{ matchDay.weekday }} {{ formatDate(matchDay.businessDate) }}
          </text>
          <text class="day-count">{{ matchDay.matchCount }}场</text>
        </view> -->
        <MatchScoreCard
          v-for="match in matchInfoList"
          :key="match.id"
          :match="match"
          :homeTeam="match.htname"
          :awayTeam="match.atname"
          :matchTime="match.mtime"
          :leagueName="match.abbName"
          :matchStatus="match.numStr"
          :score="match.scorecurrent"
          :halfTimeScore="match.halfTimecurrent"
        />
      </view>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { getFootBallList } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import MatchScoreCard from "../components/MatchScoreCard.vue";
// 接收的props
const props = defineProps({
  limit: {
    type: Number,
    default: 10,
  },
});

// 定义事件
const emit = defineEmits(["video-click"]);

// 响应式数据
const matchInfoList = ref([]);
const isLoading = ref(false);

const currentPageDate = ref("");

const recentOptions = ref([]); // 近期选项

function initRecentOptions() {
  const nowDate = dayjs().add(-1, "day");
  for (let i = 0; i < 6; i++) {
    const date = nowDate.add(-i, "day");
    recentOptions.value.unshift({
      time: date.format("YYYY/M/DD"),
      date: date.format("MM-DD"),
      weekday: date.format("dddd"),
    });
  }
  currentPageDate.value = nowDate.format("YYYY/M/DD");
}

// 刷新视频列表
const refreshVideoList = async () => {
  await fetchVideoList(currentPageDate.value);
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
const fetchVideoList = async (dateStr) => {
  try {
    if (isLoading.value) return;
    isLoading.value = true;
    currentPageDate.value = dateStr;
    uni.showLoading({
      title: "加载中...",
    });
    const Videoinfo = await getFootBallList(dateStr, 2, "");

    if (Videoinfo.code === 200 && Videoinfo.data && Array.isArray(Videoinfo.data)) {
      Videoinfo.data = Videoinfo.data.map((item) => {
        try {
          const mresult = JSON.parse(item.mresult);
          item.scorecurrent = mresult.scorecurrent;
          item.halfTimecurrent = mresult.halfTimecurrent;
          item.totalGoalscurrent = mresult.totalGoalscurrent;
          item.winDrawLosecurrent = mresult.winDrawLosecurrent;
        } catch (error) {
          console.error("解析 mresult 失败:", error);
        }
        return {
          ...item,
        };
      });

      matchInfoList.value = Videoinfo.data;
    } else {
      console.warn("API 返回数据格式不符合预期:", Videoinfo);
      uni.showToast({
        title: Videoinfo.msg || "数据格式错误",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("获取足球列表失败:", error);
    uni.showToast({
      title: error.msg || "获取足球列表失败，请检查网络",
      icon: "none",
    });
  } finally {
    uni.hideLoading();

    setTimeout(() => {
      isLoading.value = false;
    }, 300);

    // 停止下拉刷新
    uni.stopPullDownRefresh();
  }
};

function refresh() {
  initRecentOptions();
  fetchVideoList(currentPageDate.value);
}

// 组件挂载时加载数据
onMounted(() => {
  refresh();
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
</style>
