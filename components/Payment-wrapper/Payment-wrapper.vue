<template>
  <view>
    <!-- 二维码支付弹出层 -->
    <view class="qr-modal" v-if="showQRModal" @click="closeQRModal">
      <view class="qr-content" @click.stop>
        <view class="qr-header">
          <text class="qr-title">扫码支付</text>
          <text class="close-btn" @click="closeQRModal">×</text>
        </view>
        <view class="qr-body">
          <view class="qr-code-container">
            <l-qrcode class="qr-image" :value="qrCodeUrl" />
          </view>
          <text class="qr-tip">请使用微信扫描二维码完成支付</text>
          <text class="qr-amount">支付金额：¥{{ paymentAmount }}元</text>
          <text class="qr-status" v-if="isCheckingPayment">正在检查支付状态...</text>
          <text class="qr-hint" v-if="isCheckingPayment">
            请在1分钟内完成支付，请耐心等待系统检查
          </text>
        </view>
      </view>
    </view>
    <pay-type-select-popup
      ref="payMethodSelectorRef"
      @payMethodSelected="confirmPayMethod"
    ></pay-type-select-popup>
  </view>
</template>

<script>
import {
  apiUserRecharge,
  apiGetUserBalance,
  apiGetOrderPayStatus,
  apiWxpay,
  apigoldpay,
} from "@/api/apis.js";
import { getAccount } from "../../utils/request";
import payTypeSelectPopup from "./payType-select-popup.vue";
export default {
  name: "pay",
  components: {
    payTypeSelectPopup,
  },
  props: {
    info: {
      type: String,
    },
    amount: {
      type: [String, Number],
    },
    type: {
      // 0：充值 1提现,2打赏，3视频付费
      type: [String, Number],
    },
  },
  data() {
    let channel = 0;
    // #ifdef APP-PLUS
    channel = 3;
    // #endif
    // #ifdef H5
    channel = 0;
    // #endif
    return {
      channel,

      showQRModal: false,
      qrSize: 200,
      paymentAmount: 0,
      qrCodeUrl: "",

      isCheckingPayment: false,

      timer: 0,
    };
  },
  methods: {
    pay(data) {
      this.orderData = data;
      if (data.payType == 1) {
        // 积分支付
        this.createOrder(data);
      } else {
        this.$refs.payMethodSelectorRef.openPayModal();
      }
    },
    confirmPayMethod(payMethod) {
      console.log("payMethod:", payMethod);
      const payType = {
        "wechat-qr": 0,
        "alipay-app": 3,
        "wechat-app": 4,
      }[payMethod];
      this.createOrder({ ...this.orderData, payType });
    },
    // 暴露给外部的支付函数
    async createOrder({
      info, // 信息
      amount, // 金额
      type, // 0：充值 1提现,2打赏，3视频付费
      currentUser,
      payType = this.payType, // 0 微信二维码，1 积分 4 appwx支付
      remark, // 支付额外信息
    }) {
      try {
        if (Number(amount) != amount) {
          throw new Error();
        }
      } catch (error) {
        uni.showModal({
          title: "支付信息错误",
          content: "金额参数错误",
        });
        return;
      }
      this.paymentAmount = amount;
      if (payType == "1") {
        try {
          await this.checkBalance(amount);
        } catch (error) {
          //TODO handle the exception
          return;
        }
      }
      let rechargeData;
      try {
        // 组装参数
        rechargeData = {
          info: info, // 订单信息（可选）
          name: info, // 订单信息（可选）
          amount: amount.toString(), // 订单金额（必需）
          type: type, // 订单类型：0充值（可选）
          account: currentUser || getAccount(), // 账号（可选）
          payType: payType, // 支付方式：0微信（可选）
          channel: this.channel, // 下单渠道：0电脑端（可选）
          remark: remark,
        };
      } catch (error) {
        const errStr = (error && typeof error.toString === "function" && error.toString()) || "";
        uni.showModal({
          title: "支付信息错误",
          content: "参数错误（48932423）" + errStr,
        });
        return;
      }

      try {
        // 调用充值接口
        const response = await apiUserRecharge(rechargeData);
        this.payFromOrdreId(response.data, payType);
      } catch (error) {
        const errStr = (error && typeof error.toString === "function" && error.toString()) || "";
        uni.showModal({
          title: "支付接口错误",
          content: "参数错误（34634985）" + errStr,
        });
      }
    },

    // 展示二维码或调起app支付
    async payFromOrdreId(orderNo, payType = 0) {
      // 打赏或者付费
      let payInfo;
      payType = payType.toString();
      switch (payType) {
        case "0": // 展示二维码
          payInfo = await this.getPayInfo({
            orderNo: orderNo,
            payType: payType,
          });
          await this.generateQRCode(payInfo);
          break;
        case "1":
          apigoldpay({
            orderNo: orderNo,
          })
            .then((res) => {
              if (res.msg == "支付成功") {
                uni.showToast({
                  title: "支付成功",
                });
                this.payOver(true);
              }
            })
            .catch(() => {
              uni.showToast({
                title: "余额支付失败",
                icon: "error",
              });
              this.payOver(false);
            });
          break;
        case "3": // 支付宝支付
          payInfo = await this.getPayInfo({
            orderNo: orderNo,
            payType: payType,
          });
          await this.zfbPay(payInfo);
          break;
        case "4": // 掉起微信支付
          payInfo = await this.getPayInfo({
            orderNo: orderNo,
            payType: payType,
          });
          await this.wxAppPay(payInfo);
          break;
        default:
          uni.showModal({
            title: "支付失败",
            content: "暂时不支持该方式",
          });
          break;
      }
      if (payType != "1") {
        this.startPaymentCheck(orderNo);
      }
    },
    async getPayInfo({ orderNo, payType }) {
      // 准备微信支付数据
      const wxPayData = {
        orderNo: orderNo,
        payType: payType,
      };
      try {
        // 调用微信支付API
        const res = await apiWxpay(wxPayData);
        return res.data;
      } catch (error) {
        const errStr = (error && typeof error.toString === "function" && error.toString()) || "";
        uni.showModal({
          title: "获取支付参数失败(987492494)",
          content: errStr,
        });
      }
    },
    generateQRCode(url) {
      return new Promise((resolve) => {
        // this.generateQRCodeOnline(url);
        this.qrCodeUrl = url;
        this.showQRModal = true;
        resolve();
        return;
      });
    },
    // 使用在线服务生成二维码
    generateQRCodeOnline(url) {
      try {
        // 使用qrcode.js在线服务
        const encodedUrl = encodeURIComponent(url);
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${this.qrSize}x${this.qrSize}&data=${encodedUrl}`;
        this.qrCodeUrl = qrApiUrl;
        this.showQRModal = true;
      } catch (error) {
        uni.showToast({
          title: "二维码生成失败",
          icon: "none",
        });
      }
    },
    wxAppPay(orderInfo) {
      return new Promise((resolve) => {
        const self = this;
        uni.requestPayment({
          provider: "wxpay",
          orderInfo: {
            appid: "wxcc8965020c482056",
            partnerid: orderInfo.merchantId,
            prepayid: orderInfo.prepayId,
            noncestr: orderInfo.nonceStr,
            timestamp: orderInfo.timeStamp,
            package: "Sign=WXPay",
            sign: orderInfo.sign,
          },
          success: function (res) {
            resolve();
          },
          fail: function (res) {
            console.log("支付失败", res);
            uni.showToast({
              title: "支付失败",
              content: JSON.stringify(res),
              icon: "error",
            });
            self.payOver(false);
          },
        });
      });
    },
    zfbPay(orderStr) {
      return new Promise((resolve) => {
        const self = this;
        uni.requestPayment({
          provider: "alipay",
          orderInfo: orderStr,
          success: function (res) {
            resolve();
          },
          fail: function (res) {
            console.log("支付失败", res);
            uni.showToast({
              title: "支付失败",
              content: JSON.stringify(res),
              icon: "error",
            });
            self.payOver(false);
          },
        });
      });
    },
    async checkBalance(amount) {
      const balanceResponse = await apiGetUserBalance({
        account: getAccount(),
      });
      const userBalance = parseFloat(balanceResponse.data.gold || 0);
      const paymentAmount = parseFloat(amount);

      // 2. 检查余额是否足够
      if (userBalance < paymentAmount) {
        console.log(userBalance, paymentAmount);
        uni.hideLoading();
        uni.showModal({
          title: "余额不足，请充值",
          confirmText: "去充值",
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: "/pages/recharge/recharge",
              });
            }
          },
        });
        throw new Error();
        return false;
      }
    },
    startPaymentCheck(orderNo, count = 0) {
      const checkTime = 1000 * 1; // 1秒检查一次
      const maxCheckCount = 300;
      clearTimeout(this.timer);

      if (count >= maxCheckCount) {
        uni.showModal({
          title: "检查支付状态异常",
          content: "检查状态次数已达上限",
        });
        this.payOver(false);
        return;
      }
      if (count == 0) {
        // uni.showLoading({
        //   title: "检查支付状态中...",
        // });
      }

      this.timer = setTimeout(() => {
        if (orderNo) {
          this.checkPayStatusApi(orderNo).then((flat) => {
            if (flat) {
              // uni.hideLoading();
              uni.showToast({
                title: "支付成功！！！",
              });
              this.payOver(true);
            } else {
              this.startPaymentCheck(orderNo, count + 1);
            }
          });
        }
      }, checkTime);
    },
    // 检查订单支付状态
    async checkPayStatusApi(orderNo) {
      try {
        const paymentStatusResponse = await apiGetOrderPayStatus({
          orderNo: orderNo,
        });
        if (paymentStatusResponse.data) {
          return true;
        }
        throw new Error();
      } catch (error) {
        return false;
      }
    },
    closeQRModal() {
      this.payOver(false);
    },
    payOver(flag) {
      uni.hideLoading();
      // 支付结束，回调父组件
      this.$emit("payOver", {
        orderNo: this.orderNo,
        flag: flag,
      });
      this.orderNo = "";
      this.qrCodeUrl = "";
      this.showQRModal = false;
      this.paymentAmount = 0;
    },
  },
};
</script>

<style lang="scss">
/* 二维码弹出层样式 */
.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx;
}

.qr-content {
  width: 100%;
  max-width: 500rpx;
  background-color: #fff;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.2);
}

.qr-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.qr-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  font-weight: bold;
  width: 60rpx;
  text-align: center;
}

.qr-body {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qr-code-container {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f8f9fa;
  border-radius: 15rpx;
}

.qr-image {
  display: block;
  border-radius: 10rpx;
}

.qr-loading {
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 10rpx;
}

.loading-text {
  font-size: 28rpx;
  color: #666;
}

.qr-tip {
  font-size: 28rpx;
  color: #666;
  text-align: center;
  margin-bottom: 15rpx;
}

.qr-amount {
  font-size: 32rpx;
  color: #ff4757;
  font-weight: 600;
  text-align: center;
}

.qr-status {
  font-size: 24rpx;
  color: #28b389;
  text-align: center;
  margin-top: 10rpx;
  animation: pulse 1.5s infinite;
}

.qr-hint {
  font-size: 22rpx;
  color: #999;
  text-align: center;
  margin-top: 8rpx;
  line-height: 1.4;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 1;
  }
}

.qr-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-qr-btn,
.refresh-qr-btn,
.success-qr-btn {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.cancel-qr-btn {
  background-color: #f5f5f5;
  color: #666;
}

.refresh-qr-btn {
  background-color: #28b389;
  color: #fff;
}

.success-qr-btn {
  background-color: #ff4757;
  color: #fff;
}
</style>
