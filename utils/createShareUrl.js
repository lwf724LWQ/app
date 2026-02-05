import { useUserStore } from "@/stores/userStore";
import cryptoJs from "crypto-js";

export function createShareUrl() {
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

  return `http://caimizm.com/#/pages/activity-page/activity-dowapp?inviteCode=${encodeURIComponent(
    inviteCode
  )}&username=${encodeURIComponent(username)}`;
}
