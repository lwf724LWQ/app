<template>
  <view class="dual-axis">
    <view class="header">
      <view>{{ leftName }}</view>
      <view>{{ rightName }}</view>
    </view>
    <view class="line-table">
      <view v-for="item in list" :key="item.id" class="line-item">
        <view class="line-text">
          <view>{{ item.left }}</view>
          <view>{{ item.center || "胜负" }}</view>
          <view>{{ item.right }}</view>
        </view>
        <view class="line">
          <view
            class="left-line"
            :style="{ width: lineWidth(item, 'left') }"
          ></view>
          <view
            class="right-line"
            :style="{ width: lineWidth(item, 'right') }"
          ></view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  props: {
    // leftName: {
    //   type: String,
    //   default: "老虎大学",
    // },
    // rightName: {
    //   type: String,
    //   default: "蒂华纳",
    // },
    data: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {};
  },
  computed: {
    leftName() {
      return this.data.homeTeamShortName;
    },
    rightName() {
      return this.data.awayTeamShortName;
    },
    list() {
      const arr = [];

      [
        { key: "last", name: "近5场交锋" },
        { key: "eachHomeAway", name: "同主客交锋" },
        { key: "eachSameHomeAway", name: "近10场战况" },
        { key: "eachSameHomeAway", name: "同主客战况" },
      ].forEach((item) => {
        if (this.data[item.key]) {
          arr.push({
            left: `${this.data[item.key].homeWinGoalMatchCnt}胜/${
              this.data[item.key].homeDrawMatchCnt
            }平/${this.data[item.key].homeWinGoalMatchCnt}负`,
            right: `${this.data[item.key].awayWinGoalMatchCnt}胜/${
              this.data[item.key].awayDrawMatchCnt
            }平/${this.data[item.key].awayWinGoalMatchCnt}负`,
            homeScoreRatio: this.data[item.key].homeScoreRatio,
            awayScoreRatio: this.data[item.key].awayScoreRatio,
            center: item.name,
          });
        }
      });
      if (this.data.goalAvg) {
        arr.push({
          left: `${this.data.goalAvg.homeGoalAvgCnt}`,
          right: `${this.data.goalAvg.awayGoalAvgCnt}`,
          homeScoreRatio: this.data.goalAvg.homeGoalAvgCntRatio,
          awayScoreRatio: this.data.goalAvg.awayGoalAvgCntRatio,
          center: "场均进球",
        });
      }
      if (this.data.lossGoalAvg) {
        arr.push({
          left: `${this.data.lossGoalAvg.homeLossGoalAvgCnt}`,
          right: `${this.data.lossGoalAvg.awayLossGoalAvgCnt}`,
          homeScoreRatio: this.data.lossGoalAvg.homeLossGoalAvgCntRatio,
          awayScoreRatio: this.data.lossGoalAvg.awayLossGoalAvgCntRatio,
          center: "场均进球",
        });
      }
      return arr;
    },
  },
  methods: {
    lineWidth(item, postion) {
      if (item.homeScoreRatio && item.awayScoreRatio) {
        if (postion === "left") {
          return item.homeScoreRatio / 2 + "%";
        } else {
          return item.awayScoreRatio / 2 + "%";
        }
      }
      const count = (item.left + item.right) * 2;
      return `${(item[postion] / count) * 100}%`;
    },
  },
};
</script>

<style lang="scss" scoped>
.dual-axis {
  background-color: #111;
  padding: 10rpx;
  box-sizing: border-box;
  font-size: 25rpx;

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx;
    color: #fff;
  }
  .line-table {
    width: 100%;
    color: #fff;

    .line-item {
      margin: 10rpx 0;
      .line-text {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .line {
        position: relative;
        width: 100%;
        height: 10rpx;
        background-color: #333;
        > view {
          height: 100%;
        }
        .left-line {
          position: absolute;
          right: 50%;
          background-color: #ff0000;
        }
        .right-line {
          position: absolute;
          left: 50%;
          background-color: #0000ff;
        }
      }
    }
  }
}
</style>