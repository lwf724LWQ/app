<template>
	<view class="container">
		<view class="wrapper">
			<view class="navbar">
				<!-- 返回按钮 -->
				<view class="navbar-left" @click="goBack">
					<uni-icons type="left" size="30"></uni-icons>
				</view>
				<!-- 标题 -->
				<view class="navbar-title">{{ videoData.title }}</view>
			</view>
			<!-- 视频播放器容器 -->
			<view class="video-container">
				<!-- <video v-if="videoData.src" :src="videoData.src" :controls="isPlaying" :autoplay="false" -->
				<video v-if="videoData.id && hasPaid" v-show="!showFormImage" :src="videoData.src" :show-play-btn="true"
					:controls="true" :autoplay="false" :show-fullscreen-btn="true" object-fit="cover"
					class="video-player" :class="{ 'video-full-screen': isFullScreen }" id="videoPlayer"
					@play="onVideoPlay" @pause="onVideoPause" @ended="onVideoEnded"></video>
				<view v-else-if="videoData.id"></view>
				<view v-else class="video-placeholder">
					<text class="placeholder-text">视频加载中...</text>
				</view>

				<!-- 播放按钮遮罩层 -->
				<view class="play-overlay" v-if="showPlayButton" @click="playVideo">
					<view class="play-button">
						<uni-icons type="play-filled" size="60" color="#fff"></uni-icons>
					</view>
				</view>

				<!-- 购买按钮（如果有价格） -->
				<view class="buy-overlay" v-if="!hasPaid && videoData.price && videoData.price > 0"
					@click="handleBuyClick">
					<view class="buy-button">
						<view class="buy-text">¥{{ videoData.price }}购买</view>
					</view>
				</view>
			</view>

			<!-- 表单图片显示遮罩层（独立层级） -->
			<cover-view class="form-image-overlay" v-show="showFormImage" @click="closeFormImage">
				<cover-view class="form-image-container" @click.stop>
					<cover-view class="form-image-header">
						<cover-view class="form-image-title">开奖号码记录</cover-view>
						<cover-view class="form-image-close" @click="closeFormImage">
							X
							<!-- <uni-icons type="close" size="24" color="#666"></uni-icons> -->
						</cover-view>
					</cover-view>
					<cover-image :src="formImageUrl" class="form-image" mode="aspectFit" @error="handleFormImageError"
						@load="handleFormImageLoad"></cover-image>
					<!-- #ifdef H5 -->
					<cover-view class="save-image-button" @click="saveImg">长按图片保存</cover-view>
					<!-- #endif -->
					<!-- #ifdef APP-PLUS -->
					<cover-view class="save-image-button" @click="saveImg">保存到相册</cover-view>
					<!-- #endif-->
				</cover-view>
			</cover-view>

			<!-- 打赏和点赞区域 -->
			<view class="interaction-bar">
				<view class="reward-interaction" @click="goToRewardPage">
					<uni-icons type="gift-filled" size="20" color="#FF9500"></uni-icons>
					<text class="interaction-text">打赏 0</text>
				</view>
				<view class="like-interaction" :class="videoData.isLiked ? 'liked' : ''" @click="toggleLike">
					<uni-icons :type="videoData.isLiked ? 'heart-filled' : 'heart'" size="20"
						:color="videoData.isLiked ? '#ff4757' : '#FF9500'"></uni-icons>
					<text class="interaction-text">点赞 {{ videoData.likeCount }}</text>
				</view>
			</view>

			<!-- 作者和视频信息 -->
			<view class="video-info-card">
				<view class="info-header">
					<image v-if="userInfo.himg || userInfo.uname" :src="getAvatarUrl(userInfo.himg)"
						@click="toUserSpace" class="author-avatar"></image>
					<view class="author-info">
						<text class="author-name">{{ userInfo.uname }}出品</text>
						<text class="video-count">视频</text>
					</view>
					<view class="header-actions">
						<button class="teacher-btn" @click="toUserSpace">讲师主页</button>
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
					<view class="icon-item" @click="toIndex">
						<uni-icons type="home" size="24" color="#FFD700"></uni-icons>
						<text class="icon-label">首页</text>
					</view>

				</view>
				<button class="bottom-buy-btn" @click="handleBuyClick">
					{{ buttonText }}
				</button>
			</view>
		</view>
	</view>
