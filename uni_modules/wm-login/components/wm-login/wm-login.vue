<template>
	<view class="page">
		<view class="circle"></view>
		<view class="white-box">
			<view class="text-center mb40">
				<image class="user" src="./images/user.png" mode=""></image>
			</view>
			<!--#ifndef MP-->
			<view class="input">
				<image class="input-icon" src="./images/phone.png" mode=""></image>
				<input class="uni-input" v-model="phone" placeholder="请输入手机号" />
			</view>
			<view class="input">
				<image class="input-icon" src="./images/code.png" mode=""></image>
				<input class="uni-input" v-model="code" placeholder="请输入验证码" />
				<button type="default" size="mini" :disabled="!canGetCode" @click="handleGetCode">{{tips}}</button>
			</view>
			<view class="mb20">
				<button class="btn" type="primary" @click="handleLogin">登录</button>
			</view>
			<checkbox-group @change="handleCheckChange" v-if="showPolicy">
				<label class="small-text">
					<checkbox style="transform:scale(0.7)" value="read" />
					<text>阅读并同意</text>
					<text class="text-blue" @click="handleShowPop('user')">《用户协议》</text>
					<text>和</text>
					<text class="text-blue" @click="handleShowPop('privacy')">《隐私政策》</text>
				</label>
			</checkbox-group>
			<template v-if="showWechat">
				<view class="wechat">微信登录</view>
				<image class="wt-img" src="./images/wechat.png" @click="handleWechatLogin"></image>
			</template>
			
			<view class="wm-popup" v-if="showPop" @click="showPop = false">
				<view class="wm-popct">
					<rich-text :nodes="content"></rich-text>
				</view>
			</view>
			<!--#endif-->
			<!--#ifdef MP-->
			<button class="btn" type="primary" open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">微信授权登录</button>
			<!--#endif-->
		</view>
	</view>
</template>
<script setup>
	import {
		ref
	} from 'vue';
	const phone = ref('')
	const code = ref('')
	const tips = ref('获取验证码')
	const canGetCode = ref(true)
	const hasRead = ref([])
	const showPop = ref(false)
	const content = ref('')
	const props = defineProps({
		showWechat: {
			type: Boolean,
			default: true
		},
		showPolicy: {
			type: Boolean,
			default: true
		},
		userAgreement: '',
		privacyPolicy: ''
	})
	const emit = defineEmits(['sendCode', 'phoneLogin', 'wechatLogin', 'getPhone'])
	let timer = null, time = 60
	
	const handleGetCode = () => {
		if (!phone.value) {
			uni.showToast({
				title: '请输入手机号',
				icon: 'none'
			})
			return
		}
		if(!(/^1[3-9]\d{9}$/.test(phone.value))){ 
			uni.showToast({
				title: '手机号格式有误',
				icon: 'none'
			})
			return
		}
		if (!canGetCode.value) {
			uni.showToast({
				title: '请在倒计时结束后再次获取',
				icon: 'none'
			})
			return
		}
		canGetCode.value = false
		tips.value = '60S后获取'
		// 事件传递：发送验证码
		emit('sendCode')
		timer = setInterval(() => {
			time--
			tips.value = time + 'S后获取'
			if (time <= 0) {
				clearInterval(timer)
				time = 60
				tips.value = '获取验证码'
				canGetCode.value = true
			}
		}, 1000)
	}
	const handleCheckChange = (e) => {
		hasRead.value = e.detail.value
	}
	const handleLogin = () => {
		if (!code.value) {
			uni.showToast({
				title: '请输入验证码',
				icon: 'none'
			})
			return
		}
		// if (hasRead.value.length == 0) {
		// 	uni.showToast({
		// 		title: '请阅读并同意用户协议和隐私政策',
		// 		icon: 'none'
		// 	})
		// 	return
		// }
		emit('phoneLogin', {phone: phone.value, code: code.value})
	}
	const handleWechatLogin = () => {
		emit('wechatLogin')
	}
	const handleShowPop = (type) => {
		showPop.value = true
		if (type == 'user') {
			content.value = props.userAgreement
		} else {
			content.value = props.privacyPolicy
		}
	}
	const getPhoneNumber = (e) => {
		emit('getPhone', {code: e.detail.code})
	}
