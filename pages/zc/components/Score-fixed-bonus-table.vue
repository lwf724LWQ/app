<template>
  <view class="detail-container">
    <!-- 标题 -->
    <view class="header">
      <text class="title">比分固定奖金</text>
      <text class="title">开奖结果{{ matchResult.combinationDesc }}</text>
    </view>

    <!-- 比赛数据表格 -->
    <template v-for="(item, index) in matches">
      <view class="header">
        <text class="title">发布时间：{{ item.updateDate }} {{ item.updateTime }}</text>
      </view>
      <scroll-view scroll-x class="table-scroll" :show-scrollbar="false">
        <view class="matches-table">
          <view class="table-header">
            <view class="header-cell flex-3">1:0</view>
            <view class="header-cell flex-3">2:0</view>
            <view class="header-cell flex-3">2:1</view>
            <view class="header-cell flex-3">3:0</view>
            <view class="header-cell flex-3">3:1</view>
            <view class="header-cell flex-3">3:2</view>
            <view class="header-cell flex-3">4:0</view>
            <view class="header-cell flex-3">4:1</view>
            <view class="header-cell flex-3">4:2</view>
            <view class="header-cell flex-3">5:0</view>
            <view class="header-cell flex-3">5:1</view>
            <view class="header-cell flex-3">5:2</view>
            <view class="header-cell flex-3">胜其他</view>
          </view>
          <view class="table-row">
            <view class="cell" v-for="(fieldName, index) in listSh" :key="index">
              {{ item[fieldName] }}
            </view>
          </view>
        </view>
        <view class="matches-table">
          <view class="table-header">
            <view class="header-cell flex-3">0:0</view>
            <view class="header-cell flex-3">1:1</view>
            <view class="header-cell flex-3">2:2</view>
            <view class="header-cell flex-3">3:3</view>
            <view class="header-cell flex-3">平其他</view>
          </view>
          <view class="table-row">
            <view class="cell" v-for="(fieldName, index) in listSd" :key="index">
              {{ item[fieldName] }}
            </view>
          </view>
        </view>
        <view class="matches-table">
          <view class="table-header">
            <view class="header-cell flex-3">0:1</view>
            <view class="header-cell flex-3">0:2</view>
            <view class="header-cell flex-3">1:2</view>
            <view class="header-cell flex-3">0:3</view>
            <view class="header-cell flex-3">1:3</view>
            <view class="header-cell flex-3">2:3</view>
            <view class="header-cell flex-3">0:4</view>
            <view class="header-cell flex-3">1:4</view>
            <view class="header-cell flex-3">2:4</view>
            <view class="header-cell flex-3">0:5</view>
            <view class="header-cell flex-3">1:5</view>
            <view class="header-cell flex-3">2:5</view>
            <view class="header-cell flex-3">负其他</view>
          </view>
          <view class="table-row">
            <view class="cell" v-for="(fieldName, index) in listSa" :key="index">
              {{ item[fieldName] }}
            </view>
          </view>
        </view>
      </scroll-view>
    </template>
  </view>
</template>

