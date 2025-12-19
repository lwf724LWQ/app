<template>
  <view class="container">
    <!-- 隐私政策弹窗 -->
    <uni-popup ref="privacyPopup" type="dialog">
      <view class="privacy-dialog">
        <view class="dialog-header">
          <text class="header-title">隐私政策提示</text>
        </view>

        <view class="dialog-content">
          <scroll-view class="content-scroll" scroll-y="true">
            <text class="content-text">
              请你务必审慎阅读、充分理解“服务协议”和“隐私政策”各条款，包括但不限于：为了更好的向你提供服务，我们需要收集你的设备标识、操作日志等信息用于分析、优化应用性能。<br />　　你可阅读
              <navigator
                class="privacy-link"
                url="/pages/login/agreement?type=UserAgreement"
                >《服务协议》</navigator
              >和<navigator
                class="privacy-link"
                url="/pages/login/agreement?type=PrivacyPolicy"
                >《隐私政策》</navigator
              >了解详细信息。如果你同意，请点击下面按钮开始接受我们的服务。
            </text>
          </scroll-view>
        </view>

        <view class="dialog-footer">
          <button class="btn-disagree" @click="handleDisagree">不同意</button>
          <button class="btn-agree" type="primary" @click="handleAgree">
            同意
          </button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>
  <script>
export default {
  methods: {
    // 显示隐私政策弹窗
    open() {
      this.$refs.privacyPopup.open();
    },

    // 用户不同意隐私政策
    handleDisagree() {
      this.$refs.privacyPopup.close();
    },

    // 用户同意隐私政策
    handleAgree() {
      this.$refs.privacyPopup.close();

      this.$emit("agree", true);
    },
  },
};
</script>
<style scoped>
.auth-buttons {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.auth-buttons button {
  width: 100%;
  height: 80rpx;
  font-size: 32rpx;
}

.privacy-dialog {
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 20rpx;
  overflow: hidden;
}

.dialog-header {
  padding: 30rpx;
  text-align: center;
  border-bottom: 1rpx solid #eeeeee;
}

.header-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
}

.dialog-content {
  padding: 30rpx;
  max-height: 500rpx;
}

.content-scroll {
  max-height: 440rpx;
}

.content-text {
  font-size: 28rpx;
  line-height: 42rpx;
  color: #666666;
}
.privacy-link {
  display: inline;
  color: #2337ec;
}

.dialog-footer {
  display: flex;
  border-top: 1rpx solid #eeeeee;
}

.dialog-footer button {
  flex: 1;
  height: 80rpx;
  border-radius: 0;
  font-size: 30rpx;
}

.btn-disagree {
  background-color: #f8f8f8;
  color: #666666;
}

.btn-agree {
  background-color: #007aff;
  color: #ffffff;
}
</style>