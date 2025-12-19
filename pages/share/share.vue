<template>
  <myPage pageTitle="分享">
    <!-- <view class="card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons class="card-icon" type="link"></uni-icons>
          <text class="title-text">链接下载</text>
        </view>
        <view class="card-description"
          >分享地址，或复制地址去手机浏览器粘贴打开</view
        >
      </view>
      <view class="card-footer">
        <view class="share-button" @click="share('link')">分享链接</view>
        <view class="copy-button" @click="copyLink()">复制地址</view>
      </view>
    </view> -->
    <!-- #ifdef APP-PLUS -->
    <view class="card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons class="card-icon" type="link"></uni-icons>
          <text class="title-text">二维码下载</text>
        </view>
        <view class="card-description"
          >分享二维码到微信，好友扫描二维码即可下载</view
        >
      </view>
      <view class="card-footer">
        <view class="share-button" @click="share('rqcode')">分享二维码</view>
        <!-- <view class="copy-button" @click="copyLink()">复制地址</view> -->
      </view>
    </view>
    <!-- #endif -->
    <view class="card">
      <view class="card-header">
        <view class="card-title">
          <uni-icons class="card-icon" type="link"></uni-icons>
          <text class="title-text">官网下载</text>
        </view>
        <view class="card-description"
          >在手机浏览器，输入官网地址，即可下载。
          <uni-link
            class="link"
            href="http://www.caimizm.com/"
            text="官网地址：http://www.caimizm.com"
          ></uni-link>
        </view>
      </view>
      <view class="card-footer">
        <!-- #ifdef APP-PLUS -->
        <view class="share-button" @click="share('link')">分享链接</view>
        <!-- #endif -->
        <view class="copy-button" @click="copyLink()">复制地址</view>
      </view>
    </view>

    <SharePopup ref="sharePopupRef"></SharePopup>
  </myPage>
</template>

<script setup>
import { ref } from "vue";

import myPage from "@/components/myPage.vue";
import SharePopup from "./components/Share-popup.vue";

const sharePopupRef = ref(null);

function share(type) {
  sharePopupRef.value.open(type);
}
function copyLink() {
  let txt = "http://www.caimizm.com/";
  uni.setClipboardData({
    data: txt,
    success: function () {
      uni.showToast({
        title: "复制成功",
        icon: "success",
        duration: 2000,
      });
    },
  });
}

function openUrl() {}
</script>

<style lang="scss" scoped>
.card {
  margin: 20rpx;
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);

  display: flex;

  gap: 10rpx;
  .card-header {
    display: flex;
    flex-direction: column;
    justify-content: center;

    margin-bottom: 30rpx;
    gap: 10rpx;

    .card-title {
      display: flex;
      align-items: center;
      font-size: 32rpx;
      font-weight: bold;
      color: #333333;

      .card-icon {
        margin-right: 10rpx;
        font-size: 36rpx;
        color: #007aff;
      }

      .title-text {
        // 标题文字样式已在父元素中定义
      }
    }

    .card-description {
      margin-top: 10rpx;
      font-size: 26rpx;
      color: #999999;
    }
    .link {
      display: block;
      color: #007aff;
    }
  }

  .card-footer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-width: 180rpx;
    gap: 10rpx;

    .share-button {
      padding: 12rpx 16rpx;
      background-color: #fd2d2d;
      color: #ffffff;
      font-size: 26rpx;
      border-radius: 8rpx;

      width: 100%;
      box-sizing: content-box;
      text-align: center;
    }

    .copy-button {
      padding: 12rpx 16rpx;
      background-color: #007aff;
      color: #ffffff;
      font-size: 26rpx;
      border-radius: 8rpx;

      width: 100%;
      box-sizing: content-box;
      text-align: center;
    }
  }
}
</style>
