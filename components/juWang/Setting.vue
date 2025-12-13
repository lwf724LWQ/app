<template>
  <uni-popup
    ref="settingPopup"
    type="bottom"
    border-radius="10px 10px 0 0"
    @maskClick="open = false"
  >
    <view class="drawer">
      <view class="drawer-header">
        <view
          class="drawer-header-title"
          @click="crurentPage = '通用设置'"
          :class="{ 'drawer-header-title-active': crurentPage === '通用设置' }"
          ><view>通用设置</view></view
        >
        <view
          class="drawer-header-title"
          @click="crurentPage = '皮肤设置'"
          :class="{ 'drawer-header-title-active': crurentPage === '皮肤设置' }"
          ><view>皮肤设置</view></view
        >
        <view
          class="drawer-header-title"
          @click="crurentPage = '显示设置'"
          :class="{ 'drawer-header-title-active': crurentPage === '显示设置' }"
          ><view>显示设置</view></view
        >
        <view
          class="drawer-header-title"
          @click="crurentPage = '智能多笔'"
          :class="{ 'drawer-header-title-active': crurentPage === '智能多笔' }"
          ><view>智能多笔</view></view
        >
      </view>
      <view class="drawer-content">
        <view class="common" v-show="crurentPage === '通用设置'">
          <view class="title">字体大小</view>
          <view class="select-1">
            <view
              :class="{ 'btn-active': options.fontSizeRatio === 1 }"
              @click="options.fontSizeRatio = 1"
              >标准</view
            >
            <view
              :class="{ 'btn-active': options.fontSizeRatio === 1.2 }"
              @click="options.fontSizeRatio = 1.2"
              >大号</view
            >
            <view
              :class="{ 'btn-active': options.fontSizeRatio === 1.4 }"
              @click="options.fontSizeRatio = 1.4"
              >超大号</view
            >
          </view>
          <!-- <view class="title"
            >分割线
            <text class="tip">（指定期数内，每4局分割）</text>
          </view>
          <view class="select-2">
            <view>常用分割</view>
            <view>本年分割</view>
            <view>全部分割</view>
          </view> -->
          <view class="title">号码样式</view>
          <view class="select-3">
            <view
              v-for="(value, index) in 4"
              :key="value"
              @click="options.numberStyle = styleMap[index]"
              :class="{
                'btn-active':
                  options.numberStyle.isSolid === styleMap[index].isSolid &&
                  options.numberStyle.isRound === styleMap[index].isRound
              }"
            >
              <view>0</view>
              <view>0</view>
              <view></view>
            </view>
          </view>
          <view class="switch">
            <text>数字选择器</text>
            <switch
              color="#fc3d44"
              :checked="options.numberPicker"
              @change="options.numberPicker = $event.detail.value"
            />
          </view>
          <view class="switch">
            <text>固定字体</text>
            <switch
              color="#fc3d44"
              :checked="options.fontFamily === 'sans-serif'"
              @change="
                options.fontFamily = options.fontFamily === 'sans-serif' ? 'serif' : 'sans-serif'
              "
            />
          </view>
          <view class="switch">
            <text>底部增加两行</text>
            <switch
              color="#fc3d44"
              :checked="options.bottomRow === 6"
              @change="options.bottomRow = options.bottomRow === 6 ? 4 : 6"
            />
          </view>
          <!-- <view class="switch">
            <text>去除水印</text>
            <switch color="#fc3d44" checked />
          </view> -->
          <view class="switch">
            <text>屏幕常量</text>
            <switch
              color="#fc3d44"
              :checked="options.keepScreenOn"
              @change="options.keepScreenOn = $event.detail.value"
            />
          </view>
        </view>

        <view class="theme" v-show="crurentPage === '皮肤设置'">
          <view class="title">选择皮肤</view>
          <view class="theme-content">
            <view
              v-for="value in themeList"
              :key="value.id"
              @click="changeTheme(value)"
              :style="{
                color: options.theme === value.text ? '#fc3d44' : ''
              }"
            >
              <image class="image" :src="value.url" mode="aspectFill"></image>
              <view class="theme-text">{{ value.text }}</view>
            </view>
          </view>
        </view>

        <view class="show" v-show="crurentPage === '显示设置'">
          <view class="title">显示期数</view>
          <view class="select-1">
            <view @click="changePeriod(40)" :class="{ 'btn-active': options.showPeriod === 40 }">
              40期
            </view>
            <view @click="changePeriod(60)" :class="{ 'btn-active': options.showPeriod === 60 }"
              >60期</view
            >
            <view @click="changePeriod(80)" :class="{ 'btn-active': options.showPeriod === 80 }"
              >80期</view
            >
            <view @click="changePeriod(100)" :class="{ 'btn-active': options.showPeriod === 100 }"
              >100期</view
            >
          </view>
          <view class="switch">
            <text>显示右下角'设置'</text>
            <switch
              color="#fc3d44"
              :checked="options.showSetting"
              @change="options.showSetting = $event.detail.value"
            />
          </view>
        </view>

        <view class="multi" v-show="crurentPage === '智能多笔'">
          <view class="title">智能曲线设置</view>
          <view class="switch">
            <view>
              <uni-icons
                custom-prefix="iconfont"
                type="icon-shizi"
                size="17"
                color="#fc3d44"
              ></uni-icons>
              <text> 号码连接拖拽点</text>
            </view>
            <switch
              color="#fc3d44"
              :disabled="options.count !== 1"
              :checked="options.dragPoint"
              @change="options.dragPoint = $event.detail.value"
            />
          </view>
          <view class="select select-1">
            <text>笔数</text>
            <view
              class="item"
              v-for="value in 5"
              :key="value"
              @click="options.count = value"
              :class="{ 'btn-active': options.count === value }"
              >{{ value }}笔</view
            >
          </view>
          <view class="select select-2">
            <text>间隔</text>
            <view
              class="item"
              :style="{
                color: options.count === 1 ? '#cecece' : '',
                pointerEvents: options.count === 1 ? 'none' : ''
              }"
              v-for="value in 5"
              :key="value"
              @click="options.distance = value - 1"
              :class="{ 'btn-active': options.distance === value - 1 }"
              >{{ value - 1 }}期</view
            >
          </view>
          <view class="select select-3">
            <text>颜色</text>
            <view
              class="item"
              :style="{
                color: options.count === 1 ? '#cecece' : '',
                pointerEvents: options.count === 1 ? 'none' : ''
              }"
              @click="options.colorType = 'single'"
              :class="{ 'btn-active': options.colorType === 'single' }"
              >单色笔</view
            >
            <view
              class="item"
              :style="{
                color: options.count === 1 ? '#cecece' : '',
                pointerEvents: options.count === 1 ? 'none' : ''
              }"
              @click="options.colorType = 'multi'"
              :class="{ 'btn-active': options.colorType === 'multi' }"
              >多色笔</view
            >
          </view>
          <view class="select select-4">
            <text>线形</text>
            <view
              class="item"
              @click="options.lineType = 'straight'"
              :class="{ 'btn-active': options.lineType === 'straight' }"
              >直线</view
            >
            <view
              class="item"
              @click="options.lineType = 'curveUp'"
              :class="{ 'btn-active': options.lineType === 'curveUp' }"
              >上曲线</view
            >
            <view
              class="item"
              @click="options.lineType = 'curveDown'"
              :class="{ 'btn-active': options.lineType === 'curveDown' }"
              >下曲线</view
            >
          </view>
        </view>
      </view>
    </view>
  </uni-popup>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useDrawLineSettingStore } from '@/stores/drawLine.js'

