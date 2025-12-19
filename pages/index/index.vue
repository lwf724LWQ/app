<template>
	<view class="lottery-container" :class="useOldManModeStore.enabled ? 'old-man-mode' : ''">
		<!-- 顶部广告轮播图 -->
		<swiper class="ad-swiper" indicator-dots="true" autoplay="true" interval="3000" duration="500" circular="true"
			easing-function="default">
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

		<!-- 开奖结果区域 - 福彩3D -->
		<navigator :url="`/pages/table/table?type=福彩3D&period=${fc3dPeriod}`">
			<view class="lottery-results-fc3d">
				<view class="result-item-fc3d">
					<view class="result-header-fc3d">
						<view class="lottery-title-fc3d">福彩3D 第{{ fc3dPeriod }}期</view>
						<view class="lottery-date">{{ fc3dDate }}</view>
					</view>
					<view class="winning-numbers-fc3d">
						<view class="number-wrapper" v-for="(num, index) in fc3dNumbers" :key="index">
							<view class="number-item-fc3d">{{ num }}</view>
							<view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
						</view>
					</view>
				</view>
			</view>
		</navigator>

		<!-- 开奖结果区域 - 排列五 -->
		<navigator :url="`/pages/table/table?type=排列五&period=${plwPeriod}`">
			<view class="lottery-results-plw">
				<view class="result-item-plw">
					<view class="result-header-plw">
						<view class="lottery-title-plw">排列三 排列五 第{{ plwPeriod }}期</view>
						<view class="lottery-date">{{ plwDate }}</view>
					</view>
					<view class="winning-numbers-plw">
						<view class="number-wrapper" v-for="(num, index) in plwNumbers" :key="index">
							<view class="number-item-plw">{{ num }}</view>
							<view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
						</view>
					</view>
				</view>
			</view>
		</navigator>

		<!-- 开奖结果区域 - 七星彩 -->
		<navigator :url="`/pages/table/table?type=七星彩&period=${qxcPeriod}`">
			<view class="lottery-results-qxc">
				<view class="result-item-qxc">
					<view class="result-header-qxc">
						<view class="lottery-title-qxc">七星彩 第{{ qxcPeriod }}期</view>
						<view class="lottery-date">{{ qxcDate }}</view>
					</view>
					<view class="winning-numbers-qxc">
						<view class="number-wrapper" v-for="(num, index) in qxcNumbers" :key="index">
							<view class="number-item-qxc" :class="{ 'qxc-special': index === qxcNumbers.length - 1 }">{{
								num
							}}</view>
							<view class="number-label">{{ String.fromCharCode(65 + index) }}</view>
						</view>
					</view>
				</view>
			</view>
		</navigator>

		<!-- 通知横幅 -->
		<view class="notice-banner">
			<uni-icons type="sound" size="32" color="#FF8C00"></uni-icons>
			<text class="notice-text">【2025 国庆总结通知】</text>
			<text class="notice-new">NEW</text>
			<uni-icons type="right" size="28" color="#999"></uni-icons>
		</view>

		<!-- 功能图标区 - 15个图标网格 -->
		<view class="function-area">
			<view class="function-grid">
				<!-- 第一行 -->
				<view class="icon-item" @click="drawGui">
					<uni-icons type="compose" size="20" color="#4A90E2"></uni-icons>
					<text>画规</text>
				</view>
				<view class="icon-item" @click="toChangtiao">
					<image src="/static/icons/list.png" mode="aspectFit"></image>
					<text>长条</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/font.png" mode="aspectFit"></image>
					<text>云规</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/card.png" mode="aspectFit"></image>
					<text>统计</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/button.png" mode="aspectFit"></image>
					<text class="leng3">智能规</text>
				</view>
				<!-- 第二行 -->
				<view class="icon-item" @click="goToLive">
					<uni-icons type="videocam" size="20" color="#4A90E2"></uni-icons>
					<text>开奖直播</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/badge.png" mode="aspectFit"></image>
					<text>大师榜单</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/card.png" mode="aspectFit"></image>
					<text>大师统计</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/fav.png" mode="aspectFit"></image>
					<text>奖表统计</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/search-bar.png" mode="aspectFit"></image>
					<text>奖表查询</text>
				</view>
				<!-- 第三行 -->
				<view class="icon-item" @click="goToDreamInterpretation">
					<uni-icons type="chat" size="20" color="#4A90E2"></uni-icons>
					<text>解梦</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/collapse.png" mode="aspectFit"></image>
					<text class="leng3">过滤王</text>
				</view>
				<view class="icon-item">
					<image src="/static/icons/search-bar.png" mode="aspectFit"></image>
					<text>彩友搜索</text>
				</view>
				<view class="icon-item icon-item-message">
					<image src="/static/icons/color.png" mode="aspectFit"></image>
					<text>我的消息</text>
					<view class="message-badge">1</view>
				</view>
				<view class="icon-item">
					<image src="/static/icons/grid.png" mode="aspectFit"></image>
					<text>全部</text>
				</view>
			</view>
		</view>

		<!-- <PrivacyPolicyModal :visible="true"></PrivacyPolicyModal> -->
		<bottomBar current-path="/pages/index/index"/>
	</view>

