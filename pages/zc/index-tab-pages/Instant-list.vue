<template>
  <!-- 即时列表 -->
  <scroll-view
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="true"
    :refresher-triggered="refresher"
    :lower-threshold="150"
    :scroll-top="scrollTop"
    @refresherrefresh="fetchVideoList"
    @scrolltolower="loadMore"
    @scroll="scroll"
  >
    <view v-if="matchInfoList.length === 0">
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
  </scroll-view>

  <!-- 进球/红黄牌底部弹窗通知 -->
  <view v-if="activeNotification" class="event-popup" :class="{ 'popup-show': activeNotification }">
    <view class="event-popup-inner">
      <view class="event-icon">{{ getEventIcon(activeNotification.type) }}</view>
      <view class="event-content">
        <view class="event-teams">{{ activeNotification.homeChs }} vs {{ activeNotification.awayChs }}</view>
        <view class="event-desc">
          <text v-if="activeNotification.type === 'goal'" class="event-text">
            {{ activeNotification.side === 'home' ? '主队' : '客队' }}进球！
            比分 {{ activeNotification.homeScore }}:{{ activeNotification.awayScore }}
          </text>
          <text v-else-if="activeNotification.type === 'red'" class="event-text event-red">
            {{ activeNotification.side === 'home' ? activeNotification.homeChs : activeNotification.awayChs }} 红牌！
          </text>
          <text v-else-if="activeNotification.type === 'yellow'" class="event-text event-yellow">
            {{ activeNotification.side === 'home' ? activeNotification.homeChs : activeNotification.awayChs }} 黄牌！
          </text>
        </view>
      </view>
      <view class="event-close" @click="dismissNotification">✕</view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { getFootBallList } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useUserStore } from "@/stores/userStore";
import dayjs from "dayjs";
import MatchScoreCard from "../components/MatchScoreCard.vue";
import whistleMp3 from "@/static/zc/whistle.mp3"

const innerAudioContext = uni.createInnerAudioContext();
innerAudioContext.autoplay = false;
innerAudioContext.src = whistleMp3

// 播放口哨声
function playWhistle(){
  innerAudioContext.play()
}

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

const currentPageDate = ref(new Date());

// ========== 进球/红黄牌通知相关 ==========
const previousMatchMap = ref({});       // 存储上一次各比赛数据 { matchId: { homeScore, awayScore, homeRed, awayRed, homeYellow, awayYellow, ... } }
const activeNotification = ref(null);   // 当前显示的通知
let notificationTimer = null;           // 通知自动消失计时器
const notificationQueue = ref([]);      // 通知队列

// 获取事件图标
function getEventIcon(type) {
  if (type === 'goal') return '⚽';
  if (type === 'red') return '🟥';
  if (type === 'yellow') return '🟨';
  return '';
}

// 关闭通知
function dismissNotification() {
  activeNotification.value = null;
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  // 检查队列中是否有待显示的通知
  showNextNotification();
}

// 显示队列中的下一个通知
function showNextNotification() {
  if (notificationQueue.value.length > 0) {
    const next = notificationQueue.value.shift();
    showNotificationPopup(next);
  }
}

// 弹出通知弹窗
function showNotificationPopup(notification) {
  activeNotification.value = notification;
  playWhistle();
  // 5秒后自动消失
  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }
  notificationTimer = setTimeout(() => {
    dismissNotification();
  }, 5000);
}

// 入队新通知
function enqueueNotification(notification) {
  if (activeNotification.value) {
    // 当前有通知显示中，加入队列
    notificationQueue.value.push(notification);
  } else {
    showNotificationPopup(notification);
  }
}

// 对比新旧数据，检测变化
function detectChanges(oldMatches, newMatches) {
  const oldMap = {};
  oldMatches.forEach(m => {
    if (m.matchId) {
      oldMap[m.matchId] = m;
    }
  });

  newMatches.forEach(newMatch => {
    const matchId = newMatch.matchId;
    if (!matchId) return;
    const oldMatch = oldMap[matchId];

    // 只有进行中的比赛才检测变化 (mstate 1=上半场, 3=下半场, 4=加时)
    if (![1, 3, 4].includes(newMatch.mstate)) return;
    if (!oldMatch) return;

    const oldHomeScore = Number(oldMatch.homeScore) || 0;
    const oldAwayScore = Number(oldMatch.awayScore) || 0;
    const newHomeScore = Number(newMatch.homeScore) || 0;
    const newAwayScore = Number(newMatch.awayScore) || 0;

    const oldHomeRed = Number(oldMatch.homeRed) || 0;
    const oldAwayRed = Number(oldMatch.awayRed) || 0;
    const newHomeRed = Number(newMatch.homeRed) || 0;
    const newAwayRed = Number(newMatch.awayRed) || 0;

    const oldHomeYellow = Number(oldMatch.homeYellow) || 0;
    const oldAwayYellow = Number(oldMatch.awayYellow) || 0;
    const newHomeYellow = Number(newMatch.homeYellow) || 0;
    const newAwayYellow = Number(newMatch.awayYellow) || 0;

    // 检测主队进球
    if (newHomeScore > oldHomeScore) {
      enqueueNotification({
        type: 'goal',
        side: 'home',
        homeChs: newMatch.homeChs,
        awayChs: newMatch.awayChs,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        matchId: matchId,
      });
    }

    // 检测客队进球
    if (newAwayScore > oldAwayScore) {
      enqueueNotification({
        type: 'goal',
        side: 'away',
        homeChs: newMatch.homeChs,
        awayChs: newMatch.awayChs,
        homeScore: newHomeScore,
        awayScore: newAwayScore,
        matchId: matchId,
      });
    }

    // 检测主队红牌
    if (newHomeRed > oldHomeRed) {
      enqueueNotification({
        type: 'red',
        side: 'home',
        homeChs: newMatch.homeChs,
        awayChs: newMatch.awayChs,
        matchId: matchId,
      });
    }

    // 检测客队红牌
    if (newAwayRed > oldAwayRed) {
      enqueueNotification({
        type: 'red',
        side: 'away',
        homeChs: newMatch.homeChs,
        awayChs: newMatch.awayChs,
        matchId: matchId,
      });
    }

    // 检测主队黄牌
    if (newHomeYellow > oldHomeYellow) {
      enqueueNotification({
        type: 'yellow',
        side: 'home',
        homeChs: newMatch.homeChs,
        awayChs: newMatch.awayChs,
        matchId: matchId,
      });
    }

    // 检测客队黄牌
    if (newAwayYellow > oldAwayYellow) {
      enqueueNotification({
        type: 'yellow',
        side: 'away',
        homeChs: newMatch.homeChs,
        awayChs: newMatch.awayChs,
        matchId: matchId,
      });
    }
  });

  // 更新快照
  updateSnapshot(newMatches);
}

