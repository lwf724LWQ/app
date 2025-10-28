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
    common_vendor.onPullDownRefresh(async () => {
      common_vendor.index.__f__("log", "at pages/video/video.vue:81", "下拉刷新触发");
      await fetchVideoList();
      common_vendor.index.stopPullDownRefresh();
    });
    const fetchVideoList = async () => {
      try {
        const videoinfo = {
          page: 1,
          limit: 10
        };
        const Videoinfo = await api_apis.apiGetVideo(videoinfo);
        common_vendor.index.__f__("log", "at pages/video/video.vue:96", "API 返回数据:", Videoinfo);
        if (Videoinfo.data && Videoinfo.data.records && Array.isArray(Videoinfo.data.records)) {
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
          common_vendor.index.__f__("log", "at pages/video/video.vue:110", "更新后的 videoList:", videoList.value);
        } else {
          common_vendor.index.__f__("warn", "at pages/video/video.vue:112", "API 返回数据格式不符合预期:", Videoinfo);
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/video.vue:115", "获取视频失败:", error);
        common_vendor.index.showToast({
          title: "获取视频失败",
          icon: "none"
        });
      }
    };
    const videoStore = stores_video.useVideoStore();
    const pickerOptions = common_vendor.ref(["排列五", "排列三", "七星彩", "福彩3D"]);
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
    const onPickerChange = (e) => {
      const index = e.detail.value;
      pickerIndex.value = index;
      switch (index) {
        case 0:
          currentTab.value = "plw";
          break;
        case 1:
          currentTab.value = "pls";
          break;
        case 2:
          currentTab.value = "qxc";
          break;
        case 3:
          currentTab.value = "fc";
          break;
      }
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
    common_vendor.onMounted(async () => {
      fetchVideoList();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_assets._imports_0$3,
        b: common_vendor.t(pickerOptions.value[pickerIndex.value]),
        c: common_vendor.p({
          type: "down",
          size: "16",
          color: "#333"
        }),
        d: common_vendor.o(onPickerChange),
        e: pickerIndex.value,
        f: pickerOptions.value,
        g: currentTab.value === "plw" || 0
      }, currentTab.value === "plw" || 0 ? {
        h: common_vendor.f(videoList.value, (video, index, i0) => {
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
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-06518e47"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/video.js.map