const settingPopup = ref(null)

const crurentPage = ref('通用设置')

const styleMap = [
  { isSolid: false, isRound: false },
  { isSolid: false, isRound: true },
  { isSolid: true, isRound: false },
  { isSolid: true, isRound: true }
]

// const themeList = ['鸿运', '护眼', '怀旧', '金黄', '金玉', '经典', '护眼', '护眼', '护眼', '其他']
const themeList = [
  {
    text: '经典',
    url: '/static/images/draw-line/jingdian.jpg'
  },
  {
    text: '护眼',
    url: '/static/images/draw-line/huyan.jpg'
  },
  {
    text: '夜间',
    url: '/static/images/draw-line/yejian.jpg'
  },
  {
    text: '怀旧',
    url: '/static/images/draw-line/huaijiu.jpg'
  },
  {
    text: '鸿运',
    url: '/static/images/draw-line/hongyun.jpg'
  },
  {
    text: '金玉',
    url: '/static/images/draw-line/jinyu.jpg'
  },
  {
    text: '素棕',
    url: '/static/images/draw-line/suzong.jpg'
  },
  {
    text: '金黄',
    url: '/static/images/draw-line/jinhuang.jpg'
  },
  {
    text: '浅蓝',
    url: '/static/images/draw-line/qianlan.jpg'
  },
  {
    text: '其他',
    url: '/static/images/draw-line/other.jpg'
  }
]

const changeTheme = (value) => {
  options.theme = value.text
}

const drawLineSettingStore = useDrawLineSettingStore()
const options = drawLineSettingStore.options

const open = defineModel()

watch(open, (newVal) => {
  if (newVal) settingPopup.value.open()
})

const props = defineProps(['record'])

