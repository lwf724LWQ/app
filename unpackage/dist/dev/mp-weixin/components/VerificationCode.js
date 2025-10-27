"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = {
  __name: "VerificationCode",
  props: {
    // 按钮文字（默认"获取验证码"，可自定义）
    buttonText: {
      type: String,
      default: "获取验证码"
    },
    // 输入框占位符（默认"验证码"）
    placeholder: {
      type: String,
      default: "验证码"
    },
    // 是否禁用整个组件（用于表单验证等场景）
    disabled: {
      type: Boolean,
      default: false
    },
    // 倒计时时长（秒）
    countdownTime: {
      type: Number,
      default: 60
    }
  },
  emits: [
    "getCode",
    // 点击获取验证码时触发
    "input"
    // 输入验证码时触发（用于双向绑定）
  ],
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const codeValue = common_vendor.ref("");
    const isCounting = common_vendor.ref(false);
    const countdown = common_vendor.ref(props.countdownTime);
    let timer = null;
    const handleGetCode = () => {
      emit("getCode");
    };
    const startCountdown = () => {
      if (isCounting.value)
        return;
      isCounting.value = true;
      countdown.value = props.countdownTime;
      clearInterval(timer);
      timer = setInterval(() => {
        countdown.value--;
        if (countdown.value <= 0) {
          clearInterval(timer);
          isCounting.value = false;
        }
      }, 1e3);
    };
    const handleInput = (e) => {
      codeValue.value = e.detail.value;
      emit("input", codeValue.value);
    };
    common_vendor.onUnmounted(() => {
      if (timer)
        clearInterval(timer);
    });
    __expose({
      startCountdown
    });
    return (_ctx, _cache) => {
      return {
        a: __props.placeholder,
        b: common_vendor.o([($event) => codeValue.value = $event.detail.value, handleInput]),
        c: codeValue.value,
        d: common_vendor.t(isCounting.value ? `${countdown.value}s后重新获取` : __props.buttonText),
        e: isCounting.value || __props.disabled,
        f: common_vendor.o(handleGetCode)
      };
    };
  }
};
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-0b74c6a3"]]);
wx.createComponent(Component);
//# sourceMappingURL=../../.sourcemap/mp-weixin/components/VerificationCode.js.map
