<template>
	<view class="wrapper">
		<view class="navbar">
			<!-- 返回按钮 -->
			<view class="navbar-left" @click="goBack">
			   <uni-icons type="left" size="30"></uni-icons>
			 </view>
			 <!-- 标题 -->
			 <view class="navbar-title">{{ videoData.title }}</view>
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
      
      <!-- 购买按钮（如果有价格） -->
      <view class="buy-overlay" v-if="videoData.price && videoData.price > 0" @click="handleBuyClick">
        <view class="buy-button">
          <text class="buy-text">¥{{ videoData.price }}购买</text>
        </view>
      </view>
    </view>
    
    <!-- 打赏和点赞区域 -->
    <view class="interaction-bar">
      <view class="reward-interaction" @click="goToRewardPage">
        <uni-icons type="gift-filled" size="20" color="#FF9500"></uni-icons>
        <text class="interaction-text">打赏 0</text>
      </view>
      <view class="like-interaction" :class="{ 'liked': videoData.isLiked }" @click="toggleLike">
        <uni-icons :type="videoData.isLiked ? 'heart-filled' : 'heart'" size="20" :color="videoData.isLiked ? '#ff4757' : '#FF9500'"></uni-icons>
        <text class="interaction-text">点赞 {{ videoData.likeCount }}</text>
      </view>
    </view>
    
    <!-- 作者和视频信息 -->
    <view class="video-info-card">
      <view class="info-header">
        <image :src="getAvatarUrl(userInfo.himg)" class="author-avatar"></image>
        <view class="author-info">
          <text class="author-name">{{ userInfo.uname }}出品</text>
          <text class="video-count">视频</text>
        </view>
        <view class="header-actions">
          <button class="teacher-btn">讲师主页</button>
          <button class="follow-btn">+ 关注</button>
        </view>
      </view>
      
      <view class="video-title-section">
        <view class="price-tag" v-if="videoData.price && videoData.price > 0">
          <text>¥{{ videoData.price }}</text>
        </view>
        <text class="video-title-text">{{ videoData.title }}</text>
      </view>
    </view>
    
    <!-- 底部按钮 -->
    <view class="bottom-bar">
      <view class="bottom-left">
        <view class="icon-item">
          <uni-icons type="home" size="24" color="#FFD700"></uni-icons>
          <text class="icon-label">首页</text>
        </view>
       
      </view>
      <button class="bottom-buy-btn" @click="handleBuyClick">
        {{ isFreeVideo ? '开始学习' : '点击购买' }}
      </button>
    </view>
	  </view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
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

// 计算是否为免费视频
const isFreeVideo = computed(() => {
  return !videoData.value.flag || videoData.value.price === 0
})
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

//导航栏
const goBack = () => {
	uni.navigateBack({
		delta: 1
	});
};

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

// 处理购买按钮点击
const handleBuyClick = async () => {
  if (!videoData.value.flag || videoData.value.price === 0) {
    // 免费视频直接播放
    if (videoContext.value) {
      videoContext.value.play()
      isPlaying.value = true
      showPlayButton.value = false
    }
  } else {
    // 付费视频，跳转到支付
    await payForVideo()
  }
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
.wrapper {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.navbar {
  height: 44px;
  background-color: #1677ff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between; 
  padding: 0 16px;
  margin-bottom: 3rpx;
  position: relative;
  z-index: 10;
}

.navbar-left {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  z-index: 11;
}

.navbar-left .uni-icons {
  color: #fff !important;
  font-size: 22px !important;
}

.navbar-title {
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: none;
}

.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
  background-color: #f5f5f5;
}

/* 视频容器样式 */
.video-container {
  position: relative;
  width: 100%;
  height: 600rpx;
  border-radius: 0;
  overflow: hidden;
  background-color: #000;
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

/* 购买按钮遮罩 */
.buy-overlay {
  position: absolute;
  bottom: 30rpx;
  right: 30rpx;
  z-index: 11;
}

.buy-button {
  background-color: #FF9500;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}

.buy-text {
  color: #fff;
  font-size: 26rpx;
  font-weight: 600;
}

/* 打赏和点赞交互栏 */
.interaction-bar {
  display: flex;
  padding: 20rpx 0;
  background-color: #fff;
  gap: 40rpx;
  justify-content: center;
}

.reward-interaction,
.like-interaction {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.interaction-text {
  color: #FF9500;
  font-size: 26rpx;
}

.like-interaction.liked .interaction-text {
  color: #ff4757;
}

/* 视频信息卡片 */
.video-info-card {
  background-color: #fff;
  padding: 30rpx;
}

.info-header {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.author-avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.author-info {
  flex: 1;
}

.author-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #333;
  display: block;
}

.video-count {
  font-size: 24rpx;
  color: #999;
}

.header-actions {
  display: flex;
  gap: 20rpx;
}

.teacher-btn,
.follow-btn {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
  border-radius: 8rpx;
}

.teacher-btn {
  background-color: transparent;
  border: 1rpx solid #FF9500;
  color: #FF9500;
}

.follow-btn {
  background-color: #FF9500;
  color: #fff;
  border: none;
}

/* 视频标题区域 */
.video-title-section {
  display: flex;
  align-items: flex-start;
  gap: 20rpx;
}

.price-tag {
  background-color: #ff4757;
  padding: 6rpx 12rpx;
  border-radius: 4rpx;
  color: #fff;
  font-size: 24rpx;
  font-weight: 600;
}

.video-title-text {
  flex: 1;
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  line-height: 1.5;
}

/* 底部购买栏 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  background-color: #fff;
  padding: 20rpx;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.bottom-left {
  display: flex;
  gap: 40rpx;
}

.icon-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4rpx;
}

.icon-label {
  font-size: 20rpx;
  color: #666;
}

.bottom-buy-btn {
  flex: 1;
  background-color: #FF9500;
  color: #fff;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: 600;
  margin-left: 40rpx;
}
</style>
