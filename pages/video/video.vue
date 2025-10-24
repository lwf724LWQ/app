<template>
	<!-- 为了适配小程序顶部高度的盒子-->
	    <StatusBarPlaceholder></StatusBarPlaceholder>
	<!-- 图片 -->
	<image class='photo' src="@/static/video/swiper.png" mode=""></image>
	
	<!-- 下拉选择器和精彩回顾容器 -->
	<view class="header-container">
		<!-- 下拉选择器 -->
		<view class="picker-container">
		  <picker @change="onPickerChange" :value="pickerIndex" :range="pickerOptions">
		    <view class="picker">
		      <text class="picker-text">{{ pickerOptions[pickerIndex] }}</text>
		      <uni-icons type="down" size="16" color="#333"></uni-icons>
		    </view>
		  </picker>
		</view>
		
		<!-- 精彩回顾文本 -->
		<view class="review-text">
		  <text>精彩回顾</text>
		</view>
	</view>

	<!-- 功能图标区 -->
	<view class="area" v-if="currentTab === 'plw' || 0">
			<view class="title" v-for="(video, index) in videoList" :key="index">
				<text class="video-title">{{ video.title }}</text>
				<!-- 将 video 标签改为 img 标签 -->
				<img
					:src="video.imgurl" 
					class="video-image"
					@click="playVideo(video)"
					:class="{ 'paid-video': video.hasPaid, 'free-video': !video.flag }"
				/>
				
				<view class="video-info">
					<text class="video-price" v-if="video.flag && video.price > 0">
						{{ video.hasPaid ? '已付费' : `付费视频 ${video.price}金币` }}
					</text>
					<text class="video-free" v-else>免费视频</text>
				</view>
				<!-- <view class="like-section">
					<button class="like-btn" :class="{ 'liked': video.isLiked }" @click="toggleLike(video)">
						<text class="like-icon">{{ video.isLiked ? '❤️' : '👍' }}</text>
						<text class="like-count">{{ video.likeCount }}</text>
					</button>
				</view> -->
			</view>
		</view>
	<!-- 发布按钮 -->
	<view class="publish-btn" @click="gotoOss()">
	  <uni-icons type="plus" size="20" color="#fff"></uni-icons>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		apiGetVideo,
		apiGetLikelist,
		apiGetIsLike,
		apiCheckVideoPayment
	} from '../../api/apis';
	import {
		setToken,
		getToken,
		setAccount,
		getAccount
	} from '@/utils/request.js'; // 导入setToken，账号
	// 导入 Pinia store
		import { useVideoStore } from '@/stores/video.js'
		// 初始化 store
			const videoStore = useVideoStore()
	// 下拉选择器相关数据
	const pickerOptions = ref(['排列五', '排列三', '七星彩', '福彩3D']);
	const pickerIndex = ref(0);
	
	// 响应式数据
	const currentTab = ref('plw');
	const upcomingTab = ref('plw');
	const currentNav = ref('home');
	const plwNumbers = ref(['8', '6', '8', '5', '7']);
	const qxcNumbers = ref(['2', '0', '4', '9', '3', '8', '8']);
	const plwUpcomingIssue = ref('25214期');
	const qxcUpcomingIssue = ref('3225期');
	const upcomingAction = ref('follow');

	// 视频列表数据
	const videoList = ref([]);
	//点赞列表数据
	const likeList = ref([]);
	
	// 下拉选择器变化事件
	const onPickerChange = (e) => {
	  const index = e.detail.value;
	  pickerIndex.value = index;
	  
	  // 根据索引设置当前标签
	  switch(index) {
	    case 0:
	      currentTab.value = 'plw';
	      break;
	    case 1:
	      currentTab.value = 'pls';
	      break;
	    case 2:
	      currentTab.value = 'qxc';
	      break;
	    case 3:
	      currentTab.value = 'fc';
	      break;
	  }
	};

	// 方法
	const switchTab = (tab) => {
		currentTab.value = tab;
	};

	const switchUpcomingTab = (tab) => {
		upcomingTab.value = tab;
	};

	const switchUpcomingAction = (action) => {
		upcomingAction.value = action;
		console.log('切换到:', action);
	};

	const handleSwiperChange = (e) => {
		currentTab.value = e.detail.current === 0 ? 'plw' : 'qxc';
	};

	const switchNav = (nav) => {
		currentNav.value = nav;
	};

	
	// 播放视频方法 - 新增付费检查
		const playVideo = async (video) => {
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
		  
		  // 将当前视频保存到 Pinia store
		  videoStore.setCurrentVideo(video)
		  
		  // 如果视频是免费的（price为0或flag为false），直接播放
		  if (!video.flag || video.price === 0) {
		    // 免费视频直接播放
		    uni.navigateTo({
		      url: `/pages/video/play?id=${video.id}`
		    });
		    return;
		  }
		  
		  // 检查视频是否收费
		  try {
		    // 查询用户是否已付费
		    const paymentCheck = await apiCheckVideoPayment({
		      videoId: video.id,
		      account: getAccount()
		    });
		    
		    if (paymentCheck.data) {
		      if (paymentCheck.data) {
		        // 用户已付费，直接播放
		        uni.navigateTo({
		          url: `/pages/video/play?id=${video.id}`
		        });
		      } else {
		        // 用户未付费，显示付费提示
		        uni.showModal({
		          title: '付费视频',
		          content: `观看此视频需要支付${video.price}金币`,
		          confirmText: '立即支付',
		          cancelText: '取消',
		          success: async (res) => {
		            if (res.confirm) {
		              // 这里调用支付接口
		              await payForVideo(video);
		            }
		          }
		        });
		      }
		    } else {
		       uni.navigateTo({
		      		          url: `/pages/video/play?id=${video.id}`
		      		        });
		    }
		  } catch (error) {
		    uni.showToast({
		      title: error.message || '查询失败',
		      icon: 'none'
		    });
		  }
		};
	
	// 支付视频方法
	const payForVideo = async (video) => {
	  try {
	    // 这里调用支付接口
	    // const paymentResult = await apiPayForVideo({...});
	    
	    // 支付成功后更新视频状态
	    video.hasPaid = true;
	    
	    uni.showToast({
	      title: '支付成功，开始播放',
	      icon: 'success'
	    });
	    
	    // 播放视频
	    uni.navigateTo({
	      url: `/pages/video/play?id=${video.id}`
	    });
	  } catch (error) {
	    uni.showToast({
	      title: '支付失败',
	      icon: 'none'
	    });
	  }
	};
	
	// 检查视频付费状态
	const checkVideoPaymentStatus = async () => {
	  try {
	    const account = getAccount();
	    if (!account) return;
	    
	    // 批量检查视频付费状态
	    const videoIds = videoList.value.map(video => video.id).filter(id => id);
	    if (videoIds.length === 0) return;
	    
	    const paymentStatus = await apiCheckVideoPayment({
	      videoIds: videoIds.join(','),
	      account: account
	    });
	    
	    if (paymentStatus.success) {
	      // 更新视频付费状态
	      videoList.value.forEach(video => {
	        const paidVideo = paymentStatus.data.find(item => item.videoId === video.id);
	        if (paidVideo) {
	          video.hasPaid = paidVideo.hasPaid;
	        }
	      });
	    }
	  } catch (error) {
	    console.error('检查视频付费状态失败:', error);
	  }
	};

	//是否点赞
	// 点赞功能
	const toggleLike = async (video) => {
		try {
			// 保存原始状态，以便在请求失败时恢复
			const originalIsLiked = video.isLiked;
			const originalLikeCount = video.likeCount;
			// console.log(originalLikeCount)

			// 立即更新UI，提供更好的用户体验
			video.isLiked = !video.isLiked;
			video.likeCount = video.isLiked ? video.likeCount + 1 : video.likeCount - 1;

			// 调用点赞API
			console.log(video,"====过来的数据=====")
			const response = await apiGetIsLike(video);
			console.log('点赞操作成功');
			
			const a = await apiGetLikelist(getAccount());
			
			console.log(a);
		} catch (error) {
			console.error('点赞操作失败:', error);

			// 恢复原始状态
			video.isLiked = originalIsLiked;
			video.likeCount = originalLikeCount;

			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			});
		}
	};
	

	const gotoOss=()=>{
	  uni.navigateTo({
	    url: `/pages/video/oss`
	  });
	};
	
	

	// 生命周期钩子
	onMounted(async () => {
		const videoinfo = reactive({
			page: 1,
			limit: 10
		});

		try {
			// 获取视频数据
			let Videoinfo = await apiGetVideo(videoinfo);
			console.log('API 返回数据:', Videoinfo);
			// 将 API 返回的数据映射到 videoList
			if (Videoinfo.data && Videoinfo.data.records && Array.isArray(Videoinfo.data.records)) {
				videoList.value = Videoinfo.data.records.map(item => ({
					title: item.title,
					src: "http://video.caimizm.com/" + item.url,
					id: item.id,
					account: item.account,
					likeCount: item.likeCount,
					createTime: item.createTime,
					// 如果价格为0，则视为免费视频
					flag: item.price > 0 ? item.flag : false,
					price: item.price,
					updateTime: item.updateTime,
					imgurl: "http://video.caimizm.com/" + item.vimg // 使用封面图片URL
				}));
				console.log('更新后的 videoList:', videoList.value);
			} else {
				console.warn('API 返回数据格式不符合预期:', Videoinfo);
			}
		} catch (error) {
			console.error('获取视频失败:', error);
			uni.showToast({
				title: '获取视频失败',
				icon: 'none'
			});
		}
	});
