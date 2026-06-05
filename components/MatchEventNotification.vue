<template>
  <!-- 进球/角球/红黄牌底部弹窗通知 -->
  <view v-show="popupState !== 'hidden'" class="event-popup" :class="popupClass">
    <view class="event-popup-inner">
      <view class="event-icon">{{ getEventIcon(activeNotification.type) }}</view>
      <view class="event-content">
        <view class="event-teams">
          {{ activeNotification.homeChs }} vs {{ activeNotification.awayChs }}
        </view>
        <view class="event-desc">
          <text v-if="activeNotification.type === 'goal'" class="event-text">
            {{ activeNotification.side === "home" ? "主队" : "客队" }}进球！ 比分
            {{ activeNotification.homeScore }}:{{ activeNotification.awayScore }}
          </text>
          <text v-else-if="activeNotification.type === 'corner'" class="event-text event-corner">
            {{ activeNotification.side === "home" ? "主队" : "客队" }}角球！ 第{{ activeNotification.cornerCount }}个
          </text>
          <text v-else-if="activeNotification.type === 'red'" class="event-text event-red">
            {{
              activeNotification.side === "home"
                ? activeNotification.homeChs
                : activeNotification.awayChs
            }}
            红牌！
          </text>
          <text v-else-if="activeNotification.type === 'yellow'" class="event-text event-yellow">
            {{
              activeNotification.side === "home"
                ? activeNotification.homeChs
                : activeNotification.awayChs
            }}
            黄牌！
          </text>
        </view>
      </view>
      <view class="event-close" @click="dismissNotification">✕</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from "vue";
import { useZcSettingsStore } from "@/stores/zcSettings";
import { useZcSoundPlayer } from "@/hooks/useZcSoundPlayer";

const setting = useZcSettingsStore();
const soundPlayer = useZcSoundPlayer();

// 震动
function vibrate() {
  try {
    plus.device.vibrate(200) 
  } catch (error) {
    
  }
}

// ========== 状态 ==========
let isInitialized = false; // 是否已完成首次快照
const previousMatchMap = {}; // 上一次各比赛数据快照（非响应式，避免不必要渲染）
const activeNotification = ref({}); // 当前显示的通知
const popupState = ref("hidden"); // hidden | entering | visible | leaving
let notificationTimer = null;
const notificationQueue = []; // 通知队列

const popupClass = computed(() => ({
  "popup-entering": popupState.value === "entering",
  "popup-visible": popupState.value === "visible",
  "popup-leaving": popupState.value === "leaving",
}));

// ========== 工具函数 ==========
function getEventIcon(type) {
  if (type === "goal") return "⚽";
  if (type === "corner") return "🚩";
  if (type === "red") return "🟥";
  if (type === "yellow") return "🟨";
  return "";
}

// ========== 弹窗队列 ==========
function dismissNotification() {
  if (popupState.value === "leaving") return; // 防重复触发
  popupState.value = "leaving";
  if (notificationTimer) {
    clearTimeout(notificationTimer);
    notificationTimer = null;
  }
  // 等待离开动画结束后再清理并展示下一个
  setTimeout(() => {
    activeNotification.value = {};
    popupState.value = "hidden";
    showNextNotification();
  }, 350);
}

function showNextNotification() {
  if (notificationQueue.length > 0) {
    const next = notificationQueue.shift();
    showNotificationPopup(next);
  }
}

function showNotificationPopup(notification) {
  activeNotification.value = notification;
  // 声音与弹窗同步：弹窗展示时才播放声音
  if (notification.soundIndex !== undefined) {
    soundPlayer.playSound(notification.soundIndex);
  }
  if (notification.shouldVibrate) {
    vibrate();
  }
  if (notificationTimer) {
    clearTimeout(notificationTimer);
  }
  // 触发进入动画
  popupState.value = "entering";
  // 进入动画持续 0.4s 后切换到可见状态
  setTimeout(() => {
    popupState.value = "visible";
  }, 400);
  notificationTimer = setTimeout(() => {
    dismissNotification();
  }, 5000);
}

function enqueueNotification(notification) {
  if (activeNotification.value.matchId || popupState.value === "leaving") {
    notificationQueue.push(notification);
  } else {
    showNotificationPopup(notification);
  }
}

// ========== 根据设置处理事件 ==========
function handleEvent(type, side, matchData, extraData = {}) {
  const noticeKey =
    type === "goal"
      ? "goalNotice"
      : type === "corner"
        ? "cornerNotice"
        : type === "red"
          ? "redCardNotice"
          : "yellowCardNotice";
  const soundKey =
    type === "goal"
      ? "goalSound"
      : type === "corner"
        ? "cornerSound"
        : type === "red"
          ? "redCardSound"
          : "yellowCardSound";

  const notice = setting[noticeKey];
  const sound = setting[soundKey];

  if (notice.popup) {
    // 有弹窗：声音和震动跟随弹窗队列顺序播放
    enqueueNotification({
      type,
      side,
      homeChs: matchData.homeChs,
      awayChs: matchData.awayChs,
      matchId: matchData.matchId,
      soundIndex: notice.sound ? sound[side] : undefined,
      shouldVibrate: notice.vibrate,
      ...extraData,
    });
  } else {
    // 无弹窗：直接播放声音和震动
    if (notice.sound) {
      soundPlayer.playSound(sound[side]);
    }
    if (notice.vibrate) {
      vibrate();
    }
  }
}

// ========== 变化检测 ==========
function detectChanges(oldMatches, newMatches) {
  const oldMap = {};
  oldMatches.forEach((m) => {
    if (m.matchId) oldMap[m.matchId] = m;
  });

  newMatches.forEach((newMatch) => {
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

    const oldHomeCorner = Number(oldMatch.homeCorner) || 0;
    const oldAwayCorner = Number(oldMatch.awayCorner) || 0;
    const newHomeCorner = Number(newMatch.homeCorner) || 0;
    const newAwayCorner = Number(newMatch.awayCorner) || 0;

    if (newHomeScore > oldHomeScore) {
      handleEvent("goal", "home", newMatch, {
        homeScore: newHomeScore,
        awayScore: newAwayScore,
      });
    }
    if (newAwayScore > oldAwayScore) {
      handleEvent("goal", "away", newMatch, {
        homeScore: newHomeScore,
        awayScore: newAwayScore,
      });
    }
    if (newHomeRed > oldHomeRed) {
      handleEvent("red", "home", newMatch);
    }
    if (newAwayRed > oldAwayRed) {
      handleEvent("red", "away", newMatch);
    }
    if (newHomeYellow > oldHomeYellow) {
      handleEvent("yellow", "home", newMatch);
    }
    if (newAwayYellow > oldAwayYellow) {
      handleEvent("yellow", "away", newMatch);
    }
    if (newHomeCorner > oldHomeCorner) {
      handleEvent("corner", "home", newMatch, {
        cornerCount: newHomeCorner,
      });
    }
    if (newAwayCorner > oldAwayCorner) {
      handleEvent("corner", "away", newMatch, {
        cornerCount: newAwayCorner,
      });
    }
  });
}

function updateSnapshot(matches) {
  matches.forEach((m) => {
    if (m.matchId) {
      previousMatchMap[m.matchId] = {
        homeScore: Number(m.homeScore) || 0,
        awayScore: Number(m.awayScore) || 0,
        homeRed: Number(m.homeRed) || 0,
        awayRed: Number(m.awayRed) || 0,
        homeYellow: Number(m.homeYellow) || 0,
        awayYellow: Number(m.awayYellow) || 0,
        homeCorner: Number(m.homeCorner) || 0,
        awayCorner: Number(m.awayCorner) || 0,
      };
    }
  });
}

// ========== 对外暴露：接收更新数据 ==========
/**
 * 外部调用此方法，传入最新比赛数据列表
 * - 首次调用：仅保存快照，不触发任何弹窗/音频
 * - 后续调用：对比变化，进球/角球/红黄牌时根据设置弹出通知/播放声音/震动
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
  transform: translateY(20rpx) scale(0.92);
  opacity: 0;
  pointer-events: none;
}

/* 隐藏态：无动画，保持在下方 */
.event-popup {
  transition: none;
}

/* 进入动画 */
.event-popup.popup-entering {
  animation: popup-enter 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  pointer-events: auto;
}

/* 可见态：保持在目标位置 */
.event-popup.popup-visible {
  transform: translateY(0) scale(1);
  opacity: 1;
  pointer-events: auto;
}

/* 离开动画 */
.event-popup.popup-leaving {
  animation: popup-leave 0.35s ease-in forwards;
}

@keyframes popup-enter {
  0% {
    transform: translateY(20rpx) scale(0.92);
    opacity: 0;
  }
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
}

@keyframes popup-leave {
  0% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  100% {
    transform: translateY(20rpx) scale(0.92);
    opacity: 0;
  }
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

.event-text.event-corner {
  color: #4fc3f7;
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