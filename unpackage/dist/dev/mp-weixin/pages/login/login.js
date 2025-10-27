"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const type = common_vendor.ref("0");
    const account = common_vendor.ref("");
    const password = common_vendor.ref("");
    const code = common_vendor.ref("");
    common_vendor.ref("");
    const isAgreed = common_vendor.ref(true);
    const showPassword = common_vendor.ref(false);
    const Userinfo = common_vendor.reactive({
      type: "",
      account: "",
      password: ""
    });
    common_vendor.watch([type, account, password, code], ([newtype, newaccount, newpassword]) => {
      Userinfo.type = newtype;
      Userinfo.account = newaccount;
      Userinfo.password = newpassword;
    }, { immediate: true });
    const gologin = async () => {
      var _a;
      if (!isAgreed.value) {
        common_vendor.index.showToast({
          title: "请先同意用户协议",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      if (!account.value || !password.value) {
        common_vendor.index.showToast({
          title: "请输入手机号和密码",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      common_vendor.index.showLoading({
        title: "登录中..."
      });
      try {
        const success = await api_apis.apilogin(Userinfo);
        common_vendor.index.hideLoading();
        if (success) {
          common_vendor.index.__f__("log", "at pages/login/login.vue:180", "登录API返回的完整数据:", success);
          if ((_a = success.data) == null ? void 0 : _a.token) {
            utils_request.setToken(success.data.token);
          } else {
            common_vendor.index.showModal({
              title: "登录失败",
              content: "未获取到token，请重试",
              showCancel: false
            });
            return;
          }
          if (account.value) {
            utils_request.setAccount(account.value);
          } else {
            common_vendor.index.showModal({
              title: "登录失败",
              content: "账号信息异常，请重试",
              showCancel: false
            });
            return;
          }
          try {
            const loginData = success.data || {};
            let avatarUrl = "http://video.caimizm.com/himg/user.png";
            if (loginData.himg) {
              if (loginData.himg.startsWith("http")) {
                avatarUrl = loginData.himg;
              } else {
                avatarUrl = `http://video.caimizm.com/himg/${loginData.himg}`;
              }
            }
            const userInfo = {
              nickname: loginData.uname || "用户",
              avatar: avatarUrl,
              phone: account.value
            };
            common_vendor.index.setStorageSync("userInfo", userInfo);
            common_vendor.index.setStorageSync("loginData", {
              uname: loginData.uname,
              himg: avatarUrl,
              // 保存完整的头像URL
              account: account.value
            });
            common_vendor.index.__f__("log", "at pages/login/login.vue:238", "登录成功，用户信息已保存:", userInfo);
            common_vendor.index.__f__("log", "at pages/login/login.vue:239", "登录数据已保存:", {
              uname: loginData.uname,
              himg: avatarUrl,
              // 显示完整的头像URL
              account: account.value
            });
            try {
              const userAvatars = common_vendor.index.getStorageSync("userAvatars") || {};
              userAvatars[account.value] = avatarUrl;
              common_vendor.index.setStorageSync("userAvatars", userAvatars);
              common_vendor.index.__f__("log", "at pages/login/login.vue:250", "登录时自动保存用户头像:", account.value, avatarUrl);
            } catch (error) {
              common_vendor.index.__f__("error", "at pages/login/login.vue:252", "保存用户头像到userAvatars失败:", error);
            }
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/login/login.vue:256", "保存用户信息失败:", error);
            const defaultAvatarUrl = "http://video.caimizm.com/himg/user.png";
            const defaultUserInfo = {
              nickname: "用户",
              avatar: defaultAvatarUrl,
              phone: account.value
            };
            common_vendor.index.setStorageSync("userInfo", defaultUserInfo);
            common_vendor.index.setStorageSync("loginData", {
              uname: "用户",
              himg: defaultAvatarUrl,
              // 保存完整的默认头像URL
              account: account.value
            });
          }
          common_vendor.index.showToast({
            title: "登录成功",
            icon: "success",
            duration: 1500
          });
          setTimeout(() => {
            common_vendor.index.switchTab({
              url: "/pages/index/index"
            });
          }, 1500);
        } else {
          common_vendor.index.showModal({
            title: "登录失败",
            content: "用户名或密码错误，请重试",
            showCancel: false
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({
          title: "登录失败",
          content: "网络错误，请检查网络连接后重试",
          showCancel: false
        });
      }
    };
    const goToReg = () => {
      common_vendor.index.navigateTo({
        url: "/pages/reg/reg"
      });
    };
    const goForgetPwdPage1 = () => {
      common_vendor.index.navigateTo({
        url: "/pages/code-login/code-login?type=forgetPwd"
      });
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
      common_vendor.index.__f__("log", "at pages/login/login.vue:346", "密码显示状态:", showPassword.value ? "显示" : "隐藏");
    };
    const toggleAgreement = () => {
      isAgreed.value = !isAgreed.value;
    };
    const showUserAgreement = () => {
      common_vendor.index.showModal({
        title: "用户协议",
        content: "这里是用户协议的内容...",
        showCancel: false
      });
    };
    const showPrivacyPolicy = () => {
      common_vendor.index.showModal({
        title: "隐私授权",
        content: "这里是隐私政策的内容...",
        showCancel: false
      });
    };
    const wechatLogin = () => {
      if (!isAgreed.value) {
        common_vendor.index.showToast({
          title: "请先同意用户协议",
          icon: "none",
          duration: 2e3
        });
        return;
      }
      common_vendor.index.showModal({
        title: "微信登录",
        content: "微信登录功能正在开发中，敬请期待",
        showCancel: false,
        confirmText: "知道了"
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: account.value,
        c: common_vendor.o(($event) => account.value = $event.detail.value),
        d: showPassword.value ? "text" : "password",
        e: password.value,
        f: common_vendor.o(($event) => password.value = $event.detail.value),
        g: showPassword.value ? 1 : "",
        h: common_vendor.o(togglePasswordVisibility),
        i: common_vendor.o(goToReg),
        j: common_vendor.o(goForgetPwdPage1),
        k: common_vendor.o(gologin),
        l: isAgreed.value
      }, isAgreed.value ? {} : {}, {
        m: isAgreed.value ? 1 : "",
        n: common_vendor.o(toggleAgreement),
        o: common_vendor.o(showUserAgreement),
        p: common_vendor.o(showPrivacyPolicy),
        q: common_vendor.o(wechatLogin)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
