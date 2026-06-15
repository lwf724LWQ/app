<template>
  <!-- 结果列表 -->
  <CustomVirtualList
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="true"
    :refresher-triggered="isLoading"
    :scroll-top="scrollTop"
    @refresherrefresh="refresh"
    @scroll="scroll"
    :data="matchListSorting"
    :item-height="itemHeight"
    :expanded-index="expandedMatchIndex"
    :extra-height="extraHeight"
  >
    <template #top>
      <!-- 近期选项 -->
      <view class="recent-options">
        <view
          class="recent-option"
          v-for="option in recentOptions"
          :key="option.date"
          :class="{ active: option.time === currentPageDate }"
          @click="fetchVideoList(option.time)"
        >
          <view class="recent-option-text">{{ option.date }}</view>
          <view class="recent-option-text">{{ option.weekday }}</view>
        </view>
      </view>
      <view v-if="matchListSorting.length === 0">
        <view class="no-data-container">
          <view class="no-data-text">暂无数据</view>
        </view>
      </view>
    </template>
    
    <template v-slot="{item, index}">
      <MatchScoreCard
          :key="item.id"
          :match="item"
          :expanded="expandedMatchIndex === index"
          @toggle-expand="handleToggleExpand"
          @height-change="handleHeightChange"
        />
    </template>

    <template #bottom>
      <view class="no-data-container">
        <view class="no-data-text">没有更多数据了</view>
      </view>
    </template>
  </CustomVirtualList>
</template>

<script setup>
import { ref, onMounted, watch, nextTick, computed } from "vue";
import { getFootBallList } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import { useMatchList, filterItem } from "../matchListHooks.js";
import CustomVirtualList from '@/components/custom-virtual-list/list.vue';

// 接收的props
const props = defineProps({
  limit: {
    type: Number,
    default: 10,
  },
  isActiveTab: {
    type: Boolean,
    default: false
  },
  searchParams: {
    type: Object,
    default: {
      keyword: "",
      leagueList: []
    }
  }
});

const itemHeight = ref(uni.upx2px(160))

// 定义事件
const emit = defineEmits(["video-click"]);

// 响应式数据
const matchInfoList = ref([]);
const isLoading = ref(false);

const currentPageDate = ref("");

const recentOptions = ref([]); // 近期选项

const matchListSorting = computed(() => {
  return matchInfoList.value.filter(filterItem(props.searchParams)).sort((a,b) => b.flag - a.flag)
})

const matchListHooks = useMatchList()
watch([() => props.isActiveTab, matchInfoList], newval => {
  if(props.isActiveTab){
    matchListHooks.setMatchList(matchInfoList.value)
  }
})

// 展开状态管理
const expandedMatchId = ref(null);
const expandedMatchIndex = ref(-1);
const extraHeight = ref(0);

// 处理展开/收起切换
function handleToggleExpand(matchId) {
  if (expandedMatchId.value === matchId) {
    expandedMatchId.value = null;
    expandedMatchIndex.value = -1;
    extraHeight.value = 0;
    return;
  }
  expandedMatchId.value = matchId;
  const idx = matchListSorting.value.findIndex(m => (m.matchId || m.id) === matchId);
  expandedMatchIndex.value = idx >= 0 ? idx : -1;
  extraHeight.value = 0;
}

// 处理高度变化
function handleHeightChange({ matchId, extraHeight: h }) {
  if (matchId === expandedMatchId.value) {
    extraHeight.value = h;
  }
}

// 提供关闭方法
function closeExpanded() {
  expandedMatchId.value = null;
  expandedMatchIndex.value = -1;
  extraHeight.value = 0;
}

function initRecentOptions() {
  recentOptions.value = []
  const nowDate = dayjs();
  for (let i = 0; i < 6; i++) {
    const date = nowDate.add(-i, "day");
    recentOptions.value.unshift({
      time: date.format("YYYY/M/D"),
      date: date.format("M-D"),
      weekday: date.format("dddd"),
    });
  }
  if (!recentOptions.value.map(item => item.time).includes(currentPageDate.value)) {
    currentPageDate.value = nowDate.format("YYYY/M/D");
  }
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
    const Videoinfo = await getFootBallList(dateStr, 2, "", getAccount());
    
    if (Videoinfo.code === 200 && Videoinfo.data && Array.isArray(Videoinfo.data)) {
      matchInfoList.value = Videoinfo.data;
      // 数据更新后，如果之前有展开的matchId，重新查找index
      if (expandedMatchId.value) {
        const idx = matchInfoList.value.findIndex(m => (m.matchId || m.id) === expandedMatchId.value);
        if (idx >= 0) {
          expandedMatchIndex.value = idx;
        } else {
          closeExpanded();
        }
      }
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
  closeExpanded,
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