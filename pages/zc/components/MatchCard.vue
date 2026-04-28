<template>
  <view class="match-item" @click="toDetail">
    <view class="match-content">
      <view class="match-info">
        <view class="match-teams">
          <text class="match-type" :style="{ color: leagueColor, backgroundColor: leagueBgColor }">
            {{ match.abbName }}
          </text>
          <text
            class="match-time"
            :class="{
              time: match.status === '未开始',
              score: match.status === '赛果',
              live: match.status === '进行中',
              upcoming: match.status === '即将开始',
            }"
          >
            {{ match.mtime }}
          </text>
        </view>

        <view class="match-teams">
          <text class="match-type">
            {{ match.numStr }}
          </text>

          <text class="team-name left-team-name">{{ match.htname }}</text>
          <text class="vs">VS</text>
          <text class="team-name">{{ match.atname }}</text>
        </view>

        <view
          class="expand-icon"
          v-if="result"
          @click.stop="toggleExpand"
          :class="{ expanded: isExpanded }"
        >
          <uni-icons type="down" size="20"></uni-icons>
        </view>

        <text v-if="isBozhu && !result" class="go-predict" @click.stop="toPredict">去预测本场</text>
      </view>
    </view>
    <view class="match-score" v-if="result" :class="{ expanded: isExpanded }">
      <view class="score-item">
        <view class="score-item-title">胜平负</view>
        <view class="score-item-value">{{ result.winDrawLosecurrent }}</view>
      </view>
      <view class="score-item">
        <view class="score-item-title">让球胜平负</view>
        <view class="score-item-value">{{ result.winDrawLosecurrentHandicap }}</view>
      </view>
      <view class="score-item">
        <view class="score-item-title">比分</view>
        <view class="score-item-value">{{ result.scorecurrent }}</view>
      </view>
      <view class="score-item">
        <view class="score-item-title">总进球数</view>
        <view class="score-item-value">{{ result.totalGoalscurrent }}</view>
      </view>
      <view class="score-item">
        <view class="score-item-title">半全场胜平负</view>
        <view class="score-item-value">{{ result.halfTimecurrent }}</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import type { SubMatchList, PoolStatus } from "@/types/match";
import { useUserStore } from "@/stores/userStore";
import { getToken } from "@/utils/request";

interface Props {
  match: SubMatchList;
}

const props = defineProps<Props>();
const isExpanded = ref(false);

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 联赛颜色映射
const leagueBgColor = computed(() => {
  const colors: Record<string, string> = {
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
  };
  return colors[props.match.abbName] || colors["默认"];
});

const leagueColor = computed(() => {
  const backgroundColors: Record<string, string> = {
    // 亚洲联赛
    澳超: "#001F3F", // 午夜蓝 ↔ 活力橙（强烈冷暖对比）
    沙职: "#FFF8DC", // 玉米黄 ↔ 深绿（沙漠与绿洲的对比）

    // 欧洲五大联赛及次级
    英超: "#E0FFFF", // 薄荷青 ↔ 深红（经典红绿互补，高可读性）
    英冠: "#FFD700", // 金黄 ↔ 皇家蓝（蓝黄极高对比，醒目）
    西甲: "#98FF98", // 亮薄荷绿 ↔ 西班牙红（红绿互补）
    意甲: "#FF4500", // 橙红 ↔ 蓝色（充满活力，地中海风格）
    德甲: "#00FFFF", // 青色 ↔ 深红（高饱和对比，醒目）
    德乙: "#2E0039", // 深紫 ↔ 金黄（紫黄互补，现代感强）
    法甲: "#FFD700", // 金黄 ↔ 深蓝（法国国旗配色，极高对比）
    法乙: "#8B4513", // 深陶土色 ↔ 浅蓝（深色背景压重次级联赛）
    葡超: "#FF1493", // 深粉红 ↔ 绿色（品红与绿，葡萄牙街头艺术感）

    // 荷兰联赛
    荷甲: "#000080", // 海军蓝 ↔ 深橙（橙蓝互补，经典对比）
    荷乙: "#191970", // 深靛蓝 ↔ 浅橙（深蓝托浅橙，稳重中带活力）

    // 杯赛（采用深色背景配亮色文字，营造夜晚赛事氛围）
    欧罗巴: "#003333", // 深青绿 ↔ 橙红（夜晚比赛感）
    欧协联: "#FF69B4", // 热粉 ↔ 森林绿（荧光对比，新兴赛事的活力）
    解放者杯: "#1A0033", // 深紫 ↔ 金色（皇室紫配金，奢华高对比）

    // 其他
    芬超: "#8B0000", // 深红 ↔ 天蓝（北欧冷淡与热情的碰撞）
    中超: "#004d00", // 墨绿 ↔ 粉色（粉绿互补，清晰锐利）
    默认: "#FFFF00", // 亮黄 ↔ 灰色（警示级对比）
  };

  return backgroundColors[props.match.abbName] || backgroundColors["默认"];
});

