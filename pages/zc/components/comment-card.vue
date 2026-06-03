<template>
  <view class="comment-card">
    <view class="card-main">
      <!-- 用户头像 -->
      <image
        class="avatar"
        :src="getFullImgUrl(comment.himg)"
        mode="aspectFill"
        @click="toUserDetail(comment)"
      />

      <view class="content-box">
        <!-- 用户信息行 -->
        <view class="user-info" @click="toUserDetail(comment)">
          <text class="username">{{ comment.uname }}</text>
        </view>

        <!-- 评论文本 -->
        <view class="text-content">
          {{ comment.text || comment.content }}
        </view>

        <!-- 底部时间地点 + 回复按钮 -->
        <view class="footer-info">
          <text>{{ getTimeAgo(comment.date || comment.createTime) }}</text>
          <view class="reply-btn" @click.stop="onReply">回复</view>
        </view>
      </view>
    </view>

    <!-- 二级评论列表 -->
    <view class="sub-comments" v-if="comment.child && comment.child.length">
      <view class="sub-comment-item" v-for="(child, cIdx) in displayedChildren" :key="cIdx">
        <image
          class="sub-avatar"
          :src="getFullImgUrl(child.himg)"
          mode="aspectFill"
          @click="toUserDetail(child)"
        />
        <view class="sub-content-box">
          <view class="sub-user-row">
            <text class="sub-username">{{ child.uname }}</text>
            <!-- <text
              v-if="child.replyToName"
              class="reply-target"
            >
              回复 {{ child.replyToName }}
            </text> -->
          </view>
          <view class="sub-text">{{ child.text || child.content }}</view>
          <view class="sub-footer">
            <text class="sub-time">{{ getTimeAgo(child.date || child.createTime) }}</text>
          </view>
        </view>
      </view>

      <!-- 展开/收起按钮 -->
      <view class="sub-expand-btn" v-if="hasMoreChildren" @click="toggleExpand">
        {{ expanded ? "收起" : `展开更多 (${remainingCount})` }}
      </view>
    </view>
  </view>
</template>

<script>
import tool from "@/utils/tool";
export default {
  props: {
    comment: {
      type: Object,
      required: true,
    },
    // 二级评论每页条数，默认3条
    subPageSize: {
      type: Number,
      default: 3,
    },
  },
  data() {
    return {
      expanded: false, // 是否已展开
    };
  },
  computed: {
    // 当前显示的二级评论列表
    displayedChildren() {
      const list = this.comment.child || [];
      if (this.expanded || list.length <= this.subPageSize) {
        return list;
      }
      return list.slice(0, this.subPageSize);
    },
    // 是否还有更多未显示
    hasMoreChildren() {
      const list = this.comment.child || [];
      return list.length > this.subPageSize;
    },
    // 剩余未显示条数
    remainingCount() {
      const list = this.comment.child || [];
      return list.length - this.subPageSize;
    },
  },
  methods: {
    getFullImgUrl(url) {
      return tool.oss.getFullUrl(`/himg/${url}`);
    },
    toggleExpand() {
      this.expanded = !this.expanded;
    },
    // 回复一级评论
    onReply() {
      this.$emit("reply", this.comment);
    },
    // 回复二级评论
    onReplyChild(child) {
      this.$emit("reply-child", {
        parent: this.comment,
        child: child,
      });
    },
    getTimeAgo(time) {
      return tool.getTimeAgo(time);
    },
    toUserDetail(item) {
      uni.navigateTo({
        url: `/pages/user/space?account=${item.account}`,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.comment-card {
  background-color: #fff;
  padding: 30rpx 24rpx;
  border-bottom: 2rpx solid #f5f5f5;

  .card-main {
    display: flex;
    position: relative;
  }

  .avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
  }

  .content-box {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .user-info {
    display: flex;
    align-items: center;
    font-size: 30rpx;
    margin-bottom: 8rpx;

    .username {
      font-weight: bold;
      margin-right: 12rpx;
    }

    .badge {
      padding: 0 8rpx;
      border-radius: 6rpx;
      font-size: 20rpx;
      margin-right: 8rpx;
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
      margin: 0 12rpx;
    }
    .op-tag {
      color: #ff9800;
      font-size: 22rpx;
    }
  }

  .text-content {
    font-size: 34rpx;
    color: #333;
    line-height: 1.5;
    margin-bottom: 16rpx;
  }

  .footer-info {
    font-size: 24rpx;
    color: #999;
    display: flex;
    align-items: center;
    justify-content: space-between;

    .reply-btn {
      color: #4a90e2;
      font-size: 28rpx;
      padding: 4rpx 12rpx;
    }
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
      font-size: 26rpx;
      .like-count {
        margin-left: 8rpx;
      }
    }
    .more-btn {
      color: #999;
      font-size: 36rpx;
      padding-top: 8rpx;
    }
  }

  // 二级评论区域
  .sub-comments {
    margin-top: 10rpx;
    margin-left: 20rpx;
    padding-left: 20rpx;
    background-color: #f8f9fa;
    border-radius: 6rpx;
    padding: 16rpx 20rpx;

    .sub-comment-item {
      display: flex;
      padding: 8rpx 0;
      border-bottom: 2rpx solid #eee;

      &:last-child {
        border-bottom: none;
      }

      .sub-avatar {
        width: 60rpx;
        height: 60rpx;
        border-radius: 50%;
        margin-right: 18rpx;
        flex-shrink: 0;
      }

      .sub-content-box {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .sub-user-row {
        font-size: 32rpx;
        margin-bottom: 8rpx;

        .sub-username {
          font-weight: bold;
          color: #333;
          margin-right: 12rpx;
        }

        .reply-target {
          color: #4a90e2;
          font-size: 26rpx;
        }
      }

      .sub-text {
        font-size: 30rpx;
        color: #333;
        line-height: 1.5;
        margin-bottom: 8rpx;
      }

      .sub-footer {
        font-size: 24rpx;
        color: #999;
        display: flex;
        align-items: center;
        justify-content: space-between;

        .reply-btn {
          color: #4a90e2;
          font-size: 22rpx;
          padding: 2rpx 12rpx;
        }
      }
    }

    .sub-expand-btn {
      text-align: center;
      padding: 12rpx 0;
      color: #4a90e2;
      font-size: 24rpx;
    }
  }
}
</style>
