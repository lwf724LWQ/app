<template>
  <my-page pageTitle="添加管理员">
    <view class="container">
      <view class="content" @click="copyWechatNumber" @longpress="saveImg">
        <image class="bg-img" src="/static/images/baguajianbihua.jpg" mode="widthFix"></image>
      </view>
    </view>
  </my-page>
</template>

<script>
import wxchatFriend from "/static/images/baguajianbihua.png";
import myPage from "../../components/myPage.vue";
export default {
  components: {
    myPage,
  },
  data() {
    return {
      wechatNumber: "ws198805000000", // 替换为实际的微信号
      qrcodeUrl: wxchatFriend, // 替换为实际的二维码图片路径
    };
  },
  onLoad() {
    // 页面加载时可以获取客服信息
    this.getCustomerServiceInfo();
  },
  methods: {
    openMenu() {},
    saveImg() {
      uni.saveImageToPhotosAlbum({
        filePath: this.qrcodeUrl,
        success: function (res) {
          uni.showToast({
            title: "图片保存成功",
            icon: "success",
            duration: 2000,
          });
        },
      });
    },

    // 复制微信号到剪贴板
    copyWechatNumber() {
      uni.setClipboardData({
        data: this.wechatNumber,
        success: () => {
          uni.showToast({
            title: "微信号已复制",
            icon: "success",
          });
          // 尝试跳转到微信
          plus.runtime.openURL(`weixin://`);
        },
        fail: () => {
          uni.showToast({
            title: "复制失败",
            icon: "none",
            duration: 2000,
          });
        },
      });
    },
  },
};
</script>

<style lang="scss">
.container {
  background-color: #ffd200;
  min-height: 100%;
  .bg-img {
    width: 100%;
  }
}
</style>
