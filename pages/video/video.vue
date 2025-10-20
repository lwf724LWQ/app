<template>
	<!-- 为了适配小程序顶部高度的盒子-->
	    <StatusBarPlaceholder></StatusBarPlaceholder>
	<!-- 图片 -->
	<image class='photo' src="@/static/video/swiper.png" mode=""></image>

	<!-- 选项卡 -->
	<view class="tabs">
		<view class="tab-item" :class="{ 'active': currentTab === 'plw' }" @click="switchTab('plw')">排列五</view>
		<view class="tab-item" :class="{ 'activepls': currentTab === 'pls' }" @click="switchTab('pls')">排列三</view>
		<view class="tab-item" :class="{ 'activeqxc': currentTab === 'qxc' }" @click="switchTab('qxc')">七星彩</view>
		<view class="tab-item" :class="{ 'activefc': currentTab === 'fc' }" @click="switchTab('fc')">福彩3D</view>
	</view>

	<!-- 功能图标区 -->
	<view class="area" v-if="currentTab === 'plw' || 0">
		<view class="title" v-for="(video, index) in videoList">{{video.title}}
			<video :src="video.src" controls object-fit="cover">
			</video>
			<view class="like-section">
				<button class="like-btn" :class="{ 'liked': video.isLiked }" @click="toggleLike(video)">
					<text class="like-icon">{{ video.isLiked ? '❤️' : '👍' }}</text>
					<text class="like-count">{{ video.likeCount }}</text>
				</button>
			</view>
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
		apiGetIsLike
	} from '../../api/apis';
	import {
		setToken,
		getToken,
		setAccount,
		getAccount
	} from '@/utils/request.js'; // 导入setToken，账号
	
	

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

	const drawGui = () => {
		console.log('dddd');
		uni.navigateTo({
			url: '/pages/juWang/drawLine/drawLineRead?tname=排列5'
		});
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
					src: "http://video.caimizm.com/"+item.url,
					// id: item.id,
					account: item.account,
					likeCount:item.likeCount,
					createTime:item.createTime,
					flag:item.flag,
					price:item.price,
					updateTime:item.updateTime,
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
		//----------------------------------------------------------

	});
	
</script>

<style scoped>
	.status-bar{
		height: ;
	}
	.photo {
		width: 100%;
		height: 80px;
	}


	.area {
		display: flex;
		flex-wrap: wrap;
		gap: 30px;
		justify-content: flex-start;
	}

	.tab-item {
		padding: 15rpx 40rpx;
		font-size: 32rpx;
		color: #333;
		border-radius: 30rpx;
	}

	.tab-item.active {
		background-color: #1e88e5;
		color: #fff;
	}

	.tab-item.activeqxc {
		background-color: #03c9ff;
		color: #fff;
	}

	.tab-item.activepls {
		background-color: #ff209e;
		color: #fff;
	}

	.tab-item.activefc {
		background-color: #a0a5ff;
		color: #fff;
	}

	.tabs {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		background-color: #fff;
		border-bottom: 1rpx solid #e0e0e0;
		position: relative;
		z-index: 10;
	}

	.title {
		display: block;
		flex: 0 0 calc(50% - 30px);
		width: 100%;
		text-align: center;
		background: rgba(255, 255, 255, 0.95);

	}

	video {
		flex: 1 1 calc(50% - 30px);
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
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