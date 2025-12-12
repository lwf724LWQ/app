<template>
  <uni-popup ref="share" type="bottom">
    <view class="container">
      <view class="title">选择要分享的平台</view>
      <view class="btns">
        <view class="wx" @click="shareWx">
          <uni-icons
            class="icon"
            custom-prefix="iconfont"
            type="icon-weixin"
            size="30"
            color="#07c160"
          ></uni-icons>
          微信
        </view>
        <view class="wxpyq" @click="shareWxpyq">
          <uni-icons
            class="icon"
            custom-prefix="iconfont"
            type="icon-weixinpengyouquan1"
            size="30"
            color="#07c160"
          ></uni-icons>
          微信朋友圈
        </view>
      </view>
      <view class="close">取消</view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref } from 'vue'
import { BASE_URL } from '@/utils/request.js'
import { getCompressImage } from '@/pages/juWang/peng-liao/drawLine/utils'

const share = ref(null)

const props = defineProps({
  imageUrl: {
    type: String
  }
})

const open = () => {
  share.value.open()
}
defineExpose({
  open
})

const shareWx = async () => {
  // const imageUrl = await props.getImageUrl()
  // const compressImage = await getCompressImage(imageUrl, 0.5)
  uni.share({
    provider: 'weixin',
    type: 0,
    scene: 'WXSceneSession',
    href: `${BASE_URL}/pages/juWang/peng-liao/drawLine/drawLine`,
    imageUrl: props.imageUrl,
    success(res) {
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    },
    fail(err) {},
    complete() {
      share.value.close()
    }
  })
}

const shareWxpyq = async () => {
  // #ifdef APP
  const imageUrl = await props.getImageUrl()
  const compressImage = await getCompressImage(imageUrl, 0.5)
  uni.share({
    provider: 'weixin',
    type: 0,
    scene: 'WXSceneTimeline',
    href: `${BASE_URL}/pages/juWang/peng-liao/drawLine/drawLine`,
    imageUrl: compressImage,
    success(res) {
      uni.showToast({
        title: '分享成功',
        icon: 'success'
      })
    },
    fail(err) {},
    complete() {
      share.value.close()
    }
  })
  // #endif
}
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
