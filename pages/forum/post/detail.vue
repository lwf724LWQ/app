<template>
  <view class="detail-container">
    <!-- 帖子详情卡片 -->
    <view class="post-detail-card">
      <!-- 帖子头部 -->
      <view class="post-header">
        <view class="user-info" @click="gotoUserSpace(post.account)">
          <image :src="post.avatar" class="avatar"></image>
          <view class="username-and-url">
            <text class="username">{{ post.username }}</text>
          </view>
        </view>
      </view>

      <!-- 期号和时间 -->
      <view class="issue-time">
        <text class="issue-no">{{ post.tname }} 第{{ post.issueno }}期</text>
        <text class="post-time">{{ post.time }}</text>
      </view>

      <!-- 帖子内容 -->
      <view class="post-content">
        <text class="content-text">{{ post.content }}</text>
        <!-- 图片显示 -->
        <view v-if="postImages.length > 0" class="post-image-container">
          <!-- 单张图片 -->
          <image
            v-if="postImages.length === 1"
            :src="postImages[0]"
            class="post-image"
            mode="aspectFit"
            @click="previewImage(postImages[0], postImages)"
          />
          <!-- 多张图片 -->
          <view v-else class="multiple-images">
            <view
              v-for="(imageUrl, index) in postImages"
              :key="index"
              class="image-item"
            >
              <image
                :src="imageUrl"
                class="post-image-small"
                mode="aspectFit"
                @click="previewImage(imageUrl, postImages)"
              />
            </view>
          </view>
        </view>
      </view>

      <!-- 帖子底部操作 -->
      <view class="post-footer">
        <view
          class="action-item"
          :class="{ 'liked-disabled': post.isLiked }"
          @click="handleLike"
        >
          <uni-icons type="hand-up" size="18" :color="post.isLiked ? '#ff4757' : '#999'"></uni-icons>
          <text class="count" :class="{ liked: post.isLiked }">{{ post.likes }}</text>
        </view>
        <view class="action-item">
          <uni-icons type="redo" size="18" color="#999"></uni-icons>
          <text class="count">{{ post.shares || 0 }}</text>
        </view>
        <view class="action-item">
          <uni-icons type="chatbubble" size="18" color="#999"></uni-icons>
          <text class="count">{{ commentTotal || post.comments || 0 }}</text>
        </view>
        <view class="action-item append-btn" @click="handleAppendPost" v-if="isSelfAccountPost">
          <uni-icons type="plus" size="18" color="#28B389"></uni-icons>
          <text class="count">追帖</text>
        </view>
      </view>
    </view>

    <!-- 评论标题 -->
    <view class="comment-title">
      <text class="title-text">全部评论</text>
      <text class="title-count" v-if="commentTotal > 0">（{{ commentTotal }}）</text>
    </view>

    <!-- 评论列表 -->
    <scroll-view
      class="comment-list"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="commentRefreshing"
      @refresherrefresh="onCommentRefresh"
      @scrolltolower="loadMoreComments"
    >
      <view v-if="commentList.length > 0" class="comment-items">
        <view
          class="comment-item"
          v-for="(comment, index) in commentList"
          :key="comment.id || index"
        >
          <view class="comment-header">
            <view class="comment-user-info" @click="gotoUserSpace(comment.account)">
              <image :src="comment.avatar" class="comment-avatar"></image>
              <text class="comment-username">{{ comment.username }}</text>
            </view>
            <text class="comment-time">{{ formatCommentTime(comment.create_time) }}</text>
          </view>
          <view class="comment-body">
            <text class="comment-content">{{ comment.content }}</text>
          </view>
        </view>
      </view>

      <!-- 暂无评论 -->
      <view v-if="commentList.length === 0 && !commentLoading" class="no-comments">
        <text class="no-comments-text">暂无评论，快来抢沙发吧~</text>
      </view>

      <!-- 加载更多 -->
      <view v-if="commentLoading" class="loading-more">
        <text class="loading-text">加载中...</text>
      </view>
      <view v-if="commentNoMore && commentList.length > 0" class="no-more">
        <text class="no-more-text">没有更多评论了</text>
      </view>

      <!-- 底部占位，防止被输入框遮挡 -->
      <view class="comment-bottom-placeholder"></view>
    </scroll-view>

    <!-- 评论输入框 -->
    <view class="comment-input-bar">
      <view class="input-wrapper">
        <input
          class="comment-input"
          type="text"
          v-model="commentText"
          placeholder="说点什么..."
          placeholder-style="color: #ccc;"
          :adjust-position="true"
          @confirm="submitComment"
        />
      </view>
      <view class="send-btn" :class="{ disabled: !commentText.trim() }" @click="submitComment">
        <text>发送</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from "vue";
