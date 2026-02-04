<template>
  <ActivityHover :src="img" @click="share"></ActivityHover>
</template>

<script setup>
import ActivityHover from "@/components/activity-hover.vue";
import img from "@/static/images/activity-invited.png";
import { useUserStore } from "@/stores/userStore";
import cryptoJs from "crypto-js";

// 分享
const encrypt = (text) => {
  // 将邀请码加密
  const encrypted = cryptoJs.AES.encrypt(text, "inviteCode");
  return encrypted.toString();
};

const userStore = useUserStore();
const userInfo = userStore.getUserInfo;
const username = userInfo.nickname;
const inviteCode = encrypt(userInfo.account);

const share = () => {
  uni.showModal({
    title: "提示",
    content: "请分享后让好友将链接复制到浏览器中打开",
    showCancel: false,
    success: (res) => {
      uni.share({
        provider: "weixin",
        type: 1,
        summary: `http://caimizm.com/#/pages/activity-page/activity-dowapp?inviteCode=${encodeURIComponent(
          inviteCode
        )}&username=${encodeURIComponent(username)}`,
        scene: "WXSceneSession",
        success(res) {},
        fail(err) {},
      });
    },
  });
};
</script>
