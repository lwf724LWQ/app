"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      currentTab: "plw",
      // 当前选中的选项卡：plw-排列五，qxc-七星彩
      upcomingTab: "plw",
      // 待开奖区域选中的选项卡：plw-排列五，qxc-七星彩
      currentNav: "home",
      // 当前选中的导航项
      plwNumbers: ["8", "6", "8", "5", "7"],
      // 排列五开奖号码
      qxcNumbers: ["2", "0", "4", "9", "3", "8", "8"],
      // 七星彩开奖号码
      plwUpcomingIssue: "25214期",
      // 排列五待开奖期号
      qxcUpcomingIssue: "3225期",
      // 七星彩待开奖期号
      upcomingAction: "follow"
      // 待开奖区域选中的操作：all-全部，follow-关注
    };
  },
  methods: {
    // 切换顶部选项卡
    switchTab(tab) {
      this.currentTab = tab;
    },
    // 切换待开奖区域选项卡
    switchUpcomingTab(tab) {
      this.upcomingTab = tab;
    },
    // 切换待开奖区域操作
    switchUpcomingAction(action) {
      this.upcomingAction = action;
      common_vendor.index.__f__("log", "at pages/index/index.vue:205", "切换到:", action);
    },
    // 处理swiper切换
    handleSwiperChange(e) {
      this.currentTab = e.detail.current === 0 ? "plw" : "qxc";
    },
    // 切换导航
    switchNav(nav) {
      this.currentNav = nav;
    },
    // 获取最新开奖结果
    getLatestResults() {
    },
    drawGui() {
      this.currentTab === "plw" ? "排列5" : "七星彩";
      common_vendor.index.navigateTo({
        url: `/pages/juWang/drawLine/drawLine`
      });
    },
    // 跳转到解梦页面
    goToDreamInterpretation() {
      common_vendor.index.navigateTo({
        url: "/pages/dream-interpretation/dream-interpretation"
      });
    }
  },
  onLoad() {
    this.getLatestResults();
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_assets._imports_1,
    c: $data.currentTab === "plw" ? 1 : "",
    d: common_vendor.o(($event) => $options.switchTab("plw")),
    e: $data.currentTab === "qxc" ? 1 : "",
    f: common_vendor.o(($event) => $options.switchTab("qxc")),
    g: $data.currentTab == "plw"
  }, $data.currentTab == "plw" ? {
    h: common_assets._imports_2,
    i: common_assets._imports_3,
    j: common_vendor.o(($event) => $options.drawGui()),
    k: common_assets._imports_4,
    l: common_assets._imports_5,
    m: common_assets._imports_6,
    n: common_assets._imports_7,
    o: common_assets._imports_8,
    p: common_assets._imports_9,
    q: common_vendor.o((...args) => $options.goToDreamInterpretation && $options.goToDreamInterpretation(...args)),
    r: common_assets._imports_10,
    s: common_assets._imports_11
  } : {}, {
    t: $data.currentTab == "qxc"
  }, $data.currentTab == "qxc" ? {
    v: common_assets._imports_2,
    w: common_assets._imports_12,
    x: common_vendor.o((...args) => $options.drawGui && $options.drawGui(...args)),
    y: common_assets._imports_4,
    z: common_assets._imports_5,
    A: common_assets._imports_6,
    B: common_assets._imports_13,
    C: common_assets._imports_14,
    D: common_assets._imports_15,
    E: common_vendor.o((...args) => $options.goToDreamInterpretation && $options.goToDreamInterpretation(...args)),
    F: common_assets._imports_10,
    G: common_assets._imports_11
  } : {}, {
    H: common_vendor.f($data.plwNumbers, (num, index, i0) => {
      return {
        a: common_vendor.t(num),
        b: num,
        c: index >= 4 ? 1 : ""
      };
    }),
    I: common_vendor.f($data.qxcNumbers, (num, index, i0) => {
      return {
        a: common_vendor.t(num),
        b: index,
        c: index >= 4 ? 1 : ""
      };
    }),
    J: common_assets._imports_16,
    K: common_assets._imports_17,
    L: $data.upcomingTab === "plw" ? 1 : "",
    M: common_vendor.o(($event) => $options.switchUpcomingTab("plw")),
    N: $data.upcomingTab === "qxc" ? 1 : "",
    O: common_vendor.o(($event) => $options.switchUpcomingTab("qxc")),
    P: common_vendor.t($data.upcomingTab === "plw" ? $data.plwUpcomingIssue : $data.qxcUpcomingIssue),
    Q: $data.upcomingAction === "all" ? 1 : "",
    R: common_vendor.o(($event) => $options.switchUpcomingAction("all")),
    S: $data.upcomingAction === "follow" ? 1 : "",
    T: common_vendor.o(($event) => $options.switchUpcomingAction("follow"))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
