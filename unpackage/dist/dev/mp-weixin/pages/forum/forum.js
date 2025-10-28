"use strict";
const common_vendor = require("../../common/vendor.js");
const api_apis = require("../../api/apis.js");
const utils_request = require("../../utils/request.js");
if (!Array) {
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "forum",
  setup(__props) {
    const activeTab = common_vendor.ref("predict");
    const activeTag = common_vendor.ref(0);
    const showPeriodDropdown = common_vendor.ref(false);
    const publishPopup = common_vendor.ref(null);
    const agreedToTerms = common_vendor.ref(false);
    const selectedFunction = common_vendor.ref("");
    const showFilterDialog = common_vendor.ref(false);
    const selectedPredictionFilter = common_vendor.ref("");
    const selectedOtherFilter = common_vendor.ref("");
    const searchKeyword = common_vendor.ref("");
    const showSearchSuggestions = common_vendor.ref(false);
    const searchSuggestions = common_vendor.ref([]);
    const filteredPredictList = common_vendor.ref([]);
    const isSearching = common_vendor.ref(false);
    const isLoadingPosts = common_vendor.ref(false);
    const isLoadingLottery = common_vendor.ref(false);
    const predictionFilters = common_vendor.ref([
      "头尾",
      "芝麻",
      "定头",
      "定百",
      "定十",
      "定尾",
      "杀头",
      "杀百",
      "杀十",
      "杀尾",
      "稳码",
      "中肚",
      "头尾合",
      "中肚合",
      "千百合",
      "千十合",
      "百个合",
      "十个合",
      "ABXD",
      "ABCX",
      "AXCD",
      "XBCD",
      "ABXX",
      "AXCX",
      "XXCD",
      "XBXD",
      "死数",
      "二字现",
      "三字现",
      "过滤王二定",
      "过滤王三定",
      "过滤王四定",
      "头尾不合",
      "中肚不合",
      "千百不合",
      "千十不合",
      "百个不合",
      "十个不合"
    ]);
    const otherFilters = common_vendor.ref([
      "大师帖子",
      "靓规贴子",
      "点赞最多",
      "讨论最热"
    ]);
    const tags = common_vendor.ref([
      "#全部",
      "#大师",
      "#靓规贴",
      "#过滤王",
      "#点赞最多"
    ]);
    const lotteryTypes = common_vendor.ref([
      { id: 16, name: "排列三", code: "pl3", status: "待开奖", time: "今天 21:30" },
      { id: 17, name: "排列五", code: "pl5", status: "待开奖", time: "今天 21:30" },
      { id: 15, name: "七星彩", code: "qxc", status: "待开奖", time: "今天 21:30" },
      { id: 12, name: "福彩3D", code: "fc3d", status: "待开奖", time: "今天 21:30" }
    ]);
    const currentLotteryType = common_vendor.ref(lotteryTypes.value[0]);
    const headlinesList = common_vendor.ref([
      {
        id: 1,
        title: "2024年彩票行业最新政策解读",
        content: "国家彩票管理中心发布最新政策，对彩票销售和兑奖流程进行了优化调整...",
        time: "2小时前",
        views: 1256,
        likes: 89
      },
      {
        id: 2,
        title: "数字彩票中奖概率分析报告",
        content: "专业机构发布最新中奖概率分析，帮助彩民理性购彩...",
        time: "5小时前",
        views: 892,
        likes: 67
      },
      {
        id: 3,
        title: "彩票公益金使用情况公示",
        content: "本年度彩票公益金主要用于教育、医疗、体育等公益事业...",
        time: "1天前",
        views: 2156,
        likes: 156
      }
    ]);
    const followList = common_vendor.ref([
      {
        id: 1,
        username: "彩友小王",
        avatar: "/static/images/defaultAvatar.png",
        time: "刚刚",
        content: "今天分享一个实用的选号技巧，希望对大家有帮助！"
      },
      {
        id: 2,
        username: "幸运星",
        avatar: "/static/images/defaultAvatar.png",
        time: "30分钟前",
        content: "最近在研究号码走势，发现了一些有趣的规律"
      },
      {
        id: 3,
        username: "数字达人",
        avatar: "/static/images/defaultAvatar.png",
        time: "1小时前",
        content: "新一期预测已发布，欢迎大家参考讨论"
      }
    ]);
    const predictList = common_vendor.ref([]);
    const currentIssueInfo = common_vendor.ref({
      id: null,
      number: null,
      status: "待开奖",
      time: "今天 21:30"
    });
    const soupList = common_vendor.ref([
      {
        id: 1,
        username: "心灵导师",
        avatar: "/static/images/defaultAvatar.png",
        time: "1小时前",
        content: "生活就像彩票，不买永远没有中奖的机会，但买了也不一定中奖。重要的是保持一颗平常心，享受过程，期待美好。",
        likes: 45,
        comments: 12
      },
      {
        id: 2,
        username: "正能量小王",
        avatar: "/static/images/defaultAvatar.png",
        time: "3小时前",
        content: "每一次失败都是成功的垫脚石，每一次尝试都是成长的机会。相信自己，坚持下去，好运总会降临。",
        likes: 67,
        comments: 23
      },
      {
        id: 3,
        username: "励志达人",
        avatar: "/static/images/defaultAvatar.png",
        time: "6小时前",
        content: "人生就像选号，没有标准答案，但有无数种可能。勇敢尝试，坚持梦想，你就是自己的幸运星。",
        likes: 89,
        comments: 34
      }
    ]);
    const isPageInitialized = common_vendor.ref(false);
    common_vendor.onMounted(() => {
      if (isPageInitialized.value) {
        common_vendor.index.__f__("log", "at pages/forum/forum.vue:594", "页面已经初始化，跳过重复加载");
        return;
      }
      try {
        const savedLotteryType = common_vendor.index.getStorageSync("currentLotteryType");
        if (savedLotteryType) {
          currentLotteryType.value = savedLotteryType;
        }
      } catch (error) {
      }
      autoSaveCurrentUserAvatar();
      optimizeTouchEvents();
      loadLotteryData(currentLotteryType.value.code);
      isPageInitialized.value = true;
    });
    const switchTab = (tab) => {
      activeTab.value = tab;
    };
    const selectTag = (index) => {
      activeTag.value = index;
      const selectedTag = tags.value[index];
      const tagContent = selectedTag.replace("#", "");
      searchKeyword.value = tagContent;
      performFuzzySearch();
      showSearchSuggestions.value = false;
    };
    const togglePeriodDropdown = () => {
      showPeriodDropdown.value = !showPeriodDropdown.value;
    };
    const closePeriodDropdown = () => {
      showPeriodDropdown.value = false;
    };
    const selectLotteryType = (lotteryType) => {
      if (currentLotteryType.value.code === lotteryType.code) {
        common_vendor.index.__f__("log", "at pages/forum/forum.vue:653", "彩票类型未变化，跳过加载");
        showPeriodDropdown.value = false;
        return;
      }
      currentLotteryType.value = lotteryType;
      showPeriodDropdown.value = false;
      try {
        common_vendor.index.setStorageSync("currentLotteryType", lotteryType);
      } catch (error) {
      }
      loadLotteryData(lotteryType.code);
    };
    const loadLotteryData = async (lotteryCode) => {
      if (isLoadingLottery.value) {
        common_vendor.index.__f__("log", "at pages/forum/forum.vue:674", "正在加载彩票数据，跳过重复请求");
        return;
      }
      try {
        isLoadingLottery.value = true;
        const lotteryType = lotteryTypes.value.find((type) => type.code === lotteryCode);
        if (!lotteryType) {
          return;
        }
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_apis.apiGetIssueNo({ cpid: lotteryType.id });
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
          if (currentLotteryType.value.code === lotteryCode) {
            currentLotteryType.value.status = lotteryType.status;
            currentLotteryType.value.time = lotteryType.time;
          }
          currentIssueInfo.value = {
            id: issueNumber,
            number: issueNumber,
            status: issueStatus,
            time: issueTime
          };
          try {
            common_vendor.index.setStorageSync("currentIssueInfo", currentIssueInfo.value);
          } catch (error) {
          }
          loadPredictPosts();
        } else {
          common_vendor.index.showToast({ title: response.msg || "数据加载失败", icon: "none" });
        }
      } catch (error) {
        common_vendor.index.hideLoading();
        common_vendor.index.showToast({ title: "网络错误，请重试", icon: "none" });
      } finally {
        isLoadingLottery.value = false;
      }
    };
    const isMultipleImages = (imageStr) => {
      return imageStr && imageStr.includes(",");
    };
    const getImageUrls = (imageStr) => {
      if (!imageStr)
        return [];
      return imageStr.split(",").map((url) => url.trim()).filter((url) => url);
    };
    const previewImage = (current, urls) => {
      common_vendor.index.previewImage({
        current,
        urls
      });
    };
    const showPublishModal = () => {
      publishPopup.value.open();
    };
    const hidePublishModal = () => {
      publishPopup.value.close();
    };
    const toggleAgreementManually = () => {
      agreedToTerms.value = !agreedToTerms.value;
    };
    const selectFunction = (type) => {
      if (!agreedToTerms.value) {
        common_vendor.index.showToast({
          title: "请先同意管理规范",
          icon: "none"
        });
        return;
      }
      selectedFunction.value = type;
      switch (type) {
        case "predict":
          common_vendor.index.navigateTo({
            url: "/pages/predict-scheme/predict-scheme",
            success: () => {
              hidePublishModal();
            },
            fail: (err) => {
              common_vendor.index.showToast({
                title: "跳转失败",
                icon: "none"
              });
            }
          });
          break;
        case "pattern":
          common_vendor.index.navigateTo({
            url: "/pages/pattern-predict/pattern-predict",
            success: () => {
              hidePublishModal();
            },
            fail: (err) => {
              common_vendor.index.showToast({
                title: "跳转失败",
                icon: "none"
              });
            }
          });
          break;
        case "filter":
          common_vendor.index.showToast({
            title: "跳转到过滤王帖发布",
            icon: "none"
          });
          break;
        case "soup":
          common_vendor.index.showToast({
            title: "跳转到老母鸡汤发布",
            icon: "none"
          });
          break;
      }
      hidePublishModal();
    };
    const showFilterModal = () => {
      showFilterDialog.value = true;
    };
    const hideFilterModal = () => {
      showFilterDialog.value = false;
    };
    const togglePredictionFilter = (filter) => {
      if (selectedPredictionFilter.value === filter) {
        selectedPredictionFilter.value = "";
      } else {
        selectedPredictionFilter.value = filter;
      }
    };
    const toggleOtherFilter = (filter) => {
      if (selectedOtherFilter.value === filter) {
        selectedOtherFilter.value = "";
      } else {
        selectedOtherFilter.value = filter;
      }
    };
    const handleSearchInput = () => {
      if (searchKeyword.value.trim()) {
        generateSearchSuggestions();
        performFuzzySearch();
      } else {
        clearSearchResults();
      }
    };
    const generateSearchSuggestions = () => {
      const keyword = searchKeyword.value.trim().toLowerCase();
      const suggestions = [];
      predictionFilters.value.forEach((filter) => {
        if (filter.toLowerCase().includes(keyword)) {
          suggestions.push(filter);
        }
      });
      otherFilters.value.forEach((filter) => {
        if (filter.toLowerCase().includes(keyword)) {
          suggestions.push(filter);
        }
      });
      searchSuggestions.value = suggestions.slice(0, 5);
    };
    const selectSuggestion = (suggestion) => {
      searchKeyword.value = suggestion;
      showSearchSuggestions.value = false;
      performFuzzySearch();
    };
    const clearSearch = () => {
      searchKeyword.value = "";
      showSearchSuggestions.value = false;
      activeTag.value = -1;
      clearSearchResults();
    };
    const performFuzzySearch = () => {
      const keyword = searchKeyword.value.trim().toLowerCase();
      if (!keyword) {
        clearSearchResults();
        return;
      }
      isSearching.value = true;
      filteredPredictList.value = predictList.value.filter((post) => {
        if (post.username && post.username.toLowerCase().includes(keyword)) {
          return true;
        }
        if (post.content && post.content.toLowerCase().includes(keyword)) {
          return true;
        }
        if (post.period && post.period.toString().includes(keyword)) {
          return true;
        }
        if (keyword === "全部") {
          return true;
        }
        if (keyword === "大师" || keyword === "大师帖子") {
          return post.content && post.content.toLowerCase().includes("大师");
        }
        if (keyword === "靓规贴" || keyword === "靓规贴子") {
          return post.content && post.content.toLowerCase().includes("靓规");
        }
        if (keyword === "过滤王") {
          return post.content && post.content.toLowerCase().includes("过滤王");
        }
        if (keyword === "点赞最多") {
          return post.likes > 0;
        }
        return false;
      });
      if (keyword === "点赞最多") {
        filteredPredictList.value.sort((a, b) => b.likes - a.likes);
      }
      common_vendor.index.showToast({
        title: `找到${filteredPredictList.value.length}条结果`,
        icon: "success"
      });
    };
    const clearSearchResults = () => {
      filteredPredictList.value = [];
      isSearching.value = false;
    };
    const performSearch = () => {
      const filters = [];
      if (selectedPredictionFilter.value) {
        filters.push(selectedPredictionFilter.value);
      }
      if (selectedOtherFilter.value) {
        filters.push(selectedOtherFilter.value);
      }
      if (filters.length === 0) {
        common_vendor.index.showToast({
          title: "请选择筛选条件",
          icon: "none"
        });
        return;
      }
      searchKeyword.value = filters.join("+");
      performFilterSearch();
      hideFilterModal();
      activeTag.value = -1;
      common_vendor.index.showToast({
        title: `搜索${filters.join("+")}`,
        icon: "success"
      });
    };
    const performFilterSearch = (filters) => {
      isSearching.value = true;
      filteredPredictList.value = predictList.value.filter((post) => {
        let matches = false;
        if (selectedPredictionFilter.value) {
          const predictionFilter = selectedPredictionFilter.value.toLowerCase();
          if (post.content && post.content.toLowerCase().includes(predictionFilter)) {
            matches = true;
          }
          if (predictionFilter === "头尾" && post.content && (post.content.includes("头") || post.content.includes("尾"))) {
            matches = true;
          }
          if (predictionFilter === "芝麻" && post.content && post.content.includes("芝麻")) {
            matches = true;
          }
          if (predictionFilter === "中肚" && post.content && post.content.includes("中肚")) {
            matches = true;
          }
          if (predictionFilter.includes("定") && post.content && post.content.includes("定")) {
            matches = true;
          }
          if (predictionFilter.includes("杀") && post.content && post.content.includes("杀")) {
            matches = true;
          }
          if (predictionFilter.includes("合") && post.content && post.content.includes("合")) {
            matches = true;
          }
          if (predictionFilter.includes("过滤王") && post.content && post.content.includes("过滤王")) {
            matches = true;
          }
        }
        if (selectedOtherFilter.value) {
          const otherFilter = selectedOtherFilter.value.toLowerCase();
          if (otherFilter === "大师帖子" && post.content && post.content.includes("大师")) {
            matches = true;
          }
          if (otherFilter === "靓规贴子" && post.content && post.content.includes("靓规")) {
            matches = true;
          }
          if (otherFilter === "点赞最多" && post.likes > 0) {
            matches = true;
          }
          if (otherFilter === "讨论最热" && post.comments > 0) {
            matches = true;
          }
        }
        return matches;
      });
      if (selectedOtherFilter.value === "点赞最多") {
        filteredPredictList.value.sort((a, b) => b.likes - a.likes);
      } else if (selectedOtherFilter.value === "讨论最热") {
        filteredPredictList.value.sort((a, b) => b.comments - a.comments);
      }
    };
    const getSearchButtonText = () => {
      const filters = [];
      if (selectedPredictionFilter.value) {
        filters.push(selectedPredictionFilter.value);
      }
      if (selectedOtherFilter.value) {
        filters.push(selectedOtherFilter.value);
      }
      if (filters.length === 0) {
        return "搜索";
      }
      return filters.join("+");
    };
    const loadPredictPosts = async () => {
      if (isLoadingPosts.value) {
        common_vendor.index.__f__("log", "at pages/forum/forum.vue:1138", "正在加载帖子，跳过重复请求");
        return;
      }
      try {
        isLoadingPosts.value = true;
        const queryData = {
          tname: currentLotteryType.value.name,
          // 查询预测帖
          issueno: currentIssueInfo.value.number || currentIssueInfo.value.id || "--",
          page: "1",
          limit: "20"
        };
        const response = await api_apis.apiPostListQuery(queryData);
        let allPosts = [];
        if (response.code === 200) {
          if (response.data && response.data.records && Array.isArray(response.data.records)) {
            allPosts = [...response.data.records];
          }
        }
        const patternQueryData = {
          tname: `${currentLotteryType.value.name}-规律预测`,
          // 查询规律帖
          issueno: currentIssueInfo.value.number || currentIssueInfo.value.id || "--",
          page: "1",
          limit: "20"
        };
        const patternResponse = await api_apis.apiPostListQuery(patternQueryData);
        if (patternResponse.code === 200) {
          if (patternResponse.data && patternResponse.data.records && Array.isArray(patternResponse.data.records)) {
            allPosts = [...allPosts, ...patternResponse.data.records];
          }
        }
        if (allPosts.length > 0) {
          predictList.value = allPosts.map((post) => {
            const postId = post.id;
            if (!postId) {
              return null;
            }
            const currentAccount = utils_request.getAccount();
            const userLikedKey = `${postId}_${currentAccount}`;
            const isLiked = getLikedStatus(userLikedKey);
            const serverLikeCount = post.likeCount || 0;
            let userAvatar = "http://video.caimizm.com/himg/user.png";
            userAvatar = getUserAvatar(post.account);
            return {
              id: postId,
              username: post.account || "匿名用户",
              avatar: userAvatar,
              // 使用处理后的头像
              time: formatTime(post.createTime),
              status: "预测中",
              period: post.issueno || currentIssueInfo.value.number,
              content: post.content || "",
              image: post.pimg || "",
              // 帖子图片（规律帖的图片）
              likes: serverLikeCount,
              // 使用服务器返回的点赞数
              comments: post.comment || 0,
              shares: 0,
              isLiked,
              // 检查当前用户是否点赞过
              isLiking: false
              // 点赞中状态
            };
          }).filter((post) => post !== null);
        } else {
          predictList.value = [];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/forum/forum.vue:1224", "加载帖子失败:", error);
        predictList.value = [];
      } finally {
        isLoadingPosts.value = false;
      }
    };
    const getLikedStatus = (postId) => {
      try {
        const likedPosts = common_vendor.index.getStorageSync("likedPosts") || {};
        return likedPosts[postId] || false;
      } catch (error) {
        return false;
      }
    };
    const saveLikedStatus = (postId, isLiked) => {
      try {
        const likedPosts = common_vendor.index.getStorageSync("likedPosts") || {};
        likedPosts[postId] = isLiked;
        common_vendor.index.setStorageSync("likedPosts", likedPosts);
      } catch (error) {
      }
    };
    const getUserAvatar = (account) => {
      try {
        const currentAccount = utils_request.getAccount();
        if (account === currentAccount) {
          const loginData = common_vendor.index.getStorageSync("loginData") || {};
          if (loginData.himg) {
            return loginData.himg;
          }
        }
        const userAvatars = common_vendor.index.getStorageSync("userAvatars") || {};
        if (userAvatars[account]) {
          return userAvatars[account];
        }
        return "http://video.caimizm.com/himg/user.png";
      } catch (error) {
        return "http://video.caimizm.com/himg/user.png";
      }
    };
    const formatTime = (timeStr) => {
      if (!timeStr)
        return "刚刚";
      try {
        const time = new Date(timeStr);
        const now = /* @__PURE__ */ new Date();
        const diff = now - time;
        if (diff < 6e4)
          return "刚刚";
        if (diff < 36e5)
          return `${Math.floor(diff / 6e4)}分钟前`;
        if (diff < 864e5)
          return `${Math.floor(diff / 36e5)}小时前`;
        return `${Math.floor(diff / 864e5)}天前`;
      } catch (error) {
        return "刚刚";
      }
    };
    const clearFilterSelection = () => {
      selectedPredictionFilter.value = "";
      selectedOtherFilter.value = "";
      common_vendor.index.showToast({
        title: "已清空筛选条件",
        icon: "success"
      });
    };
    const handleLike = async (post) => {
      try {
        if (post.isLiking) {
          return;
        }
        const currentAccount = utils_request.getAccount();
        const userLikedKey = `${post.id}_${currentAccount}`;
        const hasUserLiked = getLikedStatus(userLikedKey);
        if (hasUserLiked) {
          common_vendor.index.showToast({
            title: "你已经点赞过了",
            icon: "none"
          });
          return;
        }
        if (!post.id) {
          common_vendor.index.showToast({
            title: "帖子数据异常，无法点赞",
            icon: "none"
          });
          return;
        }
        post.isLiking = true;
        const likeData = {
          postId: post.id,
          account: currentAccount
          // 使用当前登录用户账号
        };
        const response = await api_apis.apiPostLike(likeData);
        if (response.code === 200) {
          post.isLiked = true;
          post.likes += 1;
          saveLikedStatus(userLikedKey, true);
          common_vendor.index.showToast({
            title: response.msg || "点赞成功",
            icon: "success"
          });
          updatePostInList(post);
        } else {
          common_vendor.index.showToast({
            title: response.msg || "点赞失败",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "网络错误，请重试",
          icon: "none"
        });
      } finally {
        post.isLiking = false;
      }
    };
    const updatePostInList = (updatedPost) => {
      const originalIndex = predictList.value.findIndex((p) => p.id === updatedPost.id);
      if (originalIndex !== -1) {
        predictList.value[originalIndex] = { ...updatedPost };
      }
      const filteredIndex = filteredPredictList.value.findIndex((p) => p.id === updatedPost.id);
      if (filteredIndex !== -1) {
        filteredPredictList.value[filteredIndex] = { ...updatedPost };
      }
    };
    const autoSaveCurrentUserAvatar = () => {
      try {
        const loginData = common_vendor.index.getStorageSync("loginData") || {};
        const currentAccount = utils_request.getAccount();
        if (loginData.himg && currentAccount) {
          const userAvatars = common_vendor.index.getStorageSync("userAvatars") || {};
          if (!userAvatars[currentAccount]) {
            userAvatars[currentAccount] = loginData.himg;
            common_vendor.index.setStorageSync("userAvatars", userAvatars);
          }
        }
      } catch (error) {
      }
    };
    const optimizeTouchEvents = () => {
      try {
        if (typeof window !== "undefined" && window.addEventListener) {
          const addPassiveListener = (element, event, handler) => {
            element.addEventListener(event, handler, { passive: true });
          };
          const scrollContainers = document.querySelectorAll(".predict-list, .modal-content, .dropdown-list, .filter-dialog");
          scrollContainers.forEach((container) => {
            addPassiveListener(container, "touchstart", () => {
            });
            addPassiveListener(container, "touchmove", () => {
            });
            addPassiveListener(container, "touchend", () => {
            });
          });
        }
      } catch (error) {
      }
    };
    const handleAppendPost = (post) => {
      try {
        if (!post.id) {
          common_vendor.index.showToast({
            title: "帖子数据异常，无法追帖",
            icon: "none"
          });
          return;
        }
        const currentAccount = utils_request.getAccount();
        if (post.username === currentAccount) {
          common_vendor.index.showModal({
            title: "追帖确认",
            content: `确定要对帖子"第${post.period}期"进行追帖吗？`,
            confirmText: "确定追帖",
            cancelText: "取消",
            success: (res) => {
              if (res.confirm) {
                navigateToAppendPost(post);
              }
            }
          });
        } else {
          common_vendor.index.showToast({
            title: "只能追帖自己的帖子",
            icon: "none"
          });
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "操作失败，请重试",
          icon: "none"
        });
      }
    };
    const navigateToAppendPost = (post) => {
      try {
        const schemeIds = extractSchemeFromContent(post.content);
        const appendPostData = {
          postId: post.id,
          schemeIds,
          // 改为数组，包含所有方案
          postContent: post.content,
          period: post.period,
          lotteryType: currentLotteryType.value.name,
          // 添加彩票类型
          timestamp: Date.now()
        };
        common_vendor.index.setStorageSync("appendPostData", appendPostData);
        common_vendor.index.navigateTo({
          url: "/pages/predict-scheme/predict-scheme",
          success: () => {
            common_vendor.index.showToast({
              title: "请选择要追加的方案",
              icon: "success"
            });
          },
          fail: (err) => {
            common_vendor.index.showToast({
              title: "跳转失败",
              icon: "none"
            });
          }
        });
      } catch (error) {
        common_vendor.index.showToast({
          title: "跳转失败",
          icon: "none"
        });
      }
    };
    const extractSchemeFromContent = (content) => {
      try {
        if (!content)
          return [];
        const schemeTypes = [
          "头尾",
          "中肚",
          "ABXX",
          "AXCX",
          "XBXD",
          "XXCD",
          "ABCX",
          "ABXD",
          "AXCD",
          "XBCD",
          "芝麻",
          "二字现",
          "三字现",
          "定头",
          "定百",
          "定十",
          "定尾",
          "杀头",
          "杀百",
          "杀十",
          "杀尾",
          "稳码",
          "头尾合",
          "中肚合",
          "千百合",
          "千十合",
          "百个合",
          "十个合",
          "死数",
          "头尾不合",
          "中肚不合",
          "千百不合",
          "千十不合",
          "百个不合",
          "十个不合",
          "过滤王二定",
          "过滤王三定",
          "过滤王四定"
        ];
        const foundSchemes = [];
        schemeTypes.forEach((scheme) => {
          if (content.includes(scheme)) {
            foundSchemes.push(scheme);
          }
        });
        return foundSchemes;
      } catch (error) {
        return [];
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.p({
          type: "list",
          size: "20",
          color: "#fff"
        }),
        b: common_vendor.t(currentLotteryType.value.name),
        c: common_vendor.t(currentLotteryType.value.status),
        d: showPeriodDropdown.value ? 1 : "",
        e: common_vendor.p({
          type: "arrowdown",
          size: "16",
          color: "#fff"
        }),
        f: common_vendor.o(togglePeriodDropdown),
        g: showPeriodDropdown.value
      }, showPeriodDropdown.value ? {
        h: common_vendor.o(closePeriodDropdown)
      } : {}, {
        i: showPeriodDropdown.value
      }, showPeriodDropdown.value ? {
        j: common_vendor.p({
          type: "close",
          size: "16",
          color: "#999"
        }),
        k: common_vendor.o(closePeriodDropdown),
        l: common_vendor.f(lotteryTypes.value, (lotteryType, k0, i0) => {
          return {
            a: common_vendor.t(lotteryType.name),
            b: common_vendor.t(lotteryType.status),
            c: common_vendor.t(lotteryType.time),
            d: lotteryType.id === currentLotteryType.value.id ? 1 : "",
            e: lotteryType.id,
            f: common_vendor.o(($event) => selectLotteryType(lotteryType), lotteryType.id)
          };
        }),
        m: common_vendor.o(() => {
        })
      } : {}, {
        n: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#fff"
        }),
        o: common_vendor.o(showPublishModal),
        p: activeTab.value === "headlines" ? 1 : "",
        q: common_vendor.o(($event) => switchTab("headlines")),
        r: activeTab.value === "follow" ? 1 : "",
        s: common_vendor.o(($event) => switchTab("follow")),
        t: activeTab.value === "predict" ? 1 : "",
        v: common_vendor.o(($event) => switchTab("predict")),
        w: activeTab.value === "soup" ? 1 : "",
        x: common_vendor.o(($event) => switchTab("soup")),
        y: common_vendor.p({
          type: "search",
          size: "16",
          color: "#999"
        }),
        z: common_vendor.o([($event) => searchKeyword.value = $event.detail.value, handleSearchInput]),
        A: common_vendor.o(($event) => showSearchSuggestions.value = true),
        B: searchKeyword.value,
        C: searchKeyword.value
      }, searchKeyword.value ? {
        D: common_vendor.p({
          type: "clear",
          size: "16",
          color: "#999"
        }),
        E: common_vendor.o(clearSearch)
      } : {}, {
        F: common_vendor.p({
          type: "tune",
          size: "16",
          color: "#999"
        }),
        G: common_vendor.o(showFilterModal),
        H: showSearchSuggestions.value && searchSuggestions.value.length > 0
      }, showSearchSuggestions.value && searchSuggestions.value.length > 0 ? {
        I: common_vendor.f(searchSuggestions.value, (suggestion, index, i0) => {
          return {
            a: "aeadbf01-7-" + i0,
            b: common_vendor.t(suggestion),
            c: index,
            d: common_vendor.o(($event) => selectSuggestion(suggestion), index)
          };
        }),
        J: common_vendor.p({
          type: "search",
          size: "14",
          color: "#999"
        })
      } : {}, {
        K: common_vendor.f(tags.value, (tag, index, i0) => {
          return {
            a: common_vendor.t(tag),
            b: activeTag.value === index ? 1 : "",
            c: index,
            d: common_vendor.o(($event) => selectTag(index), index)
          };
        }),
        L: activeTab.value === "headlines"
      }, activeTab.value === "headlines" ? {
        M: common_vendor.f(headlinesList.value, (headline, index, i0) => {
          return {
            a: common_vendor.t(headline.title),
            b: common_vendor.t(headline.time),
            c: common_vendor.t(headline.content),
            d: common_vendor.t(headline.views),
            e: common_vendor.t(headline.likes),
            f: index
          };
        })
      } : {}, {
        N: activeTab.value === "follow"
      }, activeTab.value === "follow" ? {
        O: common_vendor.f(followList.value, (follow, index, i0) => {
          return {
            a: follow.avatar,
            b: common_vendor.t(follow.username),
            c: common_vendor.t(follow.time),
            d: common_vendor.t(follow.content),
            e: index
          };
        })
      } : {}, {
        P: activeTab.value === "predict"
      }, activeTab.value === "predict" ? common_vendor.e({
        Q: isSearching.value && searchKeyword.value
      }, isSearching.value && searchKeyword.value ? {
        R: common_vendor.t(searchKeyword.value),
        S: common_vendor.t(filteredPredictList.value.length)
      } : {}, {
        T: common_vendor.f(isSearching.value && searchKeyword.value ? filteredPredictList.value : predictList.value, (item, index, i0) => {
          return common_vendor.e({
            a: item.avatar,
            b: common_vendor.t(item.username),
            c: "aeadbf01-8-" + i0,
            d: common_vendor.t(item.period),
            e: common_vendor.t(item.time),
            f: common_vendor.t(item.content),
            g: item.image
          }, item.image ? common_vendor.e({
            h: !isMultipleImages(item.image)
          }, !isMultipleImages(item.image) ? {
            i: item.image.startsWith("http") ? item.image : `http://video.caimizm.com/himg/${item.image}`,
            j: common_vendor.o(($event) => previewImage(item.image, [item.image]), index)
          } : {
            k: common_vendor.f(getImageUrls(item.image), (imageUrl, index2, i1) => {
              return {
                a: imageUrl.startsWith("http") ? imageUrl : `http://video.caimizm.com/himg/${imageUrl}`,
                b: common_vendor.o(($event) => previewImage(imageUrl, getImageUrls(item.image)), index2),
                c: index2
              };
            })
          }) : {}, {
            l: "aeadbf01-9-" + i0,
            m: common_vendor.p({
              type: "hand-up",
              size: "18",
              color: item.isLiked ? "#ff4757" : "#999"
            }),
            n: common_vendor.t(item.likes),
            o: item.isLiked ? 1 : "",
            p: item.isLiked ? 1 : "",
            q: common_vendor.o(($event) => handleLike(item), index),
            r: "aeadbf01-10-" + i0,
            s: common_vendor.t(item.shares),
            t: "aeadbf01-11-" + i0,
            v: common_vendor.t(item.comments),
            w: "aeadbf01-12-" + i0,
            x: common_vendor.o(($event) => handleAppendPost(item), index),
            y: index
          });
        }),
        U: common_vendor.p({
          type: "more-filled",
          size: "20",
          color: "#999"
        }),
        V: common_vendor.p({
          type: "redo",
          size: "18",
          color: "#999"
        }),
        W: common_vendor.p({
          type: "chatbubble",
          size: "18",
          color: "#999"
        }),
        X: common_vendor.p({
          type: "plus",
          size: "18",
          color: "#28B389"
        }),
        Y: predictList.value.length === 0
      }, predictList.value.length === 0 ? {} : {}) : {}, {
        Z: activeTab.value === "soup"
      }, activeTab.value === "soup" ? {
        aa: common_vendor.f(soupList.value, (soup, index, i0) => {
          return {
            a: soup.avatar,
            b: common_vendor.t(soup.username),
            c: common_vendor.t(soup.time),
            d: common_vendor.t(soup.content),
            e: "aeadbf01-13-" + i0,
            f: common_vendor.t(soup.likes),
            g: "aeadbf01-14-" + i0,
            h: common_vendor.t(soup.comments),
            i: index
          };
        }),
        ab: common_vendor.p({
          type: "heart",
          size: "14",
          color: "#999"
        }),
        ac: common_vendor.p({
          type: "chat",
          size: "14",
          color: "#999"
        })
      } : {}, {
        ad: common_vendor.p({
          type: "plus",
          size: "20",
          color: "#fff"
        }),
        ae: common_vendor.o(showPublishModal),
        af: common_vendor.p({
          type: "close",
          size: "20",
          color: "#999"
        }),
        ag: common_vendor.o(hidePublishModal),
        ah: agreedToTerms.value
      }, agreedToTerms.value ? {} : {}, {
        ai: agreedToTerms.value ? 1 : "",
        aj: common_vendor.o(toggleAgreementManually),
        ak: common_vendor.o(($event) => selectFunction("predict")),
        al: common_vendor.p({
          type: "redo",
          size: "24",
          color: "#fff"
        }),
        am: common_vendor.o(($event) => selectFunction("pattern")),
        an: common_vendor.p({
          type: "gear",
          size: "24",
          color: "#fff"
        }),
        ao: common_vendor.o(($event) => selectFunction("filter")),
        ap: common_vendor.p({
          type: "coffee",
          size: "24",
          color: "#fff"
        }),
        aq: common_vendor.o(($event) => selectFunction("soup")),
        ar: common_vendor.o(hidePublishModal),
        as: common_vendor.sr(publishPopup, "aeadbf01-16", {
          "k": "publishPopup"
        }),
        at: common_vendor.p({
          type: "bottom",
          ["safe-area"]: false,
          ["mask-click"]: false,
          animation: true,
          ["mask-background-color"]: "rgba(0,0,0,0.5)",
          duration: 300
        }),
        av: showSearchSuggestions.value
      }, showSearchSuggestions.value ? {
        aw: common_vendor.o(($event) => showSearchSuggestions.value = false)
      } : {}, {
        ax: showFilterDialog.value
      }, showFilterDialog.value ? {
        ay: common_vendor.t(currentLotteryType.value.name),
        az: common_vendor.t(currentLotteryType.value.status),
        aA: common_vendor.f(predictionFilters.value, (filter, k0, i0) => {
          return {
            a: common_vendor.t(filter),
            b: selectedPredictionFilter.value === filter ? 1 : "",
            c: filter,
            d: common_vendor.o(($event) => togglePredictionFilter(filter), filter)
          };
        }),
        aB: common_vendor.f(otherFilters.value, (filter, k0, i0) => {
          return {
            a: common_vendor.t(filter),
            b: selectedOtherFilter.value === filter ? 1 : "",
            c: filter,
            d: common_vendor.o(($event) => toggleOtherFilter(filter), filter)
          };
        }),
        aC: common_vendor.o(clearFilterSelection),
        aD: common_vendor.t(getSearchButtonText()),
        aE: common_vendor.o(performSearch),
        aF: common_vendor.o(() => {
        }),
        aG: common_vendor.o(hideFilterModal)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-aeadbf01"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/forum/forum.js.map
