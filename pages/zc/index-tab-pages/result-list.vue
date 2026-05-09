<template>
  <!-- 视频列表 -->
  <scroll-view
    class="scroll-view"
    :scroll-y="true"
    :show-scrollbar="false"
    :refresher-enabled="false"
    :refresher-triggered="isLoading"
    :lower-threshold="150"
    :scroll-top="scrollTop"
    @scrolltolower="loadMore"
    @scroll="scroll"
  >
    <view v-if="matchInfoList.length === 0">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <view class="area">
      <view v-for="(matchDay, index) in matchInfoList" :key="index" class="day-group">
        <view class="day-header">
          <text class="day-title">
            {{ matchDay.weekday }} {{ formatDate(matchDay.businessDate) }}
          </text>
          <text class="day-count">{{ matchDay.matchCount }}场</text>
        </view>
        <MatchScoreCard
          v-for="match in matchDay.subMatchList"
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

    <!-- 加载更多提示 -->
    <view class="loading-more" v-if="isLoading && currentPage > 1">
      <text>加载中...</text>
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

const currentPageDate = ref(new Date());

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
// 获取视频列表的函数
const fetchVideoList = async () => {
  try {
    if (isLoading.value) return;
    isLoading.value = true;
    // 构建请求参数
    currentPageDate.value = dayjs(currentPageDate.value).add(-1, "day");
    const fdateStr = currentPageDate.value.format("YYYY-MM-DD");

    const Videoinfo = await getFootBallList(fdateStr);

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
      const newArr = [
        ...matchInfoList.value,
        {
          businessDate: fdateStr,
          weekday: dayjs(fdateStr).format("dddd"),
          matchCount: Videoinfo.data.length,
          subMatchList: Videoinfo.data,
        },
      ];

      matchInfoList.value = newArr.sort(
        (a, b) => new Date(b.businessDate).getTime() - new Date(a.businessDate).getTime()
      );
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
  // 检查是否登录
  // if (!token && video.flag) {
  //   uni.showModal({
  //     title: "提示",
  //     content: "付费视频需要登录，新用户赠送5次付费视频观看次数",
  //     success: async (res) => {
  //       if (res.confirm) {
  //         uni.navigateTo({ url: "/pages/reg/reg" + "?redirect=/pages/video/video" });
  //       }
  //     },
  //     showCancel: true,
  //   });
  //   return;
  // }

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
    refreshVideoList();
  },
  { immediate: true }
);

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
</style>
