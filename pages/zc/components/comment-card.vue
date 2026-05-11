<template>
  <view class="comment-card">
    <view class="card-main">
      <!-- 用户头像 -->
      <image class="avatar" :src="comment.userAvatar" mode="aspectFill" />

      <view class="content-box">
        <!-- 用户信息行 -->
        <view class="user-info">
          <text class="username">{{ comment.username }}</text>
        </view>

        <!-- 评论文本 -->
        <view class="text-content">
          {{ comment.text }}
        </view>

        <!-- 底部时间地点 -->
        <view class="footer-info">
          <text>{{ comment.date }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-card {
  background-color: #fff;
  padding: 15px 12px;
  border-bottom: 1px solid #f5f5f5;

  .card-main {
    display: flex;
    position: relative;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 10px;
  }

  .content-box {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .user-info {
    display: flex;
    align-items: center;
    font-size: 13px;
    margin-bottom: 4px;

    .username {
      font-weight: bold;
      margin-right: 6px;
    }

    .badge {
      padding: 0 4px;
      border-radius: 3px;
      font-size: 10px;
      margin-right: 4px;
      color: #fff;
    }
    .lv {
      background-color: #91c43c;
    }
    .v {
      background-color: #fbe212;
      color: #666;
    }

    .user-title {
      color: #666;
      margin: 0 6px;
    }
    .op-tag {
      color: #ff9800;
      font-size: 11px;
    }
  }

  .text-content {
    font-size: 15px;
    color: #333;
    line-height: 1.5;
    margin-bottom: 8px;
  }

  .footer-info {
    font-size: 12px;
    color: #999;
  }

  .action-area {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: space-between;
    height: 100%;

    .like-btn {
      display: flex;
      align-items: center;
      color: #666;
      font-size: 13px;
      .like-count {
        margin-left: 4px;
      }
    }
    .more-btn {
      color: #999;
      font-size: 18px;
      padding-top: 4px;
    }
  }
}
</style>
