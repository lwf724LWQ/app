<template>
  <view class="rank-filter" v-if="visible" @click="onMaskClick">
    <view class="rf-panel" @click.stop>
      <!-- 彩种（切换后选项按该彩种的配置重建） -->
      <view class="rf-types">
        <view
          v-for="type in filterTypes"
          :key="type"
          class="rf-type"
          :class="{ active: type === localTname }"
          @click="selectType(type)"
        >
          {{ type }}
        </view>
      </view>

      <!-- 各筛选分组（按彩种配置动态渲染） -->
      <view class="rf-section" v-for="section in sections" :key="section.key">
        <view class="rf-title">{{ section.title }}</view>
        <view class="rf-chips">
          <view
            v-for="item in section.items"
            :key="item"
            class="rf-chip"
            :class="{ active: isSelected(section, item) }"
            @click="toggleItem(section, item)"
          >
            {{ item }}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  FILTER_TYPES,
  DEFAULT_FILTER_TYPE,
  getFilterSections,
  getDefaultSelection,
} from "../rankFilterConfig.js";

// 大师榜单 - 筛选弹框
// 定位为单选（决定页面标题），其余分组为多选
// 排列五/七星彩 与 排列三/福彩3D 的分组配置不同，见 rankFilterConfig.js
export default {
  name: "RankFilterPopup",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    tname: {
      type: String,
      default: DEFAULT_FILTER_TYPE,
    },
    // 页面当前的定位（打开弹框时回填）
    position: {
      type: String,
      default: "",
    },
  },
  emits: ["update:visible", "confirm"],
  data() {
    return {
      filterTypes: FILTER_TYPES,
      localTname: DEFAULT_FILTER_TYPE,
      // { [分组key]: [已选项] }
      localSelection: {},
    };
  },
  computed: {
    sections() {
      return getFilterSections(this.localTname);
    },
    // 定位 = 第一组的选中项
    localPosition() {
      const first = this.sections[0];
      if (!first) return "";
      const selected = this.localSelection[first.key] || [];
      return selected[0] || "";
    },
  },
  watch: {
    visible(val) {
      if (val) this.resetSelection();
    },
  },
  methods: {
    // 打开弹框时按传入的彩种/定位回填
    resetSelection() {
      this.localTname = this.tname || DEFAULT_FILTER_TYPE;
      const selection = getDefaultSelection(this.localTname);
      const first = this.sections[0];
      if (first && this.position && first.items.includes(this.position)) {
        selection[first.key] = [this.position];
      }
      this.localSelection = selection;
    },
    // 切换彩种：选项完全不同，选中值一并重建
    selectType(type) {
      if (type === this.localTname) return;
      this.localTname = type;
      this.localSelection = getDefaultSelection(type);
    },
    isSelected(section, item) {
      const selected = this.localSelection[section.key] || [];
      return selected.indexOf(item) > -1;
    },
    toggleItem(section, item) {
      const selected = this.localSelection[section.key] || [];
      if (section.single) {
        this.localSelection = { ...this.localSelection, [section.key]: [item] };
        return;
      }
      const next = selected.indexOf(item) > -1
        ? selected.filter((value) => value !== item)
        : [...selected, item];
      this.localSelection = { ...this.localSelection, [section.key]: next };
    },
    onMaskClick() {
      // 点击遮罩关闭，同时把已选条件回传（选完即生效）
      this.confirm();
    },
    confirm() {
      const selections = {};
      Object.keys(this.localSelection).forEach((key) => {
        selections[key] = [...(this.localSelection[key] || [])];
      });
      this.$emit("update:visible", false);
      this.$emit("confirm", {
        tname: this.localTname,
        position: this.localPosition,
        selections,
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.rank-filter {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.45);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40rpx 24rpx;
  box-sizing: border-box;
}

.rf-panel {
  width: 100%;
  max-height: 76vh;
  overflow-y: auto;
  background-color: #fff;
  border-radius: 20rpx;
  padding-bottom: 30rpx;
}

/* 彩种切换 */
.rf-types {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 24rpx 10rpx;
  position: sticky;
  top: 0;
  background-color: #fff;
  border-radius: 20rpx 20rpx 0 0;
  z-index: 2;
}

.rf-type {
  min-width: 130rpx;
  height: 60rpx;
  line-height: 60rpx;
  text-align: center;
  font-size: 30rpx;
  color: #333;
  border-radius: 8rpx;
}

.rf-type.active {
  color: #fff;
  background-color: #ff3b30;
  font-weight: bold;
}

/* 分组 */
.rf-section {
  padding: 10rpx 24rpx 0 24rpx;
}

.rf-title {
  font-size: 34rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}

/* 选项用自适应网格：手机窄屏约 4 列，长文案自动换行（与设计稿一致） */
.rf-chips {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150rpx, 1fr));
  gap: 16rpx;
  padding-bottom: 20rpx;
}

.rf-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72rpx;
  padding: 8rpx 6rpx;
  text-align: center;
  font-size: 26rpx;
  line-height: 1.15;
  color: #666;
  background-color: #fff;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  box-sizing: border-box;
}

.rf-chip.active {
  color: #ff3b30;
  border-color: #ff3b30;
  background-color: #fff5f5;
  font-weight: bold;
}
</style>
