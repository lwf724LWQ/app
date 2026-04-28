<template>
  <view class="match-head" v-if="data">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="nav-left" @click="goBack">
        <uni-icons class="back-icon" color="#333" type="back" size="20"></uni-icons>
      </view>
      <view class="nav-title">
        <text class="home-name">{{ data.htname }}</text>
        <text class="vs-text">VS</text>
        <text class="away-name">{{ data.atname }}</text>
      </view>
      <view class="nav-right"></view>
      <!-- 占位，保持标题绝对居中 -->
    </view>

    <!-- 核心比赛信息区 -->
    <view class="match-content">
      <!-- 左侧主队 -->
      <view class="team-box left">
        <view class="team-logo-placeholder">
          <!-- 如果有 logo 可以解开下面的注释，没有则显示首字母或留空 -->
          <!-- <image class="logo-img" :src="data.homeTeamLogoPath" mode="aspectFill"></image> -->
          <text class="team-initial">{{ getInitial(data.htname) }}</text>
        </view>
        <view class="team-name">{{ data.htname }}</view>
        <!-- <view class="team-rank">
          <text class="phase">{{ data.phaseName }}</text>
          <text class="rank-num">第{{ data.wbsjStats.home.ranking }}名</text>
        </view> -->
      </view>

      <!-- 中间比分与信息 -->
      <view class="score-box">
        <!-- <view class="score-num">{{ data.fullCourtGoal }}</view> -->
        <view class="league-name">{{ data.abbName }}</view>
        <view class="match-time">{{ data.numStr }} - {{ data.mtime }}</view>
      </view>

      <!-- 右侧客队 -->
      <view class="team-box right">
        <view class="team-logo-placeholder">
          <!-- <image class="logo-img" :src="data.awayTeamLogoPath" mode="aspectFill"></image> -->
          <text class="team-initial">{{ getInitial(data.atname) }}</text>
        </view>
        <view class="team-name">{{ data.atname }}</view>
        <!-- <view class="team-rank">
          <text class="phase">{{ data.phaseName }}</text>
          <text class="rank-num">第{{ data.wbsjStats.away.ranking }}名</text>
        </view> -->
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    // 辅助方法：获取队名首字母作为默认头像
    getInitial(name) {
      if (!name) return "";
      return name.charAt(0);
    },
  },
};
</script>

<style lang="scss" scoped>
.match-head {
  width: 100%;
  // 背景图设置，增加了一个半透明白色遮罩层，防止背景太花看不清字
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.4)),
    url("../../static/images/zq/detail-top-bg.png") no-repeat center top;
  background-size: cover;
  padding-top: var(--status-bar-height);
  padding-bottom: 30rpx;
  box-sizing: border-box;
}

/* --- 导航栏样式 --- */
.navbar {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  position: relative;

  .nav-left,
  .nav-right {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10;
  }

  .nav-title {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    white-space: nowrap;

    .home-name,
    .away-name {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
      max-width: 200rpx;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .vs-text {
      font-size: 24rpx;
      color: #999;
      margin: 0 16rpx;
      font-weight: normal;
    }
  }
}

/* --- 核心内容区样式 --- */
.match-content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 20rpx 40rpx;
  margin-top: 10rpx;

  /* 左右队伍区域 */
  .team-box {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    .team-logo-placeholder {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      overflow: hidden;

      .logo-img {
        width: 100%;
        height: 100%;
      }

      .team-initial {
        font-size: 36rpx;
        font-weight: bold;
        color: #666;
      }
    }

    .team-name {
      font-size: 34rpx;
      font-weight: 700;
      color: #333;
      margin-bottom: 8rpx;
      /* 关键：文字阴影，模仿截图效果，增加清晰度 */
      text-shadow: 0 2rpx 4rpx rgba(255, 255, 255, 0.8);
      line-height: 1.2;
      // 防止队名太长换行难看
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .team-rank {
      font-size: 24rpx;
      color: #666;
      background: rgba(255, 255, 255, 0.6);
      padding: 4rpx 12rpx;
      border-radius: 20rpx;
      display: flex;
      flex-direction: column;
      line-height: 1.4;

      .phase {
        font-size: 22rpx;
        color: #888;
      }
      .rank-num {
        font-weight: 600;
        color: #ff6b00; /* 排名用亮色突出 */
      }
    }
  }

  /* 中间比分区域 */
  .score-box {
    flex: 1.2; /* 中间稍微宽一点 */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;

    .score-num {
      font-size: 64rpx;
      font-weight: 800;
      color: #333;
      font-family: "DIN Alternate", "Arial Narrow", sans-serif; /* 使用窄字体让数字更紧凑 */
      line-height: 1;
      margin-bottom: 12rpx;
      text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
    }

    .league-name {
      font-size: 26rpx;
      color: #555;
      font-weight: 600;
      margin-bottom: 6rpx;
      background: rgba(255, 255, 255, 0.5);
      padding: 2rpx 10rpx;
      border-radius: 4rpx;
    }

    .match-time {
      font-size: 22rpx;
      color: #999;
      font-family: monospace; /* 时间用等宽字体更像数字时钟 */
    }
  }
}
</style>
