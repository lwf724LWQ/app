"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
if (!Math) {
  VerificationCode();
}
const VerificationCode = () => "../../components/VerificationCode.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "code-login",
  setup(__props) {
    const isForgetPwd = common_vendor.ref(false);
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    const goToReg = () => {
      common_vendor.index.navigateTo({
        url: "/pages/reg/reg"
      });
    };
    const userLogin = () => {
      common_vendor.index.navigateTo({
        url: "/pages/login/login"
      });
    };
    common_vendor.onLoad((options) => {
      if (options.type === "forgetPwd") {
        isForgetPwd.value = true;
      } else {
        isForgetPwd.value = false;
      }
    });
    const phone = common_vendor.ref("");
    const code = common_vendor.ref("");
    const codeRef = common_vendor.ref(null);
    const handleCodeInput = (value) => {
      code.value = value;
    };
    const sendLoginCode = async () => {
      if (!phone.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      try {
        const response = await api_apis.apiSendCode({ phone: phone.value });
        if (response.code === 200) {
          codeRef.value.startCountdown();
          common_vendor.index.showToast({ title: "验证码已发送", icon: "success" });
        } else {
          common_vendor.index.showToast({ title: response.errMsg || "发送失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "发送验证码失败", icon: "none" });
      }
    };
    const login = async () => {
      var _a;
      if (!phone.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!code.value) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中..." });
      try {
        const loginData = {
          type: "1",
          // 验证码登录
          account: phone.value,
          code: code.value
        };
        const success = await api_apis.apilogin(loginData);
        common_vendor.index.hideLoading();
        if (success) {
          common_vendor.index.__f__("log", "at pages/code-login/code-login.vue:175", "验证码登录API返回的完整数据:", success);
          if ((_a = success.data) == null ? void 0 : _a.token) {
            utils_request.setToken(success.data.token);
          }
          if (phone.value) {
            utils_request.setAccount(phone.value);
          }
          try {
            const loginData2 = success.data || {};
            let avatarUrl = "http://video.caimizm.com/himg/user.png";
            if (loginData2.himg) {
              if (loginData2.himg.startsWith("http")) {
                avatarUrl = loginData2.himg;
              } else {
                avatarUrl = `http://video.caimizm.com/himg/${loginData2.himg}`;
              }
            }
            const userInfo = {
              nickname: loginData2.uname || "用户",
              avatar: avatarUrl,
              phone: phone.value
            };
            common_vendor.index.setStorageSync("userInfo", userInfo);
            common_vendor.index.setStorageSync("loginData", {
              uname: loginData2.uname,
              himg: loginData2.himg,
              account: phone.value
            });
            common_vendor.index.__f__("log", "at pages/code-login/code-login.vue:219", "验证码登录成功，用户信息已保存:", userInfo);
            common_vendor.index.__f__("log", "at pages/code-login/code-login.vue:220", "登录数据已保存:", {
              uname: loginData2.uname,
              himg: loginData2.himg,
              account: phone.value
            });
          } catch (error) {
            common_vendor.index.__f__("error", "at pages/code-login/code-login.vue:227", "保存用户信息失败:", error);
            const defaultUserInfo = {
              nickname: "用户",
              avatar: "http://video.caimizm.com/himg/user.png",
              phone: phone.value
            };
            common_vendor.index.setStorageSync("userInfo", defaultUserInfo);
            common_vendor.index.setStorageSync("loginData", {
              uname: "用户",
              himg: "http://video.caimizm.com/himg/user.png",
              account: phone.value
            });
          }
          common_vendor.index.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.switchTab({ url: "/pages/user/user" });
          }, 1500);
        } else {
          common_vendor.index.showModal({ title: "登录失败", content: "验证码错误或已过期，请重试", showCancel: false });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({ title: "登录失败", content: "网络错误，请检查网络连接后重试", showCancel: false });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: !isForgetPwd.value
      }, !isForgetPwd.value ? {} : {}, {
        c: isForgetPwd.value
      }, isForgetPwd.value ? {} : {}, {
        d: phone.value,
        e: common_vendor.o(($event) => phone.value = $event.detail.value),
        f: common_vendor.sr(codeRef, "6816d2d4-0", {
          "k": "codeRef"
        }),
        g: common_vendor.o(sendLoginCode),
        h: common_vendor.o(handleCodeInput),
        i: common_vendor.p({
          placeholder: "请输入验证码"
        }),
        j: !isForgetPwd.value
      }, !isForgetPwd.value ? {
        k: common_vendor.o(userLogin),
        l: common_vendor.o(goToReg)
      } : {}, {
        m: common_vendor.t(isForgetPwd.value ? "重置密码" : "登录"),
        n: common_vendor.o(login)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-6816d2d4"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/code-login/code-login.js.map
