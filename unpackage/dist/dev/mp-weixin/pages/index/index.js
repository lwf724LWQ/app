"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentTab: "plw",
      fc3dNumbers: ["3", "8", "5"],
      plwNumbers: ["9", "0", "5", "3", "2"],
      qxcNumbers: ["8", "0", "6", "5", "7", "9", "7"],
      fc3dPeriod: "第25123期",
      plwPeriod: "第25285期",
      qxcPeriod: "第25123期",
      lotteryDate: "10.26 周日",
      isLoadingResults: false
      // 添加加载锁
    };
  },
  methods: {
    drawGui() {
      this.currentTab === "plw" ? "排列5" : "七星彩";
      common_vendor.index.navigateTo({
        url: `/pages/juWang/drawLine/drawLine`
      });
    },
    goToDreamInterpretation() {
      common_vendor.index.navigateTo({
        url: "/pages/dream-interpretation/dream-interpretation"
      });
    },
    // 加载开奖结果
    async loadLotteryResults() {
      if (this.isLoadingResults) {
        return;
      }
      try {
        this.isLoadingResults = true;
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_apis.apiFindResult();
        common_vendor.index.hideLoading();
        if (response.code === 200 && response.data) {
          const results = response.data;
          let dataArray = results;
          if (Array.isArray(results)) {
            dataArray = results;
          } else if (results.records && Array.isArray(results.records)) {
            dataArray = results.records;
          } else if (results.data && Array.isArray(results.data)) {
            dataArray = results.data;
          }
          dataArray.forEach((item) => {
            const tname = item.tname || item.name;
            if (tname && tname.includes("福彩3D")) {
              this.fc3dNumbers = this.parseNumbers(item.number);
              this.fc3dPeriod = "第" + item.issueno + "期";
            }
            if (tname && tname.includes("排列五")) {
              this.plwNumbers = this.parseNumbers(item.number);
              this.plwPeriod = "第" + item.issueno + "期";
            }
            if (tname && tname.includes("排列三")) {
              this.plwPeriod = "第" + item.issueno + "期";
            }
            if (tname && tname.includes("七星彩")) {
              let numbers = this.parseNumbers(item.number);
              if (item.refernumber) {
                numbers.push(item.refernumber);
              }
              this.qxcNumbers = numbers;
              this.qxcPeriod = "第" + item.issueno + "期";
            }
            if (item.opendate || item.date || item.createTime) {
              const date = item.opendate || item.date || item.createTime;
              this.lotteryDate = this.formatDate(date);
            }
          });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.__f__("error", "at pages/index/index.vue:250", "加载开奖结果失败:", error);
      } finally {
        this.isLoadingResults = false;
      }
    },
    // 解析中奖号码（支持字符串和数组格式）
    parseNumbers(numbers) {
      if (!numbers) {
        return [];
      }
      if (Array.isArray(numbers)) {
        return numbers.map((n) => String(n));
      }
      if (typeof numbers === "string") {
        if (numbers.includes(" ")) {
          return numbers.split(" ").map((n) => n.trim()).filter((n) => n).map((n) => String(n));
        }
        if (numbers.includes(",")) {
          return numbers.split(",").map((n) => n.trim()).filter((n) => n).map((n) => String(n));
        }
        return numbers.split("").map((n) => n.trim()).filter((n) => n).map((n) => String(n));
      }
      if (typeof numbers === "number") {
        return String(numbers).split("");
      }
      return [];
    },
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr)
        return "10.26 周日";
      try {
        const date = new Date(dateStr);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
        const weekday = weekdays[date.getDay()];
        return `${month}.${day} ${weekday}`;
      } catch (e) {
        return "10.26 周日";
      }
    }
  },
  onLoad() {
    this.loadLotteryResults();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_assets._imports_0,
    b: common_assets._imports_1,
    c: common_vendor.t($data.fc3dPeriod),
    d: common_vendor.t($data.lotteryDate),
    e: common_vendor.f($data.fc3dNumbers, (num, index, i0) => {
      return {
        a: common_vendor.t(num),
        b: common_vendor.t(String.fromCharCode(65 + index)),
        c: index
      };
    }),
    f: common_vendor.t($data.plwPeriod),
    g: common_vendor.t($data.lotteryDate),
    h: common_vendor.f($data.plwNumbers, (num, index, i0) => {
      return {
        a: common_vendor.t(num),
        b: common_vendor.t(String.fromCharCode(65 + index)),
        c: index
      };
    }),
    i: common_vendor.t($data.qxcPeriod),
    j: common_vendor.t($data.lotteryDate),
    k: common_vendor.f($data.qxcNumbers, (num, index, i0) => {
      return {
        a: common_vendor.t(num),
        b: index === $data.qxcNumbers.length - 1 ? 1 : "",
        c: common_vendor.t(String.fromCharCode(65 + index)),
        d: index
      };
    }),
    l: common_assets._imports_2,
    m: common_assets._imports_3,
    n: common_vendor.o(($event) => $options.drawGui()),
    o: common_assets._imports_4,
    p: common_assets._imports_5,
    q: common_assets._imports_6,
    r: common_assets._imports_7,
    s: common_assets._imports_8,
    t: common_assets._imports_9,
    v: common_assets._imports_6,
    w: common_assets._imports_10,
    x: common_assets._imports_11,
    y: common_assets._imports_12,
    z: common_vendor.o((...args) => $options.goToDreamInterpretation && $options.goToDreamInterpretation(...args)),
    A: common_assets._imports_13,
    B: common_assets._imports_11,
    C: common_assets._imports_14,
    D: common_assets._imports_15
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
