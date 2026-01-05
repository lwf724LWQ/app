<template>
  <!-- 单个视频列表项容器 -->
  <view class="video-card" @click="toVideoDetail(video.id)">
    <!-- 视频缩略图 -->
    <view class="video-thumb">
      <image
        class="video-thumb-img"
        :src="`http://video.caimizm.com/${video.vimg}`"
        mode="aspectFill"
      />
      <view class="video-price" v-if="video.price !== 0">付费：{{ video.price.toFixed(2) }}</view>
    </view>

    <!-- 视频信息区 -->
    <view class="video-info">
      <!-- 视频标题 -->
      <text class="video-title">{{ video.title }}</text>

      <!-- 视频元数据（底部信息栏） -->
      <view class="video-meta">
        <!-- 左侧：视频类型标签 -->
        <!-- <text class="video-type">{{ video.tname }}</text> -->

        <!-- 右侧：时间与互动数据 -->
        <view class="meta-right">
          <!-- 发布时间 -->
          <text class="publish-time">{{ formatDate(video.createTime) }}</text>
          <!-- 分隔点 -->
          <text class="divider">·</text>
          <!-- 点赞数 -->
          <text class="like-count">{{ video.likeCount }} 赞</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import dayjs from "dayjs";

defineProps({
  video: {
    type: Object,
    default: () => ({}),
  },
});

const formatDate = (date) => {
  return dayjs(date).fromNow(true);
};

// 跳转视频详情页
const toVideoDetail = (videoId) => {
  uni.navigateTo({
    url: `/pages/video/play?id=${videoId}`,
  });
};
</script>

<style lang="scss" scoped>
.video-card {
  display: flex;
  background-color: #fff;

  .video-thumb {
    width: 240rpx;
    height: 160rpx;
    border-radius: 12rpx;
    flex-shrink: 0;
    margin-right: 24rpx;
    position: relative;
    .video-thumb-img {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
    }
    .video-price {
      position: absolute;
      top: 5rpx;
      left: 5rpx;
      color: #fff;
      font-size: 24rpx;
      padding: 4rpx 12rpx;
      background-color: rgba(0, 0, 0, 0.6);
      border-radius: 6rpx;
    }
  }

  .video-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 0; /* 防止标题过长撑开布局 */
  }

  .video-title {
    font-size: 32rpx;
    color: #333;
    line-height: 1.4;
    /* 标题最多显示两行，超出部分显示省略号 */
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .video-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 24rpx;
    color: #999;
  }

  .video-type {
    padding: 4rpx 12rpx;
    background-color: #f0f0f0;
    border-radius: 6rpx;
    color: #666;
  }

  .meta-right {
    display: flex;
    align-items: center;
  }

  .divider {
    margin: 0 12rpx;
  }
}
</style>
