<template>
  <my-page pageTitle="帖子详情">
    <!-- 帖子主体 -->
    <view class="post-card">
      <view class="post-header">
        <view class="author-info">
          <text class="author-name">{{ postDetail.title }}</text>
        </view>
        <view class="post-stats"></view>
      </view>

      <view class="post-body">
        <text class="post-text">{{ formatBody(postDetail.body) }}</text>
      </view>
    </view>
  </my-page>
</template>

<script>
	import mockData from "../index/mock.js"
import myPage from "../../components/myPage.vue";
export default {
  components: {
    myPage,
  },

  data() {
    return {
      postId: null,
      postDetail: {
      },
      newComment: "",
      loadingComments: false,
      currentPage: 1,
    };
  },
  onLoad(options) {
    // 获取帖子ID
    this.postId = options.id;
    console.log("帖子详情页加载，帖子ID:", this.postId);

    // 这里可以调用API获取帖子详情
    this.loadPostDetail();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
      });
    },

    // 加载帖子详情
    loadPostDetail() {
      // 模拟API调用
      this.postDetail = mockData['鸡汤文章'][this.postId]
    },
	formatBody(str){
		if(str instanceof Array){
			return str.join('\n')
		}
		return str
	}
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

.header {
  width: 100%;
  height: 88rpx;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  position: fixed;
  top: 0;
  z-index: 999;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);

  .back-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;

    .back-icon {
      font-size: 36rpx;
      color: #007aff;
    }
  }

  .header-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
  }

  .placeholder {
    width: 60rpx;
    height: 60rpx;
  }
}

.content-area {
  flex: 1;
  margin-top: 88rpx;
  padding: 20rpx;
}

.post-card {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
	height: 100%;
  .post-header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 30rpx;

    .author-info {
      flex: 1;

      .author-name {
        font-size: 32rpx;
        color: #333;
        font-weight: bold;
        display: block;
      }

      .post-time {
        font-size: 24rpx;
        color: #999;
        display: block;
      }
    }

    .post-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;

      .like-count,
      .comment-count {
        font-size: 24rpx;
        color: #999;
        margin-bottom: 10rpx;
      }
    }
  }

  .post-body {
    .post-text {
      font-size: 32rpx;
      color: #333;
      line-height: 50rpx;
      text-align: justify;
      white-space: pre-line; // 保留换行符
    }
  }
}

.comments-section {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);

  .comments-title {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
    display: block;
    margin-bottom: 30rpx;
  }

  .comment-list {
    .comment-item {
      padding: 30rpx 0;
      border-bottom: 1rpx solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .comment-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20rpx;

        .comment-author {
          font-size: 28rpx;
          color: #333;
          font-weight: bold;
        }

        .comment-time {
          font-size: 24rpx;
          color: #999;
        }
      }

      .comment-content {
        font-size: 28rpx;
        color: #333;
        line-height: 42rpx;
        margin-bottom: 20rpx;
        text-align: justify;
      }

      .comment-actions {
        display: flex;
        justify-content: flex-end;

        .like-btn,
        .reply-btn {
          font-size: 24rpx;
          color: #999;
          margin-left: 30rpx;
          padding: 10rpx 20rpx;
          border: 1rpx solid #eee;
          border-radius: 10rpx;
        }

        .like-btn {
          &:active {
            background-color: #f0f0f0;
          }
        }
      }
    }
  }

  .loading-comments {
    text-align: center;
    padding: 30rpx;
    color: #999;
    font-size: 28rpx;
  }
}

.comment-input-area {
  width: 100%;
  height: 100rpx;
  background-color: #fff;
  display: flex;
  align-items: center;
  padding: 0 20rpx;
  border-top: 1rpx solid #eee;

  .comment-input {
    flex: 1;
    height: 60rpx;
    background-color: #f5f5f5;
    border-radius: 30rpx;
    padding: 0 30rpx;
    font-size: 28rpx;
    color: #333;
  }

  .submit-btn {
    width: 80rpx;
    height: 60rpx;
    background-color: #007aff;
    color: #fff;
    font-size: 24rpx;
    border-radius: 10rpx;
    margin-left: 20rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
