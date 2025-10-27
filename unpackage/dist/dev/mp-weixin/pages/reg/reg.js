"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
if (!Math) {
  VerificationCode();
}
const VerificationCode = () => "../../components/VerificationCode.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "reg",
  setup(__props) {
    const goToLogin = () => {
      common_vendor.index.navigateBack();
    };
    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };
    const account = common_vendor.ref("");
    const code = common_vendor.ref("");
    const codeRef = common_vendor.ref(null);
    const uname = common_vendor.ref("");
    const password = common_vendor.ref("");
    const showPassword = common_vendor.ref(false);
    const Reginfo = common_vendor.reactive({
      account: "",
      code: "",
      uname: "",
      password: ""
    });
    const handleCodeInput = (value) => {
      code.value = value;
    };
    const sendLoginCode = async () => {
      if (!account.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      try {
        const response = await api_apis.apiSendCode({ phone: account.value });
        if (response.code === 200) {
          codeRef.value.startCountdown();
        } else {
          common_vendor.index.showToast({ title: response.errMsg, icon: "none" });
        }
      } catch (error) {
        common_vendor.index.showToast({ title: "发送验证码失败", icon: "none" });
      }
    };
    common_vendor.watch([account, code, uname, password], ([newAccount, newCode, newUname, newPassword]) => {
      Reginfo.account = newAccount;
      Reginfo.code = newCode;
      Reginfo.uname = newUname;
      Reginfo.password = newPassword;
    }, { immediate: true });
    const doReg = async () => {
      if (!account.value) {
        common_vendor.index.showToast({ title: "请输入手机号", icon: "none" });
        return;
      }
      if (!code.value) {
        common_vendor.index.showToast({ title: "请输入验证码", icon: "none" });
        return;
      }
      if (!uname.value) {
        common_vendor.index.showToast({ title: "请输入用户名", icon: "none" });
        return;
      }
      if (!password.value) {
        common_vendor.index.showToast({ title: "请输入密码", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "注册中..." });
      try {
        const success = await api_apis.apiRegInfo(Reginfo);
        common_vendor.index.hideLoading();
        if (success) {
          common_vendor.index.showToast({ title: "注册成功", icon: "success" });
          setTimeout(() => {
            common_vendor.index.redirectTo({ url: "/pages/login/login" });
          }, 1500);
        } else {
          common_vendor.index.showModal({ title: "注册失败", content: "注册失败，请重试", showCancel: false });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showModal({ title: "注册失败", content: "网络错误，请检查网络连接后重试", showCancel: false });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.o(goToLogin),
        b: account.value,
        c: common_vendor.o(($event) => account.value = $event.detail.value),
        d: common_vendor.sr(codeRef, "bca7dd61-0", {
          "k": "codeRef"
        }),
        e: common_vendor.o(sendLoginCode),
        f: common_vendor.o(handleCodeInput),
        g: common_vendor.p({
          placeholder: "请输入验证码"
        }),
        h: uname.value,
        i: common_vendor.o(($event) => uname.value = $event.detail.value),
        j: showPassword.value ? "text" : "password",
        k: password.value,
        l: common_vendor.o(($event) => password.value = $event.detail.value),
        m: showPassword.value ? 1 : "",
        n: common_vendor.o(togglePasswordVisibility),
        o: common_vendor.o(goToLogin),
        p: common_vendor.o(doReg),
        q: common_vendor.o(doReg)
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-bca7dd61"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/reg/reg.js.map
