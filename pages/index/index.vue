<template>
  <view class="container">
    <!-- 帖子列表 -->
    <scroll-view class="post-list" scroll-y="true" @scrolltolower="loadMore" :lower-threshold="20">
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
	
	
	<flipModal 
	      :show.sync="showModal"
	      title="确认操作"
	      @update:show="showModal = $event"
	    />
  </view>
</template>

<script>
	import mockData from "./mock.js"
	import flipModal from "./flip-modal.vue";
export default {
	components:{flipModal},
  data() {
    return {
      posts: mockData['鸡汤文章'],
      loading: false,
      noMore: false,
      currentPage: 1,
	  showModal: true
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