</script>

<style scoped>
	.video-free {
			font-size: 24rpx;
			color: #27ae60;
			font-weight: 500;
			padding: 4rpx 12rpx;
			background-color: #e8f6ef;
			border-radius: 12rpx;
		}
	.video-info {
			margin: 10rpx 0;
			text-align: center;
		}
	
		.video-price {
			font-size: 24rpx;
			color: #e74c3c;
			font-weight: 500;
			padding: 4rpx 12rpx;
			background-color: #ffeaea;
			border-radius: 12rpx;
		}
	.status-bar{
		height: ;
	}
	.photo {
		width: 100%;
		height: 80px;
	}
	
	/* 头部容器 - 水平排列 */
	.header-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15rpx 30rpx;
		background-color: #fff;
		border-bottom: 1rpx solid #e0e0e0;
	}
	
	/* 下拉选择器样式 */
	.picker-container {
		flex: 1;
		margin-right: 20rpx;
	}
	
	.picker {
		/* display: flex; */
		align-items: center;
		justify-content: space-between;
		padding: 15rpx 20rpx;
		border: 1rpx solid #3498db;
		border-radius: 8rpx;
		background-color: #f8fafc;
		box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.2);
	}
	
	.picker-text {
		font-size: 32rpx;
		color: #3498db;
		font-weight: 500;
	}
	
	/* 精彩回顾文本样式 */
	.review-text {
		width: 50%;
		align-items: center;
		justify-content: space-between;
		padding: 15rpx 20rpx;
		text-align: center;
		border: 1rpx solid #3498db;
		border-radius: 8rpx;
		background-color: #f8fafc;
		box-shadow: 0 2rpx 8rpx rgba(52, 152, 219, 0.2);
	}
	
	/* 下拉箭头样式 */
	.picker:active .uni-icons {
	  transform: rotate(180deg);
	}

	.area {
		display: flex;
		flex-wrap: wrap;
		gap: 30px;
		justify-content: flex-start;
	}

	.title {
		display: block;
		flex: 0 0 calc(50% - 30px);
		width: 100%;
		text-align: center;
		background: rgba(255, 255, 255, 0.95);

	}

	
	.video-image {
		flex: 1 1 calc(50% - 30px);
		width: 100%;
		height: 200px; /* 设置固定高度 */
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		object-fit: cover; /* 确保图片填充整个容器 */
		cursor: pointer; /* 添加指针样式，表示可点击 */
	}

	/* 鼠标悬停效果 */
	.video-image:hover {
		transform: scale(1.02);
		box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
	}

	/* ----------------------------------------------------------------- */
	/* 点赞区域 */
	.like-btn {
		display: flex;
		align-items: center;
		background: none;
		border: none;
		color: #666;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.like-section {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		padding: 0 15px 15px;
	}

	.like-btn:hover {
		color: #ff4757;
	}

	.like-btn.liked {
		color: #ff4757;
	}

	.like-icon {
		font-size: 18px;
		margin-right: 5px;
	}

	.like-count {
		font-size: 14px;
	}
	/* 发布按钮 */
	.publish-btn {
	  position: fixed;
	  right: 30rpx;
	  bottom: 120rpx;
	  width: 100rpx;
	  height: 100rpx;
	  background-color: #28B389;
	  border-radius: 50%;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  box-shadow: 0 4rpx 20rpx rgba(40, 179, 137, 0.3);
	  z-index: 999;
	}
	
	.publish-btn:active {
	  transform: scale(0.95);
	}
</style>