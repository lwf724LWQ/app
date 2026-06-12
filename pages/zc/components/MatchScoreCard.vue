<template>
  <view class="match-card" :class="{ 'score-flash': isFlashing }" @click="toDetailPage">
    <!-- 顶部：联赛名称和时间 -->
    <view class="header">
      <text class="match-status"></text>
      <view class="league-name">{{ match.leagueChsShort }}</view>
      <text class="match-time">{{ matchTime }}</text>
      <text class="match-status" :class="statusClass">{{ matchStatus }}</text>
    </view>

    <!-- 中间：主赛区 -->
    <view class="main-content">
      <view class="team-section left">
        {{ match.homeChs }}
      </view>

      <view class="score-section" :class="{ 'no-score': !score }">
        <text class="score" :style="scoreColor">{{ score || "VS" }}</text>
      </view>

      <view class="team-section right">
        {{ match.awayChs }}
      </view>

      <view class="favorite-btn" @click="toggleFavorite" :class="{ active: match.flag }">
        <text class="star-icon">{{ match.flag ? "★" : "☆" }}</text>
      </view>
    </view>

    <!-- 底部：详细数据 -->
    <view class="footer" v-if="[1, 2, 3, 4, 5, -1].includes(match.mstate)">
      <!-- 上半场，中场，下半场，加时，点球，完赛才显示底部数据 -->
      <!-- 主队数据 -->
      <view class="stat-group">
        <view class="stat-item red">{{ match.homeRed || "" }}</view>
        <view class="stat-item yellow">{{ match.homeYellow || "" }}</view>
        <view class="stat-item grey">
          <view class="stat-corner-icon"></view>
          {{ match.homeCorner }}
        </view>
      </view>

      <!-- 半场比分 -->
      <view class="half-time" v-if="halfScore">{{ halfScore }}</view>

      <!-- 客队数据 -->
      <view class="stat-group">
        <view class="stat-item grey">
          <view class="stat-corner-icon"></view>
          {{ match.awayCorner }}
        </view>
        <view class="stat-item yellow">{{ match.awayYellow || "" }}</view>
        <view class="stat-item red">{{ match.awayRed || "" }}</view>
      </view>
    </view>

    <view class="extraExplainStr">
      {{ extraExplainStr }}
    </view>
  </view>
</template>

<script>
import dayjs from "dayjs";
import { forllowFootball, delForllowFootball } from "@/api/apis.js";
import { getToken } from "../../../utils/request";
import { useUserStore } from "@/stores/userStore";

let i = 0
const timerCallFns = {}
setInterval(() => {
  const date = new Date()
  for (const key in timerCallFns) {
    if (!Object.hasOwn(timerCallFns, key)) continue;
    const fn = timerCallFns[key];
    if (typeof fn === "function") {
      fn(date)
    }
  }
}, 1000);

function closeTimer(index){
  console.log(i)
  delete timerCallFns[index]
}
function addTimer(cb){
  i++;
  timerCallFns[i] = cb
  return i
}

