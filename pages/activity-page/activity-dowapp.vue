<template>
  <view class="content">
    <image class="bg-img" src="/static/images/activity-dowapp.jpeg" mode="widthFix"></image>

    <!-- 主要内容区域 -->
    <view class="main-content">
      <view class="invitation-text">
        <text class="username">{{ username }}</text>
        <text class="invite-text">邀请了你下载五七仔</text>
      </view>

      <view class="reward-info">
        <text class="reward-text">通过该方式注册后即可获得8金币</text>
      </view>

      <view class="input-container">
        <input
          type="number"
          class="phone-input"
          placeholder="请输入手机号"
          v-model="phoneNumber"
          maxlength="11"
        />
      </view>

      <button class="claim-btn" @click="claimReward">下载APP</button>

      <!-- 新增特色功能介绍 -->
      <view class="features-section">
        <view class="feature-item">
          <view class="feature-title">多彩预测</view>
          <view class="feature-subtitle">排列三 / 排列五 / 七星彩 / 福彩3D</view>
          <view class="feature-desc">预测分享，数据透彻，中奖率提升</view>
        </view>

        <view class="feature-item">
          <view class="feature-title">彩友社群</view>
          <view class="feature-subtitle">经验交流、实时讨论</view>
          <view class="feature-desc">结识同路人，互助成长</view>
        </view>

        <view class="feature-item">
          <view class="feature-title">实时开奖</view>
          <view class="feature-subtitle">5秒钟实时更新</view>
          <view class="feature-desc">第一时间掌握中奖结果</view>
        </view>
      </view>
    </view>

    <!-- 使用方法说明 -->
    <!-- <view class="usage-section">
      <view class="usage-title">使用方法</view>
      <view class="usage-desc">下载app后使用该手机号注册即可获得8金币</view>
    </view> -->

    <!-- 活动规则弹框 -->
    <view v-if="showRule" class="popup-overlay" @click="hideRulePopup">
      <view class="rule-popup" @click.stop>
        <view class="popup-header">
          <text class="popup-title">活动规则</text>
          <text class="close-icon" @click="hideRulePopup">×</text>
        </view>
        <view class="rule-content">
          <text class="rule-text">
            邀请新用户注册五七仔，通过邀请链接下载app并注册成功后，双方都可获得8金币，多邀多得。
          </text>
        </view>
        <view class="popup-footer">
          <button class="confirm-btn" @click="hideRulePopup">确定</button>
        </view>
      </view>
    </view>
    <!-- 微信浏览器引导 -->
    <div class="wechat-tip-overlay" v-show="showWechatTip" @click="closeWechatTip">
      <img src="/static/yindao.png" alt="微信打开引导" class="wechat-guide-image" />
    </div>
  </view>
</template>

<script>
import myPage from "../../components/myPage.vue";
import cryptoJs from "crypto-js";
import { vcodeConfiont } from "@/api/apis.js";
const dowAppUrl = "http://video.caimizm.com/upload/filehXIjhcmS3hMH.apk";

