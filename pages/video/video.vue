<template>
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
		<video v-for="(video, index) in videoList" :key="index" :src="video.src" controls object-fit="cover"></video>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from 'vue';
	import {
		apiGetVideo
	} from '../../api/apis';

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
	const videoList = ref([{
			src: "https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsKUp3_IZtIWpKcMefbSv3D.mp4?Expires=1759202109&OSSAccessKeyId=TMP.3KqzKgSaK68HdG5UVVuh7AaPfH9Dr4s2a3tSACzjkvyAt46i32uL4tm8yxNsRey1JiSgBSt5fWwohTrmaXg6Hw1qwCueGk&Signature=dXSk49njBnPZgP2U9T3%2Fu18PhJM%3D"
		},
		{
			src: "https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsKUp3_IZtIWpKcMefbSv3D.mp4?Expires=1759200797&OSSAccessKeyId=TMP.3KqzKgSaK68HdG5UVVuh7AaPfH9Dr4s2a3tSACzjkvyAt46i32uL4tm8yxNsRey1JiSgBSt5fWwohTrmaXg6Hw1qwCueGk&Signature=rjda2rkN0KaC3ysJ1NHY3SOh6%2BI%3D"
		},
		{
			src: "https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsvR4Mf2W-W1Pck9SpKfrlu.mp4?Expires=1759049502&OSSAccessKeyId=TMP.3Ko3bno7Ug1L4aKQWut5L58v83xbjgoVk9RAzx6twySqfiWSapLb9chB46naGH72Ezv5AixqXH4joC9KowfG75vATNtGdU&Signature=6XrWHNfwKuEp%2FBKOWkpBw%2BgJEeU%3D"
		},
		{
			src: "https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsvR4Mf2W-W1Pck9SpKfrlu.mp4?Expires=1759049502&OSSAccessKeyId=TMP.3Ko3bno7Ug1L4aKQWut5L58v83xbjgoVk9RAzx6twySqfiWSapLb9chB46naGH72Ezv5AixqXH4joC9KowfG75vATNtGdU&Signature=6XrWHNfwKuEp%2FBKOWkpBw%2BgJEeU%3D"
		}
	]);

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

	// 生命周期钩子
	onMounted(() => {
		const videoinfo = reactive({
		    "page": 1,
		    "limit":10
		});
		videoinfo.page = Number(videoinfo.page);
		videoinfo.limit = Number(videoinfo.limit);
		apiGetVideo(videoinfo)
		console.log(videoinfo)
	});
</script>

<style scoped>
	
	.photo {
		width: 100%;
		height: 80px;
	}

	.area {
		display: flex;
		flex-wrap: wrap;
		gap: 30px;
		justify-content: center;
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

	video {
		flex: 1 1 calc(50% - 30px);
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	
</style>