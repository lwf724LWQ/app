<template>
  <view class="navbar">
    <!-- 返回按钮 -->
    <view class="navbar-left" @click="goBack">
      <uni-icons type="left" size="30"></uni-icons>
    </view>
    <!-- 标题 -->
    <!--    <view class="navbar-title">{{title}}</view>-->
    <view class="navbar-title">
      <view class="container">
        <!-- 图标容器 -->
        <view class="icons-row">
          <view class="icon-item" @click="callParentUndo">
            <uni-icons type="undo" size="30" color="#333"></uni-icons>
            <text class="icon-text">撤销</text>
          </view>
          <view class="icon-item" @click="callParentSubmit">
            <uni-icons type="trash" size="30" color="#333"></uni-icons>
            <text class="icon-text">清除</text>
          </view>
          <view class="icon-item"  @click="callParentReset">
            <uni-icons type="download" size="30" color="#333"></uni-icons>
            <text class="icon-text">保存</text>
          </view>
          <view class="icon-item"  @click="callParentShare">
            <uni-icons type="paperplane" size="30" color="#333"></uni-icons>
            <text class="icon-text">分享</text>
          </view>
        </view>
      </view>

    </view>

    <!-- 右侧菜单按钮 -->
    <view class="navbar-right">
      <!--      <uni-icons type="left" size="30"></uni-icons>-->
    </view>
  </view>
</template>

<script setup>
import { ref, defineEmits } from 'vue';

import { defineProps } from 'vue';

// 接收父组件传递的函数（通过 props 定义）
const props = defineProps({
  title:{
    type:String,
    default:"壁纸"
  },
  onSubmit: {
    type: Function,
    required: true // 要求父组件必须传递该函数
  }

});
const emit = defineEmits(['child-event','share-event']);

// 子组件中调用父组件的方法
const callParentSubmit = () => {
  // 可以传递参数给父组件
  props.onSubmit({ username: 'test', password: '123' });
};

const callParentReset = () => {
  emit('child-event',{action:'submit',data:'test'});
};
const callParentShare=() => {
  emit('share-event',{action:'share',data:'test'});
}
const callParentUndo=() => {
  emit('child-event',{action:'undo',data:'test'});
};
// 返回上一页
const goBack = () => {
  // 直接使用全局API，不需要导入
  uni.navigateBack({
    delta: 1 // 返回的页面数
  });
};
</script>

<style lang="scss" scoped>
.container {
  padding: 0;
}

/* 图标行容器，一行展示4个 */
.icons-row {
  display: flex;
  justify-content: space-around; /* 均匀分布 */
  align-items: center;
  width: 100%;
  padding: 10rpx 0;
}

/* 每个图标项：图标在上，文字在下 */
.icon-item {
  display: flex;
  flex-direction: column; /* 垂直排列 */
  align-items: center; /* 水平居中 */
  justify-content: center;
  flex: 1; /* 平均分配宽度 */
}

/* 图标下方的文字 */
.icon-text {
  font-size: 24rpx; /* 小一点的字体 */
  color: #666;
  margin-top: 0; /* 图标和文字之间的间距 */
  text-align: center;
}
/* 自定义导航栏 */
.navbar {
  height: 44px;
  background-color: #1677ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 11;

  position: fixed;
  top:0;
  left:0;
  width: 100%;
}

.navbar-left {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

}
.uni-icons{
  color: #fff!important;
  font-size: 22px!important;
}
.icon-text{
  color: #fff!important;

}
.back-icon {
  font-size: 20px;
  font-weight: bold;
}

.navbar-title {
  font-size: 18px;
  font-weight: 500;
  flex: 1;
  text-align: center;
}

.navbar-right {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
</style>