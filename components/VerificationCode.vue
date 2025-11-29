<template>
  <view class="code-container">
    <input type="number" :placeholder="placeholder" placeholder-class="holder-class" class="code-input"
      v-model="codeValue" @input="handleInput" />
    <button type="default" class="code-btn" :disabled="isCounting || disabled" @click="handleGetCode">
      {{ isCounting ? `${countdown}s后重新获取` : buttonText }}
    </button>
  </view>
</template>

<script setup>
import { ref, defineProps, defineEmits, onUnmounted } from 'vue';

// 接收父组件传递的参数
const props = defineProps({
  // 按钮文字（默认"获取验证码"，可自定义）
  buttonText: {
    type: String,
    default: '获取验证码'
  },
  // 输入框占位符（默认"验证码"）
  placeholder: {
    type: String,
    default: '验证码'
  },
  // 是否禁用整个组件（用于表单验证等场景）
  disabled: {
    type: Boolean,
    default: false
  },
  // 倒计时时长（秒）
  countdownTime: {
    type: Number,
    default: 60
  }
});

// 向父组件传递事件
const emit = defineEmits([
  'getCode',  // 点击获取验证码时触发
  'input'     // 输入验证码时触发（用于双向绑定）
]);

// 组件内部状态
const codeValue = ref('');       // 验证码输入值
const isCounting = ref(false);   // 是否正在倒计时
const countdown = ref(props.countdownTime);  // 倒计时秒数
let timer = null;                // 定时器

// 点击获取验证码
const handleGetCode = () => {
  // 触发父组件的getCode事件（父组件在这里处理发送验证码的逻辑）
  emit('getCode');
};

// 开始倒计时（由父组件调用，通常在验证码发送成功后）
const startCountdown = () => {
  if (isCounting.value) return;

  isCounting.value = true;
  countdown.value = props.countdownTime;

  clearInterval(timer);
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearInterval(timer);
      isCounting.value = false;
    }
  }, 1000);
};

// 输入事件处理
const handleInput = (e) => {
  codeValue.value = e.detail.value;
  emit('input', codeValue.value);  // 向父组件传递输入值
};

// 清除定时器（防止内存泄漏）
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

// 暴露方法给父组件（如手动触发倒计时）
defineExpose({
  startCountdown
});
</script>

<style scoped lang="less">
.code-container {
  display: flex;
  gap: 12rpx;
  width: 100%;
  box-sizing: border-box;
}

.code-input {
  flex: 1;
  height: 42rpx;
  font-size: 28rpx;
}

.holder-class {
  color: #999;
  font-size: 28rpx;
}

.code-btn {
  width: 220rpx;
  height: 40rpx;
  line-height: 40rpx;
  text-align: center;
  background-color: transparent;
  color: #000;
  border: none;
  font-size: 28rpx;
  border-radius: 8rpx;
  padding: 0;

  &:after {
    border: none;
  }
}

uni-button[disabled][type='default'],
uni-button[disabled]:not([type]) {
  color: rgba(0, 0, 0, 0.3);
  background-color: transparent;
}
</style>
