<template>
  <view class="match-head" v-if="data.wbsjStats">
    <view class="team">
      <view class="teamlogo"><image :src="data.homeTeamLogoPath"></image></view>
      <view class="teamname">{{ data.homeTeamShortName }}</view>
      <view class="teamrank"
        >{{ data.phaseName }} 第{{ data.wbsjStats.home.ranking }}名</view
      >
      <view class="match-cnt"
        >赛季总成绩: {{ data.wbsjStats.home.sWinGoalMatchCnt }}胜
        {{ data.wbsjStats.home.sDrawMatchCnt }}平
        {{ data.wbsjStats.home.sLossGoalMatchCnt }}</view
      >
      <view class="match-cnt"
        >赛季主场成绩：{{ data.wbsjStats.home.sHomeWinGoalMatchCnt }}胜
        {{ data.wbsjStats.home.sHomeDrawMatchCnt }}平
        {{ data.wbsjStats.sHomeLossGoalMatchCnt }}负</view
      >
    </view>
    <view class="score-info">
      <view class="score">{{ data.fullCourtGoal }}</view>
      <view>{{ data.tournamentCnName }}</view>
      <view>{{ data.matchDateTime }}</view>
    </view>
    <view class="team">
      <view class="teamlogo"><image :src="data.awayTeamLogoPath"></image></view>
      <view class="teamname">{{ data.awayTeamShortName }}</view>
      <view class="teamrank"
        >{{ data.phaseName }} 第{{ data.wbsjStats.away.ranking }}名</view
      >
      <view class="match-cnt"
        >赛季总成绩: {{ data.wbsjStats.away.sWinGoalMatchCnt }}胜
        {{ data.wbsjStats.away.sDrawMatchCnt }}平
        {{ data.wbsjStats.away.sLossGoalMatchCnt }}</view
      >
      <view class="match-cnt"
        >赛季主场成绩：{{ data.wbsjStats.away.sAwayWinGoalMatchCnt }}胜
        {{ data.wbsjStats.away.sAwayDrawMatchCnt }}平
        {{ data.wbsjStats.away.sAwayLossGoalMatchCnt }}负</view
      >
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
  data() {
    return {};
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.match-head {
  display: flex;
  justify-content: center;
  align-items: center;

  background-color: #313131;
  height: 250rpx;
  color: #fff;
  font-size: 20rpx;
  .team {
    flex: 2;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .teamlogo {
      width: 80rpx;
      height: 80rpx;

      background-color: rgba(255, 255, 255, 0.3);

      margin-bottom: 10rpx;
    }
  }
  .score-info {
    flex: 1;
    text-align: center;
    .score {
      font-size: 42rpx;
      font-weight: bold;
    }
  }
}
</style>