</template>

<script>
import { apiFindResult } from '@/api/apis.js'
import { mode } from 'crypto-js';
import PrivacyPolicyModal from "../../components/PrivacyPolicyModal.vue"
import { useUserStore } from '../../stores/userStore';
import tool from "../../utils/tool"
import bottomBar from '../../components/bottom-bar/bottom-bar.vue';
export default {
	inject: ['useOldManModeStore'],
	components: { PrivacyPolicyModal, bottomBar },
	data() {
		return {
			currentTab: 'plw',
			fc3dNumbers: ['3', '8', '5'],
			plwNumbers: ['9', '0', '5', '3', '2'],
			qxcNumbers: ['8', '0', '6', '5', '7', '9', '7'],
			fc3dPeriod: '第25123期',
			plwPeriod: '第25285期',
			qxcPeriod: '第25123期',
			fc3dDate: '10.26 周日',
			plwDate: '10.26 周日',
			qxcDate: '10.26 周日',
			isLoadingResults: false // 添加加载锁
		};
	},
	methods: {
		drawGui() {
			const tname = this.currentTab === 'plw' ? '排列5' : '七星彩'
			uni.navigateTo({
				url: `/pages/juWang/peng-liao/drawLine/drawLine?type=排列五`
			});
			// uni.navigateTo({
			// 	url: `/pages/juWang/drawLine/drawLine`
			// });
		},
		isLogin(){
			const userStore = useUserStore()
			if(userStore.getUserInfo.account){
				return true
			}else{
				uni.showModal({
					title: '提示',
					content: '该功能需要登录，是否前往',
					success: async (res) => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pages/login/login' })
						}
					},
					showCancel: true,
				})
				return false
			}
		},
		toChangtiao(){
			if(isLogin()){
				uni.navigateTo({
					url: "/pages/changtiao/index"
				})
			}
			
		},
		goToLive() {
			// #ifdef H5
			uni.showModal({
				title: '提示',
				content: '收看直播功能仅支持APP内使用'
			})
			// #endif
			// #ifdef APP-PLUS
			uni.navigateTo({
				url: "/pages/index/live"
			})
			// #endif
		},
		goToDreamInterpretation() {
			const userStore = useUserStore()
			if(userStore.getUserInfo.account){
				uni.navigateTo({
					url: '/pages/dream-interpretation/dream-interpretation'
				});
			}else{
				uni.showModal({
					title: '提示',
					content: '该功能需要登录，是否前往',
					success: async (res) => {
						if (res.confirm) {
							uni.navigateTo({ url: '/pages/login/login' })
						}
					},
					showCancel: true,
				})
			}
		},
		// 加载开奖结果
		async loadLotteryResults() {
			// 防止重复调用
			if (this.isLoadingResults) {
				return
			}

			try {
				this.isLoadingResults = true
				uni.showLoading({ title: '加载中...' })

				const response = await apiFindResult()

				uni.hideLoading()

				if (response.code === 200 && response.data) {
					const results = response.data

					// 检查数据格式 - 可能是一个数组
					let dataArray = results
					if (Array.isArray(results)) {
						dataArray = results
					} else if (results.records && Array.isArray(results.records)) {
						dataArray = results.records
					} else if (results.data && Array.isArray(results.data)) {
						dataArray = results.data
					}

					// 遍历数据，根据彩票名称匹配
					dataArray.forEach(item => {
						const tname = item.tname || item.name

						// 福彩3D
						if (tname && tname.includes('福彩3D')) {
							this.fc3dNumbers = this.parseNumbers(item.number)
							this.fc3dPeriod = item.issueno
							// 更新日期
							if (item.opendate || item.date || item.createTime) {
								const date = item.opendate || item.date || item.createTime
								this.fc3dDate = this.formatDate(date)
							}
						}

						// 排列五
						if (tname && tname.includes('排列五')) {
							this.plwNumbers = this.parseNumbers(item.number)
							this.plwPeriod = item.issueno
							// 更新日期
							if (item.opendate || item.date || item.createTime) {
								const date = item.opendate || item.date || item.createTime
								this.plwDate = this.formatDate(date)
							}
						}

						// 排列三
						if (tname && tname.includes('排列三')) {
							// 排列三和排列五共用期号
							this.plwPeriod = item.issueno
							// 排列三的日期会覆盖排列五的日期（因为排列五在前面）
							if (item.opendate || item.date || item.createTime) {
								const date = item.opendate || item.date || item.createTime
								this.plwDate = this.formatDate(date)
							}
						}

						// 七星彩
						if (tname && tname.includes('七星彩')) {
							let numbers = this.parseNumbers(item.number)
							// 如果有refernumber，添加到末尾
							if (item.refernumber) {
								numbers.push(item.refernumber)
							}
							this.qxcNumbers = numbers
							this.qxcPeriod = item.issueno
							// 更新日期
							if (item.opendate || item.date || item.createTime) {
								const date = item.opendate || item.date || item.createTime
								this.qxcDate = this.formatDate(date)
							}
						}
					})
				}
			} catch (error) {
				uni.hideLoading()
				console.error('加载开奖结果失败:', error)
				// 保持默认数据，不显示错误提示
			} finally {
				this.isLoadingResults = false
			}
		},
		// 解析中奖号码（支持字符串和数组格式）
		parseNumbers(numbers) {
			if (!numbers) {
				return []
			}

			if (Array.isArray(numbers)) {
				return numbers.map(n => String(n))
			}

			if (typeof numbers === 'string') {
				// 如果是空格分隔的字符串（如 "1 7 2"）
				if (numbers.includes(' ')) {
					return numbers.split(' ').map(n => n.trim()).filter(n => n).map(n => String(n))
				}
				// 如果是逗号分隔的字符串
				if (numbers.includes(',')) {
					return numbers.split(',').map(n => n.trim()).filter(n => n).map(n => String(n))
				}
				// 如果是普通字符串，按字符分割
				return numbers.split('').map(n => n.trim()).filter(n => n).map(n => String(n))
			}

			// 如果是数字，转为字符串
			if (typeof numbers === 'number') {
				return String(numbers).split('')
			}

			return []
		},
		// 格式化日期
		formatDate(dateStr) {
			if (!dateStr) return '10.26 周日'

			try {
				const date = new Date(dateStr)
				const month = String(date.getMonth() + 1).padStart(2, '0')
				const day = String(date.getDate()).padStart(2, '0')
				const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
				const weekday = weekdays[date.getDay()]

				return `${month}.${day} ${weekday}`
			} catch (e) {
				return '10.26 周日'
			}
		}
	},
	onShow() {
		// 加载开奖结果
		this.loadLotteryResults()
	},
	onLoad() {
		tool.checkAppUpdate()
	}
};
</script>

