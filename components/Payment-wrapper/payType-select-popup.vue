<template>
  <view>
    <!-- 支付方式选择弹窗 -->
    <uni-popup ref="payPopup" type="bottom">
      <view class="pay-modal">
        <view class="modal-header">
          <text class="modal-title">选择支付方式</text>
          <text class="close-icon" @click="closePayModal">×</text>
        </view>

        <view class="pay-options">
          <radio-group @change="selectPayMethod">
            <!-- H5 平台 -->

            <label class="pay-option" value="wechat-qr">
              <!-- <view class="option-icon wechat-qr-icon"></view> -->
              <uni-icons
                class="option-icon wechat-qr-icon"
                type="scan"
                size="30"
                color="#fff"
              ></uni-icons>
              <text class="option-text">微信二维码支付</text>
              <radio :checked="selectedMethod === 'wechat-qr'" value="wechat-qr" color="#00aa00" />
            </label>
            <!-- APP 平台 -->
            <template v-if="platform === 'app-plus'">
              <label class="pay-option" value="alipay-app" v-if="haveAlipay">
                <view class="option-icon alipay-app-icon"></view>
                <text class="option-text">支付宝APP支付</text>
                <radio
                  :checked="selectedMethod === 'alipay-app'"
                  value="alipay-app"
                  color="#00aa00"
                />
              </label>

              <label class="pay-option" value="wechat-app">
                <view class="option-icon wechat-app-icon"></view>
                <text class="option-text">微信APP支付</text>
                <radio
                  :checked="selectedMethod === 'wechat-app'"
                  value="wechat-app"
                  color="#00aa00"
                />
              </label>
            </template>
          </radio-group>
        </view>

        <view class="confirm-btn" @click="confirmPayMethod">确认支付</view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: "PayMethodSelector",
  data() {
    // 获取当前平台
    let platform = "h5";
    let selectedMethod = "wechat-qr";
    // #ifdef APP-PLUS
    platform = "app-plus";
    selectedMethod = "wechat-app";
    // #endif
    return {
      platform: platform,
      selectedMethod: selectedMethod,
      amount: 0,
      orderId: "",
      haveAlipay: false,
    };
  },
  methods: {
    openPayModal() {
      this.$refs.payPopup.open();
    },

    closePayModal() {
      this.$refs.payPopup.close();
    },

    selectPayMethod(e) {
      this.selectedMethod = e.detail.value;
    },

    confirmPayMethod() {
      if (!this.selectedMethod) {
        uni.showToast({
          title: "请选择支付方式",
          icon: "none",
        });
        return;
      }

      this.$emit("payMethodSelected", this.selectedMethod);

      this.closePayModal();
    },
  },
  created() {
    const self = this;
    uni.getProvider({
      service: "payment",
      success: function (res) {
        console.log(res);
        self.haveAlipay = res.provider.includes("alipay");
      },
    });
  },
};
</script>

<style lang="scss">
.pay-modal {
  background-color: #fff;
  border-top-left-radius: 20rpx;
  border-top-right-radius: 20rpx;
  padding: 30rpx;

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30rpx;

    .modal-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
    }

    .close-icon {
      font-size: 48rpx;
      color: #ccc;
      padding: 10rpx;
    }
  }

  .pay-options {
    .pay-option {
      display: flex;
      align-items: center;
      padding: 20rpx 0;
      border-bottom: 1rpx solid #eee;

      .option-icon {
        width: 80rpx;
        height: 80rpx;
        border-radius: 50%;
        margin-right: 20rpx;
        background-size: 80%;
        background-position: center;
        background-repeat: no-repeat;

        &.wechat-qr-icon {
          background-color: #2dcd5d;
          text-align: center;
          line-height: 80rpx;
          color: #eee;
          //   background-image: url("~@/static/wechat-icon.png"); /* 需要替换为实际图标路径 */
        }

        &.alipay-app-icon {
          background-image: url("~@/static/alipay-icon.ico"); /* 需要替换为实际图标路径 */
        }

        &.wechat-app-icon {
          //   background-color: #2dcd5d;
          background-image: url("~@/static/wechat-icon.ico"); /* 需要替换为实际图标路径 */
        }
      }

      .option-text {
        flex: 1;
        font-size: 30rpx;
        color: #333;
      }
    }
  }

  .confirm-btn {
    width: 100%;
    height: 80rpx;
    line-height: 80rpx;
    text-align: center;
    background: linear-gradient(to right, #00c9a7, #00b4d8);
    color: #fff;
    border-radius: 40rpx;
    font-size: 32rpx;
    font-weight: bold;
    margin-top: 40rpx;
  }
}
</style>
