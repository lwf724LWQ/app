<template>
  <!-- 关注列表 -->
  <scroll-view
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="true"
    :refresher-triggered="refresher"
    :lower-threshold="150"
    :scroll-top="scrollTop"
    @refresherrefresh="refreshVideoList"
    @scrolltolower="loadMore"
    @scroll="scroll"
  >
    <view v-if="matchInfoList.length === 0 && !isLoading">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <view class="area">
      <view v-for="(match, index) in matchInfoList" :key="index" class="day-group">
        <MatchScoreCard
          :match="match"
        />
      </view>
    </view>
    <view v-if="matchInfoList.length > 0" class="load-more-status">
      <view v-if="isLoading" class="loading-more">加载中...</view>
      <view v-else-if="!hasMore" class="no-more">— 没有更多了 —</view>
    </view>
  </scroll-view>

  <!-- 进球/红黄牌底部弹窗通知 -->
  <MatchEventNotification ref="eventNotificationRef" />
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { forllowFootballList } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import MatchEventNotification from "@/components/MatchEventNotification.vue";

const eventNotificationRef = ref(null);

// 接收的props
const props = defineProps({
  limit: {
    type: Number,
    default: 20,
  },
  isActiveTab: {
    type: Boolean,
    default: false,
  },
});

// 定义事件
const emit = defineEmits(["video-click"]);

// 响应式数据
const matchInfoList = ref([]);
const isLoading = ref(false);
const hasMore = ref(true);
const currentPage = ref(1);
const isNeedRefresh = ref(false);
const refresher = ref(false)

// 刷新视频列表
const refreshVideoList = async (e) => {
  currentPage.value = 1;
  hasMore.value = true;
  await fetchVideoList();
};

// 加载更多
const loadMore = async () => {
  if (isLoading.value || !hasMore.value) return;
  currentPage.value += 1;
  await fetchVideoList();
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
// 获取列表数据
const fetchVideoList = async (isShowRefresh = true) => {
  try {
    if (isLoading.value) return;
    isLoading.value = true;
    refresher.value = isShowRefresh
    const form = {
      page: currentPage.value,
      limit: props.limit
    };

    const res = await forllowFootballList(form);

    if (res.code === 200 && res.data && Array.isArray(res.data.list)) {
      const list = res.data.list.map(item => ({...item, flag: true}));
      if (currentPage.value == 1) {
        matchInfoList.value = [...list]
      }else{
        matchInfoList.value = [...matchInfoList.value, ...list];
      }
      eventNotificationRef.value?.onDataUpdate(list);
      userStore.setFollowCount(res.data.total)
      if (list.length < props.limit) {
        hasMore.value = false;
      }
    } else {
      console.warn("API 返回数据格式不符合预期:", res);
      if (isRefresh) {
        uni.showToast({
          title: res.msg || "数据格式错误",
          icon: "none",
        });
      }
    }
  } catch (error) {
    console.error("获取关注列表失败:", error);
      uni.showToast({
        title: "获取关注列表失败，请检查网络",
        icon: "none",
      });
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 300);
    uni.stopPullDownRefresh();
    refresher.value = false
  }
};

// 播放视频方法 - 新增付费检查
const userStore = useUserStore();
const playVideo = async (video) => {
  const token = getToken();

  if (userStore.videoCount <= 0 && !token && video.flag) {
    uni.showModal({
      title: "提示",
      content: "付费视频观看次数已用完，需要注册才能继续观看",
      success: async (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: "/pages/reg/reg" + "?redirect=/pages/video/video" });
        }
      },
      showCancel: true,
    });
    return;
  }

  recodeVideoId(video);

  videoStore.setCurrentVideo(video);
  uni.navigateTo({
    url: `/pages/video/play?id=${video.id}`,
  });
};

function recodeVideoId(video) {
  try {
    const r = uni.getStorageSync("videoClickList") || [];
    r.push(video.id);
    video.isClicked = true;
    uni.setStorageSync("videoClickList", r);
  } catch (error) {}
}
function videoMenu(video) {
  if (video.account == getAccount()) {
    uni.showActionSheet({
      itemList: ["删除"],
      success: async (res) => {
        if (res.tapIndex === 0) {
          uni.showLoading({
            title: "正在处理...",
          });
          await delVideo(video.id)
            .then((res) => {
              uni.showToast({
                title: "删除成功",
                icon: "success",
              });

              videoList.value = videoList.value.filter((item) => item.id !== video.id);
            })
            .catch((res) => {
              uni.showToast({
                title: "删除失败",
                icon: "error",
              });
            });
          uni.hideLoading();
        }
      },
    });
  }
}

// 监听类型变化，重新获取数据
watch(
  () => props.videoType,
  (newType) => {
    refreshVideoList();
  },
  { immediate: true }
);

// ========== 定时刷新：仅在当前 tab 激活时轮询 ==========
let refreshTimer = null;

function startPolling() {
  stopPolling();
  refreshTimer = setInterval(() => {
    if (props.isActiveTab) {
      currentPage.value = 1;
      hasMore.value = true;
      fetchVideoList(true); 
    }
  }, 5000);
}

function stopPolling() {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
}

// ========== 定时刷新结束 ==========

onMounted(() => {
  startPolling()
});

onBeforeUnmount(() => {
  stopPolling();
  eventNotificationRef.value?.destroy();
});

function onshow() {
  if (isNeedRefresh.value) {
    refreshVideoList();
    isNeedRefresh.value = false;
  }
}

defineExpose({
  refreshVideoList,
  onshow,
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
</style>