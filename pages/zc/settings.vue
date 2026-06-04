<template>
    <myPage pageTitle="赛事提醒">
    <view class="settings-page">
        <!-- 仅提示我关注的 -->
        <view class="section">
        <view class="section-title">通知范围</view>
        <view class="setting-row">
            <view class="setting-label">
            <text class="label-text">仅提示我关注的</text>
            <text class="label-desc">开启后仅接收已关注比赛的通知</text>
            </view>
            <switch :checked="onlyFollowed" @change="onOnlyFollowedChange" color="#ff4d4f" />
        </view>
        </view>

        <!-- 事件提示设置 -->
        <view class="section">
        <view class="section-title">事件提示</view>

        <!-- 进球提示 -->
        <view class="event-block">
            <view class="event-header">
            <text class="event-name">进球提示</text>
            </view>
            <view class="event-options">
            <label class="checkbox-item" v-for="opt in notifyOptions" :key="'goal-' + opt.key">
                <checkbox
                :value="opt.key"
                :checked="goalNotice[opt.key]"
                @click="onGoalNoticeChange(opt.key)"
                color="#ff4d4f"
                />
                <text>{{ opt.label }}</text>
            </label>
            </view>
        </view>

        <!-- 角球提示 -->
        <view class="event-block">
            <view class="event-header">
            <text class="event-name">角球提示</text>
            </view>
            <view class="event-options">
            <label class="checkbox-item" v-for="opt in notifyOptions" :key="'corner-' + opt.key">
                <checkbox
                :value="opt.key"
                :checked="cornerNotice[opt.key]"
                @click="onCornerNoticeChange(opt.key)"
                color="#ff4d4f"
                />
                <text>{{ opt.label }}</text>
            </label>
            </view>
        </view>

        <!-- 黄牌提示 -->
        <view class="event-block">
            <view class="event-header">
            <text class="event-name">黄牌提示</text>
            </view>
            <view class="event-options">
            <label class="checkbox-item" v-for="opt in notifyOptions" :key="'yellow-' + opt.key">
                <checkbox
                :value="opt.key"
                :checked="yellowCardNotice[opt.key]"
                @click="onYellowCardNoticeChange(opt.key)"
                color="#ff4d4f"
                />
                <text>{{ opt.label }}</text>
            </label>
            </view>
        </view>

        <!-- 红牌提示 -->
        <view class="event-block">
            <view class="event-header">
            <text class="event-name">红牌提示</text>
            </view>
            <view class="event-options">
            <label class="checkbox-item" v-for="opt in notifyOptions" :key="'red-' + opt.key">
                <checkbox
                :value="opt.key"
                :checked="redCardNotice[opt.key]"
                @click="onRedCardNoticeChange(opt.key)"
                color="#ff4d4f"
                />
                <text>{{ opt.label }}</text>
            </label>
            </view>
        </view>
        </view>

        <!-- 声音选择 -->
        <view class="section">
        <view class="section-title">提示音设置</view>

        <!-- 进球声音 -->
        <view class="sound-row">
            <view class="sound-label">进球声音</view>
            <view class="sound-selects">
            <view class="select-item">
                <text class="select-tag">主队</text>
                <picker
                :range="soundOptions"
                :value="goalSound.home"
                @change="(e) => onSoundChange('goalSound', 'home', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[goalSound.home] }}</view>
                </picker>
            </view>
            <view class="select-item">
                <text class="select-tag">客队</text>
                <picker
                :range="soundOptions"
                :value="goalSound.away"
                @change="(e) => onSoundChange('goalSound', 'away', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[goalSound.away] }}</view>
                </picker>
            </view>
            </view>
        </view>

        <!-- 角球声音 -->
        <view class="sound-row">
            <view class="sound-label">角球声音</view>
            <view class="sound-selects">
            <view class="select-item">
                <text class="select-tag">主队</text>
                <picker
                :range="soundOptions"
                :value="cornerSound.home"
                @change="(e) => onSoundChange('cornerSound', 'home', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[cornerSound.home] }}</view>
                </picker>
            </view>
            <view class="select-item">
                <text class="select-tag">客队</text>
                <picker
                :range="soundOptions"
                :value="cornerSound.away"
                @change="(e) => onSoundChange('cornerSound', 'away', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[cornerSound.away] }}</view>
                </picker>
            </view>
            </view>
        </view>

        <!-- 红牌声音 -->
        <view class="sound-row">
            <view class="sound-label">红牌声音</view>
            <view class="sound-selects">
            <view class="select-item">
                <text class="select-tag">主队</text>
                <picker
                :range="soundOptions"
                :value="redCardSound.home"
                @change="(e) => onSoundChange('redCardSound', 'home', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[redCardSound.home] }}</view>
                </picker>
            </view>
            <view class="select-item">
                <text class="select-tag">客队</text>
                <picker
                :range="soundOptions"
                :value="redCardSound.away"
                @change="(e) => onSoundChange('redCardSound', 'away', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[redCardSound.away] }}</view>
                </picker>
            </view>
            </view>
        </view>

        <!-- 黄牌声音 -->
        <view class="sound-row">
            <view class="sound-label">黄牌声音</view>
            <view class="sound-selects">
            <view class="select-item">
                <text class="select-tag">主队</text>
                <picker
                :range="soundOptions"
                :value="yellowCardSound.home"
                @change="(e) => onSoundChange('yellowCardSound', 'home', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[yellowCardSound.home] }}</view>
                </picker>
            </view>
            <view class="select-item">
                <text class="select-tag">客队</text>
                <picker
                :range="soundOptions"
                :value="yellowCardSound.away"
                @change="(e) => onSoundChange('yellowCardSound', 'away', e.detail.value)"
                >
                <view class="picker-text">{{ soundOptions[yellowCardSound.away] }}</view>
                </picker>
            </view>
            </view>
        </view>
        </view>
    </view>
  </myPage>
