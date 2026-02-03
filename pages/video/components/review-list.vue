<template>
  <!-- 视频列表 -->
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
          :src="getFullUrl(video.himg)"
          class="video-image"
          :class="{ 'free-video': !video.flag }"
        />
        <view class="video-title">{{ getTitle(video) }}</view>
        <view class="video-info">
          <text class="video-price" v-if="video.flag && video.price > 0">
            {{ video.hasPaid ? "已付费" : `付费视频 ${video.price}金币` }}
          </text>
          <text class="video-free" v-else>免费</text>
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
import { ref, onMounted, watch, nextTick } from "vue";
import { getReviewPostList, delReviewPost } from "@/api/apis";
import { getToken, getAccount } from "@/utils/request.js";
import { useVideoStore } from "@/stores/video.js";
import tool from "../../../utils/tool";
import dayjs from "dayjs";

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
    // 构建请求参数
    const formdata = {
      page: page,
      limit: props.limit,
      tname: props.videoType,
    };

    currentPage.value = page;
    const postlistRes = await getReviewPostList(formdata);
    if (page === 1) {
      videoList.value = postlistRes.data.list;
    } else {
      videoList.value.push(...postlistRes.data.list);
    }

    // 判断是否还有更多数据
    hasMore.value = videoList.value.length < postlistRes.data.total;
  } catch (error) {
    console.error("获取精彩回顾失败:", error);
    if (currentPage.value === 1) {
      uni.showToast({
        title: "获取精彩回顾失败，请检查网络",
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
function getFullUrl(url) {
  return tool.oss.getFullUrl("himg/" + url);
}
function getTitle(video) {
  // return `${video.uname} ${dayjs(video.create_time).format("MM月DD日")}精彩回顾`;
  return video.title;
}
// 跳转到帖子详情
const playVideo = async (video) => {
  uni.navigateTo({
    url: `/pages/video/review-post-detial?id=${video.id}`,
  });
  return;
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
          await delReviewPost(video.id)
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
</style>
