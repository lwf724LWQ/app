<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">积分榜</text>
    </view>

    <!-- 主场队伍 -->
    <view class="matches-info">
      <view class="teamShortName">{{ homeTeamInfo.teamShortName }}</view>
      <view class="phaseName">{{ homeTeamInfo.phaseName }}</view>
      <view class="ranking">第{{ homeTeamInfo.ranking }}名</view>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell"></view>
        <view class="header-cell flex-3">场次</view>
        <view class="header-cell flex-3">胜/平/负</view>
        <view class="header-cell">胜率</view>
        <view class="header-cell">进球/失球</view>
        <view class="header-cell">净进球</view>
        <view class="header-cell">积分</view>
        <view class="header-cell">排名</view>
      </view>

      <view class="table-row" v-for="(match, index) in homeList" :key="index">
        <view class="cell">{{ match.type }}</view>
        <view class="cell flex-3">{{ match.totalLegCnt }}</view>
        <view class="cell flex-3">
          {{ match.winGoalMatchCnt }}/{{ match.drawMatchCnt }}/{{ match.lossGoalMatchCnt }}
        </view>
        <view class="cell">{{ match.winProbability }}</view>
        <view class="cell">{{ match.goalCnt }}/{{ match.lossGoalCnt }}</view>
        <view class="cell">{{ match.netGoal }}</view>
        <view class="cell">{{ match.points }}</view>
        <view class="cell">{{ match.ranking }}</view>
      </view>
    </view>

    <!-- 主场 -->
    <view class="matches-info">
      <view class="teamShortName">{{ awayTeamInfo.teamShortName }}</view>
      <view class="phaseName">{{ awayTeamInfo.phaseName }}</view>
      <view class="ranking">第{{ awayTeamInfo.ranking }}名</view>
    </view>

    <!-- 客场队伍 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell"></view>
        <view class="header-cell flex-3">场次</view>
        <view class="header-cell flex-3">胜/平/负</view>
        <view class="header-cell">胜率</view>
        <view class="header-cell">进球/失球</view>
        <view class="header-cell">净进球</view>
        <view class="header-cell">积分</view>
        <view class="header-cell">排名</view>
      </view>

      <view class="table-row" v-for="(match, index) in awayList" :key="index">
        <view class="cell">{{ match.type }}</view>
        <view class="cell flex-3">{{ match.totalLegCnt }}</view>
        <view class="cell flex-3">
          {{ match.winGoalMatchCnt }}/{{ match.drawMatchCnt }}/{{ match.lossGoalMatchCnt }}
        </view>
        <view class="cell">{{ match.winProbability }}</view>
        <view class="cell">{{ match.goalCnt }}/{{ match.lossGoalCnt }}</view>
        <view class="cell">{{ match.netGoal }}</view>
        <view class="cell">{{ match.points }}</view>
        <view class="cell">{{ match.ranking }}</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    data: {
      type: Object,
      default: () => {},
    },
  },
  computed: {
    homeTeamInfo() {
      try {
        const totalData = this.data.homeTables.total;
        return {
          teamShortName: totalData.teamShortName,
          phaseName: totalData.phaseName,
          ranking: totalData.ranking,
        };
      } catch (error) {
        return { teamShortName: "-", phaseName: "-", ranking: "-" };
      }
    },
    homeList() {
      try {
        const homeTables = this.data.homeTables;

        return [
          {
            type: "总",
            ...homeTables.total,
          },
          {
            type: "主",
            ...homeTables.home,
          },
          {
            type: "客",
            ...homeTables.away,
          },
        ];
      } catch (error) {
        return [];
      }
    },
    awayTeamInfo() {
      try {
        const totalData = this.data.awayTables.total;
        return {
          teamShortName: totalData.teamShortName,
          phaseName: totalData.phaseName,
          ranking: totalData.ranking,
        };
      } catch (error) {
        return { teamShortName: "-", phaseName: "-", ranking: "-" };
      }
    },
    awayList() {
      try {
        const awayTables = this.data.awayTables;

        return [
          {
            type: "总",
            ...awayTables.total,
          },
          {
            type: "主",
            ...awayTables.home,
          },
          {
            type: "客",
            ...awayTables.away,
          },
        ];
      } catch (error) {
        return [];
      }
    },
  },
  methods: {},
};
</script>

<style scoped lang="scss">
.detail-container {
  background-color: #121212;
}

@import url("./table.scss");

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

.cell {
  display: flex;
  > view {
    flex: 1;
    &.up {
      color: #f00;
    }
    &.down {
      color: #0f0;
    }
  }
}

.matches-info {
  display: flex;
  align-items: center;
  color: #fff;
  padding: 10rpx;
  padding-left: 20rpx;
  font-size: 28rpx;
  margin-top: 10rpx;
  .teamShortName {
    background-color: #007aff;
    padding: 6rpx 12rpx;
    border-radius: 5px;

    margin-right: 10rpx;
  }
  .phaseName {
    margin-right: 10rpx;
  }
  .ranking {
  }
}
</style>
