<template>
  <scroll-view
    scroll-y
    :scrollTop="scrollTop"
    class="table"
    :class="{
      'type-1': type === '排列五',
      'type-2': type === '福彩3D',
      'type-3': type === '七星彩'
    }"
  >
    <view
      class="row"
      v-for="item in data"
      :key="item.issueno"
      :class="{ 'text-active': item.issueno === period }"
    >
      <view class="column-1">
        <view class="issueno">{{ item.issueno }}</view>
        <view class="date">{{ getDate(item.opendate) }}</view>
      </view>
      <view class="column-2">{{
        item.number.slice(0, 4).reduce((a, b) => Number(a) + Number(b), 0)
      }}</view>
      <view class="column-3">
        <view class="column-3-item" v-for="number in item.number.slice(0, 4)" :key="number">{{
          number
        }}</view>
      </view>
      <view class="column-4" v-for="value in item.number.slice(4, 8)" :key="value">{{
        value
      }}</view>
    </view>
    <view class="row" v-for="val in 4" :key="val">
      <view class="column-1">
        <view class="issueno"></view>
        <view class="date"></view>
      </view>
      <view class="column-2"></view>
      <view class="column-3">
        <view
          class="column-3-item"
          v-for="number in type === '福彩3D' ? 3 : 4"
          :key="number"
        ></view>
      </view>
      <view
        class="column-4"
        v-if="type !== '福彩3D'"
        v-for="value in type === '排列五' ? 1 : 3"
        :key="value"
      ></view>
    </view>
  </scroll-view>
  <view class="nav">
    <uni-icons type="left" size="20" @click="back"></uni-icons>
    <view class="btn" @click="goDrawLine">去画规</view>
  </view>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { apiTicketQuery } from '@/api/apis.js'
import mock from '/pages/juWang/peng-liao/drawLine/mock.json'
import { onLoad } from '@dcloudio/uni-app'

const data = ref([])
const getData = async () => {
  try {
    uni.showLoading({ title: '加载中...' })
    const res = await apiTicketQuery({ tname: type.value, page: '1', limit: 40 })

    data.value = res.data.records.reverse()
    data.value.forEach((item) => {
      item.number = item.number?.split(' ')
      if (type.value === '七星彩') item.number.push(item.refernumber)
    })
  } finally {
    uni.hideLoading()
  }

  // data.value = mock.data.records
  // data.value.forEach((item) => {
  //   item.number = item.number.split(' ').slice(0, 5)
  // })
}

// 格式化日期
const getDate = (date) => {
  const week = ['日', '一', '二', '三', '四', '五', '六']
  const day = new Date(date).getDay()
  return date.replace(/-/g, '/').slice(-5) + ' ' + week[day]
}

const type = ref('')
const period = ref('')
const scrollTop = ref(0)
onLoad(async (options) => {
  if (!options) return
  type.value = options.type
  period.value = options.period
  await getData()
  await nextTick()
  scrollTop.value = 9999
})

const back = () => {
  uni.navigateBack()
}
const goDrawLine = () => {
  uni.navigateTo({ url: '/pages/juWang/peng-liao/drawLine/drawLine?type=' + type.value })
}

const top = uni.getSystemInfoSync().safeAreaInsets.top

// #ifdef MP
const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
// #endif
</script>

<style lang="scss" scoped>
.text-active {
  color: #fe3a49;
}
$border-color: #f9a29f;
.table {
  width: 100%;
  color: #83c283;
  height: calc(100vh - v-bind('top + "px"'));
  padding-top: v-bind('top + "px"');
  > .row:nth-child(4n) {
    border-top: 5rpx solid $border-color;
  }
  .row {
    border-bottom: 1rpx solid $border-color;
    display: flex;
    .column-1 {
      border-right: 5rpx solid $border-color;
    }
    .column-2 {
      border-right: 5rpx solid $border-color;
    }
    .column-3 {
      border-right: 5rpx solid $border-color;
      .column-3-item {
        border-right: 1rpx solid $border-color;
      }
      > .column-3-item:nth-child(5) {
        border-right: none;
      }
    }
    .column-4 {
      border-right: 1rpx solid $border-color;
    }
  }
}
.nav {
  box-sizing: border-box;
  width: 750rpx;
  position: fixed;
  top: 0;
  background-color: #fff;
  border-bottom: 3rpx solid rgba($color: #000000, $alpha: 0.1);
  color: #333333;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30rpx;
  margin-top: v-bind('top + "px"');
  /* #ifndef MP */
  height: 100rpx;
  /* #endif */
  /* #ifdef MP */
  padding-top: v-bind('menuButtonInfo.height + "px"');
  height: calc(100rpx + v-bind('menuButtonInfo.height + "px"'));
  /* #endif */
}
.row {
  height: 110rpx;
  line-height: 110rpx;
  text-align: center;
  font-weight: 600;
  .column-1 {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    padding: 26rpx 0;
    .issueno {
      height: 28rpx;
      font-size: 28rpx;
      line-height: 28rpx;
    }
    .date {
      height: 24rpx;
      font-size: 24rpx;
      line-height: 24rpx;
    }
  }
  .column-2 {
    font-weight: 500;
  }
  .column-4 {
    font-size: 35rpx;
  }
  .column-3 {
    display: flex;
    font-size: 60rpx;
    .column-3-item {
      width: 25%;
    }
  }
}
.type-1 {
  .row {
    .column-1 {
      width: 160rpx;
    }
    .column-2,
    .column-4 {
      width: 90rpx;
    }
    .column-3 {
      width: 750rpx - 340rpx;
      .column-3-item {
        width: 25%;
      }
    }
  }
}
.type-2 {
  .row {
    .column-1 {
      width: 200rpx;
    }
    .column-2 {
      width: 100rpx;
    }
    .column-3 {
      width: 750rpx - 300rpx;
      border-right: none;
      .column-3-item {
        width: 33.4%;
      }
      > .column-3-item:nth-child(3) {
        border-right: none;
      }
    }
  }
}
.type-3 {
  .row {
    .column-1 {
      width: 140rpx;
    }
    .column-2,
    .column-4 {
      width: 58rpx;
    }
    .column-3 {
      width: 360rpx;
      .column-3-item {
        width: 25%;
      }
    }
  }
}
</style>
