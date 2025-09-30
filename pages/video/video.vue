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
	<view class="area" v-if="currentTab == 'plw'||0">
			<video src="https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsKUp3_IZtIWpKcMefbSv3D.mp4?Expires=1759202109&OSSAccessKeyId=TMP.3KqzKgSaK68HdG5UVVuh7AaPfH9Dr4s2a3tSACzjkvyAt46i32uL4tm8yxNsRey1JiSgBSt5fWwohTrmaXg6Hw1qwCueGk&Signature=dXSk49njBnPZgP2U9T3%2Fu18PhJM%3D
			"></video>
			<video src="https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsKUp3_IZtIWpKcMefbSv3D.mp4?Expires=1759200797&OSSAccessKeyId=TMP.3KqzKgSaK68HdG5UVVuh7AaPfH9Dr4s2a3tSACzjkvyAt46i32uL4tm8yxNsRey1JiSgBSt5fWwohTrmaXg6Hw1qwCueGk&Signature=rjda2rkN0KaC3ysJ1NHY3SOh6%2BI%3D
			"></video>
			<video src="https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsvR4Mf2W-W1Pck9SpKfrlu.mp4?Expires=1759049502&OSSAccessKeyId=TMP.3Ko3bno7Ug1L4aKQWut5L58v83xbjgoVk9RAzx6twySqfiWSapLb9chB46naGH72Ezv5AixqXH4joC9KowfG75vATNtGdU&Signature=6XrWHNfwKuEp%2FBKOWkpBw%2BgJEeU%3D
			"></video>
			<video src="https://cjvd.oss-cn-guangzhou.aliyuncs.com/uploadsvR4Mf2W-W1Pck9SpKfrlu.mp4?Expires=1759049502&OSSAccessKeyId=TMP.3Ko3bno7Ug1L4aKQWut5L58v83xbjgoVk9RAzx6twySqfiWSapLb9chB46naGH72Ezv5AixqXH4joC9KowfG75vATNtGdU&Signature=6XrWHNfwKuEp%2FBKOWkpBw%2BgJEeU%3D
			"></video>
	</view>
	

</template>

<script>
	import {
		ref,
		onMounted,
		getCurrentInstance,
		nextTick,
		watch,
		reactive
	} from 'vue';
	import { apiGetVideo } from '../../api/apis';
	export default {
		data() {
			return {
				currentTab: 'plw', // 当前选中的选项卡：plw-排列五，qxc-七星彩
				upcomingTab: 'plw', // 待开奖区域选中的选项卡：plw-排列五，qxc-七星彩
				currentNav: 'home', // 当前选中的导航项
				plwNumbers: ['8', '6', '8', '5', '7'], // 排列五开奖号码
				qxcNumbers: ['2', '0', '4', '9', '3', '8', '8'], // 七星彩开奖号码
				plwUpcomingIssue: '25214期', // 排列五待开奖期号
				qxcUpcomingIssue: '3225期', // 七星彩待开奖期号
				upcomingAction: 'follow', // 待开奖区域选中的操作：all-全部，follow-关注
			};
		},
		
		methods: {
			// 切换顶部选项卡
			switchTab(tab) {
				this.currentTab = tab;
			},
			// 切换待开奖区域选项卡
			switchUpcomingTab(tab) {
				this.upcomingTab = tab;
			},
			// 切换待开奖区域操作
			switchUpcomingAction(action) {
				this.upcomingAction = action;
				// 这里可以添加根据操作类型筛选数据的逻辑
				console.log('切换到:', action);
			},
			// 处理swiper切换
			handleSwiperChange(e) {
				this.currentTab = e.detail.current === 0 ? 'plw' : 'qxc';
			},
			// 切换导航
			switchNav(nav) {
				this.currentNav = nav;
			},
		
			drawGui() {
				console.log('dddd')
				uni.navigateTo({
					url: '/pages/juWang/drawLine/drawLineRead?tname=排列5' // 可携带参数
				});
			}
			
		},

		//-----------------------------------------------------------------------------
		
	};
	
</script>

