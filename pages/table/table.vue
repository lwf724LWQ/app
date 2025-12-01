<template>
  <view class="table type-2">
    <view class="row" v-for="item in data" :key="item.issueno">
      <view class="column-1">{{ item.issueno }}</view>
      <view class="column-2">{{ item.number.reduce((a, b) => Number(a) + Number(b), 0) }}</view>
      <view class="column-3">
        <view
          class="column-3-item"
          v-for="number in item.number.slice(0, item.number.length - 1)"
          >{{ number }}</view
        >
      </view>
      <view class="column-4">{{ item.number[item.number.length - 1] }}</view>
      <view class="column-5">
        <view>{{ getWeek(item.opendate) }}</view>
        <view class="column-5-date">{{ item.opendate.replace(/-/g, '/').slice(2) }}</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import mock from '/pages/juWang/peng-liao/drawLine/mock.json'

const data = ref([])
const getData = async () => {
  const res = await uni.request({
    url: `http://caimi.s7.tunnelfrp.com/web/ticket/query?tname=排列五&page=1&limit=${40}`
  })
  data.value = res.data.data.records.reverse()
  data.value.forEach((item) => {
    item.number = item.number?.split(' ').slice(0, 3)
  })

  // data.value = mock.data.records
  // data.value.forEach((item) => {
  //   item.number = item.number.split(' ').slice(0, 5)
  // })
}
getData()

// 获取中文星期 2025/08/31
const getWeek = (date) => {
  const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const day = new Date(date).getDay()
  return week[day]
}
</script>

<style lang="scss" scoped>
.active {
  color: #fe3a49;
}
$border-color: #f9a29f;
.table {
  width: 100%;
  color: #83c283;
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
    .column-5 {
      border-right: 1rpx solid $border-color;
    }
  }
}
.row {
  height: 110rpx;
  line-height: 110rpx;
  text-align: center;
  font-weight: 600;
  .column-1,
  .column-5 {
    width: 120rpx;
  }
  .column-2,
  .column-4 {
    width: 60rpx;
  }
  .column-2 {
    font-size: 25rpx;
    font-weight: 500;
  }
  .column-4 {
    font-size: 35rpx;
  }
  .column-3 {
    display: flex;
    width: 750rpx - 360rpx;
    font-size: 60rpx;
    .column-3-item {
      width: 25%;
    }
  }
  .column-5 {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    font-size: 25rpx;
    line-height: 1;
    font-weight: 500;
    .column-5-date {
      font-size: 21rpx;
      font-weight: 400;
    }
  }
}
.type-1 {
  .row {
    .column-1,
    .column-5 {
      width: 120rpx;
    }
    .column-2,
    .column-4 {
      width: 60rpx;
    }
    .column-3 {
      .column-3-item {
        width: 25%;
      }
    }
  }
}
.type-2 {
  .row {
    .column-1,
    .column-5 {
      width: 200rpx;
    }
    .column-2,
    .column-4 {
      width: 130rpx;
    }
    .column-3 {
      .column-3-item {
        width: 50%;
      }
    }
  }
}
</style>
