<template>
	<view class="lottery-container">
		<!-- 顶部广告轮播图 -->
		<swiper class="ad-swiper" indicator-dots="true" autoplay="true" interval="3000" duration="500">

			<swiper-item>
				<view class="swiper-item">
					<image src="/static/4eec3b5b6deb298f7b35663a70d256bd.png" mode="aspectFill"></image>

				</view>
			</swiper-item>
			<swiper-item>
				<view class="swiper-item">
					<image src="/static/aoRed.jpg" mode="aspectFill"></image>

				</view>
			</swiper-item>
		</swiper>

		<!-- 选项卡 -->
		<view class="tabs">
			<view class="tab-item" :class="{ 'active': currentTab === 'plw' }" @click="switchTab('plw')">排列五</view>
			<view class="tab-item" :class="{ 'activeqxc': currentTab === 'qxc' }" @click="switchTab('qxc')">七星彩</view>
		</view>

		<!-- 功能图标区 -->
		<view class="function-area" v-if="currentTab == 'plw'">
			<view class="function-icons">
				<view class="icon-item">
					<image src="/static/red-list.svg" mode="aspectFit"></image>
					<text>红人榜</text>
				</view>
				<view class="icon-item">
					<image src="/static/huagui.png" mode="aspectFit" @click="drawGui()"></image>
					<text>画规</text>
				</view>
				<view class="icon-item">
					<image src="/static/ticket.svg" mode="aspectFit"></image>
					<text>奖纸</text>
				</view>
				<view class="icon-item">
					<image src="/static/master-list.svg" mode="aspectFit"></image>
					<text>大师榜</text>
				</view>
				<view class="icon-item">
					<image src="/static/video.svg" mode="aspectFit"></image>
					<text>视频</text>
				</view>
			</view>
			<view class="function-icons">
				<view class="icon-item">
					<image src="/static/黄历查询.png" mode="aspectFit"></image>
					<text>黄历</text>
				</view>
				<view class="icon-item">
					<image src="/static/电视剧.png" mode="aspectFit"></image>
					<text>开奖直播</text>
				</view>
				<view class="icon-item">
					<image src="/static/月亮 (1) (1).png" mode="aspectFit"></image>
					<text>解梦</text>
				</view>
				<view class="icon-item">
					<image src="/static/元宝 (1).png" mode="aspectFit"></image>
					<text>快选</text>
				</view>
				<view class="icon-item">
					<image src="/static/更多.png" mode="aspectFit"></image>
					<text>更多</text>
				</view>
			</view>
		</view>
		<!-- 功能图标区 -->
		<view class="function-area" v-if="currentTab == 'qxc'">
			<view class="function-icons">
				<view class="icon-item">
					<image src="/static/red-list.svg" mode="aspectFit"></image>
					<text>红人榜</text>
				</view>
				<view class="icon-item">
					<image src="/static/rules.svg" mode="aspectFit"></image>
					<text>画规</text>
				</view>
				<view class="icon-item">
					<image src="/static/ticket.svg" mode="aspectFit"></image>
					<text>奖纸</text>
				</view>
				<view class="icon-item">
					<image src="/static/master-list.svg" mode="aspectFit"></image>
					<text>大师榜</text>
				</view>
				<view class="icon-item">
					<image src="/static/video.svg" mode="aspectFit"></image>
					<text>视频</text>
				</view>
			</view>
			<view class="function-icons">
				<view class="icon-item">
					<image src="/static/黄历查询(1).png" mode="aspectFit"></image>
					<text>黄历</text>
				</view>
				<view class="icon-item">
					<image src="/static/电视剧 (1).png" mode="aspectFit"></image>
					<text>开奖直播</text>
				</view>
				<view class="icon-item">
					<image src="/static/月亮 (1) (2).png" mode="aspectFit"></image>
					<text>解梦</text>
				</view>
				<view class="icon-item">
					<image src="/static/元宝.png" mode="aspectFit"></image>
					<text>快选</text>
				</view>
				<view class="icon-item">
					<image src="/static/更多 (1).png" mode="aspectFit"></image>
					<text>更多</text>
				</view>
			</view>
		</view>
		<!-- 开奖结果区域 -->
		<view class="lottery-results">
			<!-- 排列五 -->
			<view class="result-item">
				<view class="result-header">
					<view class="lottery-typep5">排列五</view>
					<view class="lottery-date">2025-08-11 周一</view>
					<view class="history-linkp5">开奖历史</view>
				</view>
				<!-- <view class="issue-number"></view> -->
				<view class="winning-numbers">
					<text class="issue-numberp5">25213期</text>
					<view class="number-itemp5" v-for="(num,index) in plwNumbers" :key="num"
						:class="{ 'special' : index >=4}">{{ num }}</view>
				</view>
				<!-- 七星彩 -->

				<view class="result-header">
					<view class="lottery-typeqxc">七星彩</view>
					<view class="lottery-date">2025-08-10 周日</view>
					<view class="history-linkqxc">开奖历史</view>
				</view>
				<!--  <view class="issue-numberqxc"></view> -->
				<view class="winning-numbers">
					<text class="issue-numberqxc">3224期</text>
					<view class="number-itemqxc" v-for="(num, index) in qxcNumbers" :key="index"
						:class="{ 'special': index >= 4 }">{{ num }}</view>
				</view>
			</view>
		</view>
		<!-- 活动区域 -->
		<view class="activity-area">
			<image src="/static/喇叭.svg" mode="aspectFit"></image>
			<view class="activity-type">活动</view>
			<image src="/static/分隔符.png" mode="aspectFit"></image>
			<view class="registration-type">注册礼</view>
			<text>新用户注册，免费得百元...</text>
		</view>

		<!-- 待开奖区域 -->
		<view class="upcoming-area">
			<view class="upcoming-header">
				<view class="p5-lottery-type" :class="{ 'upcoming-active-p5': upcomingTab === 'plw' }" @click="switchUpcomingTab('plw')">排列五</view>
				<view class="qxc-lottery-type" :class="{ 'upcoming-active-qxc': upcomingTab === 'qxc' }" @click="switchUpcomingTab('qxc')">七星彩</view>
			</view>
			<view class="upcoming-item">
				<view class="issue-number">{{ upcomingTab === 'plw' ? plwUpcomingIssue : qxcUpcomingIssue }}</view>
				<view class="status">待开奖</view>
				<view class="actions">
					<view class="action-btn" :class="{ 'selected': upcomingAction === 'all' }" @click="switchUpcomingAction('all')">全部</view>
					<view class="action-btn" :class="{ 'selected': upcomingAction === 'follow' }" @click="switchUpcomingAction('follow')">关注</view>
				</view>
			</view>
		</view>
	</view>
	
</template>

<script>
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
				upcomingAction: 'follow'  ,// 待开奖区域选中的操作：all-全部，follow-关注
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
			// 获取最新开奖结果
			getLatestResults() {
				// 这里可以添加请求API获取最新开奖结果的逻辑
				// 示例：
				// uni.request({
				//   url: 'https://api.example.com/lottery/results',
				//   success: (res) => {
				//     this.plwNumbers = res.data.plwNumbers;
				//     this.qxcNumbers = res.data.qxcNumbers;
				//   }
				// });
			},
			drawGui(){
				console.log('dddd')
        uni.navigateTo({
          url: '/pages/juWang/drawLine/drawLineRead?tname=排列5' // 可携带参数
        });
			}
		},
		
		onLoad() {
			this.getLatestResults();
		}
		
		
	};
</script>

<style scoped>
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

	.function-area {
		padding: 20rpx;
		background-color: #fff;
		margin: 20rpx;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
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
		background-color: #ff9800;
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