<style>
	.photo {
		width: 100%;
		height: 80px;
	}

	.area {
		display: flex;
		flex-wrap: wrap;
		/* 允许子元素换行 */
		gap: 30px;
		/* 子元素之间的间隙 */
		justify-content: center;
		/* 内容居中对齐 */
	}

	
	video{
		flex: 1 1 calc(50% - 30px);
		width: 100%;
		/* 每行两个，减去间隙（30px） */
		background: rgba(255, 255, 255, 0.95);
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}

	/* ------------------------------------------------------------------------------------------ */
	.lottery-container {
		display: flex;
		flex-direction: column;
		min-height: 150vh;
		background-color: #f5f5f5;
	}

	.ad-swiper {
		width: 100%;
		height: 320rpx;
	}

	.registration-type {
		background-color: red;
		color: white;
		background-color: red;
		color: white;
		width: 100rpx;
		height: 45rpx;
		align-items: center;
		flex-direction: column;
		display: flex;
		border-radius: 10rpx;
		margin-right: 15rpx;
	}

	.swiper-item {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 30rpx;
		overflow: hidden;
	}

	.swiper-item image {
		width: 100%;
		height: 100%;
	}

	.activity-type {
		font-size: 34rpx;
		color: red;
		font-weight: 500rpx;

	}



	.ad-text {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #fff;
		font-size: 32rpx;
		font-weight: bold;
		text-shadow: 1rpx 1rpx 2rpx rgba(0, 0, 0, 0.5);
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


	.uni-video-cover {
		padding: 50rpx;
	}

	.icon-placeholder {
		width: 100rpx;
		height: 100rpx;
		background-color: #f0f0f0;
		border-radius: 20rpx;
		margin-bottom: 10rpx;
	}

	.tab-item {
		padding: 15rpx 40rpx;
		font-size: 32rpx;
		color: #333;
		border-radius: 30rpx;
	}

	.p5-lottery-type {
		padding: 12rpx 30rpx;
		font-size: 28rpx;
		color: #555;
		border-radius: 6rpx;
		margin-right: 10rpx;
	}

	.qxc-lottery-type {
		padding: 12rpx 30rpx;
		font-size: 28rpx;
		color: #555;
		border-radius: 6rpx;
	}

	.p5-lottery-type.upcoming-active-p5 {
		background-color: #2196f3;
		color: #fff;
		font-weight: bold;
	}

	.qxc-lottery-type.upcoming-active-qxc {
		background-color: #f57c00;
		color: #fff;
		font-weight: bold;
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


	.function-icons {
		display: flex;
		justify-content: space-around;
		padding: 30rpx 0;
		background-color: #fff;
	}

	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100rpx;
	}

	.icon-item image {
		width: 100rpx;
		height: 100rpx;
		margin-bottom: 10rpx;
	}

	.icon-item text {
		font-size: 24rpx;
		color: #666;
	}

	.lottery-results {
		padding: 20rpx;
		border-radius: 20%;
	}

	.result-item {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.lottery-type {
		font-size: 32rpx;
		font-weight: bold;
		background-color: #1e88e5;
		color: white;
	}


	.lottery-typep5 {
		font-size: 32rpx;
		font-weight: bold;
		background-color: #1e88e5;
		color: white;
		padding: 12rpx 24rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.lottery-typeqxc {
		font-size: 32rpx;
		font-weight: bold;
		background-color: #ff9800;
		color: white;
		padding: 12rpx 24rpx;
		border-radius: 16rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.lottery-date {
		font-size: 24rpx;
		color: #665e5e;

	}

	.history-linkp5 {
		font-size: 24rpx;
		background-color: #b8d0e5;
		background-size: 35rpx;
		border-radius: 10%;
		color: #1e88e5;
		width: 62px;
		height: 19px;
		align-items: center;
		display: flex;
		flex-direction: column;
	}

	.history-linkqxc {
		font-size: 24rpx;
		color: #ff9800;
		background-color: #ffebcd;
		background-size: 35rpx;
		border-radius: 10%;
		width: 62px;
		height: 19px;
		align-items: center;
		display: flex;
		flex-direction: column;
	}

	.issue-numberp5 {
		font-size: 28rpx;
		color: black;
		margin-bottom: 20rpx;
		height: 53px;
		margin-top: 13px;
		align-items: center;
		flex-direction: column;
	}


	.issue-numberqxc {
		font-size: 28rpx;
		color: black;
		margin-bottom: 20rpx;
		height: 53px;
		margin-top: 13px;
		align-items: center;
		flex-direction: column;
	}



	.winning-numbers {
		display: flex;
		justify-content: space-around;
	}

	.number-itemp5 {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #1e88e5;
		border-radius: 50rpx;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}

	.number-itemqxc {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #ff9800;
		border-radius: 50rpx;
		font-size: 36rpx;
		font-weight: bold;
		color: white;
	}

	.number-itemp5.special {
		background-color: white;
		color: #1e88e5;
	}


	.number-itemqxc.special {
		background-color: white;
		color: #ff9800;
		width: 0px
	}

	.activity-area {
		margin: 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		display: flex;
		align-items: center;
	}

	.activity-area image {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.activity-area text {
		font-size: 28rpx;
		color: #e91e63;
	}

	.upcoming-area {
		margin: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.upcoming-header {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		border-bottom: 1rpx solid #e0e0e0;
	}

	.upcoming-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20rpx;
	}

	.status {
		font-size: 28rpx;
		color: #ff9800;
	}

	.actions {
		display: flex;
	}

	.action-btn {
		padding: 8rpx 20rpx;
		margin-left: 10rpx;
		background-color: #f5f5f5;
		border-radius: 20rpx;
		font-size: 24rpx;
		color: #666;
	}

	.action-btn.selected {
		color: white;
		background-color: #ff4500;
	}



	.bottom-nav {
		display: flex;
		justify-content: space-around;
		padding: 20rpx 0;
		background-color: #fff;
		border-top: 1rpx solid #e0e0e0;
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
	}

	.nav-item {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.nav-item image {
		width: 50rpx;
		height: 50rpx;
		margin-bottom: 10rpx;
	}

	.nav-item text {
		font-size: 24rpx;
		color: #666;
	}

	.nav-item.active text {
		color: #1e88e5;
	}
</style>