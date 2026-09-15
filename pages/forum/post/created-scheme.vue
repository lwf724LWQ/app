<template>
  <view class="container" v-if="isLoadCompner">
    <!-- 左侧标签栏 -->
    <view class="left-tags">
      <scroll-view class="tags-scroll" scroll-y :show-scrollbar="false">
        <view
          v-for="tag in tags"
          :key="tag.name"
          class="tag-item"
          :class="{
            'tag-active': activeTag.name === tag.name,
            'tag-disabled': isDisabledTag(tag.name),
          }"
          @click="handleTagChange(tag)"
        >
          <text class="tag-text">
            <span
              class="tag-color-text"
              :class="x == 'X' ? 'tag-color-x' : 'tag-color-a'"
              v-for="x in tag.name"
              :key="x"
            >
              {{ x }}
            </span>
          </text>
          <view class="tag-isInScheme-icon isInScheme" v-if="isInScheme(tag.name)">
            <uni-icons class="tag-icon" type="checkmarkempty" size="10" color="#fff"></uni-icons>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 右侧数字选择区 -->
    <view class="right-content">
      <scroll-view class="tags-scroll" scroll-y :show-scrollbar="false">
        <!-- 根据标签类型显示对应的位数 -->
        <view class="digit-sections">
          <template v-for="name in activeTag.positions" :key="`${activeTag.name}-${name}`">
            <numSelected
              :name="name"
              :maxNum="activeTag.maxNum"
              :minNum="activeTag.minNum"
              :numberList="activeTag.numberList"
              v-model="selectedNumbers[name]"
            />
          </template>
        </view>

        <!-- 统计信息 -->
        <view class="stats-section">
          <view class="stat-item">
            <text class="stat-label">已选数字</text>
          </view>
          <view class="selected-numbers">
            <text class="selected-list">{{ selectedNumbersDisplay }}</text>
          </view>
        </view>

        <view class="action-buttons">
          <button class="clear-btn" @click="clearScheme">清除方案</button>
          <button class="update-btn" @click="addScheme">
            {{ isInScheme(activeTag.name) ? "更新方案" : "添加方案" }}
          </button>
        </view>
      </scroll-view>
    </view>

    <!-- 浮动发布按钮 -->
    <view class="floating-btn" @click="goToConfirm">
      <text class="btn-text">{{ confirmBtnText }}</text>
      <text class="btn-step">{{ publishButtonText }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, reactive } from "vue";
import numSelected from "./components/num-selected.vue";
import { onLoad } from "@dcloudio/uni-app";
import tool from "@/utils/tool.js";
import postTool from "./post-tool";
import { buildSchemeTags, contentHasTag, validateScheme } from "./scheme-tags";

const disabledTag = ref([]);
const id = ref(null);
const lotteryType = ref("");
const isLoadCompner = ref(false);
const from = ref("");
onLoad(async (options) => {
  options = tool.optionsParamsDecode(options);

  lotteryType.value = options.lotteryType;
  from.value = options.from || "";

  // 按彩种构建标签集（必须在读取已存方案之前）
  tags.value = buildSchemeTags(lotteryType.value);

  if (from.value !== "upload-diagram") {
    postTool.clearSchemesData();
  }
  if (!options.id) {
    uni.setStorageSync("postContent", "");
  }
  try {
    const postData = await postTool.getTodayNewPost(lotteryType.value);
    const content = uni.getStorageSync("postContent") || postData?.content;
    const postid = options.id || postData?.id;
    if (content) {
      // 追贴
      uni.showModal({
        title: "提示",
        content: "您本期已经发布过帖子了,目前为追贴模式，新增的内容将作为补充添加到本期帖子中！",
        showCancel: false,
      });
      id.value = postid;

      disabledTag.value = tags.value
        .filter((tag) => contentHasTag(content, tag.name))
        .map((tag) => tag.name);

      uni.setStorageSync("appendPostData", { postContent: content });
    }

    // 默认选中第一个没有被禁用的标签
    activeTag.value = tags.value.filter((tag) => !disabledTag.value.includes(tag.name))[0];

    const schemeData = postTool.loadSchemesData(lotteryType.value);
    schemeData.forEach(([tagName, tagData]) => {
      const tag = tags.value.find((tag) => tag.name === tagName);
      // 只接收属于当前彩种标签集的方案，避免切换彩种后把别的彩种的方案带过去
      if (!tag) return;
      savedSchemes[tagName] = tagData;
      tag.selectedNumbers = tagData;
    });

    isLoadCompner.value = true;
  } catch (error) {
    console.error(error);
    uni.showModal({
      title: "提示",
      content: "获取数据失败",
      success: function (res) {
        uni.redirectTo({ url: "/pages/forum/forum" });
      },
    });
  }
});

const isDisabledTag = (tagName) => {
  return disabledTag.value.includes(tagName);
};

const confirmBtnText = computed(() => {
  if (from.value === "upload-diagram") {
    return "回规则图";
  }
  if (id.value) {
    return "去追贴";
  } else {
    return "去发布";
  }
});

// 左侧标签数据：由 scheme-tags.js 按彩种构建，onLoad 里赋值
const tags = ref([]);

// 当前选中的标签
const activeTag = ref({});

// 存储选中的数字
const selectedNumbers = computed(() => {
  return activeTag.value.selectedNumbers;
});

// 切换标签
const handleTagChange = async (tag) => {
  if (isDisabledTag(tag.name)) {
    return;
  }
  if (!isInScheme(activeTag.value.name) && dataIsGood(selectedNumbers.value, activeTag.value)) {
    const res = await uni.showModal({
      title: "提示",
      content: `${activeTag.value.name} 未添加到方案中 \n 是否需要添加到方案中？`,
      showCancel: true,
    });

    if (res.confirm) {
      addScheme();
    }
  }

  activeTag.value = tag;
};

// 显示选中的数字
const selectedNumbersDisplay = computed(() => {
  const result = [];
  Object.entries(selectedNumbers.value).forEach(([position, item]) => {
    const { numbers, mainAttack } = item;
    if (numbers.length > 0) {
      result.push(
        `${position}: ${numbers.join(",")} ${mainAttack ? ` 主攻：(${mainAttack})` : ""}`
      );
    }
  });
  return result.length > 0 ? result.join("\n") : "暂无选择";
});

// 存储的方案
const savedSchemes = reactive({});
const clearScheme = () => {
  Object.entries(selectedNumbers.value).forEach(([position, item]) => {
    item.numbers = [];
    item.mainAttack = "";
  });
  delete savedSchemes[activeTag.value.name];
};

function dataIsGood(scheme, tag) {
  return validateScheme(scheme, tag) === "";
}
// 添加方案
const addScheme = () => {
  const scheme = Object.assign({}, selectedNumbers.value);
  const errorMsg = validateScheme(scheme, activeTag.value);
  if (errorMsg) {
    uni.showToast({
      title: errorMsg,
      icon: "none",
    });
    return false;
  }
  if (isInScheme(activeTag.value.name)) {
    uni.showToast({
      title: `方案已更新`,
      icon: "none",
    });
  } else if (Object.keys(savedSchemes).length >= 4) {
    uni.showModal({ title: "提示", content: "最多添加4个方案" });
    return false;
  }
  savedSchemes[activeTag.value.name] = scheme;
  postTool.saveSchemesData(lotteryType.value, savedSchemes);
  return true;
};
// 发布按钮文本
const publishButtonText = computed(() => {
  return `${Object.keys(savedSchemes).length}/4`;
});
// 判断是否在方案中
const isInScheme = (tagName) => {
  const scheme = savedSchemes[tagName];
  return !!scheme;
};

