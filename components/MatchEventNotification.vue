<template>
  <!-- 进球/红黄牌底部弹窗通知 -->
  <view v-if="activeNotification" class="event-popup" :class="{ 'popup-show': activeNotification }">
    <view class="event-popup-inner">
      <view class="event-icon">{{ getEventIcon(activeNotification.type) }}</view>
      <view class="event-content">
        <view class="event-teams">{{ activeNotification.homeChs }} vs {{ activeNotification.awayChs }}</view>
        <view class="event-desc">
          <text v-if="activeNotification.type === 'goal'" class="event-text">
            {{ activeNotification.side === 'home' ? '主队' : '客队' }}进球！
            比分 {{ activeNotification.homeScore }}:{{ activeNotification.awayScore }}
          </text>
          <text v-else-if="activeNotification.type === 'red'" class="event-text event-red">
            {{ activeNotification.side === 'home' ? activeNotification.homeChs : activeNotification.awayChs }} 红牌！
          </text>
          <text v-else-if="activeNotification.type === 'yellow'" class="event-text event-yellow">
            {{ activeNotification.side === 'home' ? activeNotification.homeChs : activeNotification.awayChs }} 黄牌！
          </text>
        </view>
      </view>
      <view class="event-close" @click="dismissNotification">✕</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from "vue";
import whistleMp3 from "@/static/zc/whistle.mp3"

// ========== 音频 ==========
const innerAudioContext = uni.createInnerAudioContext();
innerAudioContext.autoplay = false;
innerAudioContext.src = whistleMp3;

function playWhistle() {
  innerAudioContext.play();
}

// ========== 状态 ==========
let isInitialized = false;                        // 是否已完成首次快照
const previousMatchMap = {};                       // 上一次各比赛数据快照（非响应式，避免不必要渲染）
const activeNotification = ref(null);              // 当前显示的通知
let notificationTimer = null;
const notificationQueue = [];                      // 通知队列

// ========== 工具函数 ==========
function getEventIcon(type) {
  if (type === 'goal') return '⚽';
  if (type === 'red') return '🟥';
  if (type === 'yellow') return '🟨';
  return '';
}

// ========== 弹窗队列 ==========
function dismissNotification() {
  activeNotification.value = null;
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  showNextNotification();
}

function showNextNotification() {
  if (notificationQueue.length > 0) {
    const next = notificationQueue.shift();
    showNotificationPopup(next);
  }
}

function showNotificationPopup(notification) {
  activeNotification.value = notification;
  playWhistle();
  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }
  notificationTimer = setTimeout(() => {
    dismissNotification();
  }, 5000);
}

function enqueueNotification(notification) {
  if (activeNotification.value) {
    notificationQueue.push(notification);
  } else {
    showNotificationPopup(notification);
  }
}