<style lang="scss" scoped>
.lottery-container:not(.old-man-mode) {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-top: var(--status-bar-height);

	/* 轮播图样式 */
	.ad-swiper {
		width: 100%;
		height: 320rpx;
		padding: 20rpx;
		margin-bottom: 20rpx;
		box-sizing: border-box;
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

	/* 福彩3D开奖结果 */
	.lottery-results-fc3d {
		margin: 0 20rpx 20rpx 20rpx;
	}

	.result-item-fc3d {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header-fc3d {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.lottery-title-fc3d {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.winning-numbers-fc3d {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10rpx;
	}

	.number-item-fc3d {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e74c3c;
		border-radius: 50%;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 8rpx;
	}

	/* 排列五开奖结果 */
	.lottery-results-plw {
		margin: 0 20rpx 20rpx 20rpx;
	}

	.result-item-plw {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header-plw {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.lottery-title-plw {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.lottery-date {
		font-size: 24rpx;
		color: #666;
	}

	.winning-numbers-plw {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10rpx;
	}

	.number-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.number-item-plw {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e74c3c;
		border-radius: 50%;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 8rpx;
	}

	.number-label {
		font-size: 20rpx;
		color: #999;
	}

	/* 七星彩开奖结果 */
	.lottery-results-qxc {
		margin: 0 20rpx 20rpx 20rpx;
	}

	.result-item-qxc {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header-qxc {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.lottery-title-qxc {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.winning-numbers-qxc {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10rpx;
	}

	.number-item-qxc {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e74c3c;
		border-radius: 50%;
		font-size: 32rpx;
		font-weight: bold;
		color: #fff;
		margin-bottom: 8rpx;
	}

	/* 七星彩最后一个号码球显示为绿色 */
	.number-item-qxc.qxc-special {
		background-color: #28B389;
	}

	/* 通知横幅 */
	.notice-banner {
		display: flex;
		align-items: center;
		margin: 0 20rpx 20rpx 20rpx;
		padding: 20rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	/* 通知横幅图标样式 */
	.notice-banner uni-icons[type="sound"] {
		margin-right: 10rpx;
	}

	.notice-banner uni-icons[type="right"] {
		margin-left: 0;
	}

	.notice-text {
		font-size: 26rpx;
		color: #333;
		flex: 1;
	}

	.notice-new {
		font-size: 20rpx;
		color: #fff;
		background-color: #e74c3c;
		padding: 4rpx 10rpx;
		border-radius: 4rpx;
		margin-right: 10rpx;
	}


	/* 功能图标区 */
	.function-area {
		padding: 20rpx;
		background-color: #f5f5f5;
	}

	.function-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 20rpx 10rpx;
		background-color: #fff;
		padding: 30rpx;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.icon-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.icon-item image {
		width: 60rpx;
		height: 60rpx;
		margin-bottom: 8rpx;
	}

	/* uni-icons 图标样式 */
	.icon-item uni-icons {
		margin-bottom: 8rpx;
	}

	.icon-item text {
		font-size: 20rpx;
		color: #666;
	}

	.icon-item-message {
		position: relative;
	}

	.message-badge {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
		background-color: #e74c3c;
		color: #fff;
		font-size: 18rpx;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid #fff;
	}
}

.lottery-container.old-man-mode {
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	background-color: #f5f5f5;
	padding-top: var(--status-bar-height);

	/* 轮播图样式 */
	.ad-swiper {
		width: 100%;
		height: 180rpx;
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

	/* 福彩3D开奖结果 */
	.lottery-results-fc3d {}

	.result-item-fc3d {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 0 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header-fc3d {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.lottery-title-fc3d {
		font-size: 40rpx;
		font-weight: bold;
		color: #000;
	}

	.winning-numbers-fc3d {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10rpx;
	}

	.number-item-fc3d {
		width: 80rpx;
		height: 80rpx;
		font-size: 72rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e74c3c;
		border-radius: 50%;
		color: #fff;
		margin-bottom: 8rpx;
	}

	/* 排列五开奖结果 */
	.lottery-results-plw {
		margin: 0;
	}

	.result-item-plw {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 0 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header-plw {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.lottery-title-plw {
		font-size: 38rpx;
		font-weight: bold;
		color: #000;
	}

	.lottery-date {
		font-size: 44rpx;
		color: #000;
		font-weight: bold;
	}

	.winning-numbers-plw {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10rpx;
	}

	.number-wrapper {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.number-item-plw {
		width: 80rpx;
		height: 80rpx;
		font-size: 72rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e74c3c;
		border-radius: 50%;
		color: #fff;
		margin-bottom: 8rpx;
	}

	.number-label {
		font-size: 35rpx;
		font-weight: bold;
		color: #000000;
	}

	/* 七星彩开奖结果 */
	.lottery-results-qxc {
		margin: 0 0;
	}

	.result-item-qxc {
		background-color: #fff;
		border-radius: 10rpx;
		padding: 0 20rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-header-qxc {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0;
	}

	.lottery-title-qxc {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
	}

	.winning-numbers-qxc {
		display: flex;
		justify-content: flex-start;
		align-items: center;
		gap: 10rpx;
	}

	.number-item-qxc {
		width: 80rpx;
		height: 80rpx;
		font-size: 72rpx;
		font-weight: bold;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: #e74c3c;
		border-radius: 50%;
		color: #fff;
	}

	/* 七星彩最后一个号码球显示为绿色 */
	.number-item-qxc.qxc-special {
		background-color: #28B389;
	}

	/* 通知横幅 */
	.notice-banner {
		display: flex;
		align-items: center;
		padding: 0 20rpx;
		background-color: #fff;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	/* 通知横幅图标样式 */
	.notice-banner uni-icons[type="sound"] {
		margin-right: 10rpx;
	}

	.notice-banner uni-icons[type="right"] {
		margin-left: 0;
	}

	.notice-text {
		font-size: 40rpx;
		font-weight: bold;
		color: #000000;
		flex: 1;
	}

	.notice-new {
		font-size: 20rpx;
		color: #fff;
		background-color: #e74c3c;
		padding: 4rpx 10rpx;
		margin-right: 10rpx;
	}


	/* 功能图标区 */
	.function-area {
		background-color: #f5f5f5;
	}

	.function-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 20rpx 10rpx;
		background-color: #fff;
		padding: 30rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.icon-item {
		display: flex;
		flex-direction: column;
		font-weight: bolder;
		align-items: center;
		justify-content: center;
		position: relative;

	}

	.icon-item image {
		width: 50rpx;
		height: 50rpx;
	}

	/* uni-icons 图标样式 */
	.icon-item uni-icons {
		font-size: 30rpx;
		margin-bottom: 8rpx;
	}

	.icon-item text {
		font-size: 50rpx;
		color: #353434;

		// &.leng3 {
		// 	font-size: 43rpx;
		// }
	}

	.icon-item-message {
		position: relative;
	}

	.message-badge {
		position: absolute;
		top: -4rpx;
		right: -4rpx;
		background-color: #e74c3c;
		color: #fff;
		font-size: 18rpx;
		width: 32rpx;
		height: 32rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2rpx solid #fff;
	}
}
</style>