// 更新快照数据
function updateSnapshot(matches) {
  const map = {};
  matches.forEach(m => {
    if (m.matchId) {
      map[m.matchId] = {
        homeScore: Number(m.homeScore) || 0,
        awayScore: Number(m.awayScore) || 0,
        homeRed: Number(m.homeRed) || 0,
        awayRed: Number(m.awayRed) || 0,
        homeYellow: Number(m.homeYellow) || 0,
        awayYellow: Number(m.awayYellow) || 0,
      };
    }
  });
  previousMatchMap.value = map;
}

// 刷新视频列表
const refreshVideoList = async () => {
  await fetchVideoList(1);
};

// 加载更多
const loadMore = async () => {
  if (isLoading.value) return;
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
const refresher = ref(false);
// 获取视频列表的函数
const fetchVideoList = async (isShowRefresher = true) => {
  try {
    if (isLoading.value) return;
    isLoading.value = true;
    refresher.value = isShowRefresher
    // 构建请求参数
    currentPageDate.value = dayjs(currentPageDate.value);
    const fdateStr = currentPageDate.value.format("YYYY/M/D");

    const Videoinfo = await getFootBallList(fdateStr, 0, "", getAccount());

    if (Videoinfo.code === 200 && Videoinfo.data && Array.isArray(Videoinfo.data)) {
      // 首次加载：初始化快照，不触发通知
      const isFirstLoad = Object.keys(previousMatchMap.value).length === 0;
      if (isFirstLoad) {
        matchInfoList.value = Videoinfo.data;
        updateSnapshot(Videoinfo.data);
      } else {
        // 检测变化（用旧数据对比新数据）
        detectChanges(matchInfoList.value, Videoinfo.data);
        matchInfoList.value = Videoinfo.data;
      }
    } else {
      console.warn("API 返回数据格式不符合预期:", Videoinfo);
      uni.showToast({
        title: Videoinfo.msg || "数据格式错误",
        icon: "none",
      });
    }
  } catch (error) {
    console.error("获取视频失败:", error);
    if (currentPage.value === 1) {
      uni.showToast({
        title: "获取视频失败，请检查网络",
        icon: "none",
      });
    }
  } finally {
    setTimeout(() => {
      isLoading.value = false;
    }, 300);

    // 停止下拉刷新
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

  // 记录视频已经点击过
  recodeVideoId(video);

  // 将当前视频保存到 Pinia store
  videoStore.setCurrentVideo(video);
  uni.navigateTo({
    url: `/pages/video/play?id=${video.id}`,
  });
};

// 记录视频已经点击过
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
    refreshVideoList(false);
  },
  { immediate: true }
);

// 组件挂载时加载数据
let refreshTimer = null;
onMounted(() => {
  refreshVideoList();
  // 每5秒自动刷新
  refreshTimer = setInterval(() => {
    refreshVideoList();
  }, 5000);
});

onBeforeUnmount(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  // 清理音频上下文
  innerAudioContext.destroy();
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

// ========== 底部弹窗通知样式 ==========
.event-popup {
  position: fixed;
  bottom: 100rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 9999;
  transform: translateY(150%);
  transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1.2);
  pointer-events: none;
}

.event-popup.popup-show {
  transform: translateY(0);
  pointer-events: auto;
}

.event-popup-inner {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.5);
  border: 2rpx solid rgba(255, 255, 255, 0.15);
}

.event-icon {
  font-size: 50rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-teams {
  font-size: 26rpx;
  color: #aaa;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-desc {
  font-size: 32rpx;
  font-weight: bold;
}

.event-text {
  color: #fff;
}

.event-text.event-red {
  color: #ff4d4f;
}

.event-text.event-yellow {
  color: #ffeb3b;
}

.event-close {
  font-size: 32rpx;
  color: #888;
  padding: 10rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
  cursor: pointer;
}
</style>