// 切换期数
const changePeriod = (value) => {
  if (!props.record?.length) {
    options.showPeriod = value
  } else {
    uni.showModal({
      title: '提示',
      content: '切换期数会清空当前记录，是否继续？',
      success: (res) => {
        if (res.confirm) {
          options.showPeriod = value
          props.record.splice(0, props.record.length)
        }
      }
    })
  }
}
</script>

<style lang="scss" scoped>
$background-color: #f6f6f6;
$background-color-active: #fc3d44;

.drawer {
  width: 100vw;
  display: flex;
  background-color: #fff;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
  font-size: 28rpx;
  view {
    box-sizing: border-box;
  }
  .title {
    font-weight: 600;
  }
  .switch {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  .btn-active {
    color: #fff;
    background-color: $background-color-active !important;
  }
}

.drawer-header {
  width: 200rpx;
  background-color: $background-color;
  font-weight: 600;
  .drawer-header-title {
    height: 100rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    > view {
      line-height: 30rpx;
      padding: 0 10rpx;
      border-left: 5rpx solid $background-color;
    }
  }
  .drawer-header-title-active {
    color: $background-color-active;
    background-color: #fff;
    > view {
      border-left: 5rpx solid $background-color-active;
    }
  }
}
.drawer-content {
  flex: 1;
  height: 1000rpx;
  padding: 30rpx;
  > view {
    > view {
      margin-bottom: 30rpx;
    }
  }
  .common {
    .tip {
      color: #dcdcdc;
      font-size: 25rpx;
      font-weight: 400;
    }
    .select-1,
    .select-2 {
      display: flex;
      justify-content: space-between;
      > view {
        background-color: $background-color;
        width: 150rpx;
        height: 62rpx;
        line-height: 62rpx;
        border-radius: 10rpx;
        text-align: center;
      }
    }
    .select-3 {
      display: flex;
      justify-content: space-between;
      > view {
        background-color: $background-color;
        width: 100rpx;
        height: 60rpx;
        border-radius: 10rpx;
      }
      %number-style {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        position: relative;
        > view:nth-child(-n + 2) {
          width: 35rpx;
          height: 35rpx;
          border: 5rpx solid $background-color-active;
          font-size: 25rpx;
          line-height: 35rpx - 10rpx;
          text-align: center;
          position: relative;
          z-index: 2;
          background-color: $background-color;
        }
        > view:nth-child(3) {
          position: absolute;
          width: 50%;
          height: 3rpx;
          top: 30rpx;
          background-color: $background-color-active;
        }
      }
      > view:nth-child(1) {
        @extend %number-style;
        color: $background-color-active;
      }
      > view:nth-child(2) {
        @extend %number-style;
        color: $background-color-active;
        > view:nth-child(-n + 2) {
          border-radius: 50%;
        }
      }
      > view:nth-child(3) {
        @extend %number-style;
        color: #fff;
        > view:nth-child(-n + 2) {
          width: 40rpx;
          height: 40rpx;
          border: 5rpx solid $background-color;
          background-color: $background-color-active;
          line-height: 40rpx - 10rpx;
        }
      }
      > view:nth-child(4) {
        @extend %number-style;
        color: #fff;
        > view:nth-child(-n + 2) {
          width: 40rpx;
          height: 40rpx;
          border: 5rpx solid #fff;
          background-color: $background-color-active;
          border-radius: 50%;
          line-height: 40rpx - 10rpx;
        }
      }
      .btn-active {
        background-color: #fbe7e8 !important;
      }
    }
  }
  .theme {
    .theme-content {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 50rpx 0;
      > view {
        width: 150rpx;
        border-radius: 10rpx;
        .image {
          width: 150rpx;
          height: 100rpx !important;
          border-radius: 10rpx;
        }
        .theme-text {
          width: 100%;
          height: 70rpx;
          line-height: 70rpx;
          text-align: center;
          font-size: 30rpx;
        }
      }
    }
  }
  .show {
    .select-1 {
      display: flex;
      justify-content: space-between;
      > view {
        background-color: $background-color;
        width: 115rpx;
        height: 62rpx;
        line-height: 62rpx;
        border-radius: 10rpx;
        text-align: center;
      }
    }
  }
  .multi {
    .select {
      display: flex;
      text {
        width: 80rpx;
        text-align: center;
        margin-right: 30rpx;
        line-height: 62rpx;
      }
      .item {
        background-color: $background-color;
        height: 62rpx;
        border-radius: 10rpx;
        line-height: 62rpx;
        text-align: center;
      }
      &.select-1,
      &.select-2 {
        .item {
          width: 75rpx;
        }
      }
      &.select-3 {
        .item {
          width: 150rpx;
        }
      }
      &.select-4 {
        .item {
          width: 110rpx;
        }
      }
    }
    .switch {
      margin-left: 11rpx;
      justify-content: space-between;
    }
  }
}
</style>
