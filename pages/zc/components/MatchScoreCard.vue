<template>
  <view class="match-card" :class="{ 'score-flash': isFlashing }">
    <!-- 顶部：联赛名称和时间 -->
    <view class="header">
      <view class="league-name">{{ match.leagueChsShort }}</view>
      <text class="match-time">{{ matchTime }}</text>
      <text class="match-status" :class="statusClass">{{ matchStatus }}</text>
    </view>

    <!-- 中间：主赛区 -->
    <view class="main-content">
      <view class="team-section left">
        {{ match.homeChs }}
      </view>

      <view class="score-section" :class="{ 'no-score': !score, clickable: isInProgress }">
        <text class="score" :style="scoreColor">{{ score || "VS" }}</text>
      </view>

      <view class="team-section right">
        {{ match.awayChs }}
      </view>
    </view>

    <!-- 底部：详细数据 -->
    <view class="footer" v-if="isPro && [1, 2, 3, 4, 5, -1].includes(match.mstate)">
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

    <view class="extraExplainStr" v-if="isPro && extraExplainStr">
      {{ extraExplainStr }}
    </view>

    <!-- 球赛事件列表：左右分栏 -->
    <view class="events-container">
      <view class="events-columns" >
        <!-- 主队事件（左列） -->
        <view class="events-column home-column">
          <view class="event-item" v-for="event in homeEvents" :key="event.id">
            <text class="event-player">{{ event.nameChs }}</text>
            <view class="event-time">{{ event.overtime && event.overtime !== '0' ? event.time + '+' + event.overtime + "'" : event.time + "'" }}</view>
            <text class="event-icon-text">{{ getEventIcon(event.kind) }}</text>
            <view class="poi"></view>
          </view>
        </view>
        
        <view class="favorite-btn" @click.stop="toggleFavorite" :class="{ active: match.flag }">
          <!-- <text class="star-icon">{{ match.flag ? "★" : "☆" }}</text> -->
          <uni-icons class="star-icon" type="notification" size="30" :color="match.flag ? '#ff2629' : ''"></uni-icons>
        </view>

        <!-- 客队事件（右列） -->
        <view class="events-column away-column">
          <view class="event-item" v-for="event in awayEvents" :key="event.id">
            <view class="poi"></view>
            <text class="event-icon-text">{{ getEventIcon(event.kind) }}</text>
            <view class="event-time">{{ event.overtime && event.overtime !== '0' ? event.time + '+' + event.overtime + "'" : event.time + "'" }}</view>
            <text class="event-player">{{ event.nameChs }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import dayjs from "dayjs";
import { forllowFootball, delForllowFootball, getFootBallEvent } from "@/api/apis.js";
import { getToken } from "../../../utils/request";
import { useUserStore } from "@/stores/userStore";
// #ifdef APP-PLUS
import {
    goToAppNotificationSettings,
    isNotificationEnabled,
} from "@/uni_modules/xtf-jpush"
// #endif
let i = 0
const timerCallFns = {}

setInterval(() => {
  const date = new Date()
  Object.keys(timerCallFns).forEach(key =>{
    const fn = timerCallFns[key];
    if (typeof fn === "function") {
      fn(date)
    }
  })
}, 1000);

function closeTimer(index){
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
    isPro: { type: Boolean, default: true }
  },
  emits: ['height-update'],
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
            (this.isPro ? (
              newMatch.homeRed != oldMatch.homeRed ||
              newMatch.awayRed != oldMatch.awayRed ||
              newMatch.homeYellow != oldMatch.homeYellow ||
              newMatch.awayYellow != oldMatch.awayYellow
            ) : false)            
          ) {
            this.scoreUpdate();
          }

        }
      },
      deep: true,
    },
    displayEvents: {
      handler(events) {
        if (events && events.length > 0) {
          this.notifyHeightUpdate();
        }
      },
      immediate: true
    }
  },
  computed: {
    events(){
      try {
        if (this.match?.matchInfo?.minfo) {
          return JSON.parse(this.match?.matchInfo?.minfo)
        } 
      } catch (error) {
        
      }

      return []
    },
    isInProgress() {
      return [-1, 1, 2, 3, 4, 5].includes(this.match.mstate);
    },
    statusClass() {
      return this.matchStatus === "加时" ? "status-highlight" : "";
    },
    scoreColor() {
      const mstate = this.match.mstate;
      if ([-10, -11, -12, -13, -14].includes(mstate)) return "color:#007df9;";
      if ([1, 3, 4, 5].includes(mstate)) return "color:#ff2e31;";
      if ([2].includes(mstate)) return "color:#007df9;";
      return "color:#4caf50;";
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
        return `${this.match.homeScore} - ${this.match.awayScore}`;
      }
    },
    extraExplainStr(){
      const extraExplainObj = this.formatExtraExplain(this.match.extraExplain);
      let str = ""
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
    },
    /**
     * 为每个事件添加同类型累计序号标签（主客队分别统计）
     * 列表反向展示（最新事件在前），序号也反向：最新→最大序号，最早→最小序号
     */
    displayEvents() {
      // 第一遍：统计各类型总数（按原始顺序从早到晚）
      const totals = {};
      this.events.forEach(event => {
        const kind = event.kind;
        const side = event.isHome ? 'home' : 'away';
        const key = side + '_' + kind;
        totals[key] = (totals[key] || 0) + 1;
      });
      // 第二遍：反向遍历分配序号，remaining 从最大值递减到 1
      const remaining = { ...totals };
      return this.events.filter(item => [1,7,8,14].includes(item.kind)).slice().reverse().map(event => {
        const kind = event.kind;
        const side = event.isHome ? 'home' : 'away';
        const key = side + '_' + kind;
        const count = remaining[key]--;
        const labels = {
          1: '第' + count + '球',
          2: '第' + count + '张红牌',
          3: '第' + count + '张黄牌',
          7: '第' + count + '个点球',
          8: '第' + count + '个乌龙',
          9: '第' + count + '张红牌',
          11: '第' + count + '次换人',
          13: '第' + count + '次失点',
          14: '第' + count + '次VAR'
        };
        return {
          ...event,
          countLabel: labels[kind] || '第' + count + '个'
        };
      });
    },
    homeEvents() {
      return this.displayEvents.filter(e => e.isHome);
    },
    awayEvents() {
      return this.displayEvents.filter(e => !e.isHome);
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
		  try{
        if(isNotificationEnabled && !isNotificationEnabled()){
          uni.showModal({
            title: "提示",
            content: "当前未开启通知权限，是否前往开启",
            success(){
              goToAppNotificationSettings()
            }
          })
        }
      }catch(e){

      }
		  
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
    notifyHeightUpdate() {
      this.$emit('height-update', this.match.matchId || this.match.id);
    },
    getEventIcon(kind) {
      const icons = {
        1: '⚽',     // 入球
        2: '🟥',     // 红牌
        3: '🟨',     // 黄牌
        7: '点⚽',    // 点球
        8: '乌⚽',    // 乌龙
        9: '🟥🟨',   // 两黄变红
        11: '换',     // 换人
        13: '✕点',   // 射失点球
        14: 'VR'      // 视频裁判
      };
      return icons[kind] || '';
    }
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
  padding: 30rpx 10rpx;
  overflow: hidden;
  border-bottom: none;
  font-family: Arial, sans-serif;
  transition: background-color 0.3s ease;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2rpx;
    background-color: #dbdbdb;
    transform: scaleY(0.5);
    transform-origin: bottom;
  }

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
  font-size: 26rpx;
  position: relative;
  margin-bottom: 8rpx;
  padding: 0 40rpx;

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
  color: #8C969F;
}

