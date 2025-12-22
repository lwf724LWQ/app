<template>
  <view class="post-item">
    <!-- 帖子头部 -->
    <view class="post-header">
      <view class="user-info">
        <image :src="userInfo.avatar" class="avatar"></image>
        <view class="username-and-url">
          <text class="username">{{ userInfo.username }}</text>
        </view>
      </view>
    </view>
    <!-- 标题 -->
    <view class="post-title">
      {{ post.tname }} 第{{ post.issueno }}期
      <!-- <text class="is-apply-text" :class="{ activat: !post.flag }">{{
        post.flag ? "已过审" : "未过审"
      }}</text> -->
    </view>

    <!-- 发布时间 -->
    <view class="post-time">{{ formatTime(post.create_time) }}</view>

    <!-- 内容 -->
    <view class="post-content">
      <text>{{ post.content }}</text>
    </view>

    <!-- 图片 -->
    <view v-if="postImage && postImage.length > 0" class="post-images">
      <image
        v-for="(img, index) in postImage"
        :key="index"
        :src="img"
        class="post-image"
        mode=""
        @tap.stop.prevent="previewImage(postImage, index)"
      ></image>
    </view>

    <!-- 帖子底部操作 -->
    <view class="post-footer">
      <view class="action-item" :class="{ 'liked-disabled': isLiked }" @click="handleLike(item)">
        <uni-icons type="hand-up" size="18" :color="isLiked ? '#ff4757' : '#999'"></uni-icons>
        <text class="count" :class="{ liked: dianzan }">{{ post.like_count }}</text>
      </view>
      <!-- <view class="action-item">
        <uni-icons type="redo" size="18" color="#999"></uni-icons>
        <text class="count">{{ post.shares }}</text>
      </view> -->
      <!-- <view class="action-item">
        <uni-icons type="chatbubble" size="18" color="#999"></uni-icons>
        <text class="count">{{ post.comment }}</text>
      </view> -->
      <view class="action-item append-btn" @click="handleAppendPost">
        <uni-icons type="plus" size="18" color="#28B389"></uni-icons>
        <text class="count">追帖</text>
      </view>
    </view>
  </view>
</template>
<script setup>
import { computed, ref, watch } from "vue";
import forumToos from "./forumToos";
import { useUserListStore } from "@/stores/userListStore";
import { apiPostLike } from "@/api/apis";
import { getAccount } from "../../utils/request";
const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});
const userInfo = ref({});

const useUserList = useUserListStore();
watch(
  () => props.post,
  (newValue) => {
    useUserList.getUserInfo(newValue.account).then((data) => {
      userInfo.value = data;
    });
  },
  { immediate: true }
);

const postImage = computed(() => {
  return props.post.pimg ? props.post.pimg.split(",") : "";
});
const isLiked = computed(() => {
  return props.post.dianzan;
});
// 跳转到用户详情页
const goToUserDetail = (userId) => {
  // 跳转逻辑
  console.log("跳转到用户详情页", userId);
};
// 时间格式化函数
const formatTime = (datestr) => {
  const timestamp = new Date(datestr).getTime();
  const now = Date.now();
  const diff = now - timestamp;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return "今天";
  } else if (days === 1) {
    return "昨天";
  } else {
    return `${days}天前`;
  }
};
// 预览图片
const previewImage = (urls, current) => {
  uni.previewImage({
    urls,
    current,
  });
};
// 跳转到帖子详情页面
const goToPostDetail = () => {
  const post = props.post;
  console.log("跳转到帖子详情页面", post);
  //   uni.navigateTo({
  //     url: `/pages/user/post-detail?postId=${postId}`,
  //   });
};

// 处理追帖按钮点击
const handleAppendPost = () => {
  const post = props.post;
  console.log("追帖", post);
  forumToos.handleAppendPost(post);
};
// 处理点赞按钮点击
const handleLike = () => {
  const post = props.post;
  // console.log("点赞", post);
  if (post.dianzan != 1) {
    apiPostLike({
      postId: post.id,
      account: getAccount(), // 使用当前登录用户账号
    }).then(() => {
      uni.showToast({
        title: "点赞成功",
        icon: "success",
      });
      props.post.dianzan = 1;
      props.post.like_count = props.post.like_count + 1;
    });
  }
};
</script>
<style scoped lang="scss">
.post-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.post-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 16rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.post-content {
  font-size: 28rpx;
  color: #666666;
  line-height: 42rpx;
  margin-bottom: 20rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20rpx;
  .post-image:only-child {
    width: 100%;
    height: 400rpx;
  }
}

.post-image {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  margin-right: 16rpx;
  margin-bottom: 16rpx;
}
.post-footer {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-top: 20rpx;
  border-top: 1rpx solid #eee;
}

.action-item {
  display: flex;
  align-items: center;
  color: #999;
  font-size: 24rpx;
  /* 优化触摸性能 */
  touch-action: manipulation;
  transition: transform 0.2s ease;
}

.action-item .count {
  margin-left: 8rpx;
}

.action-item .count.liked {
  color: #ff4757;
  font-weight: 600;
}

.action-item:active {
  opacity: 0.7;
}

.action-item.liked-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-item.liked-disabled:active {
  opacity: 0.6;
  /* 保持禁用状态，不响应点击效果 */
}

/* 追帖按钮样式 */
.action-item.append-btn {
  color: #28b389;
}

.action-item.append-btn .count {
  color: #28b389;
  font-weight: 500;
}

.action-item.append-btn:active {
  opacity: 0.7;
  transform: scale(0.95);
}

.post-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-info {
  display: flex;
  align-items: center;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 16rpx;
  background-color: #eee;
  flex-shrink: 0;
}

.username-and-url {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.more-options {
  padding: 10rpx;
}
</style>
