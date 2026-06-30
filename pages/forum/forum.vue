<template>
  <view class="forum-container">
    <!-- 主导航栏 -->
    <view class="main-navbar">
      <view class="nav-left">
        <uni-icons type="list" size="20" color="#fff"></uni-icons>
        <text class="nav-text"></text>
      </view>
      <view class="nav-center">
        <view class="period-selector" @click="togglePeriodDropdown">
          <text class="period-text">
            {{ currentLotteryType }} {{ isOpen }}
          </text>
          <uni-icons
            type="arrowdown"
            size="16"
            color="#fff"
            :class="{ rotate: showPeriodDropdown }"
          ></uni-icons>
        </view>
      </view>

      <view v-if="showPeriodDropdown" class="dropdown-mask" @click="closePeriodDropdown"></view>

      <view v-if="showPeriodDropdown" class="period-dropdown" @click.stop>
        <view class="dropdown-header">
          <text class="dropdown-title">选择彩票类型</text>
          <view class="close-btn" @click="closePeriodDropdown">
            <uni-icons type="close" size="16" color="#999"></uni-icons>
          </view>
        </view>
        <scroll-view scroll-y class="dropdown-list">
          <view
            class="dropdown-item"
            :class="{ active: name === currentLotteryType }"
            v-for="name in lotteryTypes"
            :key="name"
            @click="selectLotteryType(name)"
          >
            <text class="period-item-text">{{ name }}</text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 切换标签栏 -->
    <view class="switch-tabs">
      <view
        v-for="name in lotteryTypes"
        :key="name"
        class="tab-item"
        :class="{ active: name === currentLotteryType }"
        @click="selectLotteryType(name)"
      >
        <text class="tab-text">{{ name }}</text>
      </view>
    </view>

    <view class="switch-tabs">
      <view
        class="tab-item"
        :class="{ active: activeTab === 'follow' }"
        @click="switchTab('follow')"
      >
        <text class="tab-text">关注</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'predict' }"
        @click="switchTab('predict')"
      >
        <text class="tab-text">预测</text>
      </view>
      <view
        class="tab-item"
        :class="{ active: activeTab === 'collection' }"
        @click="switchTab('collection')"
      >
        <text class="tab-text">精彩合集</text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-header" v-show="activeTab === 'predict'">
      <text class="search-label">搜索帖子</text>
      <view class="search-input-wrapper">
        <uni-icons type="search" size="16" color="#999"></uni-icons>
        <input
          type="text"
          placeholder="搜索头尾、芝麻、靓规等帖"
          placeholder-style="color: var(--light-text-color);font-size: 33rpx;"
          class="search-input"
          v-model="searchKeyword"
          @input="handleSearchInput(predictList)"
          @focus="showSearchSuggestions = true"
        />
        <view v-if="searchKeyword" class="clear-search" @click="clearSearch">
          <uni-icons type="clear" size="16" color="#999"></uni-icons>
        </view>
        <view class="filter-btn" @click="showFilterModal">
          <uni-icons type="tune" size="16" color="#999"></uni-icons>
        </view>
      </view>
    </view>


    <!-- 搜索建议下拉框 -->
    <view v-if="showSearchSuggestions && searchSuggestions.length > 0" class="search-suggestions">
      <view
        class="suggestion-item"
        v-for="(suggestion, index) in searchSuggestions"
        :key="index"
        @click="selectSuggestion(suggestion, predictList)"
      >
        <uni-icons type="search" size="14" color="#999"></uni-icons>
        <text class="suggestion-text">{{ suggestion }}</text>
      </view>
    </view>

    <!-- 关注用户列表 -->
    <template v-if="activeTab === 'follow'">
      <view class="followUserListTitle">关注用户</view>
      <followUserList ref="followUserListRef" />
    </template>

    <!-- 论坛内容 -->
    <scroll-view
      class="forum-content"
      scroll-y
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
      @scrolltolower="nextPage"
    >
      <view class="tab-content">
        <view v-if="isSearching && searchKeyword" class="search-status">
          <text class="search-status-text">搜索"{{ searchKeyword }}"的结果</text>
          <text class="search-count">共{{ filteredPredictList.length }}条</text>
        </view>

        <view class="" v-else-if="activeTab === 'collection'">
          <collectionPostCard
            v-for="item in collectionPostCardList"
            :key="item.id"  
            :postData="item"
            @postCard="openDetail(item)"
          />
        </view>

        <view v-else class="predict-list">
          <postCard
            v-for="(item, index) in isSearching && searchKeyword
              ? filteredPredictList
              : predictList"
            :key="index"
            :post="item"
          />
          <view v-if="predictList.length === 0" class="no-posts-tip">
            <text>暂无预测帖子</text>
          </view>
        </view>
        
        
      </view>
    </scroll-view>

    <!-- 发布按钮 -->
    <view class="publish-btn" @click="showPublishModal">
      发帖
      <uni-icons type="cloud-upload" size="30" color="#fff"></uni-icons>
    </view>

    <!-- 发布弹出层 -->
    <uni-popup
      ref="publishPopup"
      type="bottom"
      :safe-area="false"
      :mask-click="false"
      :animation="true"
      :mask-background-color="'rgba(0,0,0,0.5)'"
      :duration="300"
    >
      <view class="publish-modal">
        <view class="modal-header">
          <text class="modal-title">发布帖子</text>
          <view class="close-btn" @click="hidePublishModal">
            <uni-icons type="close" size="20" color="#999"></uni-icons>
          </view>
        </view>

        <view class="modal-content">
          <view class="period-title">
            <text class="period-text">彩迷</text>
          </view>

          <view class="agreement-section">
            <view class="checkbox-wrapper" @click="toggleAgreementManually">
              <view class="custom-checkbox" :class="{ checked: agreedToTerms }">
                <view v-if="agreedToTerms" class="checkmark">✓</view>
              </view>
              <text class="agreement-text">同意并遵守《彩友圈管理规范》</text>
            </view>
          </view>

          <view class="function-buttons">
            <view class="button-row">
              <view class="function-btn" @click="selectFunction('predict')">
                <view class="btn-icon predict-icon">免</view>
                <text class="btn-text">预测帖(免审)</text>
              </view>
              <view class="function-btn" @click="selectFunction('pattern')">
                <view class="btn-icon pattern-icon">
                  <uni-icons type="redo" size="24" color="#fff"></uni-icons>
                </view>
                <text class="btn-text">规律帖(上传规律)</text>
              </view>
              <view class="function-btn" @click="creaetCollectionPost">
                <view class="btn-icon predict-icon">免</view>
                <text class="btn-text">集合贴</text>
              </view>
            </view>
          </view>
        </view>

        <view class="modal-footer">
          <button class="close-btn-modal" @click="hidePublishModal">关闭</button>
        </view>
      </view>
    </uni-popup>

    <!-- 搜索建议遮罩 -->
    <view
      v-if="showSearchSuggestions"
      class="search-suggestions-mask"
      @click="showSearchSuggestions = false"
    ></view>

    <!-- 筛选弹窗 -->
    <view v-if="showFilterDialog" class="filter-dialog-mask" @click="hideFilterModal">
      <view class="filter-dialog" @click.stop>
        <view class="filter-header">
          <text class="filter-title">心水预测</text>
          <text class="filter-period">
            第{{ currentLotteryType }}期
          </text>
        </view>

        <view class="filter-section">
          <view class="filter-grid">
            <view
              class="filter-item"
              :class="{ active: selectedPredictionFilter === filter }"
              v-for="filter in predictionFilters"
              :key="filter"
              @click="togglePredictionFilter(filter)"
            >
              {{ filter }}
            </view>
          </view>
        </view>

        <view class="filter-section">
          <text class="section-title">其他筛选</text>
          <text class="section-subtitle">(可结合上面选项选择一个)</text>
          <view class="filter-grid">
            <view
              class="filter-item"
              :class="{ active: selectedOtherFilter === filter }"
              v-for="filter in otherFilters"
              :key="filter"
              @click="toggleOtherFilter(filter)"
            >
              {{ filter }}
            </view>
          </view>
        </view>

        <view class="filter-footer">
          <view class="filter-buttons">
            <button class="clear-filter-btn" @click="clearFilterSelection">清空</button>
            <button class="search-btn" @click="performSearch(predictList)">
              {{ getSearchButtonText() }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { apiGetIssueNo, apiPostListQuery, post_select_by_follow, getFootBallPostList } from "@/api/apis.js";
import { getAccount } from "@/utils/request.js";
import { getToken } from "../../utils/request";
import tool from "@/utils/tool.js";
import postCard from "../../components/post-card/post-card.vue";
import followUserList from "./components/follow-user-list.vue";
import { usePostSearch } from "./composables/usePostSearch.js";
import dayjs from "dayjs";

import collectionPostCard from "../zc/components/post-card.vue";

const {
  searchKeyword,
  showSearchSuggestions,
  searchSuggestions,
  filteredPredictList,
  isSearching,
  showFilterDialog,
  selectedPredictionFilter,
  selectedOtherFilter,
  predictionFilters,
  otherFilters,
  handleSearchInput,
  selectSuggestion,
  clearSearch,
  performSearch,
  clearFilterSelection,
  showFilterModal,
  hideFilterModal,
  togglePredictionFilter,
  toggleOtherFilter,
  getSearchButtonText,
} = usePostSearch();

const activeTab = ref("predict");
const showPeriodDropdown = ref(false);
const publishPopup = ref(null);
const agreedToTerms = ref(uni.getStorageSync("postAgreement") || false);
const selectedFunction = ref("");
const lotteryTypes = ref(["排列三", "排列五", "七星彩", "福彩3D"]);
const currentLotteryType = ref(lotteryTypes.value[0]);
const predictList = ref([]);
const isPageInitialized = ref(false);
const isLoad = ref(false);
const currentIssueno = ref({
  issueno: "",
  opendate: ""
})
const isOpen = computed(()=>{
    const now = dayjs();
  const openDate = dayjs(currentIssueno.value.opendate);

  // 判断日期先后（只比较日期，忽略具体时间）
  if (now.isBefore(openDate, 'day')) {
    return '未开奖';
  }
  if (now.isAfter(openDate, 'day')) {
    return '已开奖';
  }

  // 开奖日当天，根据当前时分判断
  const currentMinutes = now.hour() * 60 + now.minute();
  const startMinutes = 21 * 60 + 15; // 21:15
  const endMinutes = 21 * 60 + 35;   // 21:35

  if (currentMinutes < startMinutes) {
    return '未开奖';
  }
  if (currentMinutes <= endMinutes) {
    return '开奖中';
  }
  return '已开奖';
})
const collectionPostCardList = ref([])

onMounted(() => {
  if (isPageInitialized.value) return;

  const savedLotteryType = uni.getStorageSync("currentLotteryType");
  if (savedLotteryType) {
    if (lotteryTypes.value.find(savedLotteryType)) {
      currentLotteryType.value = savedLotteryType; 
    }
  }

  loadLotteryData(currentLotteryType.value);
  isPageInitialized.value = true;
  isLoad.value = true;
});

const followUserListRef = ref(null);
onShow(() => {
  if (!isLoad.value) return;
  followUserListRef.value?.reload();
  onRefresh();
});

function onRefresh() {
  if (refreshing.value) return;
  refreshing.value = true;
  pageData.value = { page: "1", limit: "20", total: 0, maxPage: 1 };
  loadLotteryData(currentLotteryType.value);
}

const switchTab = (tab) => {
  activeTab.value = tab;
  onRefresh();
};

const togglePeriodDropdown = () => {
  showPeriodDropdown.value = !showPeriodDropdown.value;
};

const closePeriodDropdown = () => {
  showPeriodDropdown.value = false;
};

const selectLotteryType = (name) => {
  closePeriodDropdown()
  if (currentLotteryType.value === name) {
    return;
  }
  currentLotteryType.value = name;

  try {
    uni.setStorageSync("currentLotteryType", name);
  } catch (error) {}

  pageData.value.page = 1;
  loadLotteryData(name);
};

const loadLotteryData = async (tname) => {
  if (isLoadingLottery.value) return;
  if (!tname) return;

  try {
    isLoadingLottery.value = true;
    const response = await apiGetIssueNo({ tname });

    if (response.code === 200 && response.data !== null && response.data !== undefined) {
      currentIssueno.value = response.data
      if (!currentIssueno.value.issueno) {
        throw new Error();
      }
      loadPredictPosts();
    } else {
      uni.showToast({ title: response.msg || "数据加载失败", icon: "none" });
    }
  } catch (error) {
    uni.hideLoading();
    uni.showToast({
      title: error?.msg || error?.message || "网络错误，请重试",
      icon: "none",
      duration: 3000,
    });
  } finally {
    isLoadingLottery.value = false;
  }
};

const showPublishModal = () => {
  if (tool.isLogin(false, "/pages/forum/forum")) {
    publishPopup.value.open();
  }
};

const hidePublishModal = () => {
  publishPopup.value.close();
};

const toggleAgreementManually = () => {
  agreedToTerms.value = !agreedToTerms.value;
};

const selectFunction = async (type) => {
  if (!agreedToTerms.value) {
    const res = await uni.showModal({
      title: "提示",
      content: "是否同意并遵守《彩友圈管理规范》",
      showCancel: true,
      confirmText: "同意",
      cancelText: "取消",
    });
    if (!res.confirm) return;
    toggleAgreementManually();
  }
  uni.setStorageSync("postAgreement", true);
  selectedFunction.value = type;

  const urlParams = tool.formatUrlParams({
    lotteryType: currentLotteryType.value,
  });

  switch (type) {
    case "predict":
      uni.navigateTo({
        url: `/pages/forum/post/created-scheme?${urlParams}`,
        success: () => hidePublishModal(),
        fail: () => uni.showToast({ title: "跳转失败", icon: "none" }),
      });
      break;
    case "pattern":
      uni.navigateTo({
        url: `/pages/forum/post/upload-diagram?${urlParams}`,
        success: () => hidePublishModal(),
        fail: () => uni.showToast({ title: "跳转失败", icon: "none" }),
      });
      break;
    case "filter":
      uni.showToast({ title: "跳转到过滤王帖发布", icon: "none" });
      break;
    case "soup":
      uni.showToast({ title: "跳转到老母鸡汤发布", icon: "none" });
      break;
  }

  hidePublishModal();
};

const refreshing = ref(false);

const loadPredictPosts = async () => {
  if (isLoadingPosts.value) return;
  
  const issueno = currentIssueno.value.issueno
  const tname = currentLotteryType.value;

  const queryKey = `${tname}_${issueno}`;
  if (currentQueryKey.value === queryKey) return;

  try {
    isLoadingPosts.value = true;
    currentQueryKey.value = queryKey;

    const queryData = {
      tname,
      issueno,
      page: parseInt(pageData.value.page),
      limit: parseInt(pageData.value.limit),
    };
    const account = getAccount();
    if (account) queryData.account = account;

    let response;
    if (activeTab.value === "predict") {
      response = await apiPostListQuery(queryData);
    } else if (activeTab.value === "follow") {
      delete queryData.account;
      response = await post_select_by_follow(queryData);
    } else {
      const res = await getFootBallPostList({
          page: 1,
          limit: 40,
          ftype: 3,
        })
      collectionPostCardList.value = res.data.list
    }

    let allPosts = [];
    pageData.value.total = response.data.list.total;

    if (queryData.page == 1) {
      predictList.value = [...response.data.list];
    } else {
      predictList.value = [...predictList.value, ...response.data.list];
    }
  } catch (error) {
    predictList.value = [];
  }

  setTimeout(() => {
    isLoadingPosts.value = false;
    currentQueryKey.value = null;
    refreshing.value = false;
  }, 500);
};

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
  if (isLoadNextPage.value || isMaxPage.value) return;
  if (pageData.value.total < pageData.value.page * pageData.value.limit) return;

  pageData.value.page = parseInt(pageData.value.page) + 1;
  isLoadNextPage.value = true;
  try {
    await loadPredictPosts();
  } catch (error) {}
  isLoadNextPage.value = false;
}

const isLoadingPosts = ref(false);
const isLoadingLottery = ref(false);
const currentQueryKey = ref(null);


// 打开集合贴
async function openCollectionDetail(data) {
  if (tool.isLogin()) {
    uni.navigateTo({
      url: `/pages/zc/post-detail?id=${data.id}`,
    });
  }
}
// 创建集合贴
function creaetCollectionPost(){
  uni.navigateTo({
    url: "/pages/forum/creaet-collection-post"
  })
}

</script>

<style scoped lang="scss">
.forum-container {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  height: 100vh;
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

.nav-left {
  display: flex;
  align-items: center;
}

.nav-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-text {
  font-size: 22rpx;
  color: #fff;
}

.period-selector {
  display: flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 8rpx 16rpx;
  border-radius: 20rpx;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-selector:active {
  opacity: 0.8;
}

.period-text {
  font-size: 38rpx;
  color: #000;
  font-weight: bold;
  margin-right: 8rpx;
}

.rotate {
  transform: rotate(180deg);
}

/* 下拉菜单 */
.dropdown-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

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

/* 切换标签栏 */
.switch-tabs {
  left: 0;
  right: 0;
  height: 88rpx;
  flex-basis: 88rpx;
  background-color: #fff;
  z-index: 998;
  display: flex;
}

.tab-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom: 4rpx solid transparent;
  transition: all 0.2s ease;
}

.tab-item.active {
  border-bottom-color: #ff4757;
}

.tab-text {
  font-size: 40rpx;
  font-weight: bold;
  color: #000;
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
}

.search-label {
  font-size: 35rpx;
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

/* 搜索建议 */
.search-suggestions-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  z-index: 999;
}

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

/* 搜索状态 */
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

/* 论坛内容 */
.forum-content {
  flex: 1;
  overflow: hidden;
}

.tab-content {
  padding-bottom: 100rpx;
}

/* 预测列表 */
.predict-list {
  padding: 20rpx;
  background-color: #f8f8f8;
}

.no-posts-tip {
  text-align: center;
  padding: 40rpx;
  color: var(--light-text-color);
  font-size: 35rpx;
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
  width: 190rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  color: #fff;
  font-size: 40rpx;
  font-weight: bold;
  background-color: #b3d35a;
  border-radius: 10px;
  padding: 10rpx;
  border: 6rpx solid #ffffff;
  box-shadow: 0 4rpx 20rpx rgba(11, 15, 14, 0.6);
  transition: transform 0.2s ease;
  z-index: 10;
}

.publish-btn:active {
  transform: scale(0.95);
}

/* 发布弹出层 */
.publish-modal {
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  max-height: 65vh;
  min-height: 400rpx;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.modal-content {
  padding: 30rpx;
  flex: 1;
  overflow-y: auto;
}

.period-title {
  text-align: center;
  margin-bottom: 30rpx;
}

.period-title .period-text {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
}

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

.btn-text {
  font-size: 35rpx;
  color: #333;
  text-align: center;
  line-height: 1.4;
}

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

/* 筛选弹窗 */
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