.match-time {
  color: #5f666d;
  text-align: center;
  margin: 0 20rpx;
}

.match-status {
  color: #8C969F;
}

.status-highlight {
  color: #4caf50; /* 绿色 */
  font-weight: bold;
}

.team-section {
  display: flex;
  align-items: center;
  flex: 1;

  font-size: 30rpx;
  font-weight:normal;
  color: #000;
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
    font-size: 38rpx;
    color: #4caf50;
  }
  &.clickable {
    cursor: pointer;
  }
}

.score {
  font-size: 58rpx;
  font-weight: normal;
  color: #ff2629;
}

.favorite-btn {
  right: 0;
  font-size: 50rpx;
  color: #424242;
  cursor: pointer;
}

.favorite-btn.active {
  color: #ff2629;
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

// 事件列表样式
.events-empty{
  text-align: center;
  padding: 20rpx;
  color: #999;
  font-size: 24rpx;
}
  .events-columns {
    display: flex;
    font-size: 20rpx;
    .events-column{
      flex: 1;
      &.home-column{
        // margin-right: 50rpx;
        .event-item{
          justify-content: flex-end;
          &::after{
            right: 11rpx;
          }
        }      
      }
      &.away-column{
        .event-item{
          &::after{
            left: 11rpx;
          }
        }
      }
    }
    
  .event-item {
    display: flex;
    align-items: center;
    padding: 8rpx 0;
    
      position: relative;
    .event-time{
      margin: 0 8rpx;
    }
    .poi{
      background-color: #E4E7EB;
      border-radius: 50%;
      width: 10rpx;
      height: 10rpx;
      margin:0 8rpx;
    }

    &:not(:last-child)::after{
      position: absolute;
      content: "";
      height: 100%;
      top: 50%;
      width:3rpx;
      background-color:#E4E7EB ;
    }
  }
  
  
}
</style>