const goToConfirm = async () => {
  console.log("发布");
  if (!isInScheme(activeTag.value.name)) {
    const res = await uni.showModal({
      title: "提示",
      content: `${activeTag.value.name} 不在方案中,是否添加？`,
    });
    if (res.confirm) {
      if (addScheme() === false) {
        // 没有添加成功
        return false;
      }
    }
  }

  if (Object.keys(savedSchemes).length == 0) {
    uni.showToast({
      title: "请添加方案",
      icon: "none",
    });
    return;
  }

  const urlParams = tool.formatUrlParams({
    lotteryType: lotteryType.value,
    id: id.value,
  });

  if (from.value === "upload-diagram") {
    uni.navigateBack();
  } else {
    uni.navigateTo({
      url: `/pages/forum/post/append-confirm?` + urlParams,
    });
  }
};
</script>

<style lang="scss" scoped>
.container {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #fff;
  box-sizing: border-box;
  padding-top: var(--status-bar-height);
}

// 左侧标签栏样式
.left-tags {
  width: 180rpx;
  background-color: #f5f5f5;
}

.tags-scroll {
  height: 100%;
}

.tag-item {
  padding: 30rpx 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
  text-align: center;
  transition: all 0.3s;
  position: relative;

  .tag-isInScheme-icon {
    position: absolute;
    right: 0rpx;
    bottom: 0rpx;
    background-color: #fe1111;
    width: 30rpx;
    height: 30rpx;
    border-radius: 30rpx 0 0 0;
    color: #fff;
    .tag-icon {
      position: absolute;
      left: 5rpx;
      top: 7rpx;
    }
  }
}
.tag-color-text {
  &.tag-color-x {
    color: #b8b8b8;
  }
  &.tag-color-a {
  }
}
.tag-text {
  font-weight: bold;
  font-size: 26rpx;
  color: #333333;
}

.tag-active {
  background-color: #fff;

  .tag-text {
    color: #ff4757;
    font-weight: bold;
    .tag-text-color {
      .tag-color-x {
        color: #666;
      }
      .tag-color-a {
        color: #ff4757;
      }
    }
  }
}
.tag-disabled {
  background-color: #ebe8e8;
  .tag-color-text {
    color: #acacac;
  }
}

// 右侧内容区样式
.right-content {
  flex: 1;
  padding: 30rpx;
}

.title-section {
  margin-bottom: 40rpx;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid #e8e8e8;
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  margin-right: 20rpx;
}

.selection-info {
  font-size: 24rpx;
  color: #f56c6c;
}

.digit-sections {
  margin-bottom: 40rpx;
}

.stats-section {
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.stat-label {
  font-size: 28rpx;
  color: #666;
}

.selected-numbers {
  margin-top: 20rpx;
}

.selected-label {
  font-size: 24rpx;
  color: #999;
  margin-right: 10rpx;
}

.selected-list {
  font-size: 24rpx;
  color: #333;
  line-height: 1.6;
  white-space: normal;
  word-break: break-all;
  overflow: hidden;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 20rpx;
  margin: 40rpx 0; /* 适当间距 */
  padding-bottom: 200rpx;

  .clear-btn,
  .update-btn {
    flex: 1;
    height: 80rpx;
    line-height: 80rpx;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
    border: none;
  }

  .clear-btn {
    background-color: #f0f0f0;
    color: #666;
  }

  .update-btn {
    background-color: #ff4757;
    color: #fff;
  }
}

/* 浮动发布按钮 */
.floating-btn {
  position: fixed;
  right: 30rpx;
  bottom: 30rpx;
  width: 120rpx;
  height: 120rpx;
  background-color: #ff4757;
  border-radius: 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 20rpx rgba(255, 71, 87, 0.3);
  z-index: 999;

  .btn-text {
    font-size: 24rpx;
    color: #fff;
    font-weight: 500;
  }

  .btn-step {
    font-size: 20rpx;
    color: #fff;
    margin-top: 5rpx;
  }
}
</style>
