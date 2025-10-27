"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const api_apis = require("../../api/apis.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  _easycom_uni_icons2();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
if (!Math) {
  _easycom_uni_icons();
}
const _sfc_main = {
  __name: "dream-interpretation",
  setup(__props) {
    const dreamResults = common_vendor.ref([]);
    const isLoading = common_vendor.ref(false);
    const hasSearched = common_vendor.ref(false);
    const searchKeyword = common_vendor.ref("");
    const dreamHistory = common_vendor.ref([]);
    const showSearchOverlay = common_vendor.ref(false);
    const currentPage = common_vendor.ref(1);
    const pageSize = common_vendor.ref(10);
    const totalPages = common_vendor.ref(0);
    const totalRecords = common_vendor.ref(0);
    const isLoadingMore = common_vendor.ref(false);
    const hasMoreData = common_vendor.ref(true);
    const popularDreams = common_vendor.ref([
      "苍蝇幼虫",
      "走私被捕",
      "剪刀割手",
      "跳楼",
      "伯父死了",
      "失踪少女"
    ]);
    const popularCategories = common_vendor.ref([]);
    const getImageUrl = (id, imgName) => {
      if (!id || !imgName)
        return "";
      const baseUrl = "http://video.caimizm.com";
      if (imgName.startsWith("http"))
        return imgName;
      if (imgName.startsWith("/"))
        return `${baseUrl}${imgName}`;
      const possiblePaths = [
        `${baseUrl}/web/image/${id}/${imgName}`,
        `${baseUrl}/web/dream/image/${id}`,
        `${baseUrl}/api/image/${id}`,
        `${baseUrl}/images/${id}/${imgName}`,
        `${baseUrl}/static/images/${imgName}`
      ];
      const url = possiblePaths[0];
      common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:210", "构建图片URL:", { id, imgName, url, allPaths: possiblePaths });
      return url;
    };
    const handleImageError = (item, index) => {
      common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:215", "图片加载失败:", item.img);
      item.imageError = true;
      item.currentImageUrl = "";
      if (!item.triedAlternativePaths) {
        item.triedAlternativePaths = true;
        const baseUrl = "http://video.caimizm.com";
        const alternativePaths = [
          `${baseUrl}/web/dream/image/${item.id}`,
          `${baseUrl}/api/image/${item.id}`,
          `${baseUrl}/images/${item.id}/${item.img}`,
          `${baseUrl}/static/images/${item.img}`
        ];
        const nextPathIndex = item.currentPathIndex || 0;
        if (nextPathIndex < alternativePaths.length) {
          item.currentPathIndex = nextPathIndex + 1;
          item.currentImageUrl = alternativePaths[nextPathIndex];
          common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:235", "尝试备用图片路径:", alternativePaths[nextPathIndex]);
        }
      }
    };
    const handleImageLoad = (item, index) => {
      item.imageLoaded = true;
    };
    const getAuthToken = () => {
      return utils_request.getToken();
    };
    const checkLoginStatus = () => {
      return !!getAuthToken();
    };
    const checkNetworkStatus = () => {
      return new Promise((resolve) => {
        common_vendor.index.getNetworkType({
          success: (res) => resolve(res.networkType !== "none"),
          fail: () => resolve(true)
        });
      });
    };
    const queryDreamAPI = async (content, page = "1", limit = "10", isLoadMore = false) => {
      try {
        if (isLoadMore) {
          isLoadingMore.value = true;
        } else {
          isLoading.value = true;
        }
        if (!checkLoginStatus()) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        const hasNetwork = await checkNetworkStatus();
        if (!hasNetwork) {
          common_vendor.index.showToast({ title: "网络连接不可用", icon: "none" });
          return;
        }
        const response = await api_apis.apiDreamQuery({ content, page, limit });
        const newRecords = response.data.records || [];
        if (isLoadMore) {
          dreamResults.value = [...dreamResults.value, ...newRecords];
        } else {
          dreamResults.value = newRecords;
          currentPage.value = 1;
        }
        totalRecords.value = response.data.total || 0;
        totalPages.value = Math.ceil(totalRecords.value / pageSize.value);
        currentPage.value = parseInt(page);
        hasMoreData.value = currentPage.value < totalPages.value;
        hasSearched.value = true;
        common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:312", "API返回的数据:", response.data);
        common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:313", "梦境解析结果:", dreamResults.value);
        common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:314", "分页信息:", { currentPage: currentPage.value, totalPages: totalPages.value, totalRecords: totalRecords.value });
        if (!isLoadMore) {
          common_vendor.index.showToast({ title: "查询成功", icon: "success" });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: error.errMsg || error.msg || "查询失败，请重试",
          icon: "none"
        });
      } finally {
        if (isLoadMore) {
          isLoadingMore.value = false;
        } else {
          isLoading.value = false;
        }
      }
    };
    const searchDream = async () => {
      if (!searchKeyword.value.trim()) {
        common_vendor.index.showToast({ title: "请输入梦境关键词", icon: "none" });
        return;
      }
      if (!checkLoginStatus()) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      showSearchOverlay.value = false;
      await queryDreamAPI(searchKeyword.value, "1", pageSize.value.toString(), false);
      addToHistory(searchKeyword.value);
    };
    const loadMoreData = async () => {
      if (!hasMoreData.value || isLoadingMore.value) {
        return;
      }
      const nextPage = currentPage.value + 1;
      await queryDreamAPI(searchKeyword.value, nextPage.toString(), pageSize.value.toString(), true);
    };
    const selectPopularCategory = (category) => {
      searchKeyword.value = category.keyword;
      searchDream();
    };
    const focusSearch = () => {
      showSearchOverlay.value = true;
    };
    const addToHistory = (keyword) => {
      const now = /* @__PURE__ */ new Date();
      const timeStr = `${now.getMonth() + 1}-${now.getDate()} ${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;
      const historyItem = { keyword, time: timeStr };
      const existingIndex = dreamHistory.value.findIndex((item) => item.keyword === keyword);
      if (existingIndex > -1) {
        dreamHistory.value.splice(existingIndex, 1);
      }
      dreamHistory.value.unshift(historyItem);
      if (dreamHistory.value.length > 10) {
        dreamHistory.value = dreamHistory.value.slice(0, 10);
      }
      common_vendor.index.setStorageSync("dream_history", dreamHistory.value);
    };
    const selectHistoryKeyword = (keyword) => {
      searchKeyword.value = keyword;
      showSearchOverlay.value = false;
      searchDream();
    };
    const clearHistory = () => {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要清除所有历史记录吗？",
        success: (res) => {
          if (res.confirm) {
            dreamHistory.value = [];
            common_vendor.index.removeStorageSync("dream_history");
            common_vendor.index.showToast({ title: "已清除历史记录", icon: "success" });
          }
        }
      });
    };
    const selectPopularKeyword = (keyword) => {
      searchKeyword.value = keyword;
      showSearchOverlay.value = false;
      searchDream();
    };
    const goBack = () => {
      common_vendor.index.navigateBack();
    };
    common_vendor.onMounted(async () => {
      const savedHistory = common_vendor.index.getStorageSync("dream_history");
      if (savedHistory) {
        dreamHistory.value = savedHistory;
      }
      await loadDefaultData();
    });
    const loadDefaultData = async () => {
      try {
        isLoading.value = true;
        if (!checkLoginStatus()) {
          common_vendor.index.showToast({ title: "请先登录", icon: "none" });
          return;
        }
        const hasNetwork = await checkNetworkStatus();
        if (!hasNetwork) {
          common_vendor.index.showToast({ title: "网络连接不可用", icon: "none" });
          return;
        }
        const response = await api_apis.apiDreamQuery({
          content: "",
          // 空内容获取默认数据
          page: "1",
          limit: "4"
          // 只获取4条数据
        });
        dreamResults.value = response.data.records || [];
        hasSearched.value = true;
        common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:464", "默认加载的数据:", response.data);
        common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:465", "梦境解析结果:", dreamResults.value);
      } catch (error) {
        common_vendor.index.__f__("log", "at pages/dream-interpretation/dream-interpretation.vue:468", "默认数据加载失败:", error);
      } finally {
        isLoading.value = false;
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(goBack),
        b: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        c: common_vendor.o(searchDream),
        d: common_vendor.o(focusSearch),
        e: searchKeyword.value,
        f: common_vendor.o(($event) => searchKeyword.value = $event.detail.value),
        g: common_vendor.o(focusSearch),
        h: common_vendor.o(searchDream),
        i: showSearchOverlay.value
      }, showSearchOverlay.value ? common_vendor.e({
        j: dreamHistory.value.length > 0
      }, dreamHistory.value.length > 0 ? {
        k: common_vendor.p({
          type: "trash",
          size: "16",
          color: "#999"
        }),
        l: common_vendor.o(clearHistory),
        m: common_vendor.f(dreamHistory.value, (item, index, i0) => {
          return {
            a: common_vendor.t(item.keyword),
            b: index,
            c: common_vendor.o(($event) => selectHistoryKeyword(item.keyword), index)
          };
        })
      } : {}, {
        n: common_vendor.f(popularDreams.value, (dream, index, i0) => {
          return {
            a: common_vendor.t(dream),
            b: index,
            c: common_vendor.o(($event) => selectPopularKeyword(dream), index)
          };
        })
      }) : {}, {
        o: !showSearchOverlay.value
      }, !showSearchOverlay.value ? {
        p: common_vendor.f(popularCategories.value, (category, index, i0) => {
          return {
            a: common_vendor.t(category.icon),
            b: common_vendor.t(category.name),
            c: common_vendor.t(category.numbers[0]),
            d: common_vendor.t(category.numbers[1]),
            e: index,
            f: common_vendor.o(($event) => selectPopularCategory(category), index)
          };
        })
      } : {}, {
        q: dreamResults.value.length > 0
      }, dreamResults.value.length > 0 ? common_vendor.e({
        r: hasSearched.value && searchKeyword.value
      }, hasSearched.value && searchKeyword.value ? {
        s: common_vendor.t(dreamResults.value.length)
      } : {}, {
        t: common_vendor.f(dreamResults.value, (item, index, i0) => {
          return common_vendor.e({
            a: !item.imageError && item.img
          }, !item.imageError && item.img ? {
            b: item.currentImageUrl || getImageUrl(item.id, item.img),
            c: common_vendor.o(($event) => handleImageError(item), index),
            d: common_vendor.o(($event) => handleImageLoad(item), index)
          } : {}, {
            e: common_vendor.t(item.content),
            f: item.numberOne || item.numberTwo
          }, item.numberOne || item.numberTwo ? common_vendor.e({
            g: item.numberOne
          }, item.numberOne ? {
            h: common_vendor.t(item.numberOne)
          } : {}, {
            i: item.numberTwo
          }, item.numberTwo ? {
            j: common_vendor.t(item.numberTwo)
          } : {}) : {}, {
            k: index
          });
        })
      }) : {}, {
        v: dreamResults.value.length > 0 && hasMoreData.value && !isLoading.value
      }, dreamResults.value.length > 0 && hasMoreData.value && !isLoading.value ? common_vendor.e({
        w: isLoadingMore.value
      }, isLoadingMore.value ? {
        x: common_vendor.p({
          type: "spinner-cycle",
          size: "16",
          color: "#28B389"
        })
      } : {}, {
        y: common_vendor.t(currentPage.value),
        z: common_vendor.t(totalPages.value),
        A: common_vendor.o(loadMoreData),
        B: isLoadingMore.value
      }) : {}, {
        C: dreamResults.value.length > 0 && !hasMoreData.value && !isLoading.value
      }, dreamResults.value.length > 0 && !hasMoreData.value && !isLoading.value ? {
        D: common_vendor.t(totalRecords.value)
      } : {}, {
        E: isLoading.value
      }, isLoading.value ? {
        F: common_vendor.p({
          type: "spinner-cycle",
          size: "24",
          color: "#28B389"
        })
      } : {}, {
        G: !isLoading.value && dreamResults.value.length === 0 && hasSearched.value && searchKeyword.value
      }, !isLoading.value && dreamResults.value.length === 0 && hasSearched.value && searchKeyword.value ? {
        H: common_vendor.p({
          type: "info",
          size: "48",
          color: "#ccc"
        })
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-85330c9d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/dream-interpretation/dream-interpretation.js.map
