<template>
  <view class="match-card" @click="toDetailPage">
    <!-- 顶部：联赛名称和时间 -->
    <view class="header">
      <text class="match-status"></text>
      <view class="league-name">{{ leagueName }}</view>
      <text class="match-time">{{ matchTime }}</text>
      <text class="match-status" :class="statusClass">{{ matchStatus }}</text>
    </view>

    <!-- 中间：主赛区 -->
    <view class="main-content">
      <view class="team-section left">
        {{ homeTeam }}
      </view>

      <view class="score-section" :class="{ 'no-score': !score }">
        <text class="score">{{ score || "VS" }}</text>
      </view>

      <view class="team-section right">
        {{ awayTeam }}
        <!-- 收藏功能 <view class="favorite-btn" @click="toggleFavorite" :class="{ active: isFavorite }">
          <text class="star-icon">☆</text>
        </view> -->
      </view>
    </view>

    <!-- 底部：详细数据 -->
    <view
      class="footer"
      v-if="
        homeCorners ||
        homeRedCards ||
        homeYellowCards ||
        awayCorners ||
        awayRedCards ||
        awayYellowCards ||
        halfTimeScore
      "
    >
      <!-- 主队数据 -->
      <view class="stat-group">
        <view class="stat-item red">{{ homeRedCards }}</view>
        <view class="stat-item yellow">{{ homeYellowCards }}</view>
        <view class="stat-item grey">
          {{ homeCorners }}
        </view>
      </view>

      <!-- 半场比分 -->
      <view class="half-time">半 {{ halfTimeScore }}</view>

      <!-- 客队数据 -->
      <view class="stat-group">
        <view class="stat-item grey">
          {{ awayCorners }}
        </view>
        <view class="stat-item yellow">{{ awayYellowCards }}</view>
        <view class="stat-item red">{{ awayRedCards }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    leagueName: { type: String },
    matchTime: { type: String },
    matchStatus: { type: String },
    homeTeam: { type: String },
    awayTeam: { type: String },
    score: { type: String },
    halfTimeScore: { type: String },
    homeRedCards: { type: Number },
    homeYellowCards: { type: Number },
    homeCorners: { type: Number },
    awayCorners: { type: Number },
    awayRedCards: { type: Number },
    awayYellowCards: { type: Number },
    matchId: { type: String },
  },
  data() {
    return {
      isFavorite: false,
    };
  },
  computed: {
    statusClass() {
      return this.matchStatus === "加时" ? "status-highlight" : "";
    },
    leagueColor() {
      return (
        {
          // 亚洲联赛
          澳超: "#FF6B00", // 活力橙
          沙职: "#006400", // 深绿色（沙特）

          // 欧洲五大联赛及次级
          英超: "#8B0000", // 深红色
          英冠: "#4169E1", // 皇家蓝（次级联赛用蓝色区分）
          西甲: "#E60026", // 西班牙红
          意甲: "#0066CC", // 蓝色
          德甲: "#DC143C", // 深红
          德乙: "#FFD700", // 金黄色（次级用亮色）
          法甲: "#0000CD", // 深蓝
          法乙: "#87CEEB", // 浅蓝（次级）
          葡超: "#008000", // 绿色（葡萄牙国旗绿）

          // 荷兰联赛
          荷甲: "#FF8C00", // 深橙色（荷兰传统）
          荷乙: "#FFB84D", // 浅橙色（次级）

          // 杯赛
          欧罗巴: "#FF4500", // 橙红色（欧联杯）
          欧协联: "#228B22", // 森林绿（欧协联）
          解放者杯: "#FFD700", // 金色（南美解放者杯奖杯色）

          // 其他
          芬超: "#00BFFF", // 天蓝色（芬兰）
          中超: "#E91E63", // 原有粉色保留
          默认: "#666666", // 灰色兜底
        }[this.leagueName] || "#666666"
      );
    },
  },
  methods: {
    toggleFavorite() {
      this.isFavorite = !this.isFavorite;
      this.$emit("favorite", this.isFavorite);
    },
    toDetailPage() {
      uni.navigateTo({
        url: "/pages/zc/match-detail?id=" + this.matchId,
      });
    },
  },
};
</script>

<style scoped lang="scss">
.match-card {
  background-color: #fff;
  padding: 15rpx 10rpx;
  border-bottom: 1rpx solid #f0f0f0;
  font-family: Arial, sans-serif;
}

.header,
.main-content,
.footer {
  display: flex;
  align-items: center;
  font-size: 24rpx;
  position: relative;

  & > :first-child,
  & > :last-child {
    flex: 1;
  }
  & > :first-child {
    text-align: right;
    justify-content: flex-end;
  }
  & > :last-child {
    text-align: left;
  }
}

.league-name {
  position: absolute;
  left: 20rpx;
  color: #5c5c5c;
}

.match-time {
  color: #999;
  text-align: center;
  margin: 0 20rpx;
}

.match-status {
  color: #999;
}

.status-highlight {
  color: #4caf50; /* 绿色 */
  font-weight: bold;
}

.team-section {
  display: flex;
  align-items: center;
  flex: 1;

  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.league-icon {
  width: 30rpx;
  height: 30rpx;
  margin-right: 10rpx;
}

.score-section {
  margin: 0 20rpx;
  text-align: center;
  &.no-score .score {
    color: #4caf50;
  }
}

.score {
  font-size: 36rpx;
  font-weight: 800;
  color: #ff4d4f;
}

.favorite-btn {
  margin-left: 15rpx;
  font-size: 40rpx;
  color: #ff4d4f;
  cursor: pointer;
}

.favorite-btn.active {
  color: #ff4d4f;
}

.footer {
  // display: flex;
  // justify-content: space-between;
  // align-items: center;
  font-size: 24rpx;
  color: #999;
}

.stat-group {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.stat-item {
  padding: 2rpx 8rpx;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-item.red {
  background-color: #ff4d4f;
  color: white;
}

.stat-item.yellow {
  background-color: #ffeb3b;
  color: #333;
}

.stat-item.grey {
  background-color: transparent;
}

.corner-icon {
  font-size: 20rpx;
  margin-right: 2rpx;
}

.half-time {
  font-size: 24rpx;
  color: #999;
}
</style>
