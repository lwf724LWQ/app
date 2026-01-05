<template>
  <view class="forum-container">
    <image src="/static/b.webp"></image>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { apiGetIssueNo, apiPostListQuery, apiPostLike } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
import { getToken } from "../../utils/request";
import { useUserStore } from "../../stores/userStore";
import bottomBar from "../../components/bottom-bar/bottom-bar.vue";
import tool from "@/utils/tool.js";
import forumToos from "../../components/post-card/forumToos";
import postCard from "./components/post-card.vue";
import followUserList from "./components/follow-user-list.vue";

// 用户数据存储
const userStore = useUserStore();

// 工具与常量：安全本地存取、函数防抖、文本规范化
const safeGet = (key, fallback) => {
  try {
    const v = uni.getStorageSync(key);
    return v === undefined || v === null ? fallback : v;
  } catch (e) {
    return fallback;
  }
};

const safeSet = (key, value) => {
  try {
    uni.setStorageSync(key, value);
  } catch (e) {
    // 非关键失败忽略
  }
};

const debounce = (fn, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const normalizeText = (val) => String(val || "").toLowerCase();

// 当前选中的标签
const activeTab = ref("predict");

// 当前选中的标签（分类标签）
const activeTag = ref(0);

// 彩票类型下拉框状态
const showPeriodDropdown = ref(false);

// 弹出层引用
const publishPopup = ref(null);

// 协议同意状态
const agreedToTerms = ref(uni.getStorageSync("postAgreement") || false);

// 选中的功能类型
const selectedFunction = ref("");

// 筛选弹窗相关
const showFilterDialog = ref(false);
const selectedPredictionFilter = ref(""); // 心水预测只能选择一个
const selectedOtherFilter = ref(""); // 其他筛选只能选择一个

// 搜索相关
const searchKeyword = ref("");
const showSearchSuggestions = ref(false);
const searchSuggestions = ref([]);
const filteredPredictList = ref([]);
const isSearching = ref(false);

// 请求锁 - 防止重复请求
const isLoadingPosts = ref(false);
const isLoadingLottery = ref(false);

// 请求缓存 - 记录当前正在请求的参数，避免重复请求
const currentQueryKey = ref(null); // 格式: "tname_issueno"

// 心水预测筛选选项
const predictionFilters = ref([
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
  "十个不合",
]);

// 其他筛选选项
const otherFilters = ref(["大师帖子", "靓规贴子", "点赞最多", "讨论最热"]);

// 分类标签列表
const tags = ref(["#全部", "#大师", "#靓规贴", "#过滤王", "#点赞最多"]);

// 彩票类别列表
const lotteryTypes = ref([
  { id: 16, name: "排列三", code: "pl3", status: "待开奖", time: "今天 21:30" },
  { id: 17, name: "排列五", code: "plw", status: "待开奖", time: "今天 21:30" },
  { id: 15, name: "七星彩", code: "qxc", status: "待开奖", time: "今天 21:30" },
  {
    id: 12,
    name: "福彩3D",
    code: "fc3d",
    status: "待开奖",
    time: "今天 21:30",
  },
]);

// 当前选中的彩票类别
const currentLotteryType = ref(lotteryTypes.value[0]);

// 预测列表
const predictList = ref([]);

// 当前期号信息
const currentIssueInfo = ref({
  id: null,
  number: null,
  status: "待开奖",
  time: "今天 21:30",
});

// 页面是否已经初始化
const isPageInitialized = ref(false);

// 页面加载完成
onMounted(() => {
  if (isPageInitialized.value) {
    return;
  }

  const savedLotteryType = safeGet("currentLotteryType", null);
  if (savedLotteryType) {
    currentLotteryType.value = savedLotteryType;
  }

  optimizeTouchEvents();
  loadLotteryData(currentLotteryType.value.code);
  isPageInitialized.value = true;
});
const followUserListRef = ref(null);
onShow(() => {
  followUserListRef.value?.reload();
});

function onRefresh() {
  if (refreshing.value) return;
  refreshing.value = true;
  loadLotteryData(currentLotteryType.value.code);
}

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab;
};

