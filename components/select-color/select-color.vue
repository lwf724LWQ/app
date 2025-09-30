<template>
  <div class="control-wrapper">
    <!-- 颜色触发按钮 -->
    <button
        class="color-trigger"
        :style="{ backgroundColor: selectedColor }"
        @click="toggleOptions"
    ></button>

    <!-- 颜色面板 -->
    <div
        class="color-panel"
        v-if="isOptionsOpen"
        @click.stop
    >
      <div class="color-presets-container">
        <div class="color-presets">
          <div
              v-for="color in presetColors"
              :key="color"
              class="color-preset"
              :style="{ backgroundColor: color }"
              @click="selectColor(color)"
              :title="color"
          ></div>
        </div>
      </div>
    </div>

    <!-- 右侧线条粗细选择（曲线图标，点击颜色按钮显示/隐藏） -->
    <div
        class="line-options-container"
        :class="{ 'visible': isOptionsOpen }"
        @click.stop
    >
      <div class="line-options">
        <button
            v-for="width in lineWidthOptions"
            :key="width.value"
            :class="['line-option', { 'active': selectedLineWidth === width.value }]"
            @click="selectLineWidth(width.value)"
            :title="width.label"
        >
          <!-- 曲线 SVG 图标 -->
          <svg width="40" height="30" viewBox="0 0 40 30" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M5,15 Q20,5 35,15"
                fill="none"
                :stroke="selectedColor"
                :stroke-width="width.value"
                stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';
const emit = defineEmits(['select-color', 'select-line-width']);

// 颜色相关
const selectedColor = ref('#3B82F6');
const isOptionsOpen = ref(false); // 控制选项显示/隐藏
const presetColors = ref([
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#DC2626',
  '#000000', '#333333', '#666666', '#999999', '#CCCCCC', '#FFFFFF'
]);

// 线条粗细相关（保持原有样式）
const lineWidthOptions = [
  { label: '细', value: 2 },
  { label: '中', value: 4 },
  { label: '粗', value: 6 }
];
const selectedLineWidth = ref(4); // 默认选中"中"

// 切换选项显示/隐藏
const toggleOptions = () => {
  isOptionsOpen.value = !isOptionsOpen.value;
};

// 选择颜色
const selectColor = (color) => {
  selectedColor.value = color;
  emit('select-color', color);
  // 选择颜色后保持面板打开
  // isOptionsOpen.value = false;
};

// 选择线条粗细
const selectLineWidth = (value) => {
  selectedLineWidth.value = value;
  emit('select-line-width', value);
  // 选择线条后保持面板打开
  // isOptionsOpen.value = false;
};

// 颜色格式验证
const validateColor = () => {
  const regex = /^#([0-9A-F]{3}){1,2}$/i;
  if (!regex.test(selectedColor.value)) {
    selectedColor.value = lastValidColor;
  }
};

let lastValidColor = selectedColor.value;
watch(selectedColor, (newVal) => {
  const regex = /^#([0-9A-F]{3}){1,2}$/i;
  if (regex.test(newVal)) {
    lastValidColor = newVal;
  }
});

// 点击外部关闭选项
const handleClickOutside = (e) => {
  const wrapper = document.querySelector('.control-wrapper');
  if (wrapper && !wrapper.contains(e.target)) {
    isOptionsOpen.value = false;
  }
};

document.addEventListener('click', handleClickOutside);

// 组件卸载时清理
const cleanup = () => {
  document.removeEventListener('click', handleClickOutside);
};
window.addEventListener('beforeunload', cleanup);
</script>

<style scoped>
.control-wrapper {
  position: fixed;
  bottom: 50rpx;
  left: 50rpx;
  display: flex;
  align-items: center;
  z-index: 999;
}

/* 颜色触发按钮 */
.color-trigger {
  width: 80rpx;
  height: 80rpx;
  border: none;
  border-radius: 12rpx;
  cursor: pointer;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
  transition: transform 0.2s;
  position: relative;
  z-index: 999;
}

.color-trigger:hover {
  transform: scale(1.05);
}

/* 颜色面板（保持原有样式） */
.color-panel {
  position: absolute;
  bottom: 90rpx; /* 显示在触发按钮上方 */
  left: 0;
  background: white;
  padding: 0;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 30rpx rgba(0,0,0,0.15);
  width: 100rpx;
  z-index: 999;
}

.color-presets-container {
  height: 600rpx;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 8rpx;
}

.color-presets {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  align-items: center;
  padding: 10rpx 0;
}

.color-preset {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid #eee;
}

.color-preset:hover {
  transform: scale(1.1);
}

/* 右侧线条粗细选择（保持原有样式，添加显示/隐藏控制） */
.line-options-container {
  margin-left: 15rpx;
  opacity: 0;
  visibility: hidden;
  transform: translateX(-10rpx);
  transition: all 0.2s ease;
}

/* 显示线条选项 */
.line-options-container.visible {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.line-options {
  display: flex;
  gap: 10rpx;
  background: white;
  padding: 15rpx;
  border-radius: 12rpx;
  box-shadow: 0 4rpx 10rpx rgba(0,0,0,0.1);
}

.line-option {
  background: transparent;
  border: none;
  border-radius: 8rpx;
  padding: 8rpx;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.line-option:hover {
  background-color: #f5f5f5;
}

.line-option.active {
  background-color: rgba(59, 130, 246, 0.1);
}

/* SVG 曲线图标样式 */
svg {
  display: block;
}
</style>
