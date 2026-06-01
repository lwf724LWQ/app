<template>
  <view class="post-card" @click="onPostCard">
    <!-- 头部：用户信息 -->
    <view class="header">
      <view class="user-info">
        <image class="avatar" :src="getFullImgUrl(postData.himg)" mode="aspectFill" />
        <view class="text-info">
          <view class="name-row">
            <text class="nickname">{{ postData.uname }}</text>
          </view>
          <view class="meta-info">
            <text>{{ getTimeAgo(postData.create_time) }}</text>
          </view>
        </view>
      </view>
      <!-- <button class="follow-btn" @click="handleFollow">+ 关注</button> -->
    </view>

    <!-- 内容区 -->
    <view class="content">
      <view class="title" v-if="postData.title">{{ postData.title }}</view>
      <view class="description">{{ postData.expertAnalysis }}</view>
    </view>

    <!-- 底部：互动栏 -->
    <view class="footer">
      <view class="action-item" @click="onComment">
        <uni-icons class="icon-img" type="chat" size="16" />
        {{ postData.count }}
      </view>
      <!-- <view class="action-item" @click="onLike">
        <uni-icons class="icon-img" type="hand-up" size="16" />
        {{ postData.likeCount }}
      </view> -->
    </view>
  </view>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import tool from "@/utils/tool.js"

// 定义组件接收的属性
const props = defineProps({
  postData: {
    type: Object,
    default: () => ({}),
  },
});

function getTimeAgo(time){
  return tool.getTimeAgo(time)
}

function getFullImgUrl(url){
  if (typeof url === "string" && url.startsWith("http")) {
    return url
  }
  return tool.oss.getFullUrl(`/himg/${url}`);
}

const emit = defineEmits(["follow", "share", "comment", "like", "postCard"]);

const handleFollow = () => emit("follow");
const onShare = () => emit("share");
const onPostCard = () => emit("postCard");
const onComment = () => emit("comment");
const onLike = () => emit("like");
</script>

<style lang="scss" scoped>
.post-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  padding: 32rpx;
  font-family: sans-serif;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);

  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;

    .user-info {
      display: flex;
      align-items: center;

      .avatar {
        width: 96rpx;
        height: 96rpx;
        border-radius: 50%;
        margin-right: 10rpx;
        background-color: #eee;
      }

      .text-info {
        display: flex;
        flex-direction: column;

        .name-row {
          display: flex;
          align-items: center;

          .nickname {
            font-size: 32rpx;
            font-weight: bold;
            color: #333;
            margin-right: 12rpx;
          }
        }

        .meta-info {
          font-size: 24rpx;
          color: #999;
          margin-top: 8rpx;
        }
      }
    }

    .follow-btn {
      margin: 0;
      padding: 0 28rpx;
      height: 64rpx;
      line-height: 64rpx;
      font-size: 28rpx;
      color: #007aff;
      border: 1rpx solid #007aff;
      background: transparent;
      border-radius: 32rpx;

      &::after {
        border: none;
      }
    }
  }

  .content {
    margin-bottom: 32rpx;

    .title {
      font-size: 36rpx;
      font-weight: 500;
      color: #333;
      margin-bottom: 16rpx;
    }

    .description {
      font-size: 30rpx;
      color: #666;
      line-height: 1.5;
    }
  }

  .footer {
    display: flex;
    justify-content: space-around;
    padding-top: 24rpx;
    border-top: 1rpx solid #f5f5f5; // 可选，增加分割感
    font-size: 28rpx;

    .action-item {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex: 1;

      // 模拟图标（实际项目中请使用 <uni-icons> 或图片）
      .icon-img {
        width: 40rpx;
        height: 40rpx;
        background-size: contain;
        background-repeat: no-repeat;
        background-position: center;
        margin-right: 4rpx;
        display: inline-block;
      }
    }
  }
}
</style>