import { onLoad } from "@dcloudio/uni-app";
import { apiPostLike, addComment, commentList as apiCommentList } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
import tool from "@/utils/tool.js";
import forumToos from "@/components/post-card/forumToos";

// 帖子数据
const post = ref({
  id: "",
  account: "",
  username: "",
  avatar: "",
  tname: "",
  issueno: "",
  time: "",
  content: "",
  image: "",
  likes: 0,
  isLiked: false,
  shares: 0,
  comments: 0,
});

// 评论相关
const commentText = ref("");
const commentList = ref([]);
const commentLoading = ref(false);
const commentRefreshing = ref(false);
const commentNoMore = ref(false);
const commentTotal = ref(0);
const commentPage = ref(1);
const commentLimit = 20;

// 帖子图片
const postImages = computed(() => {
  const img = post.value.image;
  if (!img) return [];
  return img
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url)
    .map((url) =>
      url.startsWith("http") ? url : `http://video.caimizm.com/himg/${url}`
    );
});

// 是否是自己的帖子
const isSelfAccountPost = computed(() => {
  return post.value.account === getAccount();
});

// 页面加载
onLoad((options) => {
  // 从页面参数解析帖子数据
  if (options.postData) {
    try {
      const postData = JSON.parse(decodeURIComponent(options.postData));
      post.value = { ...post.value, ...postData };
      if (postData.period) {
        post.value.issueno = postData.period;
      }
    } catch (e) {
      console.error("解析帖子数据失败", e);
    }
  }

  // 支持通过id等参数单独传递
  if (options.id) post.value.id = options.id;
  if (options.tname) post.value.tname = options.tname;
  if (options.issueno) post.value.issueno = options.issueno;
  if (options.period) post.value.issueno = options.period;
  if (options.content) post.value.content = options.content;
  if (options.image) post.value.image = options.image;
  if (options.likes) post.value.likes = parseInt(options.likes) || 0;
  if (options.isLiked) post.value.isLiked = options.isLiked === "true" || options.isLiked === "1";
  if (options.comments) post.value.comments = parseInt(options.comments) || 0;
  if (options.shares) post.value.shares = parseInt(options.shares) || 0;
  if (options.account) post.value.account = options.account;
  if (options.username) post.value.username = options.username;
  if (options.avatar) post.value.avatar = options.avatar;
  if (options.time) post.value.time = options.time;

  // 加载评论
  loadComments(true);
});

// 跳转到用户空间
const gotoUserSpace = (account) => {
  if (!account) return;
  uni.navigateTo({
    url: `/pages/user/user-space?account=${account}`,
  });
};

// 预览图片
const previewImage = (current, urls) => {
  uni.previewImage({
    current,
    urls,
  });
};

// 点赞
const handleLike = async () => {
  try {
    if (!tool.isLogin()) {
      return;
    }
    if (post.value.isLiked) {
      uni.showToast({ title: "你已经点赞过了", icon: "none" });
      return;
    }
    if (!post.value.id) {
      uni.showToast({ title: "帖子数据异常", icon: "none" });
      return;
    }

    const response = await apiPostLike({
      postId: post.value.id,
      account: getAccount(),
    });

    if (response.code === 200) {
      post.value.isLiked = true;
      post.value.likes = (post.value.likes || 0) + 1;
      uni.showToast({ title: response.msg || "点赞成功", icon: "success" });
    } else {
      uni.showToast({ title: response.msg || "点赞失败", icon: "none" });
    }
  } catch (error) {
    console.error("点赞失败：", error);
    uni.showToast({ title: "网络错误，请重试", icon: "none" });
  }
};

// 追帖
const handleAppendPost = () => {
  const postData = { ...post.value };
  postData.issueno = postData.issueno || postData.period;
  forumToos.handleAppendPost(postData);
};

// 加载评论列表
const loadComments = async (reset = false) => {
  if (!post.value.id) {
    return;
  }

  if (reset) {
    commentPage.value = 1;
    commentNoMore.value = false;
    commentList.value = [];
    commentRefreshing.value = true;
  }

  if (commentLoading.value || commentNoMore.value) {
    return;
  }

  commentLoading.value = true;

  try {
    const response = await apiCommentList({
      postId: post.value.id,
      page: commentPage.value,
      limit: commentLimit,
    });

    if (response.code === 200) {
      const newComments = response.data?.list || response.data || [];
      commentTotal.value = response.data?.total || newComments.length;

      if (reset) {
        commentList.value = newComments;
      } else {
        commentList.value = [...commentList.value, ...newComments];
      }

      // 判断是否还有更多
      if (newComments.length < commentLimit) {
        commentNoMore.value = true;
      } else {
        commentPage.value++;
      }
    } else {
      if (!reset) {
        commentNoMore.value = true;
      }
    }
  } catch (error) {
    console.error("加载评论失败：", error);
    if (reset) {
      uni.showToast({ title: "加载评论失败", icon: "none" });
    }
  } finally {
    commentLoading.value = false;
    commentRefreshing.value = false;
  }
};

// 下拉刷新评论
const onCommentRefresh = () => {
  commentRefreshing.value = true;
  loadComments(true);
};

// 加载更多评论
const loadMoreComments = () => {
  if (!commentNoMore.value && !commentLoading.value) {
    loadComments(false);
  }
};

// 提交评论
const submitComment = async () => {
  const content = commentText.value.trim();
  if (!content) {
    return;
  }

  // 检查登录
  if (!tool.isLogin()) {
    return;
  }

  if (!post.value.id) {
    uni.showToast({ title: "帖子数据异常", icon: "none" });
    return;
  }

  try {
    const response = await addComment({
      postId: post.value.id,
      account: getAccount(),
      content: content,
    });

    if (response.code === 200) {
      uni.showToast({ title: "评论成功", icon: "success" });
      commentText.value = "";
      // 重新加载评论
      loadComments(true);
      // 更新评论数
      commentTotal.value = (commentTotal.value || 0) + 1;
      post.value.comments = (post.value.comments || 0) + 1;
    } else {
      uni.showToast({ title: response.msg || "评论失败", icon: "none" });
    }
  } catch (error) {
    console.error("评论失败：", error);
    uni.showToast({ title: "网络错误，请重试", icon: "none" });
  }
};

// 格式化评论时间
const formatCommentTime = (datestr) => {
  if (!datestr) return "";
  const timestamp = new Date(datestr).getTime();
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "刚刚";
  } else if (minutes < 60) {
    return `${minutes}分钟前`;
  } else if (hours < 24) {
    return `${hours}小时前`;
  } else if (days === 1) {
    return "昨天";
  } else if (days < 30) {
    return `${days}天前`;
  } else {
    const date = new Date(datestr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
};
</script>

<style scoped lang="scss">
.detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

/* ======== 帖子详情卡片 ======== */
.post-detail-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin: 20rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
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

.issue-time {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
  font-size: 32rpx;
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
  font-size: 36rpx;
  color: #333;
  white-space: pre-wrap;
  word-break: break-word;
}

/* 图片样式 */
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

/* 底部操作 */
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
}

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

/* ======== 评论标题 ======== */
.comment-title {
  padding: 20rpx 30rpx;
  display: flex;
  align-items: center;
  background-color: #ffffff;
  margin: 0 20rpx;
  border-radius: 16rpx 16rpx 0 0;
  border-bottom: 1rpx solid #eee;
}

.title-text {
  font-size: 30rpx;
  font-weight: bold;
  color: #333;
}

.title-count {
  font-size: 24rpx;
  color: #999;
  margin-left: 8rpx;
}

/* ======== 评论列表 ======== */
.comment-list {
  flex: 1;
  background-color: #ffffff;
  margin: 0 20rpx;
  border-radius: 0 0 16rpx 16rpx;
  padding: 0 30rpx;
}

.comment-items {
  padding-bottom: 20rpx;
}

.comment-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.comment-user-info {
  display: flex;
  align-items: center;
}

.comment-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 12rpx;
  background-color: #eee;
  flex-shrink: 0;
}

.comment-username {
  font-size: 26rpx;
  font-weight: bold;
  color: #333;
}

.comment-time {
  font-size: 22rpx;
  color: #999;
}

.comment-body {
  padding-left: 72rpx;
}

.comment-content {
  font-size: 28rpx;
  color: #333;
  line-height: 42rpx;
  word-break: break-word;
  white-space: pre-wrap;
}

.no-comments {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80rpx 0;
}

.no-comments-text {
  font-size: 28rpx;
  color: #999;
}

.loading-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

.loading-text {
  font-size: 24rpx;
  color: #999;
}

.no-more {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx 0;
}

.no-more-text {
  font-size: 24rpx;
  color: #ccc;
}

.comment-bottom-placeholder {
  height: 100rpx;
}

/* ======== 评论输入框 ======== */
.comment-input-bar {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #eee;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
}

.input-wrapper {
  flex: 1;
  background-color: #f5f5f5;
  border-radius: 40rpx;
  padding: 10rpx 24rpx;
  margin-right: 16rpx;
}

.comment-input {
  height: 60rpx;
  font-size: 26rpx;
  color: #333;
}

.send-btn {
  padding: 12rpx 32rpx;
  background-color: #28B389;
  border-radius: 40rpx;
  flex-shrink: 0;
}

.send-btn text {
  color: #ffffff;
  font-size: 26rpx;
  font-weight: 500;
}

.send-btn:active {
  opacity: 0.8;
}

.send-btn.disabled {
  background-color: #ccc;
  pointer-events: none;
}
</style>