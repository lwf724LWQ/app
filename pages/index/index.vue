<template>
  <view class="container">
    <!-- 通知横幅 -->
    <view class="notice-banner">
      <uni-icons type="sound" size="32" color="#FF8C00"></uni-icons>
      <text class="notice-text">【2025 国庆总结通知】</text>
      <text class="notice-new">NEW</text>
      <!-- <uni-icons type="right" size="28" color="#999"></uni-icons> -->
    </view>

    <!-- 功能图标区 - 15个图标网格 -->
    <view class="function-area">
      <view class="function-grid">
        <!-- 第一行 -->
        <view class="icon-item" @click="drawGui">
          <uni-icons type="compose" size="20" color="#4A90E2"></uni-icons>
          <text>画规</text>
        </view>
        <view class="icon-item" @click="toChangtiao">
          <uni-icons type="bars" size="20" color="#4A90E2"></uni-icons>
          <text>长条</text>
        </view>
        <!-- <view class="icon-item">
          <image src="/static/icons/font.png" mode="aspectFit"></image>
          <text>云规</text>
        </view>
        <view class="icon-item">
          <image src="/static/icons/card.png" mode="aspectFit"></image>
          <text>统计</text>
        </view>
        <view class="icon-item">
          <image src="/static/icons/button.png" mode="aspectFit"></image>
          <text class="leng3">智能规</text>
        </view> -->
        <!-- 第二行 -->
        <view class="icon-item" @click="goToLive">
          <uni-icons type="videocam" size="20" color="#4A90E2"></uni-icons>
          <text>开奖直播</text>
        </view>
        <!-- <view class="icon-item">
          <image src="/static/icons/badge.png" mode="aspectFit"></image>
          <text>大师榜单</text>
        </view>
        <view class="icon-item">
          <image src="/static/icons/card.png" mode="aspectFit"></image>
          <text>大师统计</text>
        </view>
        <view class="icon-item">
          <image src="/static/icons/fav.png" mode="aspectFit"></image>
          <text>奖表统计</text>
        </view>
        <view class="icon-item">
          <image src="/static/icons/search-bar.png" mode="aspectFit"></image>
          <text>奖表查询</text>
        </view> -->
        <!-- 第三行 -->
        <view class="icon-item" @click="goToDreamInterpretation">
          <uni-icons type="chat" size="20" color="#4A90E2"></uni-icons>
          <text>解梦</text>
        </view>
        <!-- <view class="icon-item">
          <image src="/static/icons/collapse.png" mode="aspectFit"></image>
          <text class="leng3">过滤王</text>
        </view> -->
        <view class="icon-item" @click="goToSearchuser">
          <uni-icons type="search" size="20" color="#4A90E2"></uni-icons>
          <text>彩友搜索</text>
        </view>
        <!-- <view class="icon-item icon-item-message">
          <image src="/static/icons/color.png" mode="aspectFit"></image>
          <text>我的消息</text>
          <view class="message-badge">1</view>
        </view> -->
        <!-- <view class="icon-item">
          <image src="/static/icons/grid.png" mode="aspectFit"></image>
          <text>全部</text>
        </view> -->
      </view>
    </view>

    <!-- <PrivacyPolicyModal :visible="true"></PrivacyPolicyModal> -->
    <bottomBar current-path="/pages/index/index" />

    <flipModal :show.sync="showModal" title="确认操作" @update:show="showModal = $event" />
  </view>
</template>

<script>
import mockData from "./mock.js";
import flipModal from "./flip-modal.vue";
export default {
  components: { flipModal },
  data() {
    return {
      posts: mockData["鸡汤文章"],
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
  methods: {
    // 跳转到帖子详情页
    goToPostDetail(postId) {
      uni.navigateTo({
        url: `/pages/post-detail/post-detail?id=${postId}`,
      });
    },

    // 加载更多帖子
    loadMore() {
      if (this.loading || this.noMore) return;

      this.loading = true;

      // 模拟异步加载数据
      setTimeout(() => {
        const newPosts = [
          {
            id: this.posts.length + 1,
            author: `用户${String.fromCharCode(65 + this.posts.length)}`,
            time: `${this.posts.length + 1}小时前`,
            content: `这是第${
              this.posts.length + 1
            }个帖子的内容，展示更多的帖子信息，让页面看起来更丰富。`,
            commentCount: Math.floor(Math.random() * 20),
            likeCount: Math.floor(Math.random() * 50),
          },
          {
            id: this.posts.length + 2,
            author: `用户${String.fromCharCode(65 + this.posts.length + 1)}`,
            time: `${this.posts.length + 2}小时前`,
            content: `这是第${
              this.posts.length + 2
            }个帖子的内容，继续展示更多的帖子信息，让页面看起来更丰富。`,
            commentCount: Math.floor(Math.random() * 20),
            likeCount: Math.floor(Math.random() * 50),
          },
        ];

        this.posts = [...this.posts, ...newPosts];
        this.currentPage++;

        // 模拟没有更多数据的情况
        if (this.currentPage >= 5) {
          this.noMore = true;
        }

        this.loading = false;
      }, 1000);
    },
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
</style>