<script>
export default {
  props: {},
  data() {
    return {
      listSh: [
        "s01s00",
        "s02s00",
        "s02s01",
        "s03s00",
        "s03s01",
        "s03s02",
        "s04s00",
        "s04s01",
        "s04s02",
        "s05s00",
        "s05s01",
        "s05s02",
        "s-1sh",
      ],
      listSd: ["s00s00", "s01s01", "s02s02", "s03s03", "s-1sd"],
      listSa: [
        "s00s01",
        "s00s02",
        "s01s02",
        "s00s03",
        "s01s03",
        "s02s03",
        "s00s04",
        "s01s04",
        "s02s04",
        "s00s05",
        "s01s05",
        "s02s05",
        "s-1sa",
      ],
      isHalf: false,
      matchResult: {
        code: "CRS",
        combination: "0:0",
        combinationDesc: "0:0",
        goalLine: "",
        lineStatus: "",
        matchId: 2038918,
        odds: "9.00",
        oddsGoalLine: "",
        oddsType: "F",
        poolId: 2185557,
        poolTotals: "0",
        refundStatus: "0",
      },
      matches: [
        {
          s05s00: "1000",
          "s-1sd": "600.0",
          s02s00f: "0",
          "s-1sh": "400.0",
          s01s00: "12.00",
          s05s02: "900.0",
          s05s01: "800.0",
          "s-1sa": "55.00",
          s00s03f: "0",
          s02s04f: "0",
          s04s01f: "0",
          s03s00f: "0",
          s01s03f: "0",
          s02s04: "70.00",
          s02s05: "150.0",
          s02s02: "19.00",
          s02s03: "30.00",
          s05s01f: "0",
          s02s00: "29.00",
          s02s01: "16.00",
          s02s05f: "0",
          s00s02f: "0",
          s02s01f: "0",
          s04s00f: "0",
          goalLine: "",
          s03s01f: "0",
          "s-1sdf": "0",
          "s-1shf": "0",
          s01s02f: "0",
          s03s03: "100.0",
          s05s00f: "0",
          updateDate: "2026-04-07",
          s03s01: "60.00",
          s03s02: "60.00",
          s03s00: "80.00",
          s00s01f: "0",
          s02s02f: "0",
          s00s05f: "0",
          s00s01: "5.40",
          s00s00: "9.00",
          s00s03: "10.00",
          s01s01f: "0",
          s00s02: "6.30",
          s00s05: "50.00",
          s00s04: "22.00",
          s01s05f: "0",
          s03s02f: "0",
          s04s02: "300.0",
          s04s01: "250.0",
          s04s00: "400.0",
          s00s00f: "0",
          updateTime: "09:23:52",
          s00s04f: "0",
          "s-1saf": "0",
          s02s03f: "0",
          s04s02f: "0",
          s01s02: "7.00",
          s01s01: "7.00",
          s01s04: "30.00",
          s01s00f: "0",
          s01s03: "13.00",
          s05s02f: "0",
          s01s05: "70.00",
          s03s03f: "0",
          s01s04f: "0",
        },
        {
          s05s00: "1000",
          "s-1sd": "400.0",
          s02s00f: "0",
          "s-1sh": "400.0",
          s01s00: "12.00",
          s05s02: "900.0",
          s05s01: "800.0",
          "s-1sa": "55.00",
          s00s03f: "0",
          s02s04f: "0",
          s04s01f: "0",
          s03s00f: "0",
          s01s03f: "0",
          s02s04: "70.00",
          s02s05: "150.0",
          s02s02: "19.00",
          s02s03: "30.00",
          s05s01f: "0",
          s02s00: "29.00",
          s02s01: "16.00",
          s02s05f: "0",
          s00s02f: "0",
          s02s01f: "0",
          s04s00f: "0",
          goalLine: "",
          s03s01f: "0",
          "s-1sdf": "-1",
          "s-1shf": "0",
          s01s02f: "0",
          s03s03: "90.00",
          s05s00f: "0",
          updateDate: "2026-04-07",
          s03s01: "60.00",
          s03s02: "60.00",
          s03s00: "80.00",
          s00s01f: "0",
          s02s02f: "0",
          s00s05f: "0",
          s00s01: "5.40",
          s00s00: "9.00",
          s00s03: "10.00",
          s01s01f: "1",
          s00s02: "6.30",
          s00s05: "50.00",
          s00s04: "22.00",
          s01s05f: "0",
          s03s02f: "0",
          s04s02: "300.0",
          s04s01: "250.0",
          s04s00: "400.0",
          s00s00f: "0",
          updateTime: "12:50:21",
          s00s04f: "0",
          "s-1saf": "0",
          s02s03f: "0",
          s04s02f: "0",
          s01s02: "7.00",
          s01s01: "7.10",
          s01s04: "30.00",
          s01s00f: "0",
          s01s03: "13.00",
          s05s02f: "0",
          s01s05: "70.00",
          s03s03f: "-1",
          s01s04f: "0",
        },
        {
          s05s00: "1000",
          "s-1sd": "400.0",
          s02s00f: "0",
          "s-1sh": "400.0",
          s01s00: "12.00",
          s05s02: "900.0",
          s05s01: "800.0",
          "s-1sa": "60.00",
          s00s03f: "0",
          s02s04f: "0",
          s04s01f: "1",
          s03s00f: "0",
          s01s03f: "0",
          s02s04: "70.00",
          s02s05: "150.0",
          s02s02: "20.00",
          s02s03: "30.00",
          s05s01f: "0",
          s02s00: "29.00",
          s02s01: "16.00",
          s02s05f: "0",
          s00s02f: "-1",
          s02s01f: "0",
          s04s00f: "1",
          goalLine: "",
          s03s01f: "0",
          "s-1sdf": "0",
          "s-1shf": "0",
          s01s02f: "-1",
          s03s03: "100.0",
          s05s00f: "0",
          updateDate: "2026-04-07",
          s03s01: "60.00",
          s03s02: "70.00",
          s03s00: "80.00",
          s00s01f: "0",
          s02s02f: "1",
          s00s05f: "1",
          s00s01: "5.40",
          s00s00: "9.00",
          s00s03: "10.00",
          s01s01f: "0",
          s00s02: "6.10",
          s00s05: "55.00",
          s00s04: "22.00",
          s01s05f: "0",
          s03s02f: "1",
          s04s02: "300.0",
          s04s01: "300.0",
          s04s00: "500.0",
          s00s00f: "0",
          updateTime: "19:03:17",
          s00s04f: "0",
          "s-1saf": "1",
          s02s03f: "0",
          s04s02f: "0",
          s01s02: "6.75",
          s01s01: "7.10",
          s01s04: "30.00",
          s01s00f: "0",
          s01s03: "13.00",
          s05s02f: "0",
          s01s05: "70.00",
          s03s03f: "1",
          s01s04f: "0",
        },
      ],
    };
  },
  computed: {
    list() {
      const indexMap = {
        HAD: { index: 0, gameName: "胜平负" },
        HHAD: { index: 1, gameName: "让球胜平负" },
        CRS: { index: 2, gameName: "比分" },
        TTG: { index: 3, gameName: "总进球" },
        HAFU: { index: 4, gameName: "半全场胜平负	" },
      };
      const newList = [];
      this.matches.forEach((match) => {
        const indexObj = indexMap[match.code];
        newList[indexObj.index] = {
          ...match,
          ...indexObj,
        };
      });
      return newList;
    },
  },
  methods: {
    pointClass(startPoint, nowPoint) {
      return startPoint == nowPoint ? "" : nowPoint > startPoint ? "up" : "down";
    },
  },
};
</script>

<style scoped lang="scss">
.detail-container {
  background-color: #121212;
}

@import url("./table.scss");

.flex-3,
.cell {
  flex-shrink: 0;
  flex-basis: 100rpx;
  width: 100rpx;
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
</style>
