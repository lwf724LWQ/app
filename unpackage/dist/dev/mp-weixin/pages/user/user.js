"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
require("../../utils/system.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "user",
  setup(__props) {
    const memberStore = common_vendor.reactive({
      profile: null
    });
    const isBalanceVisible = common_vendor.ref(false);
    const userBalance = common_vendor.ref(0);
    const isLoadingBalance = common_vendor.ref(false);
    const isLoadingLogin = common_vendor.ref(false);
    const handleAvatarError = (e) => {
      if (memberStore.profile) {
        memberStore.profile.avatar = "http://video.caimizm.com/himg/user.png";
      }
    };
    const getUserBalance = async () => {
      if (isLoadingBalance.value) {
        common_vendor.index.__f__("log", "at pages/user/user.vue:188", "正在加载余额，跳过重复请求");
        return;
      }
      try {
        isLoadingBalance.value = true;
        const account = utils_request.getAccount();
        if (!account) {
          userBalance.value = 0;
          return;
        }
        const response = await api_apis.apiGetUserBalance({ account });
        if (response.code === 200) {
          userBalance.value = response.data || 0;
        } else {
          userBalance.value = 0;
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/user/user.vue:209", "获取余额失败:", error);
        userBalance.value = 0;
      } finally {
        isLoadingBalance.value = false;
      }
    };
    const checkLoginStatus = async () => {
      if (isLoadingLogin.value) {
        common_vendor.index.__f__("log", "at pages/user/user.vue:220", "正在检查登录状态，跳过重复请求");
        return;
      }
      try {
        isLoadingLogin.value = true;
        const token = utils_request.getToken();
        if (token) {
          try {
            const savedUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
            const loginData = common_vendor.index.getStorageSync("loginData") || {};
            if (loginData.uname || loginData.account) {
              memberStore.profile = {
                avatar: loginData.himg || savedUserInfo.avatar || "http://video.caimizm.com/himg/user.png",
                // 优先使用himg，然后是本地保存的头像
                nickname: loginData.uname || savedUserInfo.nickname || "欢迎您"
                // uname 是昵称
              };
            } else {
              memberStore.profile = {
                avatar: savedUserInfo.avatar || "http://video.caimizm.com/himg/user.png",
                nickname: savedUserInfo.nickname || "欢迎您"
              };
            }
          } catch (error) {
            const savedUserInfo = common_vendor.index.getStorageSync("userInfo") || {};
            memberStore.profile = {
              avatar: savedUserInfo.avatar || "http://video.caimizm.com/himg/user.png",
              nickname: savedUserInfo.nickname || "欢迎您"
            };
          }
          getUserBalance();
        } else {
          memberStore.profile = null;
          userBalance.value = 0;
        }
      } finally {
        isLoadingLogin.value = false;
      }
    };
    const logout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            utils_request.removeToken();
            checkLoginStatus();
            common_vendor.index.showToast({
              title: "已退出登录",
              icon: "success"
            });
          }
        }
      });
    };
    common_vendor.ref([
      {
        icon: "contact",
        // uni-icons 内置图标名（联系客服）
        title: "联系客服",
        subTitle: "",
        hasArrow: true
      },
      {
        icon: "paperplane-filled",
        // uni-icons 内置图标名（软件分享）
        title: "软件分享",
        subTitle: "分享给朋友",
        hasArrow: true
      },
      {
        icon: "email-filled",
        // uni-icons 内置图标名（建议反馈）
        title: "建议反馈",
        subTitle: "",
        hasArrow: true
      },
      {
        icon: "upload-filled",
        // uni-icons 内置图标名（版本箭头示意）
        title: "版本",
        subTitle: "已是最新版V3.4.0.2",
        hasArrow: true
      },
      {
        icon: "settings",
        // uni-icons 内置图标名（设置）
        title: "设置",
        subTitle: "",
        hasArrow: true
      }
    ]);
    const goToRecharge = () => {
      if (memberStore.profile) {
        getUserBalance();
      }
      common_vendor.index.navigateTo({ url: "/pages/recharge/recharge" });
    };
    const goToTransaction = () => {
      common_vendor.index.navigateTo({ url: "/pages/transaction/transaction" });
    };
    const goToOrders = () => {
      common_vendor.index.navigateTo({ url: "/pages/orders/orders" });
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
    };
    const goToEditProfile = () => {
      if (!memberStore.profile) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        return;
      }
      common_vendor.index.navigateTo({ url: "/pages/user/edit-profile" });
    };
    const toggleBalanceVisibility = (e) => {
      e.stopPropagation();
      isBalanceVisible.value = !isBalanceVisible.value;
      if (isBalanceVisible.value && memberStore.profile) {
        getUserBalance();
      }
    };
    common_vendor.onMounted(() => {
      checkLoginStatus();
      common_vendor.index.$on("userProfileUpdated", (data) => {
        if (memberStore.profile) {
          memberStore.profile.nickname = data.nickname;
          memberStore.profile.avatar = data.avatar;
          common_vendor.index.showToast({
            title: "用户信息已更新",
            icon: "success"
          });
        }
      });
    });
    common_vendor.onShow(() => {
      checkLoginStatus();
    });
    return (_ctx, _cache) => {
      var _a, _b;
      return common_vendor.e({
        a: memberStore.profile
      }, memberStore.profile ? {
        b: ((_a = memberStore.profile) == null ? void 0 : _a.avatar) || "http://video.caimizm.com/himg/user.png",
        c: common_vendor.o(handleAvatarError),
        d: common_vendor.t(((_b = memberStore.profile) == null ? void 0 : _b.nickname) || "欢迎您"),
        e: common_vendor.o(goToEditProfile)
      } : {}, {
        f: !memberStore.profile
      }, !memberStore.profile ? {
        g: common_assets._imports_0$2,
        h: common_vendor.o(goToLogin)
      } : {}, {
        i: common_vendor.t(isBalanceVisible.value ? "0.00" : "****"),
        j: common_vendor.p({
          type: isBalanceVisible.value ? "eye-filled" : "eye-slash-filled",
          size: "16",
          color: "#999"
        }),
        k: common_vendor.o(toggleBalanceVisibility),
        l: common_vendor.o(toggleBalanceVisibility),
        m: isBalanceVisible.value
      }, isBalanceVisible.value ? {
        n: common_vendor.t(userBalance.value)
      } : {}, {
        o: common_vendor.p({
          type: isBalanceVisible.value ? "eye-filled" : "eye-slash-filled",
          size: "16",
          color: "#999"
        }),
        p: common_vendor.o(toggleBalanceVisibility),
        q: common_vendor.o(goToRecharge),
        r: common_vendor.o(goToOrders),
        s: common_vendor.o(goToTransaction),
        t: common_vendor.p({
          type: "headphones",
          size: "24",
          color: "#222"
        }),
        v: common_vendor.p({
          type: "compose",
          size: "24",
          color: "#222"
        }),
        w: common_vendor.p({
          type: "settings",
          size: "24",
          color: "#222"
        }),
        x: common_vendor.o(logout),
        y: common_vendor.p({
          type: "locked",
          size: "24",
          color: "#222"
        }),
        z: common_vendor.p({
          type: "gift",
          size: "24",
          color: "#222"
        }),
        A: common_vendor.p({
          type: "help",
          size: "24",
          color: "#222"
        }),
        B: common_vendor.p({
          type: "link",
          size: "24",
          color: "#222"
        })
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0f7520f0"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user/user.js.map
