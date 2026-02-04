<template>
  <view
    class="activity-popup"
    :style="{
      left: position.x + 'px',
      top: position.y + 'px',
    }"
    v-if="isShow"
  >
    <image class="bgi" @click="onClick" :src="src"></image>
    <!-- <uni-icons type="closeempty" size="30" class="close" @click="close"></uni-icons> -->
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";

defineProps({
  src: {
    type: String,
  },
});

const isShow = ref(true);

const popupWidth = 200;
const popupHeight = 155;

const position = ref({
  x: 100,
  y: 100,
});

const velocity = ref({
  x: 2,
  y: 2,
});

let animationId = null;
let screenWidth = 0;
let screenHeight = 0;
let isAnimating = false;

const updateScreenSize = () => {
  const systemInfo = uni.getSystemInfoSync();
  screenWidth = systemInfo.windowWidth;
  screenHeight = systemInfo.windowHeight;
};

const animate = () => {
  if (!isAnimating) return;

  position.value.x += velocity.value.x;
  position.value.y += velocity.value.y;

  // 检测右边界
  if (position.value.x + popupWidth >= screenWidth) {
    position.value.x = screenWidth - popupWidth;
    velocity.value.x = -velocity.value.x;
  }

  // 检测左边界
  if (position.value.x <= 0) {
    position.value.x = 0;
    velocity.value.x = -velocity.value.x;
  }

  // 检测下边界
  if (position.value.y + popupHeight >= screenHeight) {
    position.value.y = screenHeight - popupHeight;
    velocity.value.y = -velocity.value.y;
  }

  // 检测上边界
  if (position.value.y <= 0) {
    position.value.y = 0;
    velocity.value.y = -velocity.value.y;
  }

  animationId = setTimeout(animate, 1000 / 60);
};

const close = () => {
  isAnimating = false;
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
  isShow.value = false;
};

const emit = defineEmits(["click"]);
const onClick = () => {
  emit("click");

  close();
};

onMounted(() => {
  updateScreenSize();
  isAnimating = true;
  animate();

  setTimeout(() => {
    close();
  }, 3000);
});

onUnmounted(() => {
  isAnimating = false;
  if (animationId) {
    clearTimeout(animationId);
    animationId = null;
  }
});
</script>

<style lang="scss" scoped>
.activity-popup {
  position: fixed;
  z-index: 999;
  width: 400rpx;
  height: 300rpx;
  border-radius: 30rpx;
  will-change: transform;

  .bgi {
    width: 100%;
    height: 100%;
  }

  .close {
    position: absolute;
    top: 20rpx;
    right: 20rpx;
  }
}
</style>
