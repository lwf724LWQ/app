import { useUserStore } from "@/stores/userStore";
import { getToken } from "@/utils/request.js"; // 导入setToken，账号

export default {
    checkIsBozhu: function () {
        // 判断当前有没有登录
        if (getToken()) {
            // 判断当前用户是否是为博主
            const userStore = useUserStore();
            if (userStore.getUserInfo.agent == 0) {
                uni.showModal({
                    title: "提示",
                    content: "目前不是博主身份，请先联系管理员注册成为博主",
                    confirmText: "去联系管理员",
                    success: async (res) => {
                        if (res.confirm) {
                            uni.navigateTo({ url: "/pages/share/wxchat" });
                        }
                    },
                });
                return false;
            }

            return true;
        } else {
            uni.showModal({
                title: "提示",
                content: "该操作需要登录，是否前往",
                success: async (res) => {
                    if (res.confirm) {
                        uni.navigateTo({ url: "/pages/login/login" + "?redirect=/pages/video/video" });
                    }
                },
                showCancel: true,
            });
            return false;
        }
    }
}