<template>
  <view class="match-head">
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
  data() {
    return {
      data: {
        awayTeamId: 51318,
        awayTeamLogoPath:
          "//static.sporttery.cn/res_1_0/jcw/upload/mnjc/zq/1/261.png",
        awayTeamShortName: "阿马多拉",
        fullCourtGoal: "3:1",
        gameweek: "14",
        groupId: 0,
        groupName: "",
        homeTeamId: 1678,
        homeTeamLogoPath:
          "//static.sporttery.cn/res_1_0/jcw/upload/mnjc/zq/1/937.png",
        homeTeamShortName: "波尔图",
        matchDateTime: "2025-12-16 04:45",
        matchId: 2367538,
        matchNum: "周一006",
        phaseId: 47981,
        phaseName: "Regular Season",
        seasonId: 13480,
        seasonName: "2025/2026",
        sportteryAwayTeamId: 261,
        sportteryHomeTeamId: 937,
        sportteryMatchId: 2036064,
        sportteryTournamentId: 55,
        tournamentCnName: "葡萄牙超级联赛",
        tournamentCnShortName: "葡超",
        tournamentId: 140,
        uniformAwayTeamId: 35076,
        uniformHomeTeamId: 141,
        uniformLeagueId: 78,
        uniformMatchId: 2334340,
        wbsjStats: {
          away: {
            groupName: "",
            phaseName: "Regular Season",
            ranking: "13",
            sAwayDrawMatchCnt: "3",
            sAwayLossGoalMatchCnt: "2",
            sAwayWinGoalMatchCnt: "1",
            sDrawMatchCnt: "5",
            sLossGoalMatchCnt: "5",
            sWinGoalMatchCnt: "3",
            seasonName: "2025/2026",
          },
          home: {
            groupName: "",
            phaseName: "Regular Season",
            ranking: "1",
            sDrawMatchCnt: "1",
            sHomeDrawMatchCnt: "1",
            sHomeLossGoalMatchCnt: "0",
            sHomeWinGoalMatchCnt: "5",
            sLossGoalMatchCnt: "0",
            sWinGoalMatchCnt: "12",
            seasonName: "2025/2026",
          },
        },
      },
    };
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