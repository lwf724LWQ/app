"use strict";
const common_vendor = require("./common/vendor.js");
const _sfc_main = {
  __name: "NumberSelector",
  props: {
    groupIndex: Number,
    numIndex: Number
  },
  emits: ["close"],
  setup(__props, { emit: __emit }) {
    const mode = common_vendor.ref("advanced");
    const numbers = common_vendor.computed(() => {
      if (props.numIndex == 0) {
        const numbers2 = [];
        for (let i = 0; i <= 36; i++) {
          numbers2.push(i.toString());
        }
        return numbers2;
      } else {
        return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
      }
    });
    const selectedNumbers = common_vendor.ref([]);
    const selectedNumbers2 = common_vendor.computed(() => {
      return selectedNumbers.value.map((num) => num.toString()).join(" ");
    });
    const toggleNumber = (num) => {
      const index = selectedNumbers.value.indexOf(num);
      if (index > -1) {
        selectedNumbers.value.splice(index, 1);
      } else {
        selectedNumbers.value.push(num);
      }
    };
    const props = __props;
    const conditions = common_vendor.ref([
      "单",
      "双",
      "大",
      "小",
      "X",
      props.numIndex == 1 || props.numIndex == 4 ? "头尾合" : "中肚合",
      props.numIndex == 4 ? "百个合" : props.numIndex == 3 ? "千十合" : "千百合",
      props.numIndex == 3 || props.numIndex == 4 ? "十个合" : props.numIndex == 2 ? "百个合" : "千十合",
      "杀",
      "稳码"
    ]);
    if (props.numIndex === 5) {
      conditions.value = ["单", "双", "大", "小", "X"];
    }
    if (props.numIndex === 0) {
      conditions.value = ["单", "双", "大", "小"];
    }
    const selectedCondition = common_vendor.ref(null);
    const selectCondition = (condition) => {
      if (selectedCondition.value === condition) {
        selectedCondition.value = null;
        return;
      }
      selectedCondition.value = condition;
      if (condition === "单") {
        selectedNumbers.value = ["1", "3", "5", "7", "9"];
      } else if (condition === "双") {
        selectedNumbers.value = ["0", "2", "4", "6", "8"];
      } else if (condition === "大") {
        selectedNumbers.value = ["5", "6", "7", "8", "9"];
      } else if (condition === "小") {
        selectedNumbers.value = ["0", "1", "2", "3", "4"];
      } else if (condition === "X") {
        selectedNumbers.value = [];
      }
    };
    const doubnumbers = common_vendor.ref(["0/5", "1/6", "2/7", "3/8", "4/9"]);
    const selecteddoubNumber = common_vendor.ref(null);
    const selectdoubNumber = (condition) => {
      if (selecteddoubNumber.value === condition) {
        selecteddoubNumber.value = null;
        return;
      }
      selecteddoubNumber.value = condition;
      if (condition === "0/5") {
        selectedNumbers.value = [];
        selectedCondition.value = "";
      } else if (condition === "1/6") {
        selectedNumbers.value = [];
        selectedCondition.value = "";
      } else if (condition === "2/7") {
        selectedNumbers.value = [];
        selectedCondition.value = "";
      } else if (condition === "3/8") {
        selectedNumbers.value = [];
        selectedCondition.value = "";
      } else if (condition === "4/9") {
        selectedNumbers.value = [];
        selectedCondition.value = "";
      }
    };
    const emit = __emit;
    const previewType = common_vendor.ref("solid");
    const close = () => {
      emit("close");
    };
    const confirm = () => {
      const selectionData = {
        selectedNumbers: selectedNumbers.value,
        selectedCondition: selectedCondition.value,
        selecteddoubNumber: selecteddoubNumber.value,
        groupIndex: props.groupIndex,
        // 添加格子信息
        numIndex: props.numIndex,
        previewType: previewType.value
      };
      emit("confirm", selectionData);
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: mode.value === "advanced" ? 1 : "",
        b: common_vendor.o(($event) => mode.value = "advanced"),
        c: common_vendor.f(numbers.value, (num, k0, i0) => {
          return {
            a: common_vendor.t(num),
            b: num,
            c: selectedNumbers.value.includes(num) ? 1 : "",
            d: common_vendor.o(($event) => toggleNumber(num), num)
          };
        }),
        d: common_vendor.f(conditions.value, (condition, k0, i0) => {
          return {
            a: common_vendor.t(condition),
            b: condition,
            c: selectedCondition.value === condition ? 1 : "",
            d: common_vendor.o(($event) => selectCondition(condition), condition)
          };
        }),
        e: props.numIndex == 0 ? false : true
      }, (props.numIndex == 0 ? false : true) ? {
        f: common_vendor.f(doubnumbers.value, (doubnumber, k0, i0) => {
          return {
            a: common_vendor.t(doubnumber),
            b: doubnumber,
            c: selecteddoubNumber.value === doubnumber ? 1 : "",
            d: common_vendor.o(($event) => selectdoubNumber(doubnumber), doubnumber)
          };
        })
      } : {}, {
        g: props.numIndex !== 5 && props.numIndex !== 0
      }, props.numIndex !== 5 && props.numIndex !== 0 ? common_vendor.e({
        h: selectedCondition.value !== "稳码"
      }, selectedCondition.value !== "稳码" ? common_vendor.e({
        i: __props.numIndex === 1
      }, __props.numIndex === 1 ? {
        j: common_vendor.t(selectedCondition.value)
      } : {}, {
        k: __props.numIndex === 1
      }, __props.numIndex === 1 ? {
        l: common_vendor.t(selectedNumbers2.value)
      } : {}, {
        m: __props.numIndex === 1
      }, __props.numIndex === 1 ? {
        n: common_vendor.t(selecteddoubNumber.value)
      } : {}, {
        o: __props.numIndex === 1 ? 1 : "",
        p: __props.numIndex !== 1 ? 1 : ""
      }) : {}, {
        q: selectedCondition.value !== "稳码"
      }, selectedCondition.value !== "稳码" ? common_vendor.e({
        r: __props.numIndex === 2
      }, __props.numIndex === 2 ? {
        s: common_vendor.t(selectedCondition.value)
      } : {}, {
        t: __props.numIndex === 2
      }, __props.numIndex === 2 ? {
        v: common_vendor.t(selectedNumbers2.value)
      } : {}, {
        w: __props.numIndex === 2
      }, __props.numIndex === 2 ? {
        x: common_vendor.t(selecteddoubNumber.value)
      } : {}, {
        y: __props.numIndex === 2 ? 1 : "",
        z: __props.numIndex !== 2 ? 1 : ""
      }) : {}, {
        A: selectedCondition.value !== "稳码"
      }, selectedCondition.value !== "稳码" ? common_vendor.e({
        B: __props.numIndex === 3
      }, __props.numIndex === 3 ? {
        C: common_vendor.t(selectedCondition.value)
      } : {}, {
        D: __props.numIndex === 3
      }, __props.numIndex === 3 ? {
        E: common_vendor.t(selectedNumbers2.value)
      } : {}, {
        F: __props.numIndex === 3
      }, __props.numIndex === 3 ? {
        G: common_vendor.t(selecteddoubNumber.value)
      } : {}, {
        H: __props.numIndex === 3 ? 1 : "",
        I: __props.numIndex !== 3 ? 1 : ""
      }) : {}, {
        J: selectedCondition.value !== "稳码"
      }, selectedCondition.value !== "稳码" ? common_vendor.e({
        K: __props.numIndex === 4
      }, __props.numIndex === 4 ? {
        L: common_vendor.t(selectedCondition.value)
      } : {}, {
        M: __props.numIndex === 4
      }, __props.numIndex === 4 ? {
        N: common_vendor.t(selectedNumbers2.value)
      } : {}, {
        O: __props.numIndex === 4
      }, __props.numIndex === 4 ? {
        P: common_vendor.t(selecteddoubNumber.value)
      } : {}, {
        Q: __props.numIndex === 4 ? 1 : "",
        R: __props.numIndex !== 4 ? 1 : ""
      }) : {}, {
        S: selectedCondition.value === "稳码"
      }, selectedCondition.value === "稳码" ? {
        T: common_vendor.t(selectedNumbers2.value)
      } : {}) : {}, {
        U: common_vendor.o(close),
        V: common_vendor.o(confirm)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d38e8385"]]);
exports.MiniProgramPage = MiniProgramPage;
//# sourceMappingURL=../.sourcemap/mp-weixin/NumberSelector.js.map