// 选择分类标签
const selectTag = (index) => {
  activeTag.value = index;
  const selectedTag = tags.value[index];

  // 提取标签内容（去掉#号）
  const tagContent = selectedTag.replace("#", "");

  // 设置搜索关键词并执行搜索
  searchKeyword.value = tagContent;
  performFuzzySearch();

  // 关闭搜索建议框
  showSearchSuggestions.value = false;
};

// 切换彩票类型下拉框
const togglePeriodDropdown = () => {
  showPeriodDropdown.value = !showPeriodDropdown.value;
};

// 关闭彩票类型下拉框
const closePeriodDropdown = () => {
  showPeriodDropdown.value = false;
};

// 选择彩票类型
const selectLotteryType = (lotteryType) => {
  if (currentLotteryType.value.code === lotteryType.code) {
    showPeriodDropdown.value = false;
    return;
  }

  currentLotteryType.value = lotteryType;
  showPeriodDropdown.value = false;

  try {
    uni.setStorageSync("currentLotteryType", lotteryType);
  } catch (error) {
    // 静默处理错误
  }

  loadLotteryDataByType(lotteryType);
};

// 根据彩票类型对象加载数据（直接传入完整对象）
const loadLotteryDataByType = async (lotteryType) => {
  if (isLoadingLottery.value) {
    return;
  }

  if (!lotteryType || !lotteryType.name) {
    return;
  }
  try {
    isLoadingLottery.value = true;
    uni.showLoading({ title: "加载中..." });
    const response = await apiGetIssueNo({ tname: lotteryType.name });
    uni.hideLoading();

    if (response.code === 200 && response.data !== null && response.data !== undefined) {
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

      // 更新当前彩票类型的状态
      lotteryType.status = issueStatus;
      lotteryType.time = issueTime;

      // 更新当前选中的彩票类型状态
      if (currentLotteryType.value.code === lotteryType.code) {
        currentLotteryType.value.status = issueStatus;
        currentLotteryType.value.time = issueTime;
      }

      // 更新到lotteryTypes数组中对应的项
      const index = lotteryTypes.value.findIndex((type) => type.code === lotteryType.code);
      if (index !== -1) {
        lotteryTypes.value[index].status = issueStatus;
        lotteryTypes.value[index].time = issueTime;
      }

      // 检查期号是否真的发生了变化
      const oldIssueNumber = currentIssueInfo.value?.number;
      const newIssueNumber = issueNumber;

      currentIssueInfo.value = {
        id: issueNumber,
        number: issueNumber,
        status: issueStatus,
        time: issueTime,
      };

      safeSet("currentIssueInfo", currentIssueInfo.value);

      loadPredictPosts();
    } else {
      uni.showToast({ title: response.msg || "数据加载失败", icon: "none" });
    }
  } catch (error) {
    uni.hideLoading();
    const errorMsg = error?.msg || error?.message || "网络错误，请重试";
    uni.showToast({
      title: errorMsg,
      icon: "none",
      duration: 3000,
    });
  } finally {
    isLoadingLottery.value = false;
  }
};

// 根据彩票类型加载数据（兼容旧接口，通过code查找）
const loadLotteryData = async (lotteryCode) => {
  const lotteryType = lotteryTypes.value.find((type) => type.code === lotteryCode);
  if (!lotteryType) {
    return;
  }
  await loadLotteryDataByType(lotteryType);
};

// 显示发布弹出层
const showPublishModal = () => {
  if (getToken()) {
    publishPopup.value.open();
  } else {
    uni.showModal({
      title: "提示",
      content: "该操作需要登录，是否前往",
      success: async (res) => {
        if (res.confirm) {
          uni.navigateTo({
            url: "/pages/login/login" + "?redirect=/pages/video/video",
          });
        }
      },
      showCancel: true,
    });
  }
};

// 隐藏发布弹出层
const hidePublishModal = () => {
  publishPopup.value.close();
};

// 切换协议同意状态
const toggleAgreementManually = () => {
  agreedToTerms.value = !agreedToTerms.value;
};

// 选择功能类型
const selectFunction = async (type) => {
  // 所有功能都需要先同意协议
  if (!agreedToTerms.value) {
    // uni.showToast({
    //   title: "请先同意管理规范",
    //   icon: "none",
    // });
    const res = await uni.showModal({
      title: "提示",
      content: "是否同意并遵守《彩友圈管理规范》",
      showCancel: true,
      confirmText: "同意",
      cancelText: "取消",
    });
    if (!res.confirm) {
      return;
    }
    toggleAgreementManually();
  }
  uni.setStorageSync("postAgreement", true);
  selectedFunction.value = type;

  const urlParams = tool.formatUrlParams({
    lotteryType: currentLotteryType.value.name,
  });

  // 根据选择的类型跳转到不同的发布页面
  switch (type) {
    case "predict":
      // 跳转到设置方案页面
      uni.navigateTo({
        url: `/pages/forum/post/created-scheme?${urlParams}`,
        success: () => {
          hidePublishModal();
        },
        fail: () => {
          uni.showToast({
            title: "跳转失败",
            icon: "none",
          });
        },
      });
      break;
    case "pattern":
      // 跳转到规律预测页面
      uni.navigateTo({
        url: `/pages/forum/post/upload-diagram?${urlParams}`,
        success: () => {
          hidePublishModal();
        },
        fail: () => {
          uni.showToast({
            title: "跳转失败",
            icon: "none",
          });
        },
      });
      break;
    case "filter":
      uni.showToast({
        title: "跳转到过滤王帖发布",
        icon: "none",
      });
      break;
    case "soup":
      uni.showToast({
        title: "跳转到老母鸡汤发布",
        icon: "none",
      });
      break;
  }

  // 关闭弹出层
  hidePublishModal();
};

// 显示筛选弹窗
const showFilterModal = () => {
  showFilterDialog.value = true;
};

// 隐藏筛选弹窗
const hideFilterModal = () => {
  showFilterDialog.value = false;
};

// 切换筛选选项
// 切换心水预测筛选
const togglePredictionFilter = (filter) => {
  if (selectedPredictionFilter.value === filter) {
    selectedPredictionFilter.value = ""; // 取消选择
  } else {
    selectedPredictionFilter.value = filter; // 选择新的
  }
};

// 切换其他筛选
const toggleOtherFilter = (filter) => {
  if (selectedOtherFilter.value === filter) {
    selectedOtherFilter.value = ""; // 取消选择
  } else {
    selectedOtherFilter.value = filter; // 选择新的
  }
};

// 处理搜索输入
const _handleSearchInput = () => {
  if (searchKeyword.value.trim()) {
    // 生成搜索建议
    generateSearchSuggestions();
    // 执行模糊搜索
    performFuzzySearch();
  } else {
    // 清空搜索
    clearSearchResults();
  }
};
const handleSearchInput = debounce(_handleSearchInput, 300);

// 生成搜索建议
const generateSearchSuggestions = () => {
  const keyword = normalizeText(searchKeyword.value.trim());
  const suggestions = [];

  // 从两类筛选选项中生成建议
  const candidates = [...predictionFilters.value, ...otherFilters.value];
  candidates.forEach((filter) => {
    if (normalizeText(filter).includes(keyword)) {
      suggestions.push(filter);
    }
  });

  // 限制建议数量
  searchSuggestions.value = suggestions.slice(0, 5);
};

// 选择搜索建议
const selectSuggestion = (suggestion) => {
  searchKeyword.value = suggestion;
  showSearchSuggestions.value = false;
  performFuzzySearch();
};

// 清空搜索
const clearSearch = () => {
  searchKeyword.value = "";
  showSearchSuggestions.value = false;
  activeTag.value = -1; // 重置标签选中状态
  clearSearchResults();
};

// 执行模糊搜索
const performFuzzySearch = () => {
  const keyword = normalizeText(searchKeyword.value.trim());

  if (!keyword) {
    clearSearchResults();
    return;
  }

  isSearching.value = true;

  // 对预测帖子进行模糊搜索
  filteredPredictList.value = predictList.value.filter((post) => {
    // 搜索用户名
    if (post.username && normalizeText(post.username).includes(keyword)) {
      return true;
    }

    // 搜索帖子内容
    if (post.content && normalizeText(post.content).includes(keyword)) {
      return true;
    }

    // 搜索期号
    if (post.period && post.period.toString().includes(keyword)) {
      return true;
    }

    // 特殊标签搜索逻辑
    if (keyword === "全部") {
      return true; // 显示所有帖子
    }

    if (keyword === "大师" || keyword === "大师帖子") {
      // 搜索包含"大师"关键词的帖子
      return post.content && post.content.includes("大师");
    }

    if (keyword === "靓规贴" || keyword === "靓规贴子") {
      // 搜索包含"靓规"关键词的帖子
      return post.content && post.content.includes("靓规");
    }

    if (keyword === "过滤王") {
      // 搜索包含"过滤王"关键词的帖子
      return post.content && post.content.includes("过滤王");
    }

    if (keyword === "点赞最多") {
      // 按点赞数排序（这里简化处理，实际可以按likes字段排序）
      return post.likes > 0;
    }

    return false;
  });

  // 如果是"点赞最多"标签，按点赞数排序
  if (keyword === "点赞最多") {
    filteredPredictList.value.sort((a, b) => b.likes - a.likes);
  }

  uni.showToast({
    title: `找到${filteredPredictList.value.length}条结果`,
    icon: "success",
  });
};

// 清空搜索结果
const clearSearchResults = () => {
  filteredPredictList.value = [];
  isSearching.value = false;
};

// 执行筛选搜索
const performSearch = () => {
  const filters = [];
  if (selectedPredictionFilter.value) {
    filters.push(selectedPredictionFilter.value);
  }
  if (selectedOtherFilter.value) {
    filters.push(selectedOtherFilter.value);
  }

  // 检查是否选择了筛选条件
  if (filters.length === 0) {
    uni.showToast({
      title: "请选择筛选条件",
      icon: "none",
    });
    return;
  }

  // 设置搜索关键词
  searchKeyword.value = filters.join("+");

  // 执行筛选搜索
  performFilterSearch(filters);

  // 关闭筛选弹窗
  hideFilterModal();

  // 重置标签选中状态
  activeTag.value = -1;

  uni.showToast({
    title: `搜索${filters.join("+")}`,
    icon: "success",
  });
};

