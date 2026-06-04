<template>
  <!-- Part 1: 搜索栏展示 -->
  <view class="search-input-wrapper">
    <view class="search-bar-box">
      <view class="search-bar" @click="openPanel">
        <uni-icons type="search" size="36rpx" color="#999"></uni-icons>
        <text class="search-placeholder">{{ placeholder }}</text>
      </view>
      <!-- <view class="search-selection-icon"></view> -->
      <view class="search-setting-icon" @click="openSetting">
        <uni-icons type="gear-filled" size="55rpx"></uni-icons>
      </view>
    </view>

    <!-- Part 2: 固定搜索面板 -->
    <view class="search-panel-mask" v-if="visible" @click="closePanel"></view>
    <view class="search-panel" :class="{ 'search-panel--visible': visible }" v-if="visible" >
      <view class="panel-header">
        <text class="panel-title">搜索</text>
        <view class="panel-close" @click="closePanel">
          <uni-icons type="closeempty" size="36rpx" color="#333"></uni-icons>
        </view>
      </view>

      <view class="panel-body">
        <!-- 关键词输入框 -->
        <view class="form-item">
          <text class="form-label">关键词</text>
          <input
            class="form-input"
            v-model="keyword"
            placeholder="请输入关键词"
            placeholder-style="color: #999;"
          />
        </view>

        <!-- 赛事状态选择 -->
        <view class="form-item">
          <text class="form-label">赛事状态</text>
          <picker
            class="form-picker"
            mode="selector"
            :range="statusOptions"
            range-key="label"
            :value="statusIndex"
            @change="onStatusChange"
          >
            <view class="picker-value">
              {{ statusOptions[statusIndex].label }}
            </view>
            <uni-icons type="arrowdown" size="28rpx" color="#999"></uni-icons>
          </picker>
        </view>

        <!-- 日期选择 -->
        <view class="form-item">
          <text class="form-label">日期</text>
          <uni-datetime-picker
            class="form-date-picker"
            type="date"
            v-model="date"
            placeholder="请选择日期"
          />
        </view>
      </view>

      <view class="panel-footer">
        <view class="btn-cancel" @click="onCancel">取消</view>
        <view class="btn-confirm" @click="onConfirm">确定</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: '请输入搜索内容',
  },
})

const emit = defineEmits(['search'])

// 面板可见性
const visible = ref(false)

// 关键词
const keyword = ref('')

// 赛事状态选项
const statusOptions = [
  { label: '即时', value: 0 },
  { label: '赛程', value: 1 },
  { label: '赛果', value: 2 },
]

const statusIndex = ref(0)

// 日期（默认当天）
function getToday() {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}/${month}/${day}`
  
}

const date = ref(getToday())
const dateStart = ref(new Date())

// 打开面板
function openPanel() {
  visible.value = true
}

// 关闭面板
function closePanel() {
  visible.value = false
}

// 状态选择
function onStatusChange(e) {
  statusIndex.value = e.detail.value
}
// 取消按钮
function onCancel() {
  keyword.value = ''
  statusIndex.value = 0
  date.value = getToday()
  closePanel()
}

// 确定按钮
function onConfirm() {
  const searchParams = {
    keyword: keyword.value,
    status: statusOptions[statusIndex.value].value,
    date: date.value,
  }
  console.log(searchParams)
  emit('search', searchParams)
  closePanel()
}

// 打开设置页面
function openSetting(){
  uni.navigateTo({
    url: "/pages/zc/settings"
  })
}

defineExpose({
  setStatus(value){
    statusIndex.value = value
  }
});
</script>

<style lang="scss" scoped>
.search-input-wrapper {
  width: 100%;
}

/* Part 1: 搜索栏 */
.search-bar-box{
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
.search-selection-icon{
  width: 75rpx;
  height: 65rpx;
  background: url("/static/icons/selection-icon.png") no-repeat;
  background-size: 100%;
  background-position: center;

  margin-right: 12rpx;
}

/* Part 2: 搜索面板遮罩 */
.search-panel-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 998;
}

/* Part 2: 搜索面板 */
.search-panel {
  position: fixed;
  bottom:0;
  left: 0;
  right: 0;
  z-index: 999;
  background-color: #fff;
  transform: translateY(-100%);
  transition: transform 0.3s ease;

  &--visible {
    transform: translateY(0);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    border-bottom: 1rpx solid #eee;

    .panel-title {
      font-size: 32rpx;
      font-weight: 600;
      color: #333;
    }

    .panel-close {
      padding: 8rpx;
    }
  }

  .panel-body {
    padding: 32rpx;
  }

  .form-item {
    display: flex;
    align-items: center;
    margin-bottom: 32rpx;

    .form-label {
      width: 140rpx;
      font-size: 28rpx;
      color: #333;
      flex-shrink: 0;
    }

    .form-input {
      flex: 1;
      height: 72rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 20rpx;
      font-size: 28rpx;
      color: #333;
      box-sizing: border-box;
    }

    .form-picker {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72rpx;
      background-color: #f5f5f5;
      border-radius: 12rpx;
      padding: 0 20rpx;
      box-sizing: border-box;

      .picker-value {
        font-size: 28rpx;
        color: #333;

        &--placeholder {
          color: #999;
        }
      }
    }

    .form-date-picker {
      flex: 1;
    }
  }

  .panel-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 24rpx 32rpx;
    border-top: 1rpx solid #eee;

    .btn-cancel,
    .btn-confirm {
      width: 320rpx;
      height: 80rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 40rpx;
      font-size: 28rpx;
      font-weight: 500;
    }

    .btn-cancel {
      background-color: #f5f5f5;
      color: #666;
    }

    .btn-confirm {
      background-color: #3c9cff;
      color: #fff;
    }
  }
}
</style>