export default {
  props: {
    match: { type: Object },
  },
  data() {
    return {
      isFavorite: false,
      isFlashing: false,
      timerIndex: false,
      
      nowTime: new Date()
    };
  },
  watch: {
    match: {
      handler(newMatch, oldMatch) {
        if (oldMatch) {
          if (
            newMatch.homeScore != oldMatch.homeScore ||
            newMatch.awayScore != oldMatch.awayScore ||
            newMatch.homeRed != oldMatch.homeRed ||
            newMatch.awayRed != oldMatch.awayRed ||
            newMatch.homeYellow != oldMatch.homeYellow ||
            newMatch.awayYellow != oldMatch.awayYellow
          ) {
            this.scoreUpdate();
          }
        }
        if(newMatch.extraExplain){
          console.log(newMatch.homeChs, newMatch.leagueChsShort)
          console.log(newMatch.extraExplain)
          console.log(this.formatExtraExplain(newMatch.extraExplain))
          console.log("-----------------------------------------------")
        }
      },
      deep: true,
    },
  },
  computed: {
    statusClass() {
      return this.matchStatus === "加时" ? "status-highlight" : "";
    },
    scoreColor() {
      const mstate = this.match.mstate;
      if ([-10, -11, -12, -13, -14].includes(mstate)) return "color:#007df9;";
      if ([1, 3, 4, 5].includes(mstate)) return "color:#ff4d4f;";
      if ([2].includes(mstate)) return "color:#007df9;";
      return "color:#4caf50;";
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
    matchStatus() {
      if (!this.match) {
        return "";
      }
      return {
        0: "未开",
        1: "上半场",
        2: "中场",
        3: "下半场",
        4: "加时",
        5: "点球",
        "-1": "完场",
        "-10": "取消",
        "-11": "待定",
        "-12": "腰斩",
        "-13": "中断",
        "-14": "推迟",
      }[this.match.mstate];
    },
    matchTime() {
      if (!this.match) {
        return "";
      }
      let time = this.match.matchTime;
      const teetime = Number(dayjs(dayjs(this.nowTime) - dayjs(this.match.startTime)).format("mm"))
      if (this.match.mstate == 3) {
        if (!Number.isNaN(teetime)) {
          if (teetime > 45) {
            return `90+'`
          }else{
            return `${teetime + 45}'`
          }
        }
      } else if (this.match.mstate == 1) {
        if (!Number.isNaN(teetime)) {
          if (teetime > 45) {
            return `45+'`
          }else{
            return `${teetime}'`
          }
        }
      }
      return dayjs(time).format("HH:mm");
    },
    halfScore() {
      if ([0, 1].includes(this.match.mstate)) {
        return "";
      } else {
        return `半 ${this.match.homeHalfScore}:${this.match.awayHalfScore}`;
      }
    },
    score() {
      if ([0, -10, -11, -12, -13, -14].includes(this.match.mstate)) {
        return false;
      } else {
        return `${this.match.homeScore}:${this.match.awayScore}`;
      }
    },
    extraExplainStr(){
      const extraExplainObj = this.formatExtraExplain(this.match.extraExplain);
      let str = "-"
      if (extraExplainObj) {
        if(extraExplainObj.kickoff){
          const kickoff = extraExplainObj.kickoff
          str += `${kickoff == 1 ? "主队开球" : "客队开球" } `
        }
        if(extraExplainObj.regularMinutes){
          const regularMinutes = extraExplainObj.regularMinutes
          str += `${regularMinutes}分钟`
        }
        if (extraExplainObj.regularScore) {
          const regularScore = extraExplainObj.regularScore
          str += `[${regularScore}],`
        }
        if(extraExplainObj.aggregateScore){
          const aggregateScore = extraExplainObj.aggregateScore
          str += `[${aggregateScore}],`
        }
        if(extraExplainObj.extraTimeType){
          const extraTimeType = extraExplainObj.extraTimeType
          str += {
            1: "120分钟",
            2: "加时",
            3: "加时中"
          }[extraTimeType]
          str += ","
        }
        if(extraExplainObj.penaltyScore){
          const penaltyScore = extraExplainObj.penaltyScore
          str += `[${penaltyScore}],`
        }
        if(extraExplainObj.winner){
          const winner = extraExplainObj.winner
          str += `${winner == 1 ? "主队获胜" : "客队获胜"}`
        }
      }
      return str
    }
  },
  methods: {
    scoreUpdate() {
      this.isFlashing = true;
      setTimeout(() => {
        this.isFlashing = false;
      }, 5000);
    },
    async toggleFavorite() {
      if (getToken()) {
        uni.showLoading();
        const userStore = useUserStore();
        try {
          if (this.match.flag) {
            await delForllowFootball(this.match.matchId);
            userStore.reduceFollowCount();
          } else {
            await forllowFootball(this.match.matchId);
            userStore.addFollowCount();
          }
          this.match.flag = !this.match.flag;
        } catch (error) {
          console.log(error);
          uni.showToast({
            title: error.msg || "操作失败",
          });
        }
        uni.hideLoading();
      } else {
        uni.showModal({
          title: "提示",
          content: "该操作需要登录，是否前往",
          success: async (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: "/pages/login/login" + "?redirect=/pages/zc/index" });
            }
          },
          showCancel: true,
        });
      }
    },
    toDetailPage() {
      // uni.navigateTo({
      //   url: "/pages/zc/match-detail?id=" + this.matchId,
      // });
    },
    /**
     * 解析比赛附加说明字符串，返回结构化对象
     * @param {string} str - 格式如 "2;|90,1-0;2-2;1,1-0;2-4;2"
     * @returns {Object|null}
     */
    formatExtraExplain(str) {
      if (!str) return null;
      // 用 "|" 分隔为两大部分
      const parts = str.split('|');
      if (parts.length < 2) return null;

      // 先开球方说明: "2;"
      const kickoffPart = parts[0];
      const kickoffData = kickoffPart.split(';')[0];
      const kickoff = parseInt(kickoffData) || null;

      // 赛果说明: "90,1-0;2-2;1,1-0;2-4;2"
      const resultPart = parts[1];
      const resultParts = resultPart.split(';');
      if (resultParts.length < 5) return null;

      // 常规时间比分说明 "90,1-0"
      const regularTimeData = resultParts[0].split(',');
      const regularMinutes = regularTimeData[0] || '';
      const regularScore = regularTimeData[1] || '';

      // 两回合总比分 "2-2"
      const aggregateScore = resultParts[1] || '';

      // 加时阶段比分说明 "1,1-0"
      const extraTimeData = resultParts[2].split(',');
      const extraTimeType = parseInt(extraTimeData[0]) || null;
      const extraTimeScore = extraTimeData[1] || '';

      // 点球大战比分 "2-4"
      const penaltyScore = resultParts[3] || '';

      // 获胜方 "2"
      const winner = parseInt(resultParts[4]) || null;

      return {
        kickoff,           // 先开球方: 1=主队先开球, 2=客队先开球
        regularMinutes,    // 常规时间分钟数
        regularScore,      // 常规时间比分
        aggregateScore,    // 两回合总比分（仅在有加时/点球时更新）
        extraTimeType,     // 加时阶段类型: 1=120分钟, 2=加时(室内/沙滩), 3=加时中
        extraTimeScore,    // 加时阶段比分
        penaltyScore,      // 点球大战比分
        winner,            // 获胜方: 1=主队获胜, 2=客队获胜
      };
    },
  },
  mounted(){
    this.timerIndex = addTimer((time)=>{
      this.nowTime = time
    })
  },
  unmounted(){
    closeTimer(this.timerIndex)
  }
};
</script>

<style scoped lang="scss">
.match-card {
  background-color: #fff;
  padding: 15rpx 10rpx;
  height: 150rpx;
  overflow: hidden;
  border-bottom: 1rpx solid #f0f0f0;
  font-family: Arial, sans-serif;
  transition: background-color 0.3s ease;

  &.score-flash {
    animation: flash-bg 5s ease;
  }
}

@keyframes flash-bg {
  0% {
    background-color: #fff;
  }
  30% {
    background-color: #fff7e6;
  }
  60% {
    background-color: #ffe58f;
  }
  100% {
    background-color: #fff;
  }
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
  color: #353535;
  text-align: center;
  margin: 0 20rpx;
}

.match-status {
  color: #333333;
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
  position: absolute;
  right: 0;
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
  color: #424242;
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
.stat-corner-icon {
  width: 25rpx;
  height: 25rpx;
  background: url(/static/icons/jiaoqiu.png) no-repeat;
  background-size: contain;
  margin-right: 10rpx;
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
}

.extraExplainStr{
  text-align: center;
  color: #222;
  font-size: 26rpx;
}
</style>
