<template>
  <myPage pageTitle="五七仔">
    <view class="content">
      <image class="bg-img" src="/static/images/activity-bg1.jpg" mode="widthFix"></image>

      <view class="btns">
        <view class="wx" @click="shareToWechatFriend">
          <button class="icon" open-type="share" id="shareWx">
            <uni-icons
              custom-prefix="iconfont"
              type="icon-weixin"
              size="30"
              color="#07c160"
            ></uni-icons>
          </button>

          微信
        </view>
        <view class="wxpyq" @click="shareToWechatMoments">
          <button class="icon" open-type="share" id="shareWxpyq">
            <uni-icons
              custom-prefix="iconfont"
              type="icon-weixinpengyouquan1"
              size="30"
              color="#07c160"
            ></uni-icons>
          </button>

          微信朋友圈
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

      <view class="rule-link" @click="showRulePopup">
        <text>规则</text>
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
    href: `http://caimizm.com/#/pages/activity-page/activity-dowapp?inviteCode=${encodeURIComponent(
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
    copyLink() {
      const config = getConfig(this.userInfo.nickname, this.inviteCode);
      uni.setClipboardData({
        data: config.href,
        success: function (res) {
          uni.showModal({
            title: "复制成功",
            content: "请分享后让好友将链接复制到浏览器中打开",
            showCancel: false,
            success: function (res) {
              if (res.confirm) {
                plus.runtime.openURL(`weixin://`);
              }
            },
          });
        },
        fail: function (err) {
          uni.showToast({
            title: "复制失败",
            icon: "error",
          });
        },
      });
    },
    shareToWechatFriend() {
      this.copyLink();
      // uni.share({
      //   ...getConfig(this.userInfo.nickname, this.inviteCode),
      //   scene: "WXSceneSession",
      // });
    },
    shareToWechatMoments() {
      this.copyLink();
      // uni.share({
      //   ...getConfig(this.userInfo.nickname, this.inviteCode),
      //   scene: "WXSceneTimeline",
      // });
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
  background-color: #ba3a43;
  position: relative;

  .bg-img {
    width: 100%;
  }

  .btns {
    display: flex;
    justify-content: space-around;
    align-items: center;
    font-size: 35rpx;
    color: #fff;
    .wx,
    .copyLink,
    .wxpyq {
      .icon {
        width: 100rpx;
        height: 100rpx;
        line-height: 100rpx;
        border-radius: 50%;
        box-shadow: 0 0 10rpx rgba($color: #000000, $alpha: 0.1);
        text-align: center;
        padding: 0;
        background-color: #fff;
        font-weight: normal;
        box-sizing: border-box;
        margin-bottom: 15rpx;
        &:after {
          border: none;
        }
      }

      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      width: 230rpx;
      font-weight: bold;
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

  .rule-link {
    position: absolute;
    top: 15rpx;
    right: 15rpx;
    padding: 5rpx 20rpx;
    border: 2rpx solid #fcd64f;
    color: #fcd64f;
    border-radius: 30rpx;
    background-color: transparent;
    z-index: 999;
    display: flex;
    align-items: center;
    font-size: 27rpx;
  }
}
</style>