</script>
<style lang="scss" scoped>
	.page {
		position: relative;
		align-items: center;
		width: 100%;
		height: 100vh;
		background-color: rgb(118, 218, 255);
		overflow: hidden;

		&:before,
		&:after {
			content: "";
			position: absolute;
			left: 50%;
			min-width: 300vw;
			min-height: 300vw;
			background-color: #F0F5F5;
			animation-name: rotate;
			animation-iteration-count: infinite;
			animation-timing-function: linear;
		}

		&:before {
			bottom: 15vh;
			border-radius: 45%;
			animation-duration: 10s;
		}

		&:after {
			bottom: 12vh;
			opacity: .5;
			border-radius: 47%;
			animation-duration: 10s;
		}

		.circle {
			width: 200px;
			height: 200px;
			border-radius: 50%;
			background-color: rgb(118, 218, 255);
			position: absolute;
			top: -100px;
			right: -100px;
		}

		.white-box {
			position: relative;
			z-index: 2;
			background: #fff;
			width: 660rpx;
			padding: 60rpx 40rpx;
			box-sizing: border-box;
			border-radius: 20rpx;
			box-shadow: 0 1px 3px 1px #B3E8FA;
			/*#ifndef MP*/
			margin: 100px auto 0;
			/*#endif*/
			/*#ifdef MP*/
			margin: 200px auto 0;
			/*#endif*/
			.user {
				width: 80px;
				height: 80px;
				display: block;
				margin: 0 auto;
			}

			.input {
				margin: 20px auto;
				border: 1px solid #ccc;
				padding: 8px;
				border-radius: 20px;
				display: flex;
				align-items: center;

				.input-icon {
					width: 20px;
					height: 20px;
					margin-right: 5px;
				}

				uni-button {
					background: linear-gradient(-45deg, #00c3ff, #58fff5);
					color: #fff;
					border-radius: 20px;
					flex-shrink: 0;
					&[disabled][type='default'] {
						background: #999;
					}
				}
			}

			.btn {
				background-color: #00c3ff;
				border-radius: 20px;
				margin-top: 40px;
			}

			.wechat {
				position: relative;
				font-size: 16px;
				text-align: center;
				margin-top: 80px;
				margin-bottom: 20px;

				&::before,
				&::after {
					content: '';
					display: block;
					width: 50px;
					height: 1px;
					background: #eee;
					position: absolute;
				}

				&::before {
					left: 18%;
					top: 10px;
				}

				&::after {
					right: 18%;
					top: 10px;
				}
			}
			.wt-img {
				width: 50px;
				height: 50px;
				display: block;
				margin: 0 auto;
			}
		}
	}
	.wm-popup {
		position: fixed;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		z-index: 99;
		background: rgba(0, 0, 0, 0.2);
		.wm-popct {
			position: fixed;
			left: 0;
			right: 0;
			bottom: 0;
			padding: 20px;
			background: #fff;
			min-height: 50vh;
			max-height: 80vh;
			overflow-y: auto;
			border-radius: 10px 10px 0 0;
			z-index: 100;
		}
	}
	.text-blue {
		color: #00c3ff;
	}
	.small-text {
		font-size: 14px;
	}
	.mb20 {
		margin-bottom: 20px;
	}

	.mb40 {
		margin-bottom: 40px;
	}

	@keyframes rotate {
		0% {
			transform: translate(-50%, 0) rotateZ(0deg);
		}

		50% {
			transform: translate(-50%, -2%) rotateZ(180deg);
		}

		100% {
			transform: translate(-50%, 0%) rotateZ(360deg);
		}
	}
</style>