// 执行筛选搜索的具体逻辑
const performFilterSearch = (filters) => {
  isSearching.value = true;

  // 对预测帖子进行筛选搜索
  filteredPredictList.value = predictList.value.filter((post) => {
    let matches = false;

    // 检查心水预测筛选条件
    if (selectedPredictionFilter.value) {
      const predictionFilter = selectedPredictionFilter.value.toLowerCase();

      // 在帖子内容中搜索匹配的筛选条件
      if (post.content && post.content.toLowerCase().includes(predictionFilter)) {
        matches = true;
      }

      // 特殊处理一些筛选条件
      if (
        predictionFilter === "头尾" &&
        post.content &&
        (post.content.includes("头") || post.content.includes("尾"))
      ) {
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

    // 检查其他筛选条件
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

  // 如果是"点赞最多"或"讨论最热"，按相应字段排序
  if (selectedOtherFilter.value === "点赞最多") {
    filteredPredictList.value.sort((a, b) => b.likes - a.likes);
  } else if (selectedOtherFilter.value === "讨论最热") {
    filteredPredictList.value.sort((a, b) => b.comments - a.comments);
  }
};

// 获取搜索按钮文本
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

const refreshing = ref(false);
// 加载预测帖子数据
const loadPredictPosts = async () => {
  // 先检查是否正在加载，避免重复请求
  if (isLoadingPosts.value) {
    return;
  }

  // 构建查询参数
  const tname = currentLotteryType.value?.name;
  const issueno = currentIssueInfo.value?.number || currentIssueInfo.value?.id || "--";

  // 如果参数不完整，不执行请求
  if (!tname || !issueno) {
    return;
  }

  // 生成请求唯一标识
  const queryKey = `${tname}_${issueno}`;

  // 如果正在请求相同的参数，跳过（防止重复请求）
  if (currentQueryKey.value === queryKey) {
    return;
  }
  // debugger;
  try {
    isLoadingPosts.value = true;
    // refreshing.value = true;
    currentQueryKey.value = queryKey;

    // 构建查询参数 - 同时查询预测帖和规律帖
    const queryData = {
      tname: tname, // 查询预测帖
      issueno: issueno,
      page: parseInt(pageData.value.page),
      limit: parseInt(pageData.value.limit),
    };
    const account = getAccount();
    if (account) {
      queryData.account = account;
    }

    // 查询预测帖
    const response = await apiPostListQuery(queryData);

    let allPosts = [];

    pageData.value.total = response.data.list.total;

    if (response.code === 200) {
      if (response.data) {
        allPosts = [...response.data.list];
      }
    }

    // 处理所有帖子数据
    if (allPosts.length > 0) {
      const addlist = allPosts
        .map((post) => {
          const postId = post.id;

          // 检查postId是否有效
          if (!postId) {
            return null; // 跳过无效的帖子
          }

          // 检查当前用户是否点赞过这个帖子
          const currentAccount = getAccount();
          const userLikedKey = `${postId}_${currentAccount}`;
          // const isLiked = getLikedStatus(userLikedKey);

          // 使用服务器返回的点赞数
          const serverLikeCount = post.like_count || 0;

          // 处理用户头像
          let userAvatar = "http://video.caimizm.com/himg/user.png";

          // 使用getUserAvatar函数获取头像（不再使用pimg作为头像）
          userAvatar = post.himg ? tool.oss.getFullUrl("/himg/" + post.himg) : userAvatar;

          return {
            id: postId,
            tname: post.tname,
            account: post.account,
            username: post.uname || "匿名用户",
            avatar: userAvatar, // 使用处理后的头像
            time: formatTime(post.createTime),
            status: "预测中",
            period: post.issueno || currentIssueInfo.value.number,
            content: post.content || "",
            image: post.pimg || "", // 帖子图片（规律帖的图片）
            likes: serverLikeCount, // 使用服务器返回的点赞数
            comments: post.comment || 0,
            shares: 0,
            isLiked: post.dianzan, // 检查当前用户是否点赞过
            isLiking: false, // 点赞中状态
          };
        })
        .filter((post) => post !== null);

      if (queryData.page == 1) {
        predictList.value = addlist;
      } else {
        predictList.value = [...predictList.value, ...addlist];
      }
    } else {
      predictList.value = [];
    }
  } catch (error) {
    predictList.value = [];
  } finally {
  }
  isLoadingPosts.value = false;
  currentQueryKey.value = null;
  refreshing.value = false;
};

// 加载分页
const isLoadNextPage = ref(false);
const pageData = ref({
  page: "1",
  limit: "20",
  total: 0,
  maxPage: 1,
});
const isMaxPage = computed(() => {
  return parseInt(pageData.value.page) >= parseInt(pageData.value.maxPage);
});
async function nextPage(res) {
  if (isLoadNextPage.value) return;
  if (isMaxPage.value) return;
  if (pageData.value.total < pageData.value.page * pageData.value.limit) return;
  debugger;
  pageData.value.page = parseInt(pageData.value.page) + 1;

  isLoadNextPage.value = true;
  try {
    await loadPredictPosts();
  } catch (error) {}
  isLoadNextPage.value = false;
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return "刚刚";

  try {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now - time;

    if (diff < 60000) return "刚刚";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return `${Math.floor(diff / 86400000)}天前`;
  } catch (error) {
    return "刚刚";
  }
};

// 清空筛选选择
const clearFilterSelection = () => {
  selectedPredictionFilter.value = "";
  selectedOtherFilter.value = "";

  uni.showToast({
    title: "已清空筛选条件",
    icon: "success",
  });
};

// 更新列表中的帖子数据
const updatePostInList = (updatedPost) => {
  // 更新原始列表
  const originalIndex = predictList.value.findIndex((p) => p.id === updatedPost.id);
  if (originalIndex !== -1) {
    predictList.value[originalIndex] = { ...updatedPost };
  }

  // 更新筛选列表
  const filteredIndex = filteredPredictList.value.findIndex((p) => p.id === updatedPost.id);
  if (filteredIndex !== -1) {
    filteredPredictList.value[filteredIndex] = { ...updatedPost };
  }
};

// 优化触摸事件性能
const optimizeTouchEvents = () => {
  try {
    // 在H5环境下优化触摸事件
    if (typeof window !== "undefined" && window.addEventListener) {
      // 为所有元素添加被动事件监听器
      const addPassiveListener = (element, event, handler) => {
        element.addEventListener(event, handler, { passive: true });
      };

      // 为滚动容器添加被动滚动监听器
      const scrollContainers = document.querySelectorAll(
        ".predict-list, .modal-content, .dropdown-list, .filter-dialog"
      );
      scrollContainers.forEach((container) => {
        addPassiveListener(container, "touchstart", () => {});
        addPassiveListener(container, "touchmove", () => {});
        addPassiveListener(container, "touchend", () => {});
      });
    }
  } catch (error) {
    // 静默处理错误
  }
};

// 从帖子内容中提取所有方案ID
const extractSchemeFromContent = (content) => {
  try {
    if (!content) return [];

    // 常见的方案类型列表
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
      "过滤王四定",
    ];

    const foundSchemes = [];

    // 在内容中查找所有方案类型
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
</script>

<style scoped lang="scss">
/* 输入框特殊处理 */
input,
textarea {
  touch-action: manipulation;
}

.forum-container {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

/* 主导航栏 */
.main-navbar {
  height: 88rpx;
  flex-basis: 88rpx;
  background-color: #28b389;
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  padding-top: var(--status-bar-height);
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.period-selector {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
}

.period-text {
  font-size: 24rpx;
  color: #fff;
  margin-right: 8rpx;
}

.period-selector {
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-selector:active {
  opacity: 0.8;
}

.rotate {
  transform: rotate(180deg);
}

/* 下拉菜单遮罩 */
.dropdown-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* 期号下拉菜单 */
.period-dropdown {
  position: fixed;
  top: 88rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 600rpx;
  max-height: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
  /* 优化触摸性能 */
  touch-action: manipulation;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.dropdown-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.dropdown-list {
  max-height: 500rpx;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
  /* 优化触摸性能 */
  touch-action: pan-y;
}

.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f8f8f8;
  transition: background-color 0.2s ease;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:active {
  background-color: #f8f8f8;
}

.dropdown-item.active {
  background-color: #fff2f0;
}

.period-item-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.dropdown-item.active .period-item-text {
  color: #ff4757;
}

.period-item-time {
  font-size: 24rpx;
  color: #999;
}

.post-icon {
  width: 32rpx;
  height: 32rpx;
  background-color: #ff4757;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8rpx;
}

.nav-text {
  font-size: 22rpx;
  color: #fff;
}

/* 切换标签栏 */
.switch-tabs {
  left: 0;
  right: 0;
  height: 88rpx;
  flex-basis: 88rpx;
  background-color: #fff;
  z-index: 998;
  display: flex;
  /* 优化触摸性能 */
  touch-action: manipulation;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 4rpx solid transparent;
  /* 优化触摸性能 */
  touch-action: manipulation;
  transition: all 0.2s ease;
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #000000;
  font-weight: 500;
}

.tab-item.active .tab-text {
  color: #ff4757;
}

/* 搜索栏 */
.search-header {
  left: 0;
  right: 0;
  height: 80rpx;
  flex-basis: 80rpx;
  background-color: #fff;
  z-index: 997;
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  /* 优化触摸性能 */
  touch-action: manipulation;
}

.search-label {
  font-size: 24rpx;
  color: #333;
  margin-right: 20rpx;
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  padding: 12rpx 20rpx;
}

.search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 24rpx;
  background: transparent;
  border: none;
}

.clear-search,
.filter-btn {
  width: 32rpx;
  height: 32rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 12rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.1);
}

.clear-search:active,
.filter-btn:active {
  background-color: rgba(0, 0, 0, 0.2);
}

/* 搜索建议遮罩 */
.search-suggestions-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 999;
}

/* 搜索建议下拉框 */
.search-suggestions {
  position: fixed;
  top: 256rpx;
  left: 30rpx;
  right: 30rpx;
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 400rpx;
  overflow-y: auto;
}

.suggestion-item {
  display: flex;
  align-items: center;
  padding: 20rpx 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:active {
  background-color: #f8f8f8;
}

.suggestion-text {
  margin-left: 12rpx;
  font-size: 26rpx;
  color: #333;
}

/* 搜索状态提示 */
.search-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx 30rpx;
  background-color: #f8f9fa;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
}

.search-status-text {
  font-size: 26rpx;
  color: #666;
}

.search-count {
  font-size: 24rpx;
  color: #28b389;
  font-weight: 500;
}

/* 分类标签栏 */
.category-tags {
  height: 80rpx;
  flex-basis: 80rpx;
  background-color: #fff;
  z-index: 996;
  padding: 20rpx 0;
  /* 优化触摸性能 */
  touch-action: manipulation;
}

.category-scroll {
  white-space: nowrap;
}

.tag-list {
  display: flex;
  padding: 0 30rpx;
}

.tag-item {
  padding: 12rpx 24rpx;
  margin-right: 20rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 22rpx;
  color: #666;
  white-space: nowrap;
  transition: all 0.3s ease;
  cursor: pointer;
  /* 优化触摸性能 */
  touch-action: manipulation;
}

.tag-item.active {
  background-color: #ff4757;
  color: #fff;
}

.tag-item:active {
  transform: scale(0.95);
  background-color: #e0e0e0;
}

.tag-item.active:active {
  background-color: #e63946;
}

.forum-content {
  flex: 1;
  overflow: hidden;
}

/* 标签内容区域 */
.tab-content {
  padding-bottom: 100rpx;
}

/* 头条样式 */
.headline-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.headline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.headline-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.headline-time {
  font-size: 24rpx;
  color: #999;
}

.headline-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #666;
  margin-bottom: 20rpx;
}

.headline-stats {
  display: flex;
  gap: 30rpx;
}

.headline-stats .stat-text {
  font-size: 24rpx;
  color: #999;
}

/* 关注样式 */
.follow-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.follow-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.user-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 28rpx;
  font-weight: 500;
  color: #333;
  margin-bottom: 8rpx;
}

.follow-time,
.predict-time,
.soup-time {
  font-size: 24rpx;
  color: #999;
}

.follow-btn {
  background-color: #f0f0f0;
  padding: 8rpx 16rpx;
  border-radius: 15rpx;
}

.btn-text {
  font-size: 22rpx;
  color: #666;
}

.follow-content {
  font-size: 28rpx;
  line-height: 1.6;
  color: #333;
}

/* 预测列表样式 */
.predict-list {
  padding: 20rpx;
  background-color: #f8f8f8;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
}

.no-posts-tip {
  text-align: center;
  padding: 40rpx;
  color: #999;
  font-size: 28rpx;
}

/* 鸡汤样式 */
.soup-item {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.soup-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.soup-content {
  font-size: 28rpx;
  line-height: 1.8;
  color: #333;
  margin-bottom: 20rpx;
  font-style: italic;
}

.soup-footer {
  border-top: 1rpx solid #f0f0f0;
  padding-top: 20rpx;
}

/* 发布按钮 */
.publish-btn {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  right: 30rpx;
  bottom: calc(120rpx + var(--window-bottom));
  width: 80rpx;
  height: 80rpx;
  text-align: center;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  background-color: #b3d35a;
  border-radius: 50%;
  padding: 10rpx;
  border: 6rpx solid #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(11, 15, 14, 0.6);
  z-index: 999;
}

.publish-btn:active {
  transform: scale(0.95);
}

/* 发布弹出层样式 */
.publish-modal {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 65vh;
  min-height: 400rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;
  /* 优化触摸性能 */
  touch-action: manipulation;
  will-change: transform;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f5f5f5;
}

.modal-content {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
  /* 优化触摸性能 */
  touch-action: pan-y;
}

/* 期号标题 */
.period-title {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

/* 协议确认 */
.agreement-section {
  margin-bottom: 20rpx;
  padding: 20rpx;
  background-color: #f8f8f8;
  border-radius: 15rpx;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
}

.custom-checkbox {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #ddd;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15rpx;
  transition: all 0.3s ease;
}

.custom-checkbox.checked {
  background-color: #ff4757;
  border-color: #ff4757;
}

.checkmark {
  color: #fff;
  font-size: 24rpx;
  font-weight: bold;
}

.agreement-text {
  font-size: 34rpx;
  font-weight: bold;
  color: #ff4757;
}

/* 功能按钮区域 */
.function-buttons {
  margin-bottom: 10rpx;
}

.button-row {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20rpx;
}

.button-row:last-child {
  margin-bottom: 10rpx;
}

.function-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin: 0 15rpx;
  /* 优化触摸性能 */
  touch-action: manipulation;
  transition: transform 0.2s ease;
}

.function-btn:active {
  transform: scale(0.95);
}

.btn-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15rpx;
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
}

.predict-icon {
  background-color: #28b389;
}

.pattern-icon {
  background-color: #ff6b35;
}

.filter-icon {
  background-color: #9b59b6;
}

.soup-icon {
  background-color: #3498db;
}

.btn-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}

/* 底部按钮 */
.modal-footer {
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
  text-align: center;
  flex-shrink: 0;
}

.close-btn-modal {
  background: transparent;
  border: none;
  color: #333;
  font-size: 32rpx;
  padding: 20rpx 40rpx;
}

/* 筛选弹窗样式 */
.filter-dialog-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-dialog {
  width: 90%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 40rpx;
  max-height: 80vh;
  overflow-y: auto;
  /* 优化滚动性能 */
  -webkit-overflow-scrolling: touch;
  /* 防止滚动穿透 */
  overscroll-behavior: contain;
  /* 优化触摸性能 */
  touch-action: pan-y;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.filter-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

.filter-period {
  font-size: 24rpx;
  color: #666;
}

.filter-section {
  margin-bottom: 30rpx;
}

.section-title {
  display: block;
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 10rpx;
}

.section-subtitle {
  display: block;
  font-size: 22rpx;
  color: #999;
  margin-bottom: 20rpx;
}

.filter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
}

.filter-item {
  padding: 12rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #666;
  border: 1rpx solid #e0e0e0;
  transition: all 0.3s ease;
}

.filter-item.active {
  background-color: #ff4757;
  color: #fff;
  border-color: #ff4757;
}

.filter-footer {
  margin-top: 30rpx;
  text-align: center;
}

.filter-buttons {
  display: flex;
  gap: 20rpx;
}

.clear-filter-btn {
  flex: 1;
  height: 80rpx;
  background-color: #f5f5f5;
  color: #666;
  border: 1rpx solid #ddd;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: 500;
}

.clear-filter-btn:active {
  background-color: #e0e0e0;
}

.search-btn {
  flex: 2;
  height: 80rpx;
  background-color: #ff4757;
  color: #fff;
  border: none;
  border-radius: 40rpx;
  font-size: 32rpx;
  font-weight: 600;
}

.search-btn:active {
  background-color: #e63946;
}

.followUserListTitle {
  padding: 20rpx 20rpx 0 20rpx;
  font-size: 32rpx;
  font-weight: bold;
}
</style>
