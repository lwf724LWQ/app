<template>
  <view class="detail-container">
    <view class="table-top">
      <text class="table-title">历史交锋</text>
      <view class="filter-buttons">
        <view class="filter-btn">全部赛制</view>
        <view class="filter-btn">相同主客场</view>
        <view class="filter-btn active">近10场</view>
        <view class="filter-btn">近20场</view>
      </view>
    </view>
    <view class="stats">
      <view class="stats-text">
        <view class="stat-item">近{{ statis.totalLegCnt }}场</view>
        <view class="stat-item teamShortName">{{ statis.teamShortName }}</view>
        <view class="red-highlight"
          >{{ statis.winGoalMatchCnt }}胜（{{ statis.winProbability }}）</view
        >
        <view class="green-highlight">
          {{ statis.drawMatchCnt }}平({{ statis.drawProbability }})
        </view>
        <view class="bule-highlight">
          {{ statis.lossGoalMatchCnt }}负({{ statis.lossProbability }})
        </view>
      </view>
    </view>

    <!-- 比赛数据表格 -->
    <view class="matches-table">
      <view class="table-header">
        <view class="header-cell date">日期/赛事</view>
        <view class="header-cell team main-team">主队</view>
        <view class="header-cell score">比分</view>
        <view class="header-cell team sub-team">客队</view>
        <view class="header-cell">进球走势</view>
      </view>

      <view class="table-row" v-for="(match, index) in matches" :key="index">
        <view class="cell date">
          <text class="date-text">{{ match.matchDate }}</text>
          <text class="league">{{ match.tournamentShortName }}</text>
        </view>
        <view class="cell team main-team">
          <text
            :class="[
              'team-name',
              teamNameClass(match, match.homeTeamShortName, 'home'),
            ]"
            >{{ match.homeTeamShortName }}</text
          >
        </view>
        <view class="cell score">
          <text>{{ match.fullCourtGoal }}</text>
          <text class="half-score">({{ match.halfTimeGoal }})</text>
        </view>
        <view class="cell team sub-team">
          <text
            :class="[
              'team-name',
              teamNameClass(match, match.awayTeamShortName, 'away'),
            ]"
            >{{ match.awayTeamShortName }}</text
          >
        </view>
        <view class="cell">
          <!-- 总进球走势 -->
          {{ match.totalTeamFullCourtGoalCnt }}
        </view>
      </view>
    </view>
  </view>
</template>
    
  <script>
export default {
  props: {
    statis: {
      type: Object,
      default: () => {},
    },
    matches: {
      type: Array,
      default: () => [],
    },
    homeTeam: {
      type: String,
      default: "",
    },
  },
  methods: {
    teamNameClass(item, teamName, position) {
      if (teamName == this.homeTeam) {
        if (item.winningTeam == "home") {
          if (position == "home") {
            return "home-win";
          } else {
            return "away-win";
          }
        } else if (item.winningTeam == "away") {
          if (position == "home") {
            return "away-win";
          } else {
            return "home-win";
          }
        } else {
          return "draw";
        }
      }
    },
  },
};
</script>
    
<style scoped lang="scss">
@import url("./table.scss");
.detail-container {
  background-color: #121212;
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

.home-win {
  color: #ff2222;
}

.away-win {
  color: #1960e6;
}

.draw {
  color: #5ece1d;
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

.red-highlight {
  color: #e01212;
  font-weight: bold;
}

.green-highlight {
  color: #008f4a;
  font-weight: bold;
}
.bule-highlight {
  color: #2372d9;
  font-weight: bold;
}
.additional-stats {
  color: #ffffff;
}
</style>