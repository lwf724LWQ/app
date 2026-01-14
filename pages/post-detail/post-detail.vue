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

    <!-- 评论区 -->
    <view class="comments-section">
      <text class="comments-title">评论({{ comments.length }})</text>

      <!-- 评论列表 -->
      <view class="comment-list">
        <view class="comment-item" v-for="(comment, index) in comments" :key="index">
          <view class="comment-header">
            <text class="comment-author">{{ comment.author || "匿名用户" }}</text>
            <text class="comment-time">{{ comment.time }}</text>
          </view>
          <view class="comment-content">
            <text>{{ comment.content }}</text>
          </view>
        </view>

        <!-- 加载更多评论 -->
        <view class="loading-comments" v-if="loadingComments">加载中...</view>
      </view>
    </view>

    <!-- 评论输入区 -->
    <view class="comment-input-area" v-if="userInfo.account">
      <input
        class="comment-input"
        type="text"
        placeholder="请输入评论内容"
        v-model="newComment"
        @confirm="submitComment"
      />
      <view class="submit-btn" @click="submitComment">发送</view>
    </view>
  </my-page>
</template>

<script>
import mockData from "../index/mock.js";
import myPage from "../../components/myPage.vue";
import { useUserStore } from "@/stores/userStore";
export default {
  components: {
    myPage,
  },

  data() {
    return {
      postId: null,
      postDetail: {},
      newComment: "",
      loadingComments: false,
      currentPage: 1,
      comments: [], // 评论列表

      userInfo: {
        nickname: "",
        account: "",
      },
    };
  },
  onLoad(options) {
    // 获取帖子ID
    this.postId = options.id;
    console.log("帖子详情页加载，帖子ID:", this.postId);

    // 这里可以调用API获取帖子详情
    this.loadPostDetail();

    // 从本地存储加载该帖子的评论
    this.loadLocalComments();
  },
  methods: {
    // 返回上一页
    goBack() {
      uni.navigateBack({
        delta: 1,
      });
    },

    // 加载本地评论
    loadLocalComments() {
      const storedComments = uni.getStorageSync("post_comments") || {};
      const postIdComments = storedComments[this.postId] || [];

      // 将本地评论添加到评论列表开头（避免重复）
      postIdComments.forEach((localComment) => {
        const exists = this.comments.some(
          (comment) => comment.id === localComment.id && comment.local
        );
        if (!exists) {
          this.comments.unshift(localComment);
        }
      });
    },

    // 加载帖子详情
    loadPostDetail() {
      // 模拟API调用
      this.postDetail = mockData["鸡汤文章"][this.postId];

      // 加载帖子的评论
      if (this.postDetail.comments) {
        this.comments = [...this.postDetail.comments, ...this.comments];
      }
    },

    // 初始化评论数据
    initComments() {
      // 模拟一些评论数据
      this.comments = [];
    },

    // 提交评论
    async submitComment() {
      if (!this.newComment.trim()) {
        uni.showToast({
          title: "请输入评论内容",
          icon: "none",
        });
        return;
      }

      // 检查是否登录
      if (!this.userInfo.nickname) {
        // 显示确认弹窗
        uni.showModal({
          title: "提示",
          content: "当前未登录，您的评论会经由后台筛选发布，且名称为匿名",
          confirmText: "确认发布",
          cancelText: "取消",
          success: (res) => {
            if (res.confirm) {
              this.publishComment(true); // 以匿名方式发布
            }
          },
        });
      } else {
        this.publishComment(false); // 以登录用户身份发布
      }
    },

    // 发布评论
    publishComment(isAnonymous) {
      const commentData = {
        id: Date.now(), // 模拟ID
        author: isAnonymous ? "匿名用户" : this.userInfo.nickname,
        content: this.newComment,
        time: this.formatTime(new Date()),
      };

      // 添加到评论列表顶部
      this.comments.unshift(commentData);

      // 如果用户已登录，保存评论到本地存储
      if (this.userInfo.nickname) {
        const storedComments = uni.getStorageSync("post_comments") || {};
        const postIdComments = storedComments[this.postId] || [];

        // 将新评论添加到对应帖子的评论列表中
        postIdComments.unshift({
          ...commentData,
          local: true, // 标记为本地存储的评论
        });

        // 更新本地存储
        storedComments[this.postId] = postIdComments;
        uni.setStorageSync("post_comments", storedComments);
      }

      // 清空输入框
      this.newComment = "";

      // 显示成功提示
      uni.showToast({
        title: "评论提交成功",
        icon: "success",
      });
    },

    // 格式化时间
    formatTime(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}-${month}-${day} ${hours}:${minutes}`;
    },

    formatBody(str) {
      if (str instanceof Array) {
        return str.join("\n");
      }
      return str;
    },
  },
  mounted() {
    const userStore = useUserStore();
    this.userInfo = userStore.getUserInfo;
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
