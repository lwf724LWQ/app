"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
const stores_video = require("../../stores/video.js");
if (!Array) {
  const _easycom_StatusBarPlaceholder2 = common_vendor.resolveComponent("StatusBarPlaceholder");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  (_easycom_StatusBarPlaceholder2 + _easycom_uni_icons2)();
}
const _easycom_StatusBarPlaceholder = () => "../../components/StatusBarPlaceholder/StatusBarPlaceholder.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  (_easycom_StatusBarPlaceholder + _easycom_uni_icons)();
}
const _sfc_main = {
  __name: "video",
  setup(__props) {
    const videoStore = stores_video.useVideoStore();
    common_vendor.ref(["排列五", "排列三", "七星彩", "福彩3D", "精彩回顾"]);
    const pickerIndex = common_vendor.ref(0);
    const currentTab = common_vendor.ref("plw");
    common_vendor.ref("plw");
    common_vendor.ref("home");
    common_vendor.ref(["8", "6", "8", "5", "7"]);
    common_vendor.ref(["2", "0", "4", "9", "3", "8", "8"]);
    common_vendor.ref("25214期");
    common_vendor.ref("3225期");
    common_vendor.ref("follow");
    const videoList = common_vendor.ref([]);
    common_vendor.ref([]);
    const lotteryTypes = common_vendor.ref([
      { id: 17, name: "排列五", code: "plw", status: "待开奖", time: "今天 21:30" },
      { id: 16, name: "排列三", code: "pls", status: "待开奖", time: "今天 21:30" },
      { id: 15, name: "七星彩", code: "qxc", status: "待开奖", time: "今天 21:30" },
      { id: 12, name: "福彩3D", code: "fc", status: "待开奖", time: "今天 21:30" }
    ]);
    const currentLotteryType = common_vendor.ref(lotteryTypes.value[0]);
    const isLoadingLottery = common_vendor.ref(false);
    const currentIssueInfo = common_vendor.ref({ id: null, number: null, status: "待开奖", time: "今天 21:30" });
    common_vendor.onPullDownRefresh(async () => {
      await fetchVideoList();
      common_vendor.index.stopPullDownRefresh();
    });
    const fetchVideoList = async () => {
      try {
        const videoinfo = {
          page: 1,
          limit: 10
        };
        if (currentTab.value !== "review" && currentLotteryType.value && currentLotteryType.value.name) {
          videoinfo.tname = currentLotteryType.value.name;
        }
        const Videoinfo = await api_apis.apiGetVideo(videoinfo);
        if (Videoinfo.code === 200 && Videoinfo.data && Videoinfo.data.records && Array.isArray(Videoinfo.data.records)) {
          videoList.value = Videoinfo.data.records.map((item) => ({
            title: item.title,
            src: "http://video.caimizm.com/" + item.url,
            id: item.id,
            account: item.account,
            likeCount: item.likeCount,
            createTime: item.createTime,
            flag: item.price > 0 ? item.flag : false,
            price: item.price,
            updateTime: item.updateTime,
            imgurl: "http://video.caimizm.com/" + item.vimg
          }));
          common_vendor.index.showToast({
            title: `已加载 ${videoList.value.length} 个视频`,
            icon: "success",
            duration: 1500
          });
        } else {
          common_vendor.index.showToast({
            title: Videoinfo.msg || "数据格式错误",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "获取视频失败，请检查网络",
          icon: "none"
        });
      }
    };
    const loadLotteryDataByType = async (lotteryType) => {
      if (isLoadingLottery.value || !lotteryType || !lotteryType.name)
        return;
      try {
        isLoadingLottery.value = true;
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_apis.apiGetIssueNo({ tname: lotteryType.name });
        common_vendor.index.hideLoading();
        if (response.code === 200 && response.data !== null && response.data !== void 0) {
          let issueNumber = null;
          let issueStatus = "待开奖";
          let issueTime = "今天 21:30";
          if (typeof response.data === "number" || typeof response.data === "string") {
            issueNumber = response.data.toString();
          } else if (typeof response.data === "object") {
            issueNumber = response.data.issueno || response.data.number || response.data.id;
            issueStatus = response.data.status || "待开奖";
            issueTime = response.data.time || "今天 21:30";
          }
          lotteryType.status = issueStatus;
          lotteryType.time = issueTime;
          const idx = lotteryTypes.value.findIndex((t) => t.code === lotteryType.code);
          if (idx !== -1) {
            lotteryTypes.value[idx].status = issueStatus;
            lotteryTypes.value[idx].time = issueTime;
          }
          currentIssueInfo.value = { id: issueNumber, number: issueNumber, status: issueStatus, time: issueTime };
          try {
            common_vendor.index.setStorageSync("currentIssueInfo", currentIssueInfo.value);
            common_vendor.index.setStorageSync("currentLotteryType", lotteryType);
          } catch (error) {
          }
        } else {
          common_vendor.index.showToast({ title: response.msg || "数据加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: (error == null ? void 0 : error.msg) || (error == null ? void 0 : error.message) || "网络错误，请重试", icon: "none", duration: 3e3 });
      } finally {
        isLoadingLottery.value = false;
      }
    };
    const switchTabByIndex = async (index) => {
      pickerIndex.value = index;
      switch (index) {
        case 0:
          currentTab.value = "plw";
          currentLotteryType.value = lotteryTypes.value.find((t) => t.code === "plw") || lotteryTypes.value[0];
          break;
        case 1:
          currentTab.value = "pls";
          currentLotteryType.value = lotteryTypes.value.find((t) => t.code === "pls") || lotteryTypes.value[0];
          break;
        case 2:
          currentTab.value = "qxc";
          currentLotteryType.value = lotteryTypes.value.find((t) => t.code === "qxc") || lotteryTypes.value[0];
          break;
        case 3:
          currentTab.value = "fc";
          currentLotteryType.value = lotteryTypes.value.find((t) => t.code === "fc") || lotteryTypes.value[0];
          break;
        case 4:
          currentTab.value = "review";
          break;
      }
      if (currentTab.value !== "review") {
        await loadLotteryDataByType(currentLotteryType.value);
      }
      await fetchVideoList();
    };
    const playVideo = async (video) => {
      const token = utils_request.getToken();
      if (!token) {
        common_vendor.index.showToast({
          title: "请先登录",
          icon: "none"
        });
        setTimeout(() => {
          common_vendor.index.navigateTo({
            url: "/pages/login/login"
          });
        }, 1500);
        return;
      }
      videoStore.setCurrentVideo(video);
      common_vendor.index.setStorageSync(`video_${video.id}`, video);
      if (!video.flag || video.price === 0) {
        common_vendor.index.navigateTo({
          url: `/pages/video/play?id=${video.id}`
        });
        return;
      }
      try {
        const paymentCheck = await api_apis.apiCheckVideoPayment({
          videoId: video.id,
          account: utils_request.getAccount()
        });
        if (paymentCheck.data) {
          if (paymentCheck.data) {
            common_vendor.index.navigateTo({
              url: `/pages/video/play?id=${video.id}`
            });
          } else {
            common_vendor.index.showModal({
              title: "付费视频",
              content: `观看此视频需要支付${video.price}金币`,
              confirmText: "立即支付",
              cancelText: "取消",
              success: async (res) => {
                if (res.confirm) {
                  await payForVideo(video);
                }
              }
            });
          }
        } else {
          common_vendor.index.navigateTo({
            url: `/pages/video/play?id=${video.id}`
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "查询失败",
          icon: "none"
        });
      }
    };
    const payForVideo = async (video) => {
      try {
        video.hasPaid = true;
        common_vendor.index.showToast({
          title: "支付成功，开始播放",
          icon: "success"
        });
        common_vendor.index.navigateTo({
          url: `/pages/video/play?id=${video.id}`
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "支付失败",
          icon: "none"
        });
      }
    };
    const gotoOss = () => {
      let url = `/pages/video/oss`;
      if (currentLotteryType.value && currentLotteryType.value.name) {
        url += `?tname=${encodeURIComponent(currentLotteryType.value.name)}`;
      }
      common_vendor.index.navigateTo({
        url
      });
    };
    common_vendor.onMounted(async () => {
      await loadLotteryDataByType(currentLotteryType.value);
      await fetchVideoList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$3,
        b: currentTab.value === "fc" ? 1 : "",
        c: common_vendor.o(($event) => switchTabByIndex(3)),
        d: currentTab.value === "plw" ? 1 : "",
        e: common_vendor.o(($event) => switchTabByIndex(0)),
        f: currentTab.value === "pls" ? 1 : "",
        g: common_vendor.o(($event) => switchTabByIndex(1)),
        h: currentTab.value === "qxc" ? 1 : "",
        i: common_vendor.o(($event) => switchTabByIndex(2)),
        j: currentTab.value !== "review"
      }, currentTab.value !== "review" ? {
        k: common_vendor.f(videoList.value, (video, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(video.title),
            b: video.imgurl,
            c: common_vendor.o(($event) => playVideo(video), index),
            d: video.hasPaid ? 1 : "",
            e: !video.flag ? 1 : "",
            f: video.flag && video.price > 0
          }, video.flag && video.price > 0 ? {
            g: common_vendor.t(video.hasPaid ? "已付费" : `付费视频 ${video.price}金币`)
          } : {}, {
            h: index
          });
        })
      } : {
        l: common_vendor.f(videoList.value, (video, index, i0) => {
          return common_vendor.e({
            a: common_vendor.t(video.title),
            b: video.imgurl,
            c: common_vendor.o(($event) => playVideo(video), index),
            d: video.hasPaid ? 1 : "",
            e: !video.flag ? 1 : "",
            f: video.flag && video.price > 0
          }, video.flag && video.price > 0 ? {
            g: common_vendor.t(video.hasPaid ? "已付费" : `付费视频 ${video.price}金币`)
          } : {}, {
            h: index
          });
        })
      }, {
        m: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#fff"
        }),
        n: common_vendor.o(($event) => gotoOss())
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-06518e47"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/video.js.map
