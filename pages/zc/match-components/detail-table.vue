<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">近期战绩</text>
      <view class="filter-buttons">
        <view class="filter-btn">同主客</view>
        <view class="filter-btn">同赛事</view>
        <view class="filter-btn active">近10场</view>
        <view class="filter-btn">近20场</view>
      </view>
    </view>

    <!-- 筛选区域 -->
    <view class="filter-section">
      <view class="toggle-buttons">
        <view class="toggle-btn">36</view>
        <view class="toggle-btn">初盘</view>
      </view>
      <view class="toggle-buttons">
        <view
          class="toggle-btn"
          :class="{ active: !isHalf }"
          @click="isHalf = false"
          >全场</view
        >
        <view
          class="toggle-btn"
          :class="{ active: isHalf }"
          @click="isHalf = true"
          >半场</view
        >
      </view>
    </view>

    <!-- 数据统计 -->
    <view class="stats">
      <!-- <view class="team-logo">
        <image src="/static/team-logo.png" class="logo"></image>
      </view> -->
      <view class="stats-text">
        <text class="stat-item">胜率<text class="highlight">50%</text></text>
        <text class="stat-item">赢率<text class="highlight">60%</text></text>
        <text class="stat-item">大率<text class="highlight">50%</text></text>
        <text class="stat-item">角大率<text class="highlight">60%</text></text>
        <text class="stat-item">单球率<text class="highlight">30%</text></text>
      </view>
      <view class="additional-stats">
        <text
          >5胜4平1负 场均进球<text class="highlight">2.1</text>个 场均失球<text
            class="highlight"
            >1.2</text
          >个</text
        >
      </view>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell date">日期/赛事</view>
        <view class="header-cell team main-team">主队</view>
        <view class="header-cell score">比分</view>
        <view class="header-cell team sub-team">客队</view>
        <view class="header-cell">让球</view>
        <view class="header-cell">进球数</view>
        <view class="header-cell">角球</view>
      </view>

      <view class="table-row" v-for="(match, index) in matches" :key="index">
        <view class="cell date">
          <text class="date-text">{{ match.date }}</text>
          <text class="league">{{ match.league }}</text>
        </view>
        <view class="cell team main-team">
          <template v-if="isHalf">
            <text :class="['team-name', match.homeTeamClass]">{{
              match.homeTeam
            }}</text>
          </template>

          <template v-else>
            <text :class="['team-name', match.homeTeamClass]">{{
              match.homeTeam
            }}</text>
            <text class="score-change" v-if="match.homeScoreChange">{{
              match.homeScoreChange
            }}</text>
          </template>
        </view>
        <view class="cell score">
          <template v-if="isHalf">
            <text>{{ match.halfScore }}</text>
          </template>
          <template v-else>
            <text>{{ match.score }}</text>
            <text class="half-score" v-if="match.halfScore"
              >({{ match.halfScore }})</text
            >
          </template>
        </view>
        <view class="cell team sub-team">
          <template v-if="isHalf">
            <text class="team-name">{{ match.awayTeam }}</text>
          </template>
          <template v-else>
            <text :class="['team-name', match.awayTeamClass]">{{
              match.awayTeam
            }}</text>
            <text class="score-change" v-if="match.awayScoreChange">{{
              match.awayScoreChange
            }}</text>
          </template>
        </view>
        <view class="cell">
          <!-- 让球 输赢 -->
          <view class="cell-top" :class="`cell-${match.oddsClass}`">{{
            match.odds
          }}</view>
          <view class="cell-bottom" :class="`cell-${match.oddsResultClass}`">{{
            match.isWin ? "赢" : "输"
          }}</view>
        </view>
        <view class="cell">
          <!-- 进球数 -->
          <view class="cell-top" :class="`cell-${match.goalsClass}`">{{
            match.goals
          }}</view>
          <view class="cell-bottom" :class="`cell-${match.goalsResultClass}`">{{
            match.goalsResult
          }}</view>
        </view>
        <view class="cell">
          <view class="cell-top" :class="`cell-${match.cornersClass}`">{{
            match.corners
          }}</view>
          <view
            class="cell-bottom"
            :class="`cell-${match.cornersResultClass}`"
            >{{ match.cornersResult }}</view
          >
        </view>
      </view>
    </view>
  </view>
</template>
  
