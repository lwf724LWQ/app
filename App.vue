<script lang="ts" setup>
import { useOldManModeStore, oldManModeStoreKey } from "./stores/oldManMode";
import { useUserStore } from "./stores/userStore";
import { provide } from "vue";
import {getToken} from "@/utils/request.js"
import tool from "./utils/tool";

// 初始化并提供 store
const oldManModeStore = useOldManModeStore();
provide(oldManModeStoreKey, oldManModeStore);
provide("useOldManModeStore", oldManModeStore);
const userStore = useUserStore();
try {
  if (userStore.getToken) {
    if (!userStore.getUserInfo?.account) {
      userStore.clearUserInfo();
    }
  }
} catch (e) {
  userStore.clearUserInfo();
}

// 读取剪切板，尝试获取邀请码
const staffInvitationCode = uni.getStorageSync("staffInvitationCode")
if (!staffInvitationCode && !getToken()) {
  // #ifdef H5
  try {
    const param = tool.parseQuery.parseQuery(window.location.href.split("?")[1])
    if (param && param.staffInvitationCode) {
      uni.setStorageSync("staffInvitationCode", param.staffInvitationCode)
    }
  } catch (error) {
    
  } 
  // #endif

  uni.getClipboardData({
    success: function (res) {
      console.log(res)
      if (res.data) {
        try {
          const param = tool.parseQuery.parseQuery(res.data.split("?")[1])
          if (param && param.staffInvitationCode) {
            uni.setStorageSync("staffInvitationCode", param.staffInvitationCode)
          }
        } catch (error) {
          
        } 
      }
    }
  });
}


</script>

<style lang="scss">
/*每个页面公共css */
@import "@/static/iconfont-draw-line.css";

:root {
  // 浅色文字
  --light-text-color: #1215d3;
}
</style>