</template>

<script setup>
import {
	ref,
	computed,
	onMounted,
	inject
} from 'vue';
import {
	onLoad,
	onShow
} from '@dcloudio/uni-app';
import {
	apiGetLikelist,
	apiGetIsLike,
	apiCheckVideoPayment,
	apiUserimg,
	apiGetVideo,
	apiWordQuery,
	apiGetVideoDetail
} from '@/api/apis';
import {
	getToken,
	getAccount
} from '@/utils/request.js';
import {
	useVideoStore
} from '@/stores/video.js'

const useOldManModeStore = inject("useOldManModeStore")

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
const hasPaid = ref(false) // 是否已付费

// 计算是否为免费视频
const isFreeVideo = computed(() => {
	return !videoData.value.flag || videoData.value.price === 0
})

// 计算按钮显示文本
const buttonText = computed(() => {
	if (isFreeVideo.value || hasPaid.value) {
		return '开始学习'
	}
	return '点击购买'
})
//用户头像，名字接口数据接收
const userInfo = ref({
	uname: '',
	himg: ''
});

// 表单图片相关数据
const showFormImage = ref(false) // 控制表单图片显示
const formImageUrl = ref('') // 表单图片URL

// 获取头像的方法
const getAvatarUrl = (himg) => {
	if (!himg) return '/static/images/defaultAvatar.png'; // 如果没有头像，返回默认头像
	return `http://video.caimizm.com/himg/${himg}`;
};

// 加载视频数据的统一方法
const loadVideoData = async (videoId) => {
	if (!videoId) {
		uni.redirectTo({ url: '/pages/index/index' })
	}
	try {
		let currentVideo = {}
		uni.showLoading({ title: '加载中...' })
		// 加载视频数据
		const response = await apiGetVideoDetail({ videoId: videoId })
		if (response.code === 200 && response.data) {
			const item = response.data
			currentVideo = {
				id: item.id,
				title: item.title,
				src: `http://video.caimizm.com/${item.url}`,
				account: item.account,
				likeCount: item.likeCount || 0,
				isLiked: item.isLiked || false,
				flag: item.price > 0 ? item.flag : false, // 是否为收费视频
				price: item.price,
				imgurl: `http://video.caimizm.com/${item.vimg}`
			}
		} else {
			uni.showToast({
				title: '视频不存在',
				icon: 'none'
			})
			setTimeout(() => {
				uni.redirectTo({ url: '/pages/video/video' })
			}, 1500)
			return
		}

		// 使用获取到的视频数据
		if (currentVideo && currentVideo.id === videoId) {
			videoData.value = {
				id: currentVideo.id,
				title: currentVideo.title,
				src: "",
				account: currentVideo.account,
				likeCount: currentVideo.likeCount || 0,
				isLiked: currentVideo.isLiked || false,
				flag: currentVideo.flag,
				price: currentVideo.price,
			}
			// 调用apiUserimg获取用户信息
			if (currentVideo.account) {
				await getUserInfo(currentVideo.account)
			}

			// 初始化视频上下文（如果视频数据已加载）
			if (videoData.value.src && !videoContext.value) {
				videoContext.value = uni.createVideoContext('videoPlayer')
			}
			let isPay = true
			// 检查付费状态（仅对付费视频）
			if (!isFreeVideo.value) {
				isPay = await checkPaymentStatus()
			} else {
				hasPaid.value = true
			}

			if (isPay) {
				// 这里判断已经付费才加载视频
				videoData.value.src = await toBlobUrlVideo(currentVideo.src)
			}
		}
	} catch (error) {
		console.error(error)
		uni.showToast({
			title: '加载视频失败',
			icon: 'none'
		})
	} finally {
		uni.hideLoading()
	}
}
// 将视频转为blob
/**
 * @param {string} videoUrl 视频URL
 * @returns {Promise<Blob>} 转换后的Blob对象
 */
const toBlobUrlVideo = (videoUrl) => {
	return new Promise((resolve, reject) => {
		// #ifndef H5
		resolve(videoUrl)
		return
		// #endif
		fetch(videoUrl)
			.then((response) => response.blob())
			.then((blob) => {
				// 创建一个URL对象，将Blob对象转换为URL
				const url = URL.createObjectURL(blob)
				resolve(url)
			})
			.catch((error) => {
				reject(error)
			})
	})
}

