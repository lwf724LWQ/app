<template>
	<view class="userLayout pageBg">
		<view :style="{height:getNavBarHeight()+'px'}"></view>
		<view class="userInfo" v-if="memberStore.profile">
			<view class="avatar">
				<image :src="memberStore.profile.avatar" mode="aspectFill"></image>
			</view>
			<view class="ip">{{memberStore.profile.nickname}}</view>
		</view>
		<!-- 情况2：未登录 -->
		<view class="userInfo" v-else>
			<view class="avatar gray">
				<image src="../../static/images/defaultAvatar.png" mode="aspectFill"></image>
			</view>
			<view class="ip">
				<navigator url="/pages/login/login" hover-class="none" class="nickname">
					未登录
				</navigator>
			</view>
		</view>

		<view class="menu-container">
			<!-- 循环渲染菜单列表 -->
			<view v-for="(item, index) in menuList" :key="index" class="menu-item" @click="handleMenuClick(item)">
				<!-- 左侧图标（使用 Uniapp 内置 uni-icons 组件） -->
				<uni-icons :type="item.icon" size="24" color="#333"></uni-icons>
				<!-- 中间文字区域（主标题 + 可选副标题） -->
				<view class="text-area">
					<text class="title">{{ item.title }}</text>
					<text class="sub-title" v-if="item.subTitle">{{ item.subTitle }}</text>
				</view>
				<!-- 右侧箭头（可选，通过 hasArrow 控制显示） -->
				<uni-icons v-if="item.hasArrow" type="arrowright" size="16" color="#999"></uni-icons>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<view class="logout-container" v-if="getToken()">
			<button class="logout-btn" @click="logout">退出登录</button>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		onMounted
	} from "vue";
	import {
		onShow
	} from "@dcloudio/uni-app";
	import {
		getNavBarHeight
	} from "@/utils/system.js"
	import {
		getToken,
		removeToken
	} from "@/utils/request.js";

	const memberStore = reactive({
		profile: null
	});

	// 检查登录状态
	const checkLoginStatus = () => {
		const token = getToken();
		if (token) {
			// 有token表示已登录，设置profile对象
			memberStore.profile = {
				avatar: '../../static/images/xxmLogo.png', // 默认头像
				nickname: '欢迎您'
			};
		} else {
			// 没有token表示未登录
			memberStore.profile = null;
		}
	}

	// 退出登录
	const logout = () => {
		uni.showModal({
			title: '确认退出',
			content: '确定要退出登录吗？',
			success: (res) => {
				if (res.confirm) {
					// 清除token
					removeToken();
					// 更新登录状态
					checkLoginStatus();
					// 显示退出成功提示
					uni.showToast({
						title: '已退出登录',
						icon: 'success'
					});
				}
			}
		});
	}
	//-------------------------------------------------------------------------
	const menuList = ref([
		{
			icon: 'videocam-filled', // uni-icons 内置图标名（软件分享）
			title: '上传视频',
			hasArrow: true
		},
		{
			icon: 'contact', // uni-icons 内置图标名（联系客服）
			title: '联系客服',
			subTitle: '',
			hasArrow: true
		},
		{
			icon: 'paperplane-filled', // uni-icons 内置图标名（软件分享）
			title: '软件分享',
			subTitle: '分享给朋友',
			hasArrow: true
		},
		{
			icon: 'email-filled', // uni-icons 内置图标名（建议反馈）
			title: '建议反馈',
			subTitle: '',
			hasArrow: true
		},
		{
			icon: 'upload-filled', // uni-icons 内置图标名（版本箭头示意）
			title: '版本',
			subTitle: '已是最新版V3.4.0.2',
			hasArrow: true
		},
		{
			icon: 'settings', // uni-icons 内置图标名（设置）
			title: '设置',
			subTitle: '',
			hasArrow: true
		},
	]);

	// 菜单项点击事件
	const handleMenuClick = (item) => {
		// 示例：跳转页面（需提前配置 pages.json 路由）
		if (item.title === '上传视频') {
			console.log(item.title)
		  uni.navigateTo({ url: "oss"});
		}
	};

	// 页面加载时检查登录状态
	onMounted(() => {
		checkLoginStatus();
	});

	// 页面显示时也检查登录状态（确保从登录页面返回时能更新状态）
	onShow(() => {
		checkLoginStatus();
	});
</script>

<style lang="scss" scoped>
	.userLayout {
		.userInfo {
			display: flex;
			align-items: center;
			justify-content: center;
			flex-direction: column;
			padding: 50rpx 0;

			.avatar {
				width: 160rpx;
				height: 160rpx;
				border-radius: 50%;
				overflow: hidden;

				image {
					width: 100%;
					height: 100%;
				}
			}

			.ip {
				font-size: 44rpx;
				color: #333;
				padding: 20rpx 0 5rpx;
			}

			.gray {
				filter: grayscale(100%);
			}
		}

	}

	.menu-container {
		background-color: #fff;
		padding: 0 16rpx;
	}

	/* 单个菜单项布局 */
	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
		border-bottom: 1px solid #f5f5f5;
		/* 分隔线 */
	}

	/* 文字区域（主标题 + 副标题） */
	.text-area {
		display: flex;
		flex-direction: column;
		margin-left: 12rpx;
		flex: 1;
		/* 让文字区域占满中间空间 */
	}

	.title {
		font-size: 32rpx;
		color: #333;
		font-weight: 400;
	}

	.sub-title {
		font-size: 28rpx;
		color: #999;
		margin-top: 4rpx;
	}

	/* 调整右侧箭头与文字区域的间距 */
	.menu-item>uni-icons:last-child {
		margin-left: 12rpx;
	}

	/* 退出登录按钮样式 */
	.logout-container {
		padding: 40rpx 32rpx;
		margin-top: 40rpx;
	}

	.logout-btn {
		width: 100%;
		height: 88rpx;
		background-color: #ff4757;
		color: #fff;
		border: none;
		border-radius: 44rpx;
		font-size: 32rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.logout-btn:active {
		background-color: #ff3742;
	}
</style>