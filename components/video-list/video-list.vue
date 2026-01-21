<template>
  <!-- 视频列表 -->
  <scroll-view
    class="scroll-view"
    scroll-y
    :refresher-enabled="false"
    :refresher-triggered="isLoading"
    @refresherrefresh="refreshVideoList"
    @scrolltolower="loadMore"
  >
    <view v-if="videoList.length === 0">
      <view class="no-data-container">
        <view class="no-data-text">暂无数据</view>
      </view>
    </view>
    <view class="area">
      <view
        class="title"
        v-for="(video, index) in videoList"
        :key="index"
        @longpress="videoMenu(video)"
        @click="playVideo(video)"
      >
        <image
          mode="aspectFill"
          :src="video.imgurl"
          class="video-image"
          :class="{ 'paid-video': video.hasPaid, 'free-video': !video.flag }"
        />
        <view class="video-title">{{ video.title }}</view>
        <view class="video-info">
          <text class="video-price" v-if="video.flag && video.price > 0">
            {{ video.hasPaid ? "已付费" : `付费视频 ${video.price}金币` }}
          </text>
          <text class="video-free" v-else>免费视频</text>
        </view>
      </view>
    </view>

    <!-- 加载更多提示 -->
    <view class="loading-more" v-if="isLoading && currentPage > 1">
      <text>加载中...</text>
    </view>

    <!-- 没有更多数据提示 -->
    <view class="no-more" v-else-if="!hasMore">
      <text>没有更多数据了</text>
    </view>
  </scroll-view>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { apiGetVideo, apiCheckVideoPayment, delVideo } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useVideoStore } from "@/stores/video.js";

// 接收的props
const props = defineProps({
  videoType: {
    type: String,
    default: "",
  },
  limit: {
    type: Number,
    default: 10,
  },
});

// 定义事件
const emit = defineEmits(["video-click"]);

// 响应式数据
const videoList = ref([]);
const currentPage = ref(1);
const hasMore = ref(true);
const isLoading = ref(false);

// 初始化 store
const videoStore = useVideoStore();

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

// 获取视频列表的函数
const fetchVideoList = async (page = 1) => {
  try {
    if (isLoading.value) return;

    isLoading.value = true;

    // 构建请求参数
    const videoinfo = {
      page: page,
      limit: props.limit,
    };

    // 添加视频类型参数
    if (props.videoType && props.videoType !== "") {
      videoinfo.tname = props.videoType;
    }
    currentPage.value = page;
    const Videoinfo = await apiGetVideo(videoinfo);

    if (
      Videoinfo.code === 200 &&
      Videoinfo.data &&
      Videoinfo.data.records &&
      Array.isArray(Videoinfo.data.records)
    ) {
      let reportList = [];

      // 屏蔽被举报的视频
      const r = uni.getStorageSync("reportList") || [];
      reportList = r.filter((item) => item.type == "video").map((item) => item.id);

      const newVideos = Videoinfo.data.records
        .map((item) => ({
          title: item.title,
          src: "http://video.caimizm.com/" + item.url,
          id: item.id,
          account: item.account,
          likeCount: item.likeCount,
          createTime: item.createTime,
          flag: item.price > 0 ? item.flag : false,
          price: item.price,
          updateTime: item.updateTime,
          imgurl: "http://video.caimizm.com/" + item.vimg,
        }))
        .filter((item) => !reportList.includes(item.id));

      if (page === 1) {
        videoList.value = newVideos;
      } else {
        videoList.value.push(...newVideos);
      }

      // 判断是否还有更多数据
      hasMore.value = videoList.value.length < Videoinfo.data.total;
    } else {
      console.warn("API 返回数据格式不符合预期:", Videoinfo);
      if (page === 1) {
        uni.showToast({
          title: Videoinfo.msg || "数据格式错误",
          icon: "none",
        });
      }
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
    isLoading.value = false;
    // 停止下拉刷新
    uni.stopPullDownRefresh();
  }
};

// 播放视频方法 - 新增付费检查
const playVideo = async (video) => {
  // 检查是否登录
  const token = getToken();
  if (!token) {
    uni.showModal({
      title: "提示",
      content: "该操作需要登录，是否前往",
      success: async (res) => {
        if (res.confirm) {
          uni.navigateTo({ url: "/pages/login/login" + "?redirect=/pages/video/video" });
        }
      },
      showCancel: true,
    });
    return;
  }

  // 将当前视频保存到 Pinia store
  videoStore.setCurrentVideo(video);

  // 如果视频是免费的（price为0或flag为false），直接播放
  if (!video.flag || video.price === 0) {
    // 免费视频直接播放
    uni.navigateTo({
      url: `/pages/video/play?id=${video.id}`,
    });
    return;
  }

  // 检查视频是否收费
  try {
    // 查询用户是否已付费
    const paymentCheck = await apiCheckVideoPayment({
      videoId: video.id,
      account: getAccount(),
    });

    if (paymentCheck.data) {
      if (paymentCheck.data) {
        // 用户已付费，直接播放
        uni.navigateTo({
          url: `/pages/video/play?id=${video.id}`,
        });
      } else {
        // 用户未付费，显示付费提示
        uni.showModal({
          title: "付费视频",
          content: `观看此视频需要支付${video.price}金币`,
          confirmText: "立即支付",
          cancelText: "取消",
          success: async (res) => {
            if (res.confirm) {
              // 这里调用支付接口
              await payForVideo(video);
            }
          },
        });
      }
    } else {
      uni.navigateTo({
        url: `/pages/video/play?id=${video.id}`,
      });
    }
  } catch (error) {
    uni.showToast({
      title: error.message || "查询失败",
      icon: "none",
    });
  }

  // 触发点击事件
  emit("video-click", video);
};

// 支付视频方法
const payForVideo = async (video) => {
  try {
    // 这里调用支付接口
    // const paymentResult = await apiPayForVideo({...});

    // 支付成功后更新视频状态
    video.hasPaid = true;

    uni.showToast({
      title: "支付成功，开始播放",
      icon: "success",
    });

    // 播放视频
    uni.navigateTo({
      url: `/pages/video/play?id=${video.id}`,
    });
  } catch (error) {
    uni.showToast({
      title: "支付失败",
      icon: "none",
    });
  }
};

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
  grid-template-columns: 1fr 1fr;
  /* 两列等宽 */
  gap: 10rpx;
  /* 间距 */
}

.video-image {
  width: 100%;
  height: 200rpx;
}

.video-title {
  padding: 10rpx 20rpx 5rpx 20rpx;
  flex: 1;
  font-size: 28rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-info {
  padding: 5rpx 20rpx;

  > text {
    padding: 5rpx 10rpx;
    border-radius: 6rpx;
    font-size: 22rpx;
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
}
</style>