const userStore = useUserStore();
console.log(userStore.userInfo);
const isBozhu = computed(() => {
  return userStore.userInfo.agent;
});

// 比分
const result = computed(() => {
  try {
    const obj = JSON.parse(props.match.mresult);
    // score.ht = arr[0];
    // score.at = arr[1];
    if (obj.halfTimecurrent) {
      return obj;
    }
    return false;
  } catch (error) {
    return false;
  }
});

function toDetail() {
  const token = getToken();
  if (!token) {
    uni.showModal({
      title: "提示",
      content: "您未登录，是否前往登录页面？",
      success: (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: "/pages/login/login",
          });
        }
      },
    });
    return;
  }
  uni.navigateTo({
    url: "/pages/zc/detail?id=" + props.match.matchId,
  });
}

function toPredict() {
  uni.navigateTo({
    url: "/pages/zc/creaet-prognosis-post?matchId=" + props.match.matchId,
  });
}
</script>

<style scoped lang="scss">
.flex {
  display: flex;
}
.flex-1 {
  flex: 1;
}

.match-item {
  border-radius: 12rpx;
  overflow: hidden;
  background: #fff;
  box-sizing: border-box;
}

.match-type {
  font-size: 28rpx;
  position: absolute;
  left: 10rpx;
  padding: 8rpx 12rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.match-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;

  position: relative;
}

.match-info {
  flex: 1;
  min-width: 0;
}

.match-teams {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  margin-bottom: 10rpx;
}

.expand-icon {
  position: absolute;
  right: 20rpx;
  bottom: 10rpx;
  transition: all 0.3s ease-in-out;

  &.expanded {
    transform: rotate(180deg);
  }
}

.team-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.go-predict {
  position: absolute;
  right: 10rpx;
  top: 0;
  bottom: 0;
  margin: 12rpx 0;
  font-size: 32rpx;
  color: #fff;
  background: rgba(255, 86, 86, 1);
  padding: 8rpx 14rpx;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.left-team-name {
  text-align: right;
}

.vs {
  margin: 0 15rpx;
  font-weight: bold;
}

.match-time-score {
  display: flex;
  align-items: center;
  font-size: 26rpx;
}
.match-time {
  text-align: center;
}
.time {
}

.score {
  font-weight: bold;
}

.live {
  color: #ff4d4f;
  font-weight: bold;
}

.upcoming {
  color: #1890ff;
  font-weight: bold;
}

.match-score {
  display: flex;
  align-items: center;
  // justify-content: space-around;

  height: 0;
  overflow: hidden;
  background-color: #f5f5f5;

  box-shadow: inset 0 0 15rpx 0 rgba(0, 0, 0, 0.1);

  transition: all 0.3s ease-in-out;

  &.expanded {
    height: 150rpx;
  }

  .score-item {
    flex: 1;
    font-size: 24rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-left: 1px solid #999;

    &:nth-child(1) {
      border: none;
    }

    .score-item-title {
      margin-bottom: 5rpx;
      color: #999;
    }
    .score-item-value {
    }
  }
}
</style>
