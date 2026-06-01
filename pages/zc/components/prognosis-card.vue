<template>
  <view class="prognosis-card" @click="openDetail">
    <!-- 发布用户信息 -->
    <view class="user-info">
      <view class="user-avatar">
        <image :src="getFullHimgUrl(data.himg)" mode="aspectFill"></image>
        <view class="avatar-badge"></view>
      </view>
      <view class="user-detail">
        <view class="user-name">{{ data.uname }}</view>
        <view>
          <text class="user-time">{{ timeAgo }}</text>
          <text class="user-level">资深分析师</text>
        </view>
      </view>

      <!-- 准确率徽章 -->
      <view class="accuracy-badge" v-if="badgeData.length >= 4">
        <view class="accuracy-value">{{ rate }}%</view>
        <view class="accuracy-text">近{{ badgeData.length }}场准确率</view>
        <!-- <view class="accuracy-icon">🔥</view> -->
      </view>
    </view>

    <!-- 预测内容 -->
    <view class="prognosis-content">
      <view class="content-text">{{ data.title }}</view>
    </view>
    <!-- 近十场表现 -->
    <view class="prognosis-badge-detail" v-if="badgeData.length >= 4">
      <view
        class="badge-item"
        v-for="(item, index) in badgeData"
        :key="index"
        :class="{ 'badge-item-win': item }"
      >
        {{ item ? "L" : "W" }}
      </view>
    </view>

    <!-- 底部信息 -->
    <view class="prognosis-footer">
      <view class="prognosis-tags">
        <!-- <view class="tag tag-first">首购</view>
        <view class="tag tag-refund">不中退</view> -->
        <view class="tag tag-free" v-if="!data.flag">免费</view>
        <view class="tag tag-first" v-else>{{ data.price }}金币</view>
      </view>
      <view class="action-info">
        <view class="action-item" @click="onComment">
          <uni-icons class="icon-img" type="chat" size="16" />
          {{ data.count }}
        </view>
        <!-- <view class="action-item" @click="onLike">
          <uni-icons class="icon-img" type="hand-up" size="16" />
          999
        </view> -->
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
    badgeData: {
      type: Array,
      default: () => {
        return [];
      },
    },
  },
  data() {
    return {};
  },
  computed: {
    rate() {
      if (this.badgeData instanceof Array) {
        return (
          (this.badgeData.filter((item) => item).length / this.badgeData.length) *
          100
        ).toFixed(0);
      } else {
        return 0;
      }
    },
    // 计算xx分钟前
    timeAgo() {
      const create_time = this.data.create_time;
      return tool.getTimeAgo(create_time);
    },
  },
  methods: {
    getFullHimgUrl(himg) {
      if (typeof url === "string" && himg.startsWith("http")) {
        return himg
      }
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
    padding-bottom: 24rpx;

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
      .user-time {
        font-size: 24rpx;
        color: #222;
        margin-right: 12rpx;
      }
      .user-level {
        font-size: 24rpx;
        color: #222;
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
    padding: 10rpx;
    background: #f8f9fa;
    border-radius: 12rpx;
    margin-bottom: 24rpx;

    .content-text {
      font-size: 30rpx;
      color: #333;
      line-height: 1.6;
    }
  }

  .prognosis-badge-detail {
    display: flex;
    flex-direction: row;
    gap: 8rpx;
    padding: 0 12rpx;
    margin-bottom: 24rpx;
    .badge-item {
      width: 38rpx;
      height: 38rpx;
      background: #cfcfcf;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20rpx;
      color: #333;
      &.badge-item-win {
        color: #fff;
        background: #ff6b6b;
      }
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
        font-size: 28rpx;
        padding: 6rpx 16rpx;
        border-radius: 20rpx;
        font-weight: bold;

        &.tag-first {
          background: linear-gradient(135deg, #ff6e6e 0%, #ff5258 100%);
          color: #fff;
        }

        &.tag-refund {
          background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
          color: #fff;
        }

        &.tag-free {
          background: linear-gradient(135deg, #1fa63a 0%, #1fc36b 100%);
          color: #ffffff;
        }
      }
    }

    .action-info {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12rpx;
      font-size: 30rpx;
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
