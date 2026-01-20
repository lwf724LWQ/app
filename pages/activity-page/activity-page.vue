<template>
  <myPage pageTitle="五七仔">
    <view class="content">
      <image class="bg-img" src="/static/images/activity-bg.jpg" mode="widthFix"></image>

      <!-- 活动主内容 -->
      <view class="activity-content">
        <view class="title">邀请好友注册</view>
        <view class="subtitle">双方各得8金币</view>
        <view class="description">邀请新用户通过您的专属链接下载APP并完成注册，即可获得奖励</view>

        <view class="reward-info">
          <view class="reward-item">
            <text class="number">8</text>
            <text class="unit">金币</text>
            <text class="label">您获得</text>
          </view>
          <view class="vs-text">VS</view>
          <view class="reward-item">
            <text class="number">8</text>
            <text class="unit">金币</text>
            <text class="label">好友获得</text>
          </view>
        </view>

        <view class="action-buttons">
          <button class="share-btn wechat-friend" @click="shareToWechatFriend">
            分享给微信好友
          </button>
          <button class="share-btn wechat-moments" @click="shareToWechatMoments">
            分享到微信朋友圈
          </button>
        </view>

        <view class="rule-link" @click="showRulePopup">
          <text>活动规则</text>
          <text class="icon-arrow">></text>
        </view>
      </view>

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
    </view>
  </myPage>
</template>

<script>
import myPage from "../../components/myPage.vue";
import { useUserStore } from "../../stores/userStore";
import cryptoJs from "crypto-js";
import logo from "/static/logo.png";

function getConfig(username, inviteCode) {
  return {
    provider: "weixin",
    type: 0,
    href: `https://caimizm.com/#/pages/activity-page/activity-dowapp?inviteCode=${encodeURIComponent(
      inviteCode
    )}&username=${encodeURIComponent(username)}`,
    title: "送您金币，免费查看大师预测！",
    summary: "内含排列三排列五，福彩3D七星彩开奖+大师预测，抓局画规分享",
    imageUrl: logo,
    success(res) {
      uni.showToast({
        title: "分享成功",
        icon: "success",
      });
    },
    fail(err) {},
  };
}

export default {
  components: {
    myPage,
  },
  data() {
    return {
      userInfo: {
        account: "",
        nickname: "",
      },
      inviteCode: "",
      showRule: false,
    };
  },
  methods: {
    encrypt(text) {
      // 将邀请码加密
      const encrypted = cryptoJs.AES.encrypt(text, "inviteCode");
      return encrypted.toString();
      // uni.setClipboardData({data: encrypted.toString(), success: function(res){console.log(res)},fail: function (err){
      // 		console.log(err)
      // 	},
      // })
    },
    showRulePopup() {
      this.showRule = true;
    },
    hideRulePopup() {
      this.showRule = false;
    },
    shareToWechatFriend() {
      uni.share({
        ...getConfig(this.userInfo.nickname, this.inviteCode),
        scene: "WXSceneSession",
      });
    },
    shareToWechatMoments() {
      uni.share({
        ...getConfig(this.userInfo.nickname, this.inviteCode),
        scene: "WXSceneTimeline",
      });
    },
  },
  onLoad() {
    const userStore = useUserStore();
    this.userInfo = userStore.getUserInfo;

    this.inviteCode = this.encrypt(this.userInfo.account);
  },
};
</script>

<style lang="scss" scoped>
.content {
  width: 100%;
  min-height: 100%;
  background-color: #ee0050;
  position: relative;

  .bg-img {
    width: 100%;
  }

  .activity-content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 100rpx 20rpx 20rpx;
    box-sizing: border-box;

    .title {
      text-align: center;
      font-size: 70rpx;
      color: #fff;
      font-weight: bold;
      margin-top: 60rpx;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
      background: rgba(0, 0, 0, 0.3); // 添加灰色透明底
      padding: 10rpx 20rpx; // 增加内边距使文字与背景更协调
      border-radius: 10rpx; // 添加圆角使外观更美观
      display: block; // 修改为block使其能居中
      margin-left: auto; // 居中显示
      margin-right: auto;
    }

    .subtitle {
      text-align: center;
      font-size: 56rpx;
      color: #ffd700;
      font-weight: bold;
      margin-top: 20rpx;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
      background: rgba(0, 0, 0, 0.3); // 添加灰色透明底
      padding: 10rpx 20rpx; // 增加内边距使文字与背景更协调
      border-radius: 10rpx; // 添加圆角使外观更美观
      display: block; // 修改为block使其能居中
      margin-left: auto; // 居中显示
      margin-right: auto;
    }

    .description {
      text-align: center;
      font-size: 42rpx;
      color: #fff;
      margin-top: 20rpx;
      opacity: 0.9;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
      background: rgba(0, 0, 0, 0.3); // 添加灰色透明底
      padding: 10rpx 20rpx; // 增加内边距使文字与背景更协调
      border-radius: 10rpx; // 添加圆角使外观更美观
      display: block; // 修改为block使其能居中
      margin-left: auto; // 居中显示
      margin-right: auto;
    }

    .reward-info {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 60rpx 0;

      .reward-item {
        text-align: center;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 20rpx;
        padding: 30rpx 40rpx;
        min-width: 180rpx;

        .number {
          font-size: 60rpx;
          color: #ffd700;
          font-weight: bold;
          text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
        }

        .unit {
          display: block;
          font-size: 32rpx;
          color: #fff;
          margin-top: 10rpx;
          text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
        }

        .label {
          display: block;
          font-size: 32rpx;
          color: #fff;
          margin-top: 10rpx;
          text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
        }
      }

      .vs-text {
        font-size: 40rpx;
        color: #fff;
        margin: 0 30rpx;
        font-weight: bold;
        text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);
      }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 20rpx;
      padding: 0 40rpx;

      .share-btn {
        height: 80rpx;
        line-height: 80rpx;
        border-radius: 40rpx;
        font-size: 32rpx;
        color: #fff;
        border: none;
        outline: none;

        &.wechat-friend {
          background: #07c160;
        }

        &.wechat-moments {
          background: #1aad19;
        }
      }
    }

    .rule-link {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-top: 40rpx;
      color: #fff;
      text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.5);

      .icon-arrow {
        margin-left: 10rpx;
        font-size: 32rpx;
        opacity: 0.7;
      }
    }
  }

  .popup-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;

    .rule-popup {
      width: 80%;
      max-width: 600rpx;
      background: #fff;
      border-radius: 20rpx;
      overflow: hidden;

      .popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 30rpx;
        border-bottom: 1rpx solid #eee;

        .popup-title {
          font-size: 40rpx;
          font-weight: bold;
          text-shadow: 2rpx 2rpx 4rpx rgba(0, 0, 0, 0.3);
        }

        .close-icon {
          font-size: 40rpx;
          color: #999;
          cursor: pointer;
        }
      }

      .rule-content {
        padding: 30rpx;

        .rule-text {
          font-size: 36rpx;
          line-height: 1.6;
          color: #333;
          text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.1);
        }
      }

      .popup-footer {
        padding: 30rpx;

        .confirm-btn {
          width: 100%;
          height: 80rpx;
          line-height: 80rpx;
          background: #ee0050;
          color: #fff;
          border: none;
          border-radius: 40rpx;
          font-size: 32rpx;
        }
      }
    }
  }
}
</style>
