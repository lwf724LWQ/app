<template>
  <view class="tag-list-container">
    <!-- 左侧标签区域 -->
    <scroll-view class="left-tags" :scroll-y="true" :show-scrollbar="false">
      <!-- 自定义标签插槽 -->
      <view v-if="!$slots.tags" class="tags-default">
        <view
          v-for="tag in tags"
          :key="tag.value"
          :class="['tag-item', { active: activeTag?.value === tag.value }]"
          @click="switchTag(tag)"
        >
          {{ tag.label }}
        </view>
      </view>
      <slot name="tags" :active-tag="activeTag" :switch-tag="switchTag"></slot>
    </scroll-view>

    <!-- 右侧列表区域 -->
    <scroll-view class="right-list" :scroll-y="true">
      <!-- 自定义列表插槽 -->
      <slot name="list" :data="currentList" :active-tag="activeTag"></slot>
    </scroll-view>
  </view>
</template>

<script>
export default {
  name: "TagListComponent",
  props: {
    // 标签数据
    tags: {
      type: Array,
      default: () => [],
    },
    // 列表数据
    listData: {
      type: Object,
      default: () => ({}),
    },
    // v-model绑定的值
    modelValue: {
      type: [Object, String, Number],
      default: null,
    },
  },
  emits: ["update:modelValue", "tag-change"],
  computed: {
    // 使用计算属性实现v-model双向绑定
    activeTag: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit("update:modelValue", value);
      },
    },
    // 当前激活标签对应的列表数据
    currentList() {
      if (!this.activeTag) {
        return [];
      }
      return (
        this.listData[this.activeTag.value] ||
        this.listData[this.activeTag] ||
        []
      );
    },
  },
  mounted() {
    // 如果没有默认值且有标签数据，则默认激活第一个标签
    if (this.tags.length > 0) {
      this.switchTag(this.tags[0]);
    }
  },
  methods: {
    // 切换标签
    switchTag(tagValue) {
      let isStop = false;
      const event = {
        stop: () => {
          isStop = true;
        },
        value: tagValue,
      };

      // 触发标签切换事件
      this.$emit("tag-change", event);
      if (isStop) return;

      // 更新v-model绑定的值
      this.activeTag = tagValue;
    },
  },
};
</script>

<style lang="scss" scoped>
.tag-list-container {
  display: flex;
}

.left-tags {
  width: auto;
}

.tags-default {
  min-height: 100%;
  background-color: #efefef;

  .tag-item {
    padding: 28rpx 50rpx;

    &.active {
      color: rgb(223, 34, 34);
      background-color: #fff;
    }
  }
}

.right-list {
  flex: 1;
}
</style>