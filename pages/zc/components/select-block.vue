<template>
  <view class="select-block">
    <view class="select-block-content">
      <view
        v-for="option in options"
        :key="option.value"
        @click="setValue(option.value)"
        class="select-block-option"
        :class="{ selected: modelValue === option.value }"
      >
        {{ option.label }}
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
  modelValue?: string | number;
  options?: Array<Record<"label" | "value", string | number>>;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  options: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string | number): void;
}>();

// 设置值并验证
const setValue = (value: string | number) => {
  const validatedValue = validateValue(value);
  emit("update:modelValue", validatedValue);
};

// 验证值的函数（需要根据实际需求实现）
const validateValue = (value: string | number): string | number => {
  // 这里可以添加具体的验证逻辑
  return value;
};

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    // 如果需要内部状态，可以在这里处理
    // currentValue.value = validateValue(newVal);
  }
);
</script>

<style lang="scss" scoped>
.select-block {
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 100%;

  .select-block-content {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 20rpx;
    width: 100%;

    .select-block-option {
      flex: 0 0 auto;
      min-width: 140rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 40rpx;
      background: #f8f9fa;
      border: 2rpx solid #e9ecef;
      border-radius: 16rpx;
      font-size: 30rpx;
      font-weight: 500;
      color: #666;
      transition: all 0.3s ease;
      cursor: pointer;

      &:active {
        transform: scale(0.96);
        background: #e9ecef;
      }

      &.selected {
        background: linear-gradient(135deg, #00ae1d 0%, #00d94a 100%);
        color: #fff;
        border-color: transparent;
        box-shadow: 0 8rpx 24rpx rgba(0, 174, 29, 0.35);
        transform: translateY(-2rpx);

        &:active {
          transform: scale(0.98) translateY(-2rpx);
          box-shadow: 0 4rpx 16rpx rgba(0, 174, 29, 0.3);
        }
      }
    }
  }
}
</style>
