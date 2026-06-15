<template>
  <scroll-view
    class="custom-virtual-list"
    :scroll-x="scrollX"
    :scroll-y="scrollY"
    :upper-threshold="upperThreshold"
    :lower-threshold="lowerThreshold"
    :scroll-top="scrollTop"
    :scroll-left="scrollLeft"
    :scroll-into-view="scrollIntoView"
    :scroll-with-animation="scrollWithAnimation"
    :enable-back-to-top="enableBackToTop"
    :show-scrollbar="showScrollbar"
    :refresher-enabled="refresherEnabled"
    :refresher-threshold="refresherThreshold"
    :refresher-default-style="refresherDefaultStyle"
    :refresher-background="refresherBackground"
    :refresher-triggered="refresherTriggered"
    @scroll="handleScroll"
    @scrolltoupper="handleScrollToUpper"
    @scrolltolower="handleScrollToLower"
    @refresherpulling="handleRefresherPulling"
    @refresherrefresh="handleRefresherRefresh"
    @refresherrestore="handleRefresherRestore"
    @refresherabort="handleRefresherAbort"
  >
    <slot name="top"></slot>
    <!-- 占位容器，撑开滚动区域 -->
    <view class="virtual-list-placeholder" :style="{ height: totalHeight + 'px' }">
      <!-- 实际渲染的列表项 -->
      <view class="virtual-list-content" :style="{ transform: `translateY(${offsetY}px)` }">
        <view 
          v-for="(item, index) in visibleData" 
          :key="dataKey ? item[dataKey] : index"
          class="virtual-list-item"
          :style="{ height: itemRealHeight(index) + 'px' }"
        >
          <slot :item="item" :index="startIndex + index"></slot>
        </view>
      </view>
    </view>
    <slot name="bottom"></slot>
  </scroll-view>
</template>