// ========== 变化检测 ==========
function detectChanges(oldMatches, newMatches) {
  const oldMap = {};
  oldMatches.forEach(m => {
    if (m.matchId) oldMap[m.matchId] = m;
  });

  newMatches.forEach(newMatch => {
    const matchId = newMatch.matchId;
    if (!matchId) return;
    const oldMatch = oldMap[matchId];

    // 仅对进行中的比赛做检测
    if (![1, 3, 4].includes(newMatch.mstate)) return;
    if (!oldMatch) return;

    const oldHomeScore = Number(oldMatch.homeScore) || 0;
    const oldAwayScore = Number(oldMatch.awayScore) || 0;
    const newHomeScore = Number(newMatch.homeScore) || 0;
    const newAwayScore = Number(newMatch.awayScore) || 0;

    const oldHomeRed = Number(oldMatch.homeRed) || 0;
    const oldAwayRed = Number(oldMatch.awayRed) || 0;
    const newHomeRed = Number(newMatch.homeRed) || 0;
    const newAwayRed = Number(newMatch.awayRed) || 0;

    const oldHomeYellow = Number(oldMatch.homeYellow) || 0;
    const oldAwayYellow = Number(oldMatch.awayYellow) || 0;
    const newHomeYellow = Number(newMatch.homeYellow) || 0;
    const newAwayYellow = Number(newMatch.awayYellow) || 0;
    
    if (newHomeScore > oldHomeScore) {
      enqueueNotification({
        type: 'goal', side: 'home',
        homeChs: newMatch.homeChs, awayChs: newMatch.awayChs,
        homeScore: newHomeScore, awayScore: newAwayScore, matchId,
      });
    }
    if (newAwayScore > oldAwayScore) {
      enqueueNotification({
        type: 'goal', side: 'away',
        homeChs: newMatch.homeChs, awayChs: newMatch.awayChs,
        homeScore: newHomeScore, awayScore: newAwayScore, matchId,
      });
    }
    if (newHomeRed > oldHomeRed) {
      enqueueNotification({
        type: 'red', side: 'home',
        homeChs: newMatch.homeChs, awayChs: newMatch.awayChs, matchId,
      });
    }
    if (newAwayRed > oldAwayRed) {
      enqueueNotification({
        type: 'red', side: 'away',
        homeChs: newMatch.homeChs, awayChs: newMatch.awayChs, matchId,
      });
    }
    if (newHomeYellow > oldHomeYellow) {
      enqueueNotification({
        type: 'yellow', side: 'home',
        homeChs: newMatch.homeChs, awayChs: newMatch.awayChs, matchId,
      });
    }
    if (newAwayYellow > oldAwayYellow) {
      enqueueNotification({
        type: 'yellow', side: 'away',
        homeChs: newMatch.homeChs, awayChs: newMatch.awayChs, matchId,
      });
    }
  });
}

function updateSnapshot(matches) {
  matches.forEach(m => {
    if (m.matchId) {
      previousMatchMap[m.matchId] = {
        homeScore: Number(m.homeScore) || 0,
        awayScore: Number(m.awayScore) || 0,
        homeRed: Number(m.homeRed) || 0,
        awayRed: Number(m.awayRed) || 0,
        homeYellow: Number(m.homeYellow) || 0,
        awayYellow: Number(m.awayYellow) || 0,
      };
    }
  });
}

// ========== 对外暴露：接收更新数据 ==========
/**
 * 外部调用此方法，传入最新比赛数据列表
 * - 首次调用：仅保存快照，不触发任何弹窗/音频
 * - 后续调用：对比变化，进球/红黄牌时弹出通知并播放音频
 * @param {Array} matches 比赛数据数组
 */
function onDataUpdate(matches) {
  if (!matches || !Array.isArray(matches)) return;
  if (!isInitialized) {
    // 首次：只建快照
    updateSnapshot(matches);
    isInitialized = true;
    return;
  }
  // 后续：用旧快照对比新数据
  const oldMatches = [];
  for (const key in previousMatchMap) {
    oldMatches.push({ matchId: key, ...previousMatchMap[key] });
  }
  detectChanges(oldMatches, matches);

  // 更新数据，添加新的球赛
  updateSnapshot(matches);
}

// ========== 清理 ==========
function destroy() {
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  innerAudioContext.destroy();
}

defineExpose({
  onDataUpdate,
  destroy,
});
</script>

<style lang="scss" scoped>
.event-popup {
  position: fixed;
  bottom: 150rpx;
  left: 20rpx;
  right: 20rpx;
  z-index: 9999;
  transform: translateY(150%);
  transition: transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1.2);
  pointer-events: none;
}

.event-popup.popup-show {
  transform: translateY(0);
  pointer-events: auto;
}

.event-popup-inner {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.5);
  border: 2rpx solid rgba(255, 255, 255, 0.15);
}

.event-icon {
  font-size: 50rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  min-width: 0;
}

.event-teams {
  font-size: 26rpx;
  color: #aaa;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-desc {
  font-size: 32rpx;
  font-weight: bold;
}

.event-text {
  color: #fff;
}

.event-text.event-red {
  color: #ff4d4f;
}

.event-text.event-yellow {
  color: #ffeb3b;
}

.event-close {
  font-size: 32rpx;
  color: #888;
  padding: 10rpx;
  margin-left: 10rpx;
  flex-shrink: 0;
  cursor: pointer;
}
</style>