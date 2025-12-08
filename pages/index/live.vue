<template>
	<view class="container">
		<top-navigation-bar title="开奖直播" />
		<view class="video-container">
			<!-- 视频 -->
			<view class="live-not-started" v-if="countdownTime > 0">
				<!-- 未开始直播时展示 -->
				<view class="live-not-started-poster"></view>
				<view class="live-not-started-text">距离开奖还有 {{ formatTime(countdownTime) }}</view>
			</view>
			<video v-else class="video" :src="livePath" :is-live="true" :play-strategy="2" :autoplay="true"
				:controls="true" :show-progress="false" :show-fullscreen-btn="true" :show-play-btn="false"
				:show-center-play-btn="true" :enable-progress-gesture="false"></video>
		</view>
		<view class="result-container">
			<!-- 开奖信息 -->
			<view class="result-title">体彩开奖</view>
			<view class="result-info" v-for="item in result" :key="item.name">
				<view class="result-info-name">{{ item.name }}</view>
				<view class="result-info-issue">{{ item.issue }}期</view>
				<view class="result-info-numbers">
					<view class="result-info-numbers-number" v-for="(number, index) in item.number" :key="index">{{
						number }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang='ts' setup>
import TopNavigationBar from "@/components/TopNavigationBar.vue";
import { ref, onUnmounted, Ref, onMounted } from "vue";
import moment from "moment";
import { apiFindResult } from '@/api/apis.js'

const livePath = ref('https://livevideopull.lottery.gov.cn/live/lottery_PAL.m3u8')
// const livePath = ref('http://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8')

// 声明倒计时变量
const countdownTime: Ref<number> = ref(1)

// 开奖时间
const targetDate = new Date('2024-01-01 21:25:00')
const liveEndDate = new Date('2024-01-01 21:45:00')
targetDate.setFullYear(new Date().getFullYear())
targetDate.setMonth(new Date().getMonth())
targetDate.setDate(new Date().getDate())
liveEndDate.setFullYear(new Date().getFullYear())
liveEndDate.setMonth(new Date().getMonth())
liveEndDate.setDate(new Date().getDate())

// 创建定时器
const timer = setInterval(() => {
	if (new Date() > liveEndDate) {
		countdownTime.value = 0
		return
	}
	if (new Date() > targetDate) {
		loadLotteryResults()
	}
	const now = new Date().getTime()
	const distance = targetDate.getTime() - now
	countdownTime.value = distance
}, 1000)

function formatTime(time: number): string {
	return moment.utc(time).format('HH:mm:ss')
}

// 开奖信息
interface openCodeItem {
	number: number | string[]
	issue: string | number,
	name: string
}
const result: Ref<openCodeItem[]> = ref([])
function loadLotteryResults() {
	apiFindResult().then(res => {
		result.value = res.data.map(item => {
			return {
				number: item.number.split(" "),
				issue: item.issueno,
				name: item.tname
			}
		})
	})
}

// 组件卸载时清除定时器
onUnmounted(() => {
	clearInterval(timer)
})

onMounted(() => {
	loadLotteryResults()
})
</script>
<style lang="scss" scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #21212B;

	.video-container {
		width: 100%;
		height: 400rpx;
		flex-basis: 400rpx;

		.live-not-started {
			height: 100%;
			background-color: rgba(0, 0, 0, 0.5);
			position: relative;

			.live-not-started-poster {
				position: absolute;
				left: 0;
				right: 0;
				width: 100%;
				height: 100%;
				background-image: url('/static/images/live/aa.webp');
				background-size: cover;
			}

			.live-not-started-text {
				position: absolute;
				right: 20rpx;
				bottom: 20rpx;
				font-size: 44rpx;
				font-weight: bold;
				color: #000;
				text-shadow: 0 4rpx 10rpx rgba(51, 48, 48, 0.5);
				background-color: rgba(255, 255, 255, 0.5);
				padding: 10rpx;
				box-shadow: 0 4rpx 10rpx rgba(51, 48, 48, 0.5);
			}
		}

		.video {
			width: 100%;
			height: 400rpx;
			flex-basis: 400rpx;
		}
	}

	.result-container {
		padding: 40rpx 20rpx;
		font-weight: bold;

		.result-title {
			color: #fff;
			font-size: 50rpx;
		}

		.result-info {
			display: flex;
			flex-direction: row;
			align-items: center;
			text-align: left;
			padding: 10rpx 0;
			box-sizing: border-box;
			color: #8893A7;
			font-size: 30rpx;

			.result-info-name {
				flex-basis: 130rpx;
			}

			.result-info-issue {
				flex-basis: 160rpx;
			}

			.result-info-numbers {
				flex: 3;
				display: flex;
				flex-direction: row;

				.result-info-numbers-number {
					width: 60rpx;
					height: 60rpx;
					background-color: #8893A7;
					border-radius: 50%;
					margin: 0 5rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					color: #fff;
					font-size: 40rpx;
					font-weight: bold;
				}
			}
		}
	}
}
</style>