export default {
  components: {
    myPage,
  },
  data() {
    return {
      showRule: false,
      username: "", // 接收用户名参数
      inviteCode: "", // 接收邀请码参数
      phoneNumber: "", // 手机号输入
      showWechatTip: false, // 控制微信浏览器提示显示
    };
  },
  methods: {
    showRulePopup() {
      this.showRule = true;
    },
    hideRulePopup() {
      this.showRule = false;
    },
    claimReward() {
      // 处理奖励领取逻辑
      if (!this.phoneNumber || this.phoneNumber.length !== 11) {
        uni.showToast({
          title: "请输入正确的手机号",
          icon: "none",
        });
        return;
      }

      // 判断是否为微信浏览器
      const ua = navigator.userAgent.toLowerCase();
      const isWechat = /micromessenger/i.test(ua);
      vcodeConfiont(this.phoneNumber, this.inviteCode);
      if (!isWechat) {
        // 如果不是微信浏览器，直接下载APP
        window.open(dowAppUrl);
      } else {
        // 如果是微信浏览器，显示引导图片
        this.showWechatTip = true; // 显示提示弹窗
      }
    },

    closeWechatTip() {
      this.showWechatTip = false;
    },
    decrypt(str) {
      const decryptedBytes = cryptoJs.AES.decrypt(str, "inviteCode");
      // 将解密后的数据转换为 UTF-8 格式
      return decryptedBytes.toString(cryptoJs.enc.Utf8);
    },
  },
  onLoad(options) {
    // 判断是否为微信浏览器
    const ua = navigator.userAgent.toLowerCase();
    const isWechat = /micromessenger/i.test(ua);
    if (isWechat) {
      // 如果不是微信浏览器，则不显示微信浏览器提示
      this.showWechatTip = true;
    }
    // 接收页面传参
    this.username = options.username || "";
    try {
      this.inviteCode = this.decrypt(decodeURIComponent(options.inviteCode)) || "";
    } catch (error) {}
    this.phoneNumber = options.phoneNumber || "";
    if (this.phoneNumber) {
      this.claimReward();
    }
  },
};
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  min-height: 80vh;
  background-color: #8f0d0f;
  position: relative;
  font-weight: bold;
  text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
  .bg-img {
    position: absolute;
    z-index: 0;
    top: 0;
    left: 0;
    width: 100%;
  }

  .main-content {
    padding: 30rpx;
    position: relative;
    z-index: 10;
    padding-top: 280rpx;
    width: 540rpx;
    margin: 0 auto;

    .invitation-text {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 30rpx;

      .username {
        font-size: 46rpx;
        color: #fbff06;
        font-weight: bold;
        margin-right: 10rpx;
      }

      .invite-text {
        font-size: 46rpx;
        color: #222;
      }
    }

    .reward-info {
      text-align: center;
      margin-bottom: 60rpx;

      .reward-text {
        font-size: 32rpx;
        color: #ff0000;
        background: rgba(253, 232, 46, 0.2);
        padding: 10rpx 30rpx;
        border-radius: 30rpx;
      }
    }

    .input-container {
      margin-bottom: 50rpx;

      .phone-input {
        width: 100%;
        height: 80rpx;
        background: #fff;
        border-radius: 10rpx;
        padding: 0 20rpx;
        font-size: 28rpx;
        box-sizing: border-box;
      }
    }

    .claim-btn {
      width: 100%;
      height: 80rpx;
      background: linear-gradient(to right, #ff9500, #ff5e3a);
      color: #fff;
      border: none;
      border-radius: 10rpx;
      font-size: 32rpx;
      font-weight: bold;
      margin-bottom: 50rpx;
    }

    /* 新增特色功能样式 */
    .features-section {
      margin-top: 30rpx;
      background: #8f0d0f;
      border-radius: 15rpx;
      padding: 20rpx;
      backdrop-filter: blur(5rpx);

      .feature-item {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 10rpx;
        padding: 20rpx;
        margin-bottom: 20rpx;
        box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);

        &:last-child {
          margin-bottom: 0;
        }

        .feature-title {
          font-size: 30rpx;
          color: #ffd700;
          font-weight: bold;
          text-align: center;
          margin-bottom: 10rpx;
        }

        .feature-subtitle {
          font-size: 26rpx;
          color: #fff;
          text-align: center;
          margin-bottom: 8rpx;
        }

        .feature-desc {
          font-size: 24rpx;
          color: #e0e0e0;
          text-align: center;
        }
      }
    }
  }

  .usage-section {
    position: absolute;
    z-index: 10;
    bottom: 50rpx;
    left: 0;
    right: 0;
    margin: 0 20rpx;

    border-radius: 30rpx;

    padding: 10rpx;

    background: rgba(0, 0, 0, 0.3); // 添加灰色透明底

    .usage-title {
      font-size: 32rpx;
      color: #ffffff;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10rpx;
    }

    .usage-desc {
      font-size: 28rpx;
      color: #ffffff;
      text-align: center;
      line-height: 1.6;
      padding: 10rpx;
      border-radius: 10rpx;
    }
  }
}

.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.rule-popup {
  width: 80%;
  background: #fff;
  border-radius: 20rpx;
  overflow: hidden;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #eee;

  .popup-title {
    font-size: 34rpx;
    font-weight: bold;
    color: #333;
  }

  .close-icon {
    font-size: 40rpx;
    color: #999;
    padding: 10rpx;
  }
}

.rule-content {
  padding: 30rpx;

  .rule-text {
    font-size: 28rpx;
    color: #666;
    line-height: 1.6;
  }
}

.popup-footer {
  padding: 30rpx;

  .confirm-btn {
    width: 100%;
    height: 80rpx;
    background: linear-gradient(to right, #ff9500, #ff5e3a);
    color: #fff;
    border: none;
    border-radius: 10rpx;
    font-size: 32rpx;
  }
}

.wechat-tip-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.8);
  z-index: 9999;

  .wechat-guide-image {
    width: 100%;
  }
}
</style>
