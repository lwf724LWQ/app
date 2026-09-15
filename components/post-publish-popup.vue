<template>
  <uni-popup
    ref="popup"
    type="bottom"
    :safe-area="false"
    :mask-click="false"
    :animation="true"
    :mask-background-color="'rgba(0,0,0,0.5)'"
    :duration="300"
  >
    <view class="publish-modal">
      <view class="modal-header">
        <text class="modal-title">发布帖子</text>
        <view class="close-btn" @click="close">
          <uni-icons type="close" size="20" color="#999"></uni-icons>
        </view>
      </view>

      <view class="modal-content">
        <view class="period-title">
          <text class="period-text">{{ lotteryType || "彩迷" }}</text>
        </view>

        <view class="agreement-section">
          <view class="checkbox-wrapper" @click="toggleAgreement">
            <view class="custom-checkbox" :class="{ checked: agreedToTerms }">
              <view v-if="agreedToTerms" class="checkmark">✓</view>
            </view>
            <text class="agreement-text">同意并遵守《彩友圈管理规范》</text>
          </view>
        </view>

        <view class="function-buttons">
          <view class="button-row">
            <view class="function-btn" @click="selectFunction('predict')">
              <view class="btn-icon predict-icon">免</view>
              <text class="btn-text">预测帖(免审)</text>
            </view>
            <view class="function-btn" @click="selectFunction('pattern')">
              <view class="btn-icon pattern-icon">
                <uni-icons type="redo" size="24" color="#fff"></uni-icons>
              </view>
              <text class="btn-text">规律帖(上传规律)</text>
            </view>
            <view class="function-btn" @click="selectFunction('collection')">
              <view class="btn-icon predict-icon">免</view>
              <text class="btn-text">集合贴</text>
            </view>
          </view>
        </view>
      </view>

      <view class="modal-footer">
        <button class="close-btn-modal" @click="close">关闭</button>
      </view>
    </view>
  </uni-popup>
</template>

<script>
import tool from "@/utils/tool.js";

/**
 * 发布帖子弹窗（彩友圈 / 大师榜单共用）
 * 通过 ref 调用 open() / close()
 *
 * 注意：《彩友圈管理规范》的勾选与落库（postAgreement）只在这里实现一份，
 * 避免多个入口各写一套导致规范提示不一致。
 */
export default {
  name: "PostPublishPopup",
  props: {
    // 当前彩种，发布时带到发布页
    lotteryType: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      agreedToTerms: uni.getStorageSync("postAgreement") || false,
    };
  },
  methods: {
    open() {
      this.$refs.popup.open();
    },
    close() {
      this.$refs.popup.close();
    },
    toggleAgreement() {
      this.agreedToTerms = !this.agreedToTerms;
    },
    async selectFunction(type) {
      if (!this.agreedToTerms) {
        const res = await uni.showModal({
          title: "提示",
          content: "是否同意并遵守《彩友圈管理规范》",
          showCancel: true,
          confirmText: "同意",
          cancelText: "取消",
        });
        if (!res.confirm) return;
        this.toggleAgreement();
      }
      uni.setStorageSync("postAgreement", true);

      const urlParams = tool.formatUrlParams({
        lotteryType: this.lotteryType,
      });

      const routes = {
        predict: `/pages/forum/post/created-scheme?${urlParams}`,
        pattern: `/pages/forum/post/upload-diagram?${urlParams}`,
        collection: `/pages/forum/creaet-collection-post?currentLotteryType=${this.lotteryType}`,
      };

      const url = routes[type];
      if (!url) {
        this.close();
        return;
      }

      uni.navigateTo({
        url,
        success: () => this.close(),
        fail: () => uni.showToast({ title: "跳转失败", icon: "none" }),
      });
    },
  },
};
</script>

<style lang="scss" scoped>
/* 发布弹出层 */
.publish-modal {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 65vh;
  min-height: 400rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.modal-content {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.period-title {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-title .period-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.agreement-section {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 15rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.custom-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  transition: all 0.3s ease;
}

.custom-checkbox.checked {
  background-color: #ff4757;
  border-color: #ff4757;
}

.checkmark {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.agreement-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #ff4757;
}

.function-buttons {
  margin-bottom: 10rpx;
}

.button-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.button-row:last-child {
  margin-bottom: 10rpx;
}

.function-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 15rpx;
  transition: transform 0.2s ease;
}

.function-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.predict-icon {
  background-color: #28b389;
}

.pattern-icon {
  background-color: #ff6b35;
}

.btn-text {
  font-size: 35rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}

.modal-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  text-align: center;
  flex-shrink: 0;
}

.close-btn-modal {
  background: transparent;
  border: none;
  color: #333;
  font-size: 32rpx;
  padding: 20rpx 40rpx;
}
</style>