<script>
export default {
  name: 'CustomVirtualList',
  props: {
    // 虚拟列表特有属性
    data: {
      type: Array,
      default: () => []
    },
    itemHeight: {
      type: Number,
      required: true
    },
    bufferSize: {
      type: Number,
      default: 50
    },
    dataKey: {
      type: String,
      default: 'id'
    },
    
    // 展开项支持
    expandedIndex: {
      type: Number,
      default: -1
    },
    extraHeight: {
      type: Number,
      default: 0
    },
    
    // scroll-view原有属性
    scrollX: {
      type: Boolean,
      default: false
    },
    scrollY: {
      type: Boolean,
      default: true
    },
    upperThreshold: {
      type: [Number, String],
      default: 50
    },
    lowerThreshold: {
      type: [Number, String],
      default: 50
    },
    scrollTop: {
      type: [Number, String],
      default: 0
    },
    scrollLeft: {
      type: [Number, String],
      default: 0
    },
    scrollIntoView: {
      type: String,
      default: ''
    },
    scrollWithAnimation: {
      type: Boolean,
      default: false
    },
    enableBackToTop: {
      type: Boolean,
      default: false
    },
    showScrollbar: {
      type: Boolean,
      default: true
    },
    refresherEnabled: {
      type: Boolean,
      default: false
    },
    refresherThreshold: {
      type: Number,
      default: 45
    },
    refresherDefaultStyle: {
      type: String,
      default: 'black'
    },
    refresherBackground: {
      type: String,
      default: '#FFFFFF'
    },
    refresherTriggered: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      startIndex: 0,
      endIndex: 0,
      offsetY: 0,
      visibleData: [],
      containerHeight: 0,
      currentScrollTop: 0
    }
  },
  computed: {
    totalHeight() {
      let height = this.data.length * this.itemHeight;
      if (this.expandedIndex >= 0 && this.expandedIndex < this.data.length) {
        height += this.extraHeight;
      }
      return height;
    }
  },
  mounted() {
    this.initVirtualList();
    // 获取容器高度
    this.getContainerHeight();
  },
  watch: {
    data() {
      this.updateVisibleData(this.currentScrollTop);
    },
    scrollTop(newVal) {
      this.handleScrollTopChange(newVal);
    },
    extraHeight() {
      this.updateVisibleData(this.currentScrollTop);
    },
    expandedIndex() {
      this.updateVisibleData(this.currentScrollTop);
    }
  },
  methods: {
    itemRealHeight(visibleIndex) {
      const realIndex = this.startIndex + visibleIndex;
      if (this.expandedIndex === realIndex) {
        return this.itemHeight + this.extraHeight;
      }
      return this.itemHeight;
    },
    
    initVirtualList() {
      this.updateVisibleData(this.currentScrollTop);
    },
    
    getContainerHeight() {
      const query = uni.createSelectorQuery().in(this);
      query.select('.custom-virtual-list').boundingClientRect(data => {
        if (data) {
          this.containerHeight = data.height;
          this.updateVisibleData(this.currentScrollTop);
        }
      }).exec();
    },
    
    handleScroll(e) {
      const scrollTop = e.detail.scrollTop;
      this.currentScrollTop = scrollTop;
      this.updateVisibleData(scrollTop);
      this.$emit('scroll', e);
    },
    
    handleScrollTopChange(scrollTop) {
      this.currentScrollTop = Number(scrollTop);
      this.updateVisibleData(Number(scrollTop));
    },
    
    updateVisibleData(scrollTop = 0) {
      if (this.data.length === 0) {
        this.startIndex = 0;
        this.endIndex = 0;
        this.offsetY = 0;
        this.visibleData = [];
        return;
      }
      
      // 更精确的计算：考虑extraHeight
      let accumulatedHeight = 0;
      let preciseStartIndex = 0;
      for (let i = 0; i < this.data.length; i++) {
        const itemH = (this.expandedIndex === i) ? this.itemHeight + this.extraHeight : this.itemHeight;
        if (accumulatedHeight + itemH > scrollTop) {
          preciseStartIndex = i;
          break;
        }
        accumulatedHeight += itemH;
        preciseStartIndex = i + 1;
      }
      
      const visibleCount = Math.ceil(this.containerHeight / this.itemHeight) + 2;
      const endIndex = Math.min(preciseStartIndex + visibleCount + this.bufferSize, this.data.length);
      
      // 更新偏移量和可视数据
      this.startIndex = Math.max(0, preciseStartIndex - this.bufferSize);
      this.endIndex = endIndex;
      
      // 计算精确的 offsetY
      let offsetY = 0;
      for (let i = 0; i < this.startIndex; i++) {
        offsetY += (this.expandedIndex === i) ? this.itemHeight + this.extraHeight : this.itemHeight;
      }
      this.offsetY = offsetY;
      this.visibleData = this.data.slice(this.startIndex, this.endIndex);
      
      // 触发可视区域变化事件
      this.$emit('visible-change', {
        startIndex: this.startIndex,
        endIndex: this.endIndex,
        visibleData: this.visibleData
      });
    },
    
    // 转发scroll-view的事件
    handleScrollToUpper(e) {
      this.$emit('scrolltoupper', e);
    },
    
    handleScrollToLower(e) {
      this.$emit('scrolltolower', e);
    },
    
    handleRefresherPulling(e) {
      this.$emit('refresherpulling', e);
    },
    
    handleRefresherRefresh(e) {
      this.$emit('refresherrefresh', e);
    },
    
    handleRefresherRestore(e) {
      this.$emit('refresherrestore', e);
    },
    
    handleRefresherAbort(e) {
      this.$emit('refresherabort', e);
    }
  }
}
</script>

<style lang="scss" scoped>
.custom-virtual-list {
  position: relative;
  width: 100%;
  height: 100%;
  
  .virtual-list-placeholder {
    width: 100%;
  }
  
  .virtual-list-content {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
  }
  
  .virtual-list-item {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>