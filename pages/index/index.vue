<template>
  <view class="container">
    <!-- 帖子列表 -->
    <scroll-view class="post-list" scroll-y="true" :lower-threshold="20">
      <view
        class="post-item"
        v-for="(post, index) in posts"
        :key="post.id"
        @click="goToPostDetail(index)"
      >
        <view class="post-header">
          <text class="author">{{ post.title }}</text>
          <text class="time">{{ post.time }}</text>
        </view>
        <text class="post-content">{{ post.introduction }}</text>
        <!-- 添加点赞数显示 -->
        <view class="post-footer">
          <text class="comment-count">💬 {{ post.comments ? post.comments.length : 0 }}</text>
          <text class="like-count">👍 {{ post.likes || 0 }}</text>
        </view>
      </view>

      <!-- 加载更多提示 -->
      <view class="loading" v-if="loading">
        <text>加载中...</text>
      </view>

      <!-- 没有更多数据提示 -->
      <view class="no-more" v-if="noMore">
        <text>没有更多了</text>
      </view>
    </scroll-view>

    <flipModal :show.sync="showModal" title="确认操作" @update:show="showModal = $event" />
    <updateAppPupop ref="updateAppPupopRef" />

    <ActivityHover src="/static/images/activity-invite.png" @click="share"></ActivityHover>
  </view>
</template>

<script>
import mockData from "./mock.js";
import flipModal from "./flip-modal.vue";
import updateAppPupop from "@/components/updateApp-pupop/updateApp-pupop.vue";
export default {
  components: { flipModal, updateAppPupop },
  data() {
    return {
      posts: [],
      loading: false,
      noMore: false,
      currentPage: 1,
      showModal: true,
    };
  },
  onLoad() {
    // 页面加载时的初始化
    console.log("帖子首页加载");
  },
  onShow() {
    // 页面显示时刷新列表，包括更新本地评论数量
    // this.updateLocalComments();
    this.fetchPosts();
  },
  methods: {
    // 获取帖子列表数据
    fetchPosts() {
      // 从mock数据获取基础帖子信息
      const mockPosts = mockData["鸡汤文章"];

      // 获取本地存储的评论和点赞数据
      const storedComments = uni.getStorageSync("post_comments") || {};
      const storedLikes = uni.getStorageSync("post_likes") || {};

      // 合并本地评论数量和点赞数量到帖子数据
      this.posts = mockPosts.map((post, index) => {
        // 获取本地评论数量
        const localCommentsCount = (storedComments[index] || []).length;
        // 获取本地点赞数量
        const localLikesCount = (storedLikes[index] || []).length;

        return {
          ...post,
          id: index, // 添加索引作为ID
          // 合并本地评论数量（如果有原始评论则加上本地评论数，否则仅显示本地评论数）
          comments: [
            ...(post.comments || []),
            // 添加标记为本地的评论，便于区分
            ...(storedComments[index] || []).map((comment) => ({ ...comment, local: true })),
          ],
          // 合并本地点赞数量
          likes: (post.likes || 0) + localLikesCount,
        };
      });
    },

    // 更新本地评论（保持原有方法）
    updateLocalComments() {
      // 获取本地存储的评论
      const storedComments = uni.getStorageSync("post_comments") || {};
      const storedLikes = uni.getStorageSync("post_likes") || {};

      // 更新每个帖子的评论和点赞总数
      this.posts = this.posts.map((post, index) => {
        const localCommentsCount = (storedComments[index] || []).length;
        const localLikesCount = (storedLikes[index] || []).length;

        return {
          ...post,
          id: index,
          // 包含本地评论在内的总评论数
          comments: [
            ...(post.comments || []),
            ...(storedComments[index] || []).map((comment) => ({ ...comment, local: true })),
          ],
          // 包含本地点赞在内的总点赞数
          likes: (post.likes || 0) + localLikesCount,
        };
      });
    },

    // 跳转到帖子详情页
    goToPostDetail(postId) {
      uni.navigateTo({
        url: `/pages/post-detail/post-detail?id=${postId}`,
      });
    },
  },
  mounted() {
    this.$refs.updateAppPupopRef.check();
  },
};
</script>

<style lang="scss">
page {
  background-color: #f5f5f5;
}

.container {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.post-list {
  margin-top: var(--status-bar-height);
  flex: 1;
  padding: 20rpx;

  box-sizing: border-box;
}

.post-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);

  .post-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .author {
      font-size: 30rpx;
      color: #333;
      font-weight: bold;
    }

    .time {
      font-size: 24rpx;
      color: #999;
    }
  }

  .post-content {
    font-size: 32rpx;
    color: #333;
    line-height: 48rpx;
    margin-bottom: 20rpx;
    text-align: justify;
  }

  .post-footer {
    display: flex;
    justify-content: space-between;
    border-top: 1rpx solid #eee;
    padding-top: 20rpx;

    .comment-count,
    .like-count {
      font-size: 24rpx;
      color: #999;
    }
  }
}

.loading,
.no-more {
  text-align: center;
  padding: 30rpx;
  color: #999;
  font-size: 28rpx;
}
.notice-banner-swiper {
  margin: 10rpx 0;
  height: 105rpx;
}
</style>