</template>

<script>
import myPage from "@/components/myPage.vue"
import { useZcSettingsStore } from "@/stores/zcSettings";
import { useZcSoundPlayer } from "../../hooks/useZcSoundPlayer";

export default {
    components: {myPage},
  computed: {
    store() {
      return useZcSettingsStore();
    },
    onlyFollowed() {
      return this.store.onlyFollowed;
    },
    goalNotice() {
      return this.store.goalNotice;
    },
    cornerNotice() {
      return this.store.cornerNotice;
    },
    yellowCardNotice() {
      return this.store.yellowCardNotice;
    },
    redCardNotice() {
      return this.store.redCardNotice;
    },
    goalSound() {
      return this.store.goalSound;
    },
    cornerSound() {
      return this.store.cornerSound;
    },
    redCardSound() {
      return this.store.redCardSound;
    },
    yellowCardSound() {
      return this.store.yellowCardSound;
    },
  },
  data() {
    const isHaveVibrate = typeof uni.vibrate === "function"
    const notifyOptions = [
        { key: 'sound', label: '声音' },
        { key: 'popup', label: '弹窗' },
      ]
    if (isHaveVibrate) {
      notifyOptions.push({ key: 'vibrate', label: '震动' })
    }
    const soundPlayer = useZcSoundPlayer()
    return {
      notifyOptions: notifyOptions,
      isHaveVibrate: isHaveVibrate,
      soundOptions: soundPlayer.getSoundConfig().map(item => item.name),
      soundPlayer: soundPlayer
    };
  },
  methods: {
    onOnlyFollowedChange(e) {
      this.store.setOnlyFollowed(e.detail.value);
    },
    onGoalNoticeChange(key) {
      this.store.toggleGoalNotice(key);
    },
    onCornerNoticeChange(key) {
      this.store.toggleCornerNotice(key);
    },
    onYellowCardNoticeChange(key) {
      this.store.toggleYellowCardNotice(key);
    },
    onRedCardNoticeChange(key) {
      this.store.toggleRedCardNotice(key);
    },
    onSoundChange(soundKey, team, value) {
      this.soundPlayer.playSound(value)
      if (soundKey === 'goalSound') {
        if (team === 'home') this.store.setGoalSoundHome(value);
        else this.store.setGoalSoundAway(value);
      } else if (soundKey === 'cornerSound') {
        if (team === 'home') this.store.setCornerSoundHome(value);
        else this.store.setCornerSoundAway(value);
      } else if (soundKey === 'redCardSound') {
        if (team === 'home') this.store.setRedCardSoundHome(value);
        else this.store.setRedCardSoundAway(value);
      } else if (soundKey === 'yellowCardSound') {
        if (team === 'home') this.store.setYellowCardSoundHome(value);
        else this.store.setYellowCardSoundAway(value);
      }
    },
  },
};
</script>

<style scoped lang="scss">
.settings-page {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.section {
  background-color: #fff;
  margin-top: 20rpx;
  padding: 0 30rpx;
}

.section-title {
  font-size: 26rpx;
  color: #999;
  padding: 20rpx 0 10rpx 0;
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 0;
}

.setting-label {
  display: flex;
  flex-direction: column;
}

.label-text {
  font-size: 30rpx;
  color: #333;
}

.label-desc {
  font-size: 22rpx;
  color: #999;
  margin-top: 4rpx;
}

// 事件提示块
.event-block {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.event-header {
  margin-bottom: 12rpx;
}

.event-name {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.event-options {
  display: flex;
  gap: 40rpx;
  padding-left: 20rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-size: 26rpx;
  color: #666;
}

// 声音选择行
.sound-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 0;
  border-bottom: 1rpx solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
}

.sound-label {
  font-size: 28rpx;
  color: #333;
  flex-shrink: 0;
  width: 140rpx;
}

.sound-selects {
  display: flex;
  gap: 30rpx;
  flex: 1;
  justify-content: flex-end;
}

.select-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.select-tag {
  font-size: 22rpx;
  color: #999;
  background-color: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 6rpx;
}

.picker-text {
  font-size: 26rpx;
  color: #333;
  padding: 8rpx 24rpx 8rpx 16rpx;
  background-color: #fafafa;
  border: 1rpx solid #e8e8e8;
  border-radius: 8rpx;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 8rpx;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 0;
    border-left: 8rpx solid transparent;
    border-right: 8rpx solid transparent;
    border-top: 10rpx solid #999;
  }
}
</style>