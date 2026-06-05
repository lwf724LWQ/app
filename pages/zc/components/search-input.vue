<template>
  <!-- Part 1: 搜索栏展示 -->
  <view class="search-input-wrapper">
    <view class="search-bar-box">
      <view class="search-bar">
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
      </view>
      <view class="search-selection-icon" @click="openIndexedList"></view>
      <view class="search-setting-icon" @click="openSetting">
        <uni-icons type="gear-filled" size="55rpx"></uni-icons>
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

      <view class="indexed-panel-body">
        <IndexedList
          ref="indexedListRef"
          :list="indexdeData"
          sort="asc"
        >
          <template
            v-for="(_, key) in indexdeData"
            :key="key"
            #[key]="{ sectionData }"
          >
            <view class="league-grid">
              <view
                v-for="item in sectionData.leagueList"
                :key="item.name"
                :class="['league-item', { selected: isLeagueSelected(item) }]"
                @click="toggleLeague(item)"
              >
                <text class="league-name">{{ item.name }}</text>
                <text class="league-count">（{{ item.count }}）</text>
              </view>
            </view>
          </template>
        </IndexedList>
      </view>

      <view class="indexed-panel-footer">
        <view class="footer-btn btn-select-all" @click="selectAll">全选</view>
        <view class="footer-btn btn-invert" @click="invertSelection">反选</view>
        <view class="footer-btn btn-confirm" @click="confirmSelection">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import IndexedList from "@/components/indexed-list/indexed-list.vue";
import { useMatchList } from "../matchListHooks";

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


const keyword = ref("");
const leagueList = ref([]);
const showIndexedPanel = ref(false);
const indexedListRef = ref(null);


// 所有可选的联赛（从 indexdeData 扁平化提取）
// indexdeData 结构: { "A": { leagueList: [...] }, "B": { leagueList: [...] } }
const allLeagues = computed(() => {
  const leagues = [];
  Object.values(props.indexdeData).forEach((section) => {
    const list = section?.leagueList;
    if (Array.isArray(list)) {
      list.forEach((item) => {
        leagues.push(item);
      });
    }
  });
  return leagues;
});

const emit = defineEmits(["search"]);
watch(
  [keyword, leagueList],
  () => {
    emit("search", {
      keyword: keyword.value,
      leagueList: leagueList.value,
    });
  },
  { deep: true }
);

// 判断联赛是否已选中
function isLeagueSelected(item) {
  return leagueList.value.some((l) => l.name === item.name);
}

// 切换单个联赛选中状态
function toggleLeague(item) {
  const idx = leagueList.value.findIndex((l) => l.name === item.name);
  if (idx >= 0) {
    leagueList.value.splice(idx, 1);
  } else {
    leagueList.value.push({ ...item });
  }
}

// 全选
function selectAll() {
  leagueList.value = allLeagues.value.map((item) => ({ ...item }));
}

// 反选
function invertSelection() {
  const currentNames = new Set(leagueList.value.map((l) => l.name));
  leagueList.value = allLeagues.value
    .filter((item) => !currentNames.has(item.name))
    .map((item) => ({ ...item }));
}

// 确定选择
function confirmSelection() {
  showIndexedPanel.value = false;
}

// 打开索引列表
function openIndexedList() {
  showIndexedPanel.value = true;
}

// 关闭索引列表
function closeIndexedList() {
  showIndexedPanel.value = false;
}

// 打开设置页面
function openSetting() {
  uni.navigateTo({
    url: "/pages/zc/settings",
  });
}

defineExpose({
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
    margin-left: 12rpx;
    font-size: 28rpx;
    color: #999;
  }
}
.search-selection-icon {
  width: 75rpx;
  height: 65rpx;
  background: url("/static/icons/selection-icon.png") no-repeat;
  background-size: 100%;
  background-position: center;
  margin-right: 12rpx;
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
  bottom: 0;
  left: 0;
  right: 0;
  top: 20%;
  z-index: 999;
  background-color: #fff;
  border-radius: 24rpx 24rpx 0 0;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  transform: translateY(100%);
  transition: transform 0.3s ease;

  &--visible {
    transform: translateY(0);
  }
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
  flex: 1;
  overflow: hidden;
  padding: 16rpx 0;
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