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
    const hasPaid = common_vendor.ref(false);
    const isFreeVideo = common_vendor.computed(() => {
      return !videoData.value.flag || videoData.value.price === 0;
    });
    const buttonText = common_vendor.computed(() => {
      if (isFreeVideo.value || hasPaid.value) {
        return "开始学习";
      }
      return "点击购买";
    });
    const userInfo = common_vendor.ref({
      uname: "",
      himg: ""
    });
    const showFormImage = common_vendor.ref(false);
    const formImageUrl = common_vendor.ref("");
    const getAvatarUrl = (himg) => {
      if (!himg)
        return "/static/images/defaultAvatar.png";
      return `http://video.caimizm.com/himg/${himg}`;
    };
    const loadVideoData = async (videoId) => {
      if (!videoId)
        return;
      try {
        let currentVideo = videoStore.getCurrentVideo;
        if (!currentVideo || currentVideo.id !== videoId) {
          const storedVideo = common_vendor.index.getStorageSync(`video_${videoId}`);
          if (storedVideo && storedVideo.id === videoId) {
            currentVideo = storedVideo;
            videoStore.setCurrentVideo(currentVideo);
          }
        }
        if (!currentVideo || currentVideo.id !== videoId) {
          common_vendor.index.showLoading({ title: "加载中..." });
          const response = await api_apis.apiGetVideo({ id: videoId, limit: 1 });
          common_vendor.index.hideLoading();
          if (response.code === 200 && response.data && response.data.records && response.data.records.length > 0) {
            const item = response.data.records[0];
            currentVideo = {
              id: item.id,
              title: item.title,
              src: `http://video.caimizm.com/${item.url}`,
              account: item.account,
              likeCount: item.likeCount || 0,
              isLiked: item.isLiked || false,
              flag: item.price > 0 ? item.flag : false,
              price: item.price,
              imgurl: `http://video.caimizm.com/${item.vimg}`
            };
            videoStore.setCurrentVideo(currentVideo);
            common_vendor.index.setStorageSync(`video_${videoId}`, currentVideo);
          } else {
            common_vendor.index.showToast({
              title: "视频不存在",
              icon: "none"
            });
            setTimeout(() => {
              common_vendor.index.navigateBack();
            }, 1500);
            return;
          }
        }
        if (currentVideo && currentVideo.id === videoId) {
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
          if (currentVideo.account) {
            await getUserInfo(currentVideo.account);
          }
          if (videoData.value.src && !videoContext.value) {
            videoContext.value = common_vendor.index.createVideoContext("videoPlayer");
          }
          if (!isFreeVideo.value) {
            await checkPaymentStatus();
          }
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({
          title: "加载视频失败",
          icon: "none"
        });
      }
    };
    const checkPaymentStatus = async () => {
      if (isFreeVideo.value) {
        hasPaid.value = false;
        return;
      }
      const token = utils_request.getToken();
      if (!token) {
        hasPaid.value = false;
        return;
      }
      try {
        const paymentCheck = await api_apis.apiCheckVideoPayment({
          videoId: videoData.value.id,
          account: utils_request.getAccount()
        });
        if (paymentCheck.data) {
          hasPaid.value = true;
        } else {
          hasPaid.value = false;
        }
      } catch (error) {
        hasPaid.value = false;
      }
    };
    common_vendor.onLoad(async (options) => {
      if (options.id) {
        await loadVideoData(options.id);
      }
    });
    common_vendor.onShow(async () => {
      showFormImage.value = false;
      formImageUrl.value = "";
      if (!videoData.value.id) {
        const pages = getCurrentPages();
        const currentPage = pages[pages.length - 1];
        const options = currentPage.options || {};
        if (options.id) {
          await loadVideoData(options.id);
        }
      } else {
        await loadVideoData(videoData.value.id);
      }
      if (videoData.value.id && !isFreeVideo.value) {
        await checkPaymentStatus();
      }
    });
    common_vendor.onMounted(() => {
      setTimeout(() => {
        if (videoData.value.src && !videoContext.value) {
          videoContext.value = common_vendor.index.createVideoContext("videoPlayer");
        }
      }, 100);
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
          userInfo.value = {
            uname: account,
            himg: ""
          };
        }
      } catch (error) {
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
      if (isFreeVideo.value || hasPaid.value) {
        if (!videoContext.value && videoData.value.src) {
          videoContext.value = common_vendor.index.createVideoContext("videoPlayer");
        }
        if (videoContext.value) {
          videoContext.value.play();
          isPlaying.value = true;
          showPlayButton.value = false;
        }
        return;
      }
      if (!hasPaid.value) {
        await checkPaymentStatus();
        if (hasPaid.value) {
          if (!videoContext.value && videoData.value.src) {
            videoContext.value = common_vendor.index.createVideoContext("videoPlayer");
          }
          if (videoContext.value) {
            videoContext.value.play();
            isPlaying.value = true;
            showPlayButton.value = false;
          }
          return;
        }
      }
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
    const onVideoEnded = async () => {
      common_vendor.index.__f__("log", "at pages/video/play.vue:484", "视频播放结束，开始获取表单图片");
      isPlaying.value = false;
      showPlayButton.value = false;
      await fetchFormImage();
      common_vendor.index.__f__("log", "at pages/video/play.vue:492", "获取表单图片完成，showFormImage:", showFormImage.value, "formImageUrl:", formImageUrl.value);
    };
    const fetchFormImage = async () => {
      if (!videoData.value.id) {
        common_vendor.index.__f__("log", "at pages/video/play.vue:498", "获取表单图片失败：视频ID为空");
        return;
      }
      const videoId = videoData.value.id;
      let hasLocalImage = false;
      try {
        const storageKey = `formImage_${videoId}`;
        common_vendor.index.__f__("log", "at pages/video/play.vue:508", "检查本地存储，key:", storageKey);
        const storedFormImage = common_vendor.index.getStorageSync(storageKey);
        common_vendor.index.__f__("log", "at pages/video/play.vue:510", "本地存储数据:", storedFormImage);
        if (storedFormImage && storedFormImage.wimgUrl) {
          common_vendor.index.__f__("log", "at pages/video/play.vue:513", "从本地存储获取表单图片:", storedFormImage.wimgUrl);
          formImageUrl.value = storedFormImage.wimgUrl;
          showFormImage.value = true;
          hasLocalImage = true;
          common_vendor.index.__f__("log", "at pages/video/play.vue:517", "表单图片已从本地存储设置, formImageUrl:", formImageUrl.value, "showFormImage:", showFormImage.value);
        } else {
          common_vendor.index.__f__("log", "at pages/video/play.vue:519", "本地存储中没有表单图片数据");
          try {
            const allKeys = common_vendor.index.getStorageInfoSync().keys;
            common_vendor.index.__f__("log", "at pages/video/play.vue:523", "所有本地存储keys:", allKeys);
            const relatedKeys = allKeys.filter((key) => key.includes("formImage") || key.includes("wimg"));
            common_vendor.index.__f__("log", "at pages/video/play.vue:525", "相关的本地存储keys:", relatedKeys);
          } catch (e) {
            common_vendor.index.__f__("log", "at pages/video/play.vue:527", "无法获取本地存储keys:", e);
          }
        }
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/video/play.vue:531", "本地存储获取失败:", e);
      }
      {
        try {
          common_vendor.index.__f__("log", "at pages/video/play.vue:546", "开始获取表单图片，视频ID:", videoId);
          const response = await api_apis.apiWordQuery({ videoId });
          common_vendor.index.__f__("log", "at pages/video/play.vue:548", "表单图片API响应:", response);
          if (response && response.code === 200 && response.data) {
            let imageUrl = response.data.wimg || response.data.url || response.data.image || response.data.img || "";
            common_vendor.index.__f__("log", "at pages/video/play.vue:553", "解析到的图片URL:", imageUrl);
            if (imageUrl) {
              if (!imageUrl.startsWith("http")) {
                imageUrl = `http://video.caimizm.com/wimg/${imageUrl}`;
              }
              common_vendor.index.__f__("log", "at pages/video/play.vue:561", "处理后的图片URL:", imageUrl);
              formImageUrl.value = imageUrl;
              showFormImage.value = true;
              common_vendor.index.__f__("log", "at pages/video/play.vue:564", "表单图片已从API设置，showFormImage:", showFormImage.value);
            } else {
              common_vendor.index.__f__("log", "at pages/video/play.vue:566", "未找到图片URL，响应数据:", response.data);
              if (!hasLocalImage) {
                common_vendor.index.showToast({
                  title: "暂无表单记录",
                  icon: "none",
                  duration: 2e3
                });
              }
            }
          } else {
            common_vendor.index.__f__("log", "at pages/video/play.vue:577", "API响应异常:", response);
            if (response && response.code !== 200) {
              common_vendor.index.__f__("log", "at pages/video/play.vue:579", "API返回错误码:", response.code, "错误信息:", response.message || response.msg);
            }
            if (!hasLocalImage) {
              common_vendor.index.showToast({
                title: "暂无表单记录",
                icon: "none",
                duration: 2e3
              });
            }
          }
        } catch (error) {
          common_vendor.index.__f__("error", "at pages/video/play.vue:591", "获取表单图片异常:", error);
          const errorMessage = error.message || error.errMsg || "";
          const isCorsError = errorMessage.includes("CORS") || errorMessage.includes("Access-Control") || errorMessage.includes("ERR_FAILED") || errorMessage.includes("net::ERR_FAILED");
          if (hasLocalImage) {
            common_vendor.index.__f__("log", "at pages/video/play.vue:598", "API调用失败，但本地存储有数据，继续显示本地图片");
            return;
          }
          if (isCorsError) {
            common_vendor.index.showToast({
              title: "获取表单图片失败",
              icon: "none",
              duration: 2e3
            });
          } else {
            common_vendor.index.showToast({
              title: "获取表单图片失败",
              icon: "none",
              duration: 2e3
            });
          }
        }
      }
    };
    const closeFormImage = () => {
      showFormImage.value = false;
      showPlayButton.value = true;
    };
    const handleFormImageError = (e) => {
      common_vendor.index.__f__("error", "at pages/video/play.vue:638", "表单图片加载失败:", e);
      common_vendor.index.__f__("error", "at pages/video/play.vue:639", "图片URL:", formImageUrl.value);
      common_vendor.index.showToast({
        title: "图片加载失败",
        icon: "none",
        duration: 2e3
      });
    };
    const handleFormImageLoad = (e) => {
      common_vendor.index.__f__("log", "at pages/video/play.vue:649", "表单图片加载成功:", formImageUrl.value);
    };
    const handleBuyClick = async () => {
      if (isFreeVideo.value || hasPaid.value) {
        if (!videoContext.value && videoData.value.src) {
          videoContext.value = common_vendor.index.createVideoContext("videoPlayer");
        }
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
        const likeList = await api_apis.apiGetLikelist(utils_request.getAccount());
      } catch (error) {
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
        d: videoData.value.src
      }, videoData.value.src ? {
        e: videoData.value.src,
        f: isPlaying.value,
        g: common_vendor.o(onVideoPlay),
        h: common_vendor.o(onVideoPause),
        i: common_vendor.o(onVideoEnded)
      } : {}, {
        j: videoData.value.src && showPlayButton.value
      }, videoData.value.src && showPlayButton.value ? {
        k: common_vendor.p({
          type: "play-filled",
          size: "60",
          color: "#fff"
        }),
        l: common_vendor.o(playVideo)
      } : {}, {
        m: videoData.value.src && videoData.value.price && videoData.value.price > 0
      }, videoData.value.src && videoData.value.price && videoData.value.price > 0 ? {
        n: common_vendor.t(videoData.value.price),
        o: common_vendor.o(handleBuyClick)
      } : {}, {
        p: showFormImage.value
      }, showFormImage.value ? common_vendor.e({
        q: common_vendor.p({
          type: "close",
          size: "24",
          color: "#666"
        }),
        r: common_vendor.o(closeFormImage),
        s: formImageUrl.value
      }, formImageUrl.value ? {
        t: formImageUrl.value,
        v: common_vendor.o(handleFormImageError),
        w: common_vendor.o(handleFormImageLoad)
      } : {}, {
        x: showFormImage.value && !formImageUrl.value
      }, showFormImage.value && !formImageUrl.value ? {} : {}, {
        y: common_vendor.o(() => {
        }),
        z: common_vendor.o(closeFormImage)
      }) : {}, {
        A: common_vendor.p({
          type: "gift-filled",
          size: "20",
          color: "#FF9500"
        }),
        B: common_vendor.o(goToRewardPage),
        C: common_vendor.p({
          type: videoData.value.isLiked ? "heart-filled" : "heart",
          size: "20",
          color: videoData.value.isLiked ? "#ff4757" : "#FF9500"
        }),
        D: common_vendor.t(videoData.value.likeCount),
        E: videoData.value.isLiked ? 1 : "",
        F: common_vendor.o(toggleLike),
        G: userInfo.value.himg || userInfo.value.uname
      }, userInfo.value.himg || userInfo.value.uname ? {
        H: getAvatarUrl(userInfo.value.himg)
      } : {}, {
        I: common_vendor.t(userInfo.value.uname),
        J: videoData.value.price && videoData.value.price > 0
      }, videoData.value.price && videoData.value.price > 0 ? {
        K: common_vendor.t(videoData.value.price)
      } : {}, {
        L: common_vendor.t(videoData.value.title),
        M: common_vendor.p({
          type: "home",
          size: "24",
          color: "#FFD700"
        }),
        N: common_vendor.t(buttonText.value),
        O: common_vendor.o(handleBuyClick)
      });
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-c3cc80f6"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/video/play.js.map