// 跳转到首页
const toIndex = () => {
	uni.switchTab({ url: '/pages/index/index' })
}

// 检查付费状态
/**
 * @returns Boolean 是否已付费
 */
const checkPaymentStatus = async () => {
	// 如果是免费视频，不需要检查
	if (isFreeVideo.value) {
		hasPaid.value = true
		return true
	}

	// 检查是否登录
	const token = getToken()
	if (!token) {
		hasPaid.value = false
		return true
	}

	try {
		const paymentCheck = await apiCheckVideoPayment({
			videoId: videoData.value.id,
			account: getAccount()
		})

		if (paymentCheck.data) {
			hasPaid.value = true
		} else {
			hasPaid.value = false
		}
		return hasPaid.value
	} catch (error) {
		hasPaid.value = false
		uni.showToast({
			title: '检查付费状态失败',
			icon: 'none'
		})
	}
	return false
}
const pageOptions = {}
// 获取路由参数
onLoad(async (options) => {
	pageOptions.id = options.id
})

// 页面显示时重新加载数据（刷新时触发）
onShow(async () => {
	// 重置表单图片状态
	// showFormImage.value = false
	// formImageUrl.value = ''

	// 如果 videoData 中没有 id，尝试从 store 或 URL 参数获取
	// if (!videoData.value.id) {
	// 	const pages = getCurrentPages()
	// 	const currentPage = pages[pages.length - 1]
	// 	const options = currentPage.options || {}
	// 	if (options.id) {
	// 		await loadVideoData(options.id)
	// 	}
	// } else {
	// 	// 重新加载当前视频数据
	// 	await loadVideoData(videoData.value.id)
	// }

	// 重新检查付费状态
	await loadVideoData(pageOptions.id)
})

