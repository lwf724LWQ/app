<template>
  <view class="indexed-list-container" @touchstart.stop @touchmove.stop @touchend.stop>
    <!-- 列表内容区域 -->
    <scroll-view
      class="indexed-list-body"
      :scroll-y="true"
      :scroll-into-view="scrollIntoId"
      :scroll-with-animation="true"
      @scroll="onScroll"
    >
      <view
        v-for="section in sections"
        :key="section.key"
        :id="'section-' + section.key"
      >
        <!-- 分组标题 -->
        <view class="section-header">{{ section.key }}</view>

        <!-- 分组内容插槽 -->
        <view class="section-content">
          <slot
            :name="section.key"
            :section-key="section.key"
            :section-data="section.data"
          >
            <!-- 默认内容：无数据时显示 -->
            <view class="section-empty">暂无数据</view>
          </slot>
        </view>
      </view>

      <!-- 底部占位 -->
      <view class="bottom-placeholder" />
    </scroll-view>

    <!-- 右侧索引栏 -->
    <view
      class="index-bar"
      @touchstart="onIndexTouchStart"
      @touchmove.prevent="onIndexTouchMove"
      @touchend="onIndexTouchEnd"
    >
      <view
        v-for="section in sections"
        :key="section.key"
        :class="['index-item', { active: currentIndex === section.key }]"
        :data-key="section.key"
      >
        {{ section.key }}
      </view>
    </view>

    <!-- 触摸时中间提示 -->
    <view v-if="touchTip" class="index-tip">{{ currentIndex }}</view>
  </view>
</template>

<script>
export default {
  name: "IndexedList",
  props: {
    // 索引列表数据 { "A": any, "B": any, ... }
    list: {
      type: Object,
      default: () => ({}),
    },
    // 列表key的排序方式: "default" | "asc" | "desc"
    sort: {
      type: String,
      default: "default",
    },
  },
  emits: ["section-change"],
  data() {
    return {
      scrollIntoId: "",
      currentIndex: "",
      touchTip: false,
      sectionPositions: [],
    };
  },
  computed: {
    sections() {
      const keys = Object.keys(this.list);
      if (this.sort === "asc") {
        keys.sort();
      } else if (this.sort === "desc") {
        keys.sort().reverse();
      }
      return keys.map((key) => ({
        key,
        data: this.list[key],
      }));
    },
  },
  watch: {
    list: {
      immediate: true,
      handler() {
        this.$nextTick(() => {
          this.currentIndex = this.sections[0]?.key || "";
        });
      },
    },
  },
  methods: {
    // 滚动事件（用于获取各section位置）
    onScroll(e) {
      // uniapp中scroll-view的scroll事件
    },

    // 索引栏touchstart
    onIndexTouchStart(e) {
      this.touchTip = true;
      this.scrollToIndex(e);
    },

    // 索引栏touchmove
    onIndexTouchMove(e) {
      this.scrollToIndex(e);
    },

    // 索引栏touchend
    onIndexTouchEnd() {
      this.touchTip = false;
    },

    // 根据触摸位置定位索引
    scrollToIndex(e) {
      const touch = e.touches[0] || e.changedTouches[0];
      if (!touch) return;

      // 获取触摸点相对于索引栏的位置
      const query = uni.createSelectorQuery().in(this);
      query.select(".index-bar").boundingClientRect((rect) => {
        if (!rect) return;

        const touchY = touch.clientY;
        const barTop = rect.top;
        const barHeight = rect.height;
        const sectionCount = this.sections.length;
        const itemHeight = barHeight / sectionCount;

        const index = Math.floor((touchY - barTop) / itemHeight);
        const clampedIndex = Math.max(0, Math.min(index, sectionCount - 1));

        const section = this.sections[clampedIndex];
        if (section) {
          this.currentIndex = section.key;
          this.scrollIntoId = "section-" + section.key;
          this.$emit("section-change", section.key);
        }
      });
      query.exec();
    },

    // 点击索引项
    onIndexTap(key) {
      this.currentIndex = key;
      this.scrollIntoId = "section-" + key;
      this.$emit("section-change", key);
    },
  },
};
</script>

<style lang="scss" scoped>
.indexed-list-container {
  position: relative;
  display: flex;
  height: 100%;
  overflow: hidden;
}

.indexed-list-body {
  flex: 1;
  height: 100%;
  overflow: hidden;
}

.section-header {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  font-weight: 600;
  color: #999;
  background-color: #f5f5f5;
  position: sticky;
  top: 0;
  z-index: 1;
}

.section-content {
  min-height: 40rpx;
}

.section-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100rpx;
  color: #ccc;
  font-size: 26rpx;
}

.bottom-placeholder {
  height: 60rpx;
}

.index-bar {
  position: absolute;
  right: 4rpx;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
  padding: 8rpx 4rpx;
}

.index-item {
  width: 40rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  font-size: 22rpx;
  color: #666;
  border-radius: 50%;

  &.active {
    color: #fff;
    background-color: #e43b3b;
  }
}

.index-tip {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120rpx;
  height: 120rpx;
  line-height: 120rpx;
  text-align: center;
  font-size: 56rpx;
  font-weight: bold;
  color: #fff;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 16rpx;
  z-index: 100;
}
</style>