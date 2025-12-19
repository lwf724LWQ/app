<template>
  <uni-popup ref="share" type="bottom">
    <view class="container">
      <view class="title">选择要分享的平台</view>
      <view class="btns">
        <view class="wx" @click="shareWx">
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
        <view class="wxpyq" @click="shareWxpyq">
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
      <view class="close">取消</view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from "vue";
import logo from "/static/logo.png";
import dowRqcode from "/static/dowRqcode.png"

const share = ref(null);

// 'link' 'rqcode'
const shareType = ref("link");
const open = (shareType) => {
  share.value.open();
};
defineExpose({
  open,
});

function getConfig() {
  if (shareType.value === 'link') {
    return {
      provider: "weixin",
      type: 0,
      href: "http://uniapp.dcloud.io/",
      title: "五七仔下载链接",
      summary: "",
      imageUrl: logo,
    };
  }else{
    return {
      provider: "weixin",
      type: 2,
      imageUrl: dowRqcode,
    };
  }
  
}
const shareWx = async () => {
  // #ifdef APP

  uni.share({
    ...getConfig(),
    scene: "WXSceneSession",
    success(res) {
      uni.showToast({
        title: "分享成功",
        icon: "success",
      });
    },
    fail(err) {},
    complete() {
      share.value.close();
    },
  });
  // #endif
};

const shareWxpyq = async () => {
  // #ifdef APP
  const imageUrl = await props.getImageUrl;

  uni.share({
    ...getConfig(),
    scene: "WXSceneTimeline",
    success(res) {
      uni.showToast({
        title: "分享成功",
        icon: "success",
      });
    },
    fail(err) {},
    complete() {
      share.value.close();
    },
  });
  // #endif
};
</script>

<style lang="scss" scoped>
.container {
  height: 500rpx;
  background-color: #fff;
  border-radius: 10rpx 10rpx 0 0;
  padding: 30rpx 0;
  .title {
    text-align: center;
  }
  .btns {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 400rpx;
    font-size: 25rpx;
    .wx,
    .wxpyq {
      .icon {
        width: 100rpx;
        height: 100rpx;
        line-height: 100rpx;
        border-radius: 50%;
        box-shadow: 0 0 10rpx rgba($color: #000000, $alpha: 0.1);
        margin-bottom: 30rpx;
        text-align: center;
        padding: 0;
        background-color: #fff;
        &:after {
          border: none;
        }
      }

      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
  }
  .close {
    height: 80rpx;
    line-height: 80rpx;
    color: rgba($color: #000000, $alpha: 0.3);
    text-align: center;
    border-top: 1rpx solid rgba($color: #000000, $alpha: 0.1);
  }
}
</style>