// 在onMounted中初始化视频上下文
onMounted(() => {
	// 延迟初始化，确保视频元素已渲染
	setTimeout(() => {
		if (videoData.value.src && !videoContext.value) {
			videoContext.value = uni.createVideoContext('videoPlayer')
		}
	}, 100)
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

		if (response.code === 200) {
			// 更新用户信息
			userInfo.value = {
				uname: response.data.uname,
				himg: response.data.himg
			};
		} else {
			// 使用默认信息
			userInfo.value = {
				uname: account,
				himg: ''
			};
		}
	} catch (error) {
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
	// 免费视频或已付费视频，直接播放
	if (isFreeVideo.value || hasPaid.value) {
		if (!videoContext.value && videoData.value.src) {
			videoContext.value = uni.createVideoContext('videoPlayer')
		}
		if (videoContext.value) {
			videoContext.value.play()
			isPlaying.value = true
			showPlayButton.value = false
		}
		return;
	}

	// 付费视频且未付费，需要检查或支付
	// 如果 hasPaid 还未确定，先检查一次
	if (!hasPaid.value) {
		await checkPaymentStatus()
		// 如果检查后发现已付费，直接播放
		if (hasPaid.value) {
			if (!videoContext.value && videoData.value.src) {
				videoContext.value = uni.createVideoContext('videoPlayer')
			}
			if (videoContext.value) {
				videoContext.value.play()
				isPlaying.value = true
				showPlayButton.value = false
			}
			return
		}
	}

	// 用户未付费，显示付费提示
	uni.showModal({
		title: '付费视频',
		content: `观看此视频需要支付${videoData.value.price}金币`,
		confirmText: '立即支付',
		cancelText: '取消',
		success: async (res) => {
			if (res.confirm) {
				// 跳转到支付页面
				await payForVideo();
			}
		}
	});
};

const payForVideo = async () => {
	// 准备支付数据
	const paymentData = {
		info: `视频: ${videoData.value.title}`,
		amount: videoData.value.price,
		type: 3, // 视频付费类型
		account: getAccount(),
		payType: 0, // 默认微信支付
		channel: 0, // 微信小程序
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

// 视频播放结束事件
const onVideoEnded = async () => {
	console.log('视频播放结束，开始获取表单图片')
	isPlaying.value = false
	showPlayButton.value = false


	// 获取表单图片
	await fetchFormImage()
}

// 获取表单图片
const fetchFormImage = async () => {
	if (!videoData.value.id) {
		console.log('获取表单图片失败：视频ID为空')
		return
	}
	// 判断是否为收费视频
	if (videoData.value.flag === false) {
		return
	}

	uni.showLoading({
		title: '正在获取表单图片...',
		mask: true
	})
	const videoId = videoData.value.id
	try {
		console.log('开始获取表单图片，视频ID:', videoId)
		const response = await apiWordQuery({ videoId: videoId })
		console.log('表单图片API响应:', response)

		formImageUrl.value = `http://video.caimizm.com/${response.msg}`
		showFormImage.value = true
	} catch (error) {
		console.error('获取表单图片异常:', error)
		// uni.showToast({
		// 	title: '获取预测图片失败',
		// 	icon: 'none',
		// 	duration: 2000
		// })
	}
	uni.hideLoading()
}

function saveImg() {
	uni.saveImageToPhotosAlbum({
		filePath: formImageUrl.value,
		success: function (res) {
			uni.showToast({
				title: '保存成功',
				icon: 'success',
				duration: 2000
			})
		},
		fail: function (err) {
			console.log(err.errMsg)
			uni.showToast({
				title: '保存失败',
				icon: 'none',
				duration: 2000
			})
		}
	})
}

// 关闭表单图片
const closeFormImage = () => {
	showFormImage.value = false
	showPlayButton.value = true
}

// 处理表单图片加载错误
const handleFormImageError = (e) => {
	console.error('表单图片加载失败:', e)
	console.error('图片URL:', formImageUrl.value)
	uni.showToast({
		title: '图片加载失败',
		icon: 'none',
		duration: 2000
	})
}

// 处理表单图片加载成功
const handleFormImageLoad = (e) => {
	console.log('表单图片加载成功:', formImageUrl.value)
}

// 处理购买按钮点击
const handleBuyClick = async () => {
	// 免费视频或已付费视频，直接播放
	if (isFreeVideo.value || hasPaid.value) {
		if (!videoContext.value && videoData.value.src) {
			videoContext.value = uni.createVideoContext('videoPlayer')
		}
		if (videoContext.value) {
			videoContext.value.play()
			isPlaying.value = true
			showPlayButton.value = false
		}
	} else {
		// 付费视频且未付费，跳转到支付
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

		// 获取点赞列表（可选）
		const likeList = await apiGetLikelist(getAccount());
	} catch (error) {
		// 恢复原始状态
		videoData.value.isLiked = originalIsLiked;
		videoData.value.likeCount = originalLikeCount;

		uni.showToast({
			title: '操作失败，请重试',
			icon: 'none'
		});
	}
};

function toUserSpace() {
	// uni.navigateTo({
	// 	url: '/pages/user/space?id='
	// });
}
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
	font-weight: bold;
	padding-top: var(--status-bar-height);
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

.video-full-screen {
	position: absolute;
	top: 0;
	left: 0;
	bottom: 80rpx
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
	border: 1rpx solid #000;
	color: #000;
	font-size: 40rpx;
	font-weight: bold;
}

.follow-btn {
	color: #000;
	font-size: 40rpx;
	font-weight: bold;
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
	font-size: 40rpx;
	font-size: bold;
	color: #000;
}

.bottom-buy-btn {
	flex: 1;
	background-color: #FF9500;
	color: #fff;
	border: none;
	border-radius: 50rpx;
	font-size: 42rpx;
	font-weight: 600;
	margin-left: 40rpx;
}

/* 视频加载占位符 */
.video-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: #000;
}

.placeholder-text {
	color: #fff;
	font-size: 28rpx;
}

/* 表单图片显示 */
.form-image-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.8);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.form-image-container {
	width: 90%;
	max-width: 600rpx;
	background-color: #fff;
	border-radius: 20rpx;
	overflow: hidden;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
}

.form-image-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.form-image-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #333;
}

.save-image-button {
	width: 100%;
	height: 48rpx;
	line-height: 48rpx;
	padding: 20rpx;
	border-radius: 10rpx;
	font-size: 38rpx;
	text-align: center;
	background-color: #ff623a;
}

.form-image-close {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.form-image {
	width: 100%;
	height: 70vh;
}

.form-image-loading {
	padding: 60rpx;
	text-align: center;
	color: #666;
	font-size: 28rpx;
}
</style>