<script>
export default {
  data() {
    return {
      isHalf: false,

      matches: [
        {
          date: "25-12-07",
          league: "墨西联",
          homeTeam: "老虎大学",
          homeTeamClass: "home-team",
          homeScoreChange: "↓7",
          score: "1-1",
          halfScore: "1-0",
          awayTeam: "蓝十字",
          awayTeamClass: "away-team",
          awayScoreChange: "↓6",
          odds: "0.5",
          oddsClass: "green",
          goals: "2.5/3",
          goalsClass: "green",
          goalsResult: "小",
          corners: "9.5",
          cornersClass: "red",
          cornersResult: "大",
          cornersResultClass: "red",
          isWin: true,
          oddsResultClass: "red",
          goalsResultClass: "green",
        },
        {
          date: "25-12-04",
          league: "墨西联",
          homeTeam: "蓝十字",
          homeTeamClass: "home-team",
          homeScoreChange: "↓6",
          score: "1-1",
          halfScore: "0-0",
          awayTeam: "老虎大学",
          awayTeamClass: "away-team",
          awayScoreChange: "↑1",
          odds: "0/0.5",
          oddsClass: "red",
          goals: "2.5/3",
          goalsClass: "green",
          goalsResult: "小",
          corners: "9.5",
          cornersClass: "green",
          cornersResult: "大",
          cornersResultClass: "red",
          isWin: false,
          oddsResultClass: "red",
          goalsResultClass: "green",
        },
        {
          date: "25-11-30",
          league: "墨西联",
          homeTeam: "老虎大学",
          homeTeamClass: "home-team",
          homeScoreChange: "↓8",
          score: "5-0",
          halfScore: "3-0",
          awayTeam: "蒂华纳",
          awayTeamClass: "away-team",
          awayScoreChange: "↓2",
          odds: "1.5/2",
          oddsClass: "red",
          goals: "3.5",
          goalsClass: "red",
          goalsResult: "大",
          corners: "9.5",
          cornersClass: "red",
          cornersResult: "大",
          cornersResultClass: "red",
          isWin: false,
          oddsResultClass: "red",
          goalsResultClass: "green",
        },
      ],
    };
  },
};
</script>
  
<style scoped lang="scss">
@import url("./table.scss");
.detail-container {
  background-color: #121212;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
}

.title {
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
}

.filter-buttons {
  display: flex;
  gap: 10rpx;
  font-size: 22rpx;
}

.filter-btn {
  padding: 10rpx 20rpx;
  border-radius: 20rpx;
  background-color: #333333;
  color: #ffffff;
}

.filter-btn.active {
  background-color: #007aff;
  color: #ffffff;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #1e1e1e;
  border-radius: 10rpx;
}

.dropdown {
  display: flex;
  align-items: center;
  padding: 8rpx 15rpx;
  background-color: #2a2a2a;
  border-radius: 15rpx;
  font-size: 22rpx;
  color: #ffffff;
}

.arrow-icon {
  width: 20rpx;
  height: 20rpx;
  margin-left: 5rpx;
}

.toggle-buttons {
  display: flex;
}

.toggle-btn {
  padding: 8rpx 20rpx;
  border-radius: 15rpx;
  font-size: 22rpx;
  color: #ffffff;
  background-color: #2a2a2a;
  margin-left: 10rpx;
}

.toggle-btn.active {
  background-color: #007aff;
  color: #ffffff;
}

.stats {
  align-items: center;
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #1e1e1e;
  border-radius: 10rpx;
  font-size: 22rpx;
}

.team-logo {
  margin-right: 15rpx;
}

.logo {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
}

.stats-text {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-right: 15rpx;
}

.stat-item {
  color: #ffffff;
}

.highlight {
  color: #00ff00;
  font-weight: bold;
}

.additional-stats {
  color: #ffffff;
}

.matches-table {
  background-color: #1e1e1e;
  border-radius: 10rpx;
  overflow: hidden;
}

.header-cell {
  .main-team {
    text-align: left;
  }
  .sub-team {
    text-align: right;
  }
}

.header-cell.date {
  flex: 1.5;
}

.header-cell.team {
  flex: 2;
}

.header-cell.score {
  flex: 1;
}
.cell.date {
  flex: 1.5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-text {
  color: #ffffff;
  font-weight: bold;
}

.league {
  color: #aaaaaa;
  font-size: 24rpx;
}

.cell.team {
  flex: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.team-name {
  width: 100%;
  font-weight: bold;
}
.main-team {
  text-align: right;
}
.sub-team {
  text-align: left;
}

.home-team {
  color: #007aff;
}

.away-team {
  color: #ff4500;
}

.score-change {
  font-size: 24rpx;
  color: #ffffff;
  margin-top: 5rpx;
  width: 100%;
}

.cell.score {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.half-score {
  font-size: 24rpx;
  color: #aaaaaa;
  margin-top: 5rpx;
}

.cell-top,
.cell-bottom {
  &.cell-red {
    color: #ff0000;
  }
  &.cell-green {
    color: #00ff00;
  }
}
</style>