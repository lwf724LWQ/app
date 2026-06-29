<script lang="ts" setup>
import { useOldManModeStore, oldManModeStoreKey } from "./stores/oldManMode";
import { useUserStore } from "./stores/userStore";
import { provide } from "vue";
import {getToken} from "@/utils/request.js"
import tool from "./utils/tool";

import {
    initializeJpush,
    onListenerJpushMessage,
} from "@/uni_modules/xtf-jpush"

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

const messageListener = {
    onRegister(id) {
        console.log("onRegister", id)
		
		const registrationId = getRegistrationID()
		console.log("registrationId", registrationId)
    },
    onServerConnect(state) {
        console.log("onServerConnect", state)
    },
    multiActionClicked(msg) {
        console.log("multiActionClicked", msg)
    },
    messageListener(msg) {
        console.log("messageListener", msg)
    },
    notityMessageOpened(msg) {
        console.log("notityMessageOpened", msg)
    },
    notifyMessageDismiss(msg) {
        console.log("notifyMessageDismiss", msg)
    },
    notifyMessageArrived(msg) {
        console.log("notifyMessageArrived", msg)
    },
    commandResult(msg) {
        console.log("commandResult", msg)
    }
}
try{
onListenerJpushMessage && onListenerJpushMessage(messageListener)
initializeJpush()	
}catch(e){
	
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
