<template>
  <view class="prognosis-card" @click="openDetail">
    <!-- 顶部装饰条 -->
    <view class="card-decoration"></view>

    <!-- 发布用户信息 -->
    <view class="user-info">
      <view class="user-avatar">
        <image :src="getFullHimgUrl(data.himg)" mode="aspectFill"></image>
        <view class="avatar-badge"></view>
      </view>
      <view class="user-detail">
        <view class="user-name">{{ data.uname }}</view>
        <view class="user-level">资深分析师</view>
      </view>

      <!-- 准确率徽章 -->
      <view class="accuracy-badge">
        <view class="accuracy-value">100%</view>
        <view class="accuracy-text">近10场准确率</view>
        <view class="accuracy-icon">🔥</view>
      </view>
    </view>

    <!-- 预测内容 -->
    <view class="prognosis-content">
      <view class="content-text">{{ data.title }}</view>
    </view>

    <!-- 底部信息 -->
    <view class="prognosis-footer">
      <view class="prognosis-tags">
        <!-- <view class="tag tag-first">首购</view>
        <view class="tag tag-refund">不中退</view> -->
        <view class="tag tag-free" v-if="!data.flag">免费</view>
        <view class="tag tag-first" v-else>{{ data.price }}金币</view>
      </view>

      <view class="user-time">
        <text class="time-icon">🕐</text>
        <text>发布于{{ data.create_time }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import tool from "@/utils/tool.js";
export default {
  props: {
    data: {
      type: Object,
      default: () => {
        return {};
      },
    },
  },
  methods: {
    getFullHimgUrl(himg) {
      return tool.oss.getFullUrl(`/himg/${himg}`);
    },
    openDetail() {
      this.$emit("openDetail", this.data);
    },
  },
};
</script>

<style lang="scss">
.prognosis-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%);
  border-radius: 16rpx;
  padding: 24rpx;
  margin-top: 20rpx;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
  border: 1rpx solid rgba(0, 0, 0, 0.05);

  // 顶部装饰条
  .card-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6rpx;
    background: linear-gradient(90deg, #ff6b6b 0%, #ff8e53 50%, #ffd93d 100%);
  }

  .user-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 24rpx;
    border-bottom: 1rpx solid #f0f0f0;

    .user-avatar {
      width: 88rpx;
      height: 88rpx;
      border-radius: 50%;
      overflow: hidden;
      border: 3rpx solid #fff;
      box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.12);
      margin-right: 20rpx;
      position: relative;

      image {
        width: 100%;
        height: 100%;
      }

      .avatar-badge {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 24rpx;
        height: 24rpx;
        background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
        border-radius: 50%;
        border: 2rpx solid #fff;
      }
    }

    .user-detail {
      flex: 1;
      .user-name {
        font-size: 32rpx;
        font-weight: 600;
        color: #333;
        margin-bottom: 6rpx;
      }
      .user-level {
        font-size: 22rpx;
        color: #999;
        background: #f5f5f5;
        padding: 4rpx 12rpx;
        border-radius: 20rpx;
        display: inline-block;
      }
    }

    // 准确率徽章
    .accuracy-badge {
      background: linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%);
      border: 2rpx solid #ff6b6b;
      border-radius: 16rpx;
      padding: 12rpx 20rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: "";
        position: absolute;
        top: -50%;
        right: -50%;
        width: 100%;
        height: 100%;
        background: radial-gradient(circle, rgba(255, 107, 107, 0.1) 0%, transparent 70%);
        animation: pulse 2s infinite;
      }

      .accuracy-value {
        font-size: 40rpx;
        font-weight: 800;
        color: #ff6b6b;
        line-height: 1;
        position: relative;
        z-index: 1;
      }

      .accuracy-text {
        font-size: 20rpx;
        color: #ff8e8e;
        margin-top: 4rpx;
        position: relative;
        z-index: 1;
      }

      .accuracy-icon {
        position: absolute;
        top: 4rpx;
        right: 8rpx;
        font-size: 24rpx;
        animation: fire 1s infinite;
      }
    }
  }

  .prognosis-content {
    margin-bottom: 24rpx;
    padding: 20rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    border-left: 4rpx solid #ff6b6b;

    .content-text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.6;
    }
  }

  .prognosis-footer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    .prognosis-tags {
      display: flex;
      flex-direction: row;
      gap: 12rpx;

      .tag {
        font-size: 22rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-weight: 500;

        &.tag-first {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #fff;
        }

        &.tag-refund {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: #fff;
        }

        &.tag-free {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #fff;
        }
      }
    }

    .user-time {
      font-size: 24rpx;
      color: #999;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 6rpx;

      .time-icon {
        font-size: 26rpx;
      }
    }
  }
}

// 动画
@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes fire {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}
</style>
