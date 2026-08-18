<template>
  <!-- Part 1: 搜索栏展示 -->
  <view class="search-input-wrapper">
    <view class="search-bar-box">
      <!-- <view class="search-bar">
        <uni-icons type="search" size="36rpx" color="#999"></uni-icons>

        <input
          class="search-placeholder"
          v-model="keyword"
          type="search"
          :placeholder="placeholder"
          placeholder-style="color: #999;"
          cursor-spacing="10"
          confirm-type="搜索"
        />
      </view> -->
      <view class="search-setting-icon" @click="openSetting">
        <uni-icons type="gear-filled" size="50rpx"></uni-icons>
      </view>

      <view class="mode-toggle-wrapper">
        <view class="mode-toggle-group">
          <view :class="['mode-toggle-item', { active: !isProMode }]" @click="setMode(false)">干净版</view>
          <view :class="['mode-toggle-item', { active: isProMode }]" @click="setMode(true)">专业版</view> 
        </view>
      </view>
      <view class="search-selection-icon" @click="openIndexedList">
      </view>
    </view>

    <!-- 索引列表面板遮罩 -->
    <view
      v-if="showIndexedPanel"
      class="search-panel-mask"
      @click="closeIndexedList"
    ></view>

    <!-- 索引列表面板 -->
    <view :class="['indexed-panel', { 'indexed-panel--visible': showIndexedPanel }]">
      <view class="indexed-panel-header">
        <text class="indexed-panel-title">选择联赛</text>
        <view class="indexed-panel-close" @click="closeIndexedList">
          <uni-icons type="closeempty" size="40rpx" color="#999"></uni-icons>
        </view>
      </view>

      <view class="indexed-panel-search">
        <uni-icons type="search" size="32rpx" color="#999"></uni-icons>
        <input
          class="indexed-panel-search-input"
          v-model="leagueSearchKeyword"
          type="text"
          confirm-type="search"
          :placeholder="placeholder"
          placeholder-style="color: #999;"
        />
        <view
          v-if="leagueSearchKeyword"
          class="indexed-panel-search-clear"
          @click="leagueSearchKeyword = ''"
        >
          <uni-icons type="clear" size="32rpx" color="#c0c0c0"></uni-icons>
        </view>
      </view>

      <view class="indexed-panel-body">
        <view v-if="!hasFilteredLeagues" class="indexed-empty">暂无匹配联赛</view>
        <view v-else class="indexedList">
          <IndexedList
            ref="indexedListRef"
            :list="filteredIndexdeData"
            sort="asc"
          >
            <template
              v-for="(_, key) in filteredIndexdeData"
              :key="key"
              #[key]="{ sectionData }"
            >
              <view class="league-grid">
                <view
                  v-for="item in sectionData.leagueList"
                  :key="item.name"
                  :class="['league-item']"
                  @click="toggleLeague(item)"
                >
                  <text class="league-name">{{ item.name }}</text>
                </view>
              </view>
            </template>
          </IndexedList>
        </view>
      </view>

      <!-- <view class="indexed-panel-footer">
        <view class="footer-btn btn-select-all" @click="selectAll">全选</view>
        <view class="footer-btn btn-invert" @click="invertSelection">反选</view>
        <view class="footer-btn btn-confirm" @click="confirmSelection">确定</view>
      </view> -->
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import IndexedList from "@/components/indexed-list/indexed-list.vue";
import { useMatchList, getPinyinInfo } from "../matchListHooks";

const props = defineProps({
  placeholder: {
    type: String,
    default: "请输入搜索内容",
  },
  indexdeData: {
    type: Object,
    default: () => ({}),
  },
});
const isProMode = ref(uni.getStorageSync("searchProMode") || false);


uni.$on("openOnlyShijiebei", ()=>{
  keyword.value = ""
  leagueList.value =[{name: "世界杯"}],
  onlyShijiebei.value = true
  temponlyShijiebei.value = true
})


function setMode(pro) {
  isProMode.value = pro;
  uni.setStorageSync("searchProMode", pro);
}

const keyword = ref("");
const leagueSearchKeyword = ref("");
const leagueList = ref([]);
const temponlyShijiebei = ref(false);
const showIndexedPanel = ref(false);
const indexedListRef = ref(null);
const onlyShijiebei = ref(false)

const filteredIndexdeData = computed(() => {
  const rawKeyword = leagueSearchKeyword.value.trim();
  const source = props.indexdeData || {};
  if (!rawKeyword) return source;

  const keywordText = rawKeyword.toUpperCase();
  const keywordPinyinInfo = getPinyinInfo(rawKeyword);
  const keywordPinyin = String(keywordPinyinInfo.pinyin || "").toUpperCase();
  const keywordInitials = String(keywordPinyinInfo.pinyinInitials || "").toUpperCase();

  const result = {};
  Object.keys(source).forEach((key) => {
    const list = source[key]?.leagueList;
    if (!Array.isArray(list)) return;
    const matched = list.filter((item) => {
      const name = String(item?.name || "").toUpperCase();
      const pinyin = String(item?.pinyin || "").toUpperCase();
      const initials = String(item?.pinyinInitials || "").toUpperCase();
      return (
        name.includes(keywordText) ||
        pinyin.includes(keywordText) ||
        initials.includes(keywordText) ||
        (keywordPinyin && (pinyin.includes(keywordPinyin) || initials.includes(keywordPinyin))) ||
        (keywordInitials && initials.includes(keywordInitials))
      );
    });
    if (matched.length) {
      result[key] = { ...source[key], leagueList: matched };
    }
  });
  return result;
});

const hasFilteredLeagues = computed(() => Object.keys(filteredIndexdeData.value).length > 0);

const emit = defineEmits(["search"]);
watch(
  [keyword, leagueList, onlyShijiebei, isProMode],
  () => {
    emit("search", {
      keyword: keyword.value,
      leagueList: leagueList.value,
      onlyShijiebei: onlyShijiebei.value,
      isProMode: isProMode.value
    });
  },
  { deep: true }
);

// 切换单个联赛选中状态（操作临时变量 tempLeagueList）
function toggleLeague(item) {
  leagueList.value = item.name
  closeIndexedList()
}


// 打开索引列表：用当前 leagueList 初始化临时变量
function openIndexedList() {
  leagueSearchKeyword.value = "";
  showIndexedPanel.value = true;
}

function closeIndexedList() {
  showIndexedPanel.value = false;
  leagueSearchKeyword.value = "";
}

// 打开设置页面
function openSetting() {
  uni.navigateTo({
    url: "/pages/zc/settings",
  });
}
// 去世界杯
function toShijiebei(){
  onlyShijiebei.value = !onlyShijiebei.value;
  leagueList.value = onlyShijiebei.value ? [{name: "世界杯"}] : [];
  temponlyShijiebei.value = onlyShijiebei.value
  closeIndexedList()
}

emit("search", {
      keyword: keyword.value,
      leagueList: leagueList.value,
      onlyShijiebei: onlyShijiebei.value,
      isProMode: isProMode.value
    });

defineExpose({
  toShijiebei,
  openIndexedList
});
</script>

<style lang="scss" scoped>
.search-input-wrapper {
  width: 100%;
}

/* Part 1: 搜索栏 */
.search-bar-box {
  display: flex;
  align-items: center;
}
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 72rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  margin-right: 12rpx;

  .search-placeholder {
	  flex:1;
    margin-left: 12rpx;
    font-size: 28rpx;
    color: #999;
  }
}
.search-selection-icon {
  position: relative;
  width: 50rpx;
  height: 50rpx;
  background: url("/static/icons/selection-icon.png") no-repeat;
  background-size: 100%;
  background-position: center;
  margin-right: 12rpx;
}

.selection-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  background-color: #ff3b30;
  border-radius: 16rpx;
  font-size: 20rpx;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}
.mode-toggle-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  

  .mode-toggle-group{
    background-color: #F5F6F7;
    padding: 8rpx;

    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 20rpx;
  }
}

.mode-toggle-item {
  padding: 10rpx 20rpx;
  font-size: 26rpx;
  font-weight: normal;
  color: #8E98A1;
  transition: all 0.2s ease;
  border-radius: 20rpx;

  &.active {
    background-color: #fff;
    color: #30B544;
    
  }
}

.search-setting-icon {
  margin-left: auto;
}

/* 遮罩 */
.search-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* 索引列表面板 */
.indexed-panel {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: var(--window-bottom);
  z-index: 999;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s ease;

  &--visible {
    transform: translateY(0);
  }
}

.indexed-panel-search {
  display: flex;
  align-items: center;
  margin: 8rpx 32rpx 16rpx;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  flex-shrink: 0;
  box-sizing: border-box;
}

.indexed-panel-search-input {
  flex: 1;
  margin-left: 12rpx;
  font-size: 28rpx;
  color: #333;
  height: 72rpx;
}

.indexed-panel-search-clear {
  padding-left: 8rpx;
}

.indexed-empty {
  padding: 80rpx 0;
  text-align: center;
  font-size: 28rpx;
  color: #999;
}

.indexed-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #eee;
  flex-shrink: 0;

  .indexed-panel-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .indexed-panel-close {
    padding: 8rpx;
  }
}

.indexed-panel-body {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  padding: 16rpx 0;
  
  .shijiebei{
    width: 180rpx;

    margin: 12rpx;
    padding: 20rpx;
    display: flex;
    flex-direction: row;
    align-items: center;
    border: 1px solid #f00;
    border-radius: 8rpx;
    background: #fffff6;
    box-shadow: 0 0 4rpx rgba(0, 0, 0, 0.5);

    .shijiebeiLOGO{
      background-image: url("/static/icons/sjiebeiLOGO.png");
      background-size: cover;

      width: 50rpx;
      height: 80rpx;

      margin-right: 20rpx;
    }

    &.selected{
      background-color: #fffec1;
    }
  }
  .indexedList{
    flex:1;
    overflow: hidden;
  }
}

.league-grid {
  display: flex;
  flex-wrap: wrap;
  padding: 0 16rpx;
}

.league-item {
  display: flex;
  align-items: center;
  padding: 14rpx 24rpx;
  margin: 8rpx 8rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  transition: all 0.2s ease;

  &.selected {
    background-color: #e8f4ff;
    color: #3c9cff;

    .league-name {
      color: #3c9cff;
    }

    .league-count {
      color: #3c9cff;
    }
  }

  .league-name {
    font-size: 26rpx;
    color: #333;
  }

  .league-count {
    font-size: 22rpx;
    color: #999;
    margin-left: 4rpx;
  }
}

.indexed-panel-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 32rpx;
  padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #eee;
  flex-shrink: 0;

  .footer-btn {
    flex: 1;
    height: 72rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 36rpx;
    font-size: 28rpx;
    font-weight: 500;
    margin: 0 8rpx;

    &:first-child {
      margin-left: 0;
    }
    &:last-child {
      margin-right: 0;
    }
  }

  .btn-select-all,
  .btn-invert {
    background-color: #f5f5f5;
    color: #666;
  }

  .btn-confirm {
    background-color: #3c9cff;
    color: #fff;
  }
}
</style>