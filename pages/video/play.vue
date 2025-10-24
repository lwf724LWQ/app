<template>
	<view class="video-info">
	  <text class="video-title">{{ videoData.title }}</text>
	</view>
  <view class="container">
    <!-- 视频播放器容器 -->
    <view class="video-container">
      <video 
        :src="videoData.src" 
        :controls="isPlaying" 
        :autoplay="false"
        object-fit="cover"
        class="video-player"
        id="videoPlayer"
        @play="onVideoPlay"
        @pause="onVideoPause"
      ></video>
      
      <!-- 播放按钮遮罩层 -->
      <view class="play-overlay" v-if="showPlayButton" @click="playVideo">
        <view class="play-button">
          <uni-icons type="play-filled" size="60" color="#fff"></uni-icons>
        </view>
      </view>
    </view>
    
    <!-- 视频信息 -->
    <view class="author-info">
      <view class="author-avatar">
        <!-- 修改头像路径 -->
        <image :src="getAvatarUrl(userInfo.himg)" class="avatar"></image>
        <view class="v-badge">V</view>
      </view>
      <view class="author-details">
        <text class="author-name">{{userInfo.uname}}</text>
        <!-- <text class="author-location"></text> -->
      </view>
    </view>
    
    <!-- 操作按钮区域（点赞和打赏在同一行） -->
    <view class="action-bar">
      <!-- 点赞按钮 -->
      <view class="like-section">
        <button class="like-btn" :class="{ 'liked': videoData.isLiked }" @click="toggleLike">
          <uni-icons :type="videoData.isLiked ? 'heart-filled' : 'heart'" size="24" :color="videoData.isLiked ? '#ff4757' : '#666'"></uni-icons>
          <text class="like-count">{{ videoData.likeCount }}</text>
        </button>
      </view>
      
      <!-- 打赏按钮 -->
      <view class="reward-section">
        <button class="reward-btn" @click="goToRewardPage">
          <uni-icons type="gift-filled" size="24" color="#aa0000"></uni-icons>
          <text class="reward-text">打赏</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { apiGetLikelist, apiGetIsLike,apiCheckVideoPayment,apiUserimg } from '@/api/apis';
import { getToken, getAccount } from '@/utils/request.js';
import { useVideoStore } from '@/stores/video.js'

// 初始化仓库
const videoStore = useVideoStore()

// 视频数据
const videoData = ref({
  id: '',
  title: '',
  src: '',
  account: '',
  likeCount: 0,
  isLiked: false
});

// 添加响应式数据
const showPlayButton = ref(true) // 控制播放按钮显示
const isPlaying = ref(false) // 视频播放状态
const videoContext = ref(null) // 视频上下文
//用户头像，名字接口数据接收
const userInfo = ref({
  uname: '',
  himg: ''
});

// 获取头像的方法
const getAvatarUrl = (himg) => {
  if (!himg) return ''; // 如果没有头像，返回空字符串
  return `http://video.caimizm.com/himg/${himg}`;
};

// 获取路由参数
onLoad(async (options) => {
  if (options.id) {
    // 从 Pinia store 获取视频数据
    const currentVideo = videoStore.getCurrentVideo
    if (currentVideo && currentVideo.id === options.id) {
      // 使用 store 中的视频数据
      videoData.value = {
        id: currentVideo.id,
        title: currentVideo.title,
        src: currentVideo.src,
        account: currentVideo.account,
        likeCount: currentVideo.likeCount || 0,
        isLiked: currentVideo.isLiked || false,
        flag: currentVideo.flag,
        price: currentVideo.price,
		
      }
      // 调用apiUserimg获取用户信息
      await getUserInfo(currentVideo.account);
    } 
  }
})

// 在onMounted中初始化视频上下文
onMounted(() => {
  // 创建视频上下文
  videoContext.value = uni.createVideoContext('videoPlayer')
})

// 获取用户信息
const getUserInfo = async (account) => {
  try {
    // 准备请求参数
    const params = {
      account: account
    };
    
    const headers = {};
    const token = getToken();
    if (token) {
      headers['Authorization'] = token;
    }
    
    // 调用apiUserimg接口
    const response = await apiUserimg(params, headers);
    
    if (response.code===200) {
      // 更新用户信息
      userInfo.value = {
        uname: response.data.uname,
        himg: response.data.himg
      };
    } else {
      console.error('获取用户信息失败:', response.message);
      // 使用默认信息
      userInfo.value = {
        uname: account,
        himg: ''
      };
    }
  } catch (error) {
    console.error('获取用户信息异常:', error);
    // 使用默认信息
    userInfo.value = {
      uname: account,
      himg: ''
    };
  }
};

// 播放视频方法
const playVideo = async () => {
  // 检查是否登录
  const token = getToken();
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 1500);
    return;
  }
   // 判断是否为免费视频
    if (!videoData.value.flag || videoData.value.price === 0) {
      // 免费视频直接播放
      if (videoContext.value) {
        videoContext.value.play()
        isPlaying.value = true
        showPlayButton.value = false
      }
      return;
    }
  // 检查视频付费状态
  try {
    // 调用付费检查API
    const paymentCheck = await apiCheckVideoPayment({
      videoId: videoData.value.id,
      account: getAccount()
    });
   
      if (paymentCheck.data) {
        // 用户已付费，播放视频
        if (videoContext.value) {
          videoContext.value.play()
          isPlaying.value = true
          showPlayButton.value = false
        }
      } else {
        // 用户未付费，显示付费提示
        uni.showModal({
          title: '付费视频',
          content: `观看此视频需要支付${videoData.value.price}金币`,
          confirmText: '立即支付',  
          cancelText: '取消',
          success: async (res) => {
            if (res.confirm) {
              // 这里调用支付接口
              await payForVideo();
            }
          }
        });
      }
    
  } catch (error) {
    uni.showToast({
      title: error.message || '查询失败',
      icon: 'none'
    });
  }
};

const payForVideo = async () => {
  // 准备支付数据
  const paymentData = {
    info: `视频: ${videoData.value.title}`,
    amount: videoData.value.price,
    type: 3, // 视频付费类型
    account: getAccount(),
    payType: 0, // 默认微信支付
    channel: 0 ,// 微信小程序
	videoId: videoData.value.id // 添加视频ID参数
  };
  
  // 跳转到支付页面
  uni.navigateTo({
	   url: `/pages/video/payment?${objectToQueryString(paymentData)}`
  });
};

// 将对象转换为查询字符串
const objectToQueryString = (obj) => {
  return Object.keys(obj).map(key => {
    return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`;
  }).join('&');
};

// 视频开始播放事件
const onVideoPlay = () => {
  isPlaying.value = true
  showPlayButton.value = false
}

// 视频暂停事件
const onVideoPause = () => {
  isPlaying.value = false
  showPlayButton.value = true
}

// 跳转到打赏页面
const goToRewardPage = () => {
  // 检查登录状态
  const token = getToken();
  if (!token) {
    uni.showToast({
      title: '请先登录',
      icon: 'none'
    });
    setTimeout(() => {
      uni.navigateTo({
        url: '/pages/login/login'
      });
    }, 1500);
    return;
  }
  
  // 跳转到打赏页面，传递视频信息
  uni.navigateTo({
     url: `/pages/video/reward?videoId=${videoData.value.id}&author=${encodeURIComponent(videoData.value.account)}&title=${encodeURIComponent(videoData.value.title)}&authorAvatar=${encodeURIComponent(userInfo.value.himg)}&authorName=${encodeURIComponent(userInfo.value.uname)}`
  });
};

// 点赞功能
const toggleLike = async () => {
  try {
    // 保存原始状态，以便在请求失败时恢复
    const originalIsLiked = videoData.value.isLiked;
    const originalLikeCount = videoData.value.likeCount;
    
    // 立即更新UI，提供更好的用户体验
    videoData.value.isLiked = !videoData.value.isLiked;
    videoData.value.likeCount = videoData.value.isLiked ? 
      videoData.value.likeCount + 1 : 
      videoData.value.likeCount - 1;
    
    // 调用点赞API
    const response = await apiGetIsLike({
      id: videoData.value.id,
      account: getAccount(),
      isLiked: videoData.value.isLiked
    });
    
    console.log('点赞操作成功');
    
    // 获取点赞列表（可选）
    const likeList = await apiGetLikelist(getAccount());
    console.log(likeList);
  } catch (error) {
    console.error('点赞操作失败:', error);
    
    // 恢复原始状态
    videoData.value.isLiked = originalIsLiked;
    videoData.value.likeCount = originalLikeCount;
    
    uni.showToast({
      title: '操作失败，请重试',
      icon: 'none'
    });
  }
};
</script>

<style scoped>
/* 作者信息 */
.author-info {
  margin-top: 30rpx;
  padding: 30rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.author-avatar {
  position: relative;
  margin-right: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.v-badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 24rpx;
  height: 24rpx;
  background-color: #ffd700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16rpx;
  font-weight: bold;
  color: #fff;
}

.author-details {
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 8rpx;
}

.author-location {
  font-size: 24rpx;
  color: #666;
}

/* 打赏金额选项 */
.reward-options {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
  display: block;
}

.amount-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
}

.amount-option {
  flex: 1;
  min-width: 150rpx;
  padding: 20rpx;
  border: 2rpx solid #3498db;
  border-radius: 16rpx;
  text-align: center;
  background-color: #f8f8f8;
  transition: all 0.3s ease;
}

.amount-option.active {
  background-color: #3498db;
  color: #fff;
  transform: translateY(-5rpx);
  box-shadow: 0 4rpx 12rpx rgba(52, 152, 219, 0.2);
}

.amount-text {
  font-size: 28rpx;
  font-weight: bold;
}
	

.container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* 视频容器样式 */
.video-container {
  position: relative;
  width: 100%;
  height: 600rpx;
  border-radius: 16rpx;
  overflow: hidden;
  background-color: #000;
  margin-bottom: 20rpx;
}

.video-player {
  width: 100%;
  height: 100%;
}

/* 播放按钮遮罩层 */
.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.play-button {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.play-button:active {
  transform: scale(0.9);
}

.video-info {
  margin-top: 30rpx;
  padding: 20rpx;
  background-color: #fff;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
}

.video-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333;
  display: block;
  margin-bottom: 10rpx;
}

.video-author {
  font-size: 28rpx;
  color: #666;
}

/* 操作按钮区域（点赞和打赏在同一行） */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 30rpx;
  padding: 0 20rpx;
}

/* 点赞区域 */
.like-section {
  flex: 1;
  margin-right: 20rpx;
}

.like-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1rpx solid #e0e0e0;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #666;
  transition: all 0.3s ease;
}

.like-btn.liked {
  color: #ff4757;
  border-color: #ff4757;
  background-color: rgba(255, 71, 87, 0.1);
}

.like-count {
  margin-left: 10rpx;
  font-weight: 500;
}

/* 打赏区域 */
.reward-section {
  flex: 1;
}

.reward-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #ff9500, #ff7300);
  border: none;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  color: #fff;
  box-shadow: 0 4rpx 12rpx rgba(255, 149, 0, 0.3);
  transition: all 0.3s ease;
}

.reward-btn:active {
  transform: scale(0.95);
  box-shadow: 0 2rpx 8rpx rgba(255, 149, 0, 0.2);
}

.reward-text {
  margin-left: 10rpx;
  font-weight: 500;
}
</style>