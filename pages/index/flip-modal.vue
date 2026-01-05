<template>
  <view class="flip-modal-container" v-if="show" @click="closeModal">
    <view class="flip-modal-content" @click.stop="toggleFlip">
      <view class="flip-card" :class="{ 'flipped': isFlipped }">
        <view class="flip-card-front">
          <view class="modal-body">
            点击查看今日语录
          </view>
        </view>
        <view class="flip-card-back">
          <view class="back-content">
            {{text.content}}
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
	import mockData from "./mock.js"
export default {
  name: 'FlipModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '提示'
    },
    confirmText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    }
  },
  data() {
	  
	  const t = mockData['quote'][Math.round(Math.random()*10)]
    return {
      isFlipped: false,
	  text:t
    }
  },
  methods: {
	  closeModal() {
		  if(this.isFlipped === false){
			  this.toggleFlip()
			  
			  return
		  }
	        this.$emit('update:show', false)
			uni.showTabBar()
	      },
    toggleFlip() {
      this.isFlipped = !this.isFlipped
	  
	  
    }
  },
  created() {
  	uni.hideTabBar()
  }
}
</script>

<style lang="scss" scoped>
.flip-modal-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .flip-modal-content {
    width: 600rpx;
    height: 400rpx;
    perspective: 1000rpx;

    .flip-card {
      position: relative;
      width: 100%;
      height: 100%;
      text-align: center;
      transition: transform 0.6s;
	  transform: rotateY(0deg);
      transform-style: preserve-3d;

      &.flipped {
        transform: rotateY(180deg);
      }

      .flip-card-front,
      .flip-card-back {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 20rpx;
        background-color: #fff;
        overflow: hidden;
        box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.2);
      }

      .flip-card-back {
        transform: rotateY(180deg);
        background-color: #f0f8ff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .back-content {
			font-size: 34rpx;
			color: #666;
			
			padding: 0 30rpx;
			box-sizing: border-box;
        }
      }
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 30rpx 30rpx 20rpx;
      border-bottom: 1rpx solid #eee;

      .modal-title {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }

      .close-btn {
        font-size: 40rpx;
        color: #999;
        width: 50rpx;
        height: 50rpx;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 50%;
        transition: all 0.3s;

        &:active {
          background-color: #f0f0f0;
          color: #666;
        }
      }
    }

    .modal-body {
      flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		
		padding: 0 30rpx;
		box-sizing: border-box;
    }

  }
}
</style>