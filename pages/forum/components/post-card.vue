<template>
  <view class="predict-item">
    <!-- 帖子头部 -->
    <view class="post-header">
      <view class="user-info" @click="gotoUserSpace(item.account)">
        <image :src="item.avatar" class="avatar"></image>
        <view class="username-and-url">
          <text class="username">{{ item.username }}</text>
        </view>
      </view>
      <view class="more-options" @click="toggleMoreOptions">
        <uni-icons type="more-filled" size="20" color="#999"></uni-icons>
      </view>
    </view>

    <!-- 期号和时间 -->
    <view class="issue-time">
      <text class="issue-no">第{{ item.period }}期</text>
      <text class="post-time">{{ item.time }}</text>
    </view>

    <!-- 帖子内容 -->
    <view class="post-content">
      <text class="content-text">{{ item.content }}</text>
      <!-- 规律帖图片显示 - 支持多张图片 -->
      <view v-if="item.image" class="post-image-container">
        <!-- 单张图片 -->
        <image
          v-if="!isMultipleImages(item.image)"
          :src="
            item.image.startsWith('http')
              ? item.image
              : `http://video.caimizm.com/himg/${item.image}`
          "
          class="post-image"
          mode="aspectFit"
          @click="previewImage(item.image, [item.image])"
        />
        <!-- 多张图片 -->
        <view v-else class="multiple-images">
          <view
            v-for="(imageUrl, index) in getImageUrls(item.image)"
            :key="index"
            class="image-item"
          >
            <image
              :src="
                imageUrl.startsWith('http') ? imageUrl : `http://video.caimizm.com/himg/${imageUrl}`
              "
              class="post-image-small"
              mode="aspectFit"
              @click="previewImage(imageUrl, getImageUrls(item.image))"
            />
          </view>
        </view>
      </view>
    </view>

    <!-- 帖子底部操作 -->
    <view class="post-footer">
      <view
        class="action-item"
        :class="{ 'liked-disabled': item.isLiked }"
        @click="handleLike(item)"
      >
        <uni-icons type="hand-up" size="18" :color="item.isLiked ? '#ff4757' : '#999'"></uni-icons>
        <text class="count" :class="{ liked: item.isLiked }">{{ item.likes }}</text>
      </view>
      <view class="action-item">
        <uni-icons type="redo" size="18" color="#999"></uni-icons>
        <text class="count">{{ item.shares }}</text>
      </view>
      <view class="action-item">
        <uni-icons type="chatbubble" size="18" color="#999"></uni-icons>
        <text class="count">{{ item.comments }}</text>
      </view>
      <view class="action-item append-btn" @click="handleAppendPost(item)">
        <uni-icons type="plus" size="18" color="#28B389"></uni-icons>
        <text class="count">追帖</text>
      </view>
    </view>
  </view>
</template>
<script>
import forumToos from "../../../components/post-card/forumToos";
import { apiPostLike, userFollowApi } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
export default {
  props: {
    item: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {};
  },
  methods: {
    // 预览图片
    previewImage(current, urls) {
      uni.previewImage({
        current,
        urls,
      });
    },
    // 判断图片是否是多张
    isMultipleImages(image) {
      return image && image.includes(",");
    },
    // 获取图片的URL数组
    getImageUrls(imageStr) {
      if (!imageStr) return [];
      return imageStr
        .split(",")
        .map((url) => url.trim())
        .filter((url) => url);
    },
    // 处理追帖按钮点击
    handleAppendPost(post) {
      post.issueno = post.period;
      forumToos.handleAppendPost(post);
    },
    async handleLike(post) {
      try {
        // 防止重复点击
        if (post.isLiking) {
          return;
        }

        // 检查当前用户是否已经点赞过这个帖子
        if (post.isLiked == 1) {
          uni.showToast({
            title: "你已经点赞过了",
            icon: "none",
          });
          return;
        }

        // 检查postId是否有效
        if (!post.id) {
          uni.showToast({
            title: "帖子数据异常，无法点赞",
            icon: "none",
          });
          return;
        }

        post.isLiking = true;

        // 调用点赞接口
        const likeData = {
          postId: post.id,
          account: getAccount(), // 使用当前登录用户账号
        };

        const response = await apiPostLike(likeData);

        if (response.code === 200) {
          // 点赞成功，更新状态
          post.isLiked = true;
          post.likes += 1;

          // 保存当前用户对这个帖子的点赞状态
          // saveLikedStatus(userLikedKey, true);

          uni.showToast({
            title: response.msg || "点赞成功",
            icon: "success",
          });

          // 更新列表中的对应帖子
          this.$emit("updatePost", post);
        } else {
          uni.showToast({
            title: response.msg || "点赞失败",
            icon: "none",
          });
        }
      } catch (error) {
        console.error("点赞失败：", error);
        uni.showToast({
          title: "网络错误，请重试",
          icon: "none",
        });
      } finally {
        post.isLiking = false;
      }
    },
    toggleMoreOptions() {
      return;
      uni.showActionSheet({
        itemList: ["举报"],
        success: (res) => {
          // if (res.tapIndex === 0) {
          //   if (this.item.isFollowed) {

          //   }
          //   userFollowApi({ account2: this.item.account })
          //     .then(() => {
          //       uni.showToast({
          //         title: "关注成功",
          //         icon: "success",
          //       });
          //     })
          //     .catch(() => {
          //       uni.showToast({
          //         title: "关注失败",
          //         icon: "none",
          //       });
          //     });
          // }
          if (res.tapIndex === 0) {
            // 举报
            if (this.item.account == getAccount()) {
              uni.showModal({
                title: "不能举报自己的帖子哦~",
                content: "如果需要变动，可以通过追贴的方式进行补充~",
                showCancel: false,
              });
              return;
            }

            this.$emit("report", this.item.id);
          }
        },
      });
    },
    gotoUserSpace(account) {
      const myAccount = getAccount();
      if (account == myAccount) {
        return;
      }
      if (myAccount == "") {
        uni.showToast({
          title: "请先登录",
          icon: "none",
        });
        return;
      }
      uni.navigateTo({
        url: `/pages/user/space?account=${account}`,
      });
    },
  },
};
</script>
<style scoped>
.predict-item {
  background-color: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  /* 优化触摸性能 */
  touch-action: manipulation;
  transition: transform 0.2s ease;
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

.issue-time {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 24rpx;
  color: #666;
}

.issue-no {
  font-weight: bold;
  margin-right: 10rpx;
  color: #333;
}

.post-time {
  color: #999;
}

.post-content {
  margin-bottom: 20rpx;
  line-height: 1.6;
  font-size: 28rpx;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 帖子图片样式 */
.post-image-container {
  margin-top: 20rpx;
  text-align: center;
}

.post-image {
  max-width: 100%;
  max-height: 400rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 多张图片样式 */
.multiple-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  justify-content: center;
}

.image-item {
  flex: 0 0 auto;
}

.post-image-small {
  width: 200rpx;
  height: 200rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
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
</style>
