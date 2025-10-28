"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
const stores_video = require("../../stores/video.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "play",
  setup(__props) {
    const videoStore = stores_video.useVideoStore();
    const videoData = common_vendor.ref({
      id: "",
      title: "",
      src: "",
      account: "",
      likeCount: 0,
      isLiked: false
    });
    const showPlayButton = common_vendor.ref(true);
    const isPlaying = common_vendor.ref(false);
    const videoContext = common_vendor.ref(null);
    const isFreeVideo = common_vendor.computed(() => {
      return !videoData.value.flag || videoData.value.price === 0;
    });
    const userInfo = common_vendor.ref({
      uname: "",
      himg: ""
    });
    const getAvatarUrl = (himg) => {
      if (!himg)
        return "";
      return `http://video.caimizm.com/himg/${himg}`;
    };
    common_vendor.onLoad(async (options) => {
      if (options.id) {
        const currentVideo = videoStore.getCurrentVideo;
        if (currentVideo && currentVideo.id === options.id) {
          videoData.value = {
            id: currentVideo.id,
            title: currentVideo.title,
            src: currentVideo.src,
            account: currentVideo.account,
            likeCount: currentVideo.likeCount || 0,
            isLiked: currentVideo.isLiked || false,
            flag: currentVideo.flag,
            price: currentVideo.price
          };
          await getUserInfo(currentVideo.account);
        }
      }
    });
    common_vendor.onMounted(() => {
      videoContext.value = common_vendor.index.createVideoContext("videoPlayer");
    });
    const goBack = () => {
      common_vendor.index.navigateBack({
        delta: 1
      });
    };
    const getUserInfo = async (account) => {
      try {
        const params = {
          account
        };
        const headers = {};
        const token = utils_request.getToken();
        if (token) {
          headers["Authorization"] = token;
        }
        const response = await api_apis.apiUserimg(params, headers);
        if (response.code === 200) {
          userInfo.value = {
            uname: response.data.uname,
            himg: response.data.himg
          };
        } else {
          common_vendor.index.__f__("error", "at pages/video/play.vue:201", "获取用户信息失败:", response.message);
          userInfo.value = {
            uname: account,
            himg: ""
          };
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/play.vue:209", "获取用户信息异常:", error);
        userInfo.value = {
          uname: account,
          himg: ""
        };
      }
    };
    const playVideo = async () => {
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
      if (!videoData.value.flag || videoData.value.price === 0) {
        if (videoContext.value) {
          videoContext.value.play();
          isPlaying.value = true;
          showPlayButton.value = false;
        }
        return;
      }
      try {
        const paymentCheck = await api_apis.apiCheckVideoPayment({
          videoId: videoData.value.id,
          account: utils_request.getAccount()
        });
        if (paymentCheck.data) {
          if (videoContext.value) {
            videoContext.value.play();
            isPlaying.value = true;
            showPlayButton.value = false;
          }
        } else {
          common_vendor.index.showModal({
            title: "付费视频",
            content: `观看此视频需要支付${videoData.value.price}金币`,
            confirmText: "立即支付",
            cancelText: "取消",
            success: async (res) => {
              if (res.confirm) {
                await payForVideo();
              }
            }
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.message || "查询失败",
          icon: "none"
        });
      }
    };
    const payForVideo = async () => {
      const paymentData = {
        info: `视频: ${videoData.value.title}`,
        amount: videoData.value.price,
        type: 3,
        // 视频付费类型
        account: utils_request.getAccount(),
        payType: 0,
        // 默认微信支付
        channel: 0,
        // 微信小程序
        videoId: videoData.value.id
        // 添加视频ID参数
      };
      common_vendor.index.navigateTo({
        url: `/pages/video/payment?${objectToQueryString(paymentData)}`
      });
    };
    const objectToQueryString = (obj) => {
      return Object.keys(obj).map((key) => {
        return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
      }).join("&");
    };
    const onVideoPlay = () => {
      isPlaying.value = true;
      showPlayButton.value = false;
    };
    const onVideoPause = () => {
      isPlaying.value = false;
      showPlayButton.value = true;
    };
    const handleBuyClick = async () => {
      if (!videoData.value.flag || videoData.value.price === 0) {
        if (videoContext.value) {
          videoContext.value.play();
          isPlaying.value = true;
          showPlayButton.value = false;
        }
      } else {
        await payForVideo();
      }
    };
    const goToRewardPage = () => {
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
      common_vendor.index.navigateTo({
        url: `/pages/video/reward?videoId=${videoData.value.id}&author=${encodeURIComponent(videoData.value.account)}&title=${encodeURIComponent(videoData.value.title)}&authorAvatar=${encodeURIComponent(userInfo.value.himg)}&authorName=${encodeURIComponent(userInfo.value.uname)}`
      });
    };
    const toggleLike = async () => {
      try {
        const originalIsLiked2 = videoData.value.isLiked;
        const originalLikeCount2 = videoData.value.likeCount;
        videoData.value.isLiked = !videoData.value.isLiked;
        videoData.value.likeCount = videoData.value.isLiked ? videoData.value.likeCount + 1 : videoData.value.likeCount - 1;
        const response = await api_apis.apiGetIsLike({
          id: videoData.value.id,
          account: utils_request.getAccount(),
          isLiked: videoData.value.isLiked
        });
        common_vendor.index.__f__("log", "at pages/video/play.vue:377", "点赞操作成功");
        const likeList = await api_apis.apiGetLikelist(utils_request.getAccount());
        common_vendor.index.__f__("log", "at pages/video/play.vue:381", likeList);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/video/play.vue:383", "点赞操作失败:", error);
        videoData.value.isLiked = originalIsLiked;
        videoData.value.likeCount = originalLikeCount;
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "left",
          size: "30"
        }),
        b: common_vendor.o(goBack),
        c: common_vendor.t(videoData.value.title),
        d: videoData.value.src,
        e: isPlaying.value,
        f: common_vendor.o(onVideoPlay),
        g: common_vendor.o(onVideoPause),
        h: showPlayButton.value
      }, showPlayButton.value ? {
        i: common_vendor.p({
          type: "play-filled",
          size: "60",
          color: "#fff"
        }),
        j: common_vendor.o(playVideo)
      } : {}, {
        k: videoData.value.price && videoData.value.price > 0
      }, videoData.value.price && videoData.value.price > 0 ? {
        l: common_vendor.t(videoData.value.price),
        m: common_vendor.o(handleBuyClick)
      } : {}, {
        n: common_vendor.p({
          type: "gift-filled",
          size: "20",
          color: "#FF9500"
        }),
        o: common_vendor.o(goToRewardPage),
        p: common_vendor.p({
          type: videoData.value.isLiked ? "heart-filled" : "heart",
          size: "20",
          color: videoData.value.isLiked ? "#ff4757" : "#FF9500"
        }),
        q: common_vendor.t(videoData.value.likeCount),
        r: videoData.value.isLiked ? 1 : "",
        s: common_vendor.o(toggleLike),
        t: getAvatarUrl(userInfo.value.himg),
        v: common_vendor.t(userInfo.value.uname),
        w: videoData.value.price && videoData.value.price > 0
      }, videoData.value.price && videoData.value.price > 0 ? {
        x: common_vendor.t(videoData.value.price)
      } : {}, {
        y: common_vendor.t(videoData.value.title),
        z: common_vendor.p({
          type: "home",
          size: "24",
          color: "#FFD700"
        }),
        A: common_vendor.t(isFreeVideo.value ? "开始学习" : "点击购买"),
        B: common_vendor.o(handleBuyClick)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c3cc80f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/play.js.map
