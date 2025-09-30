# 通用登录页面组件
## 介绍 
APP端及H5可使用手机号验证码登录及微信登录，小程序端可使用微信授权手机号登录
## 开始使用
### 本插件使用vue3开发，使用时请注意适配
1. 在插件市场右上角选择 使用Hbuilder X导入插件
2. 新建login.vue页面
```vue
<template>
	<view class="page">
		<wmLogin 
			:showWechat="true" 
			:showPolicy="true"
			:userAgreement="userAgreement"
			:privacyPolicy="privacyPolicy"
			@sendCode="handleSendCode"
			@phoneLogin="handlePhoneLogin"
			@wechatLogin="handleWechatLogin"
			@getPhone="handleGetPhone">
		</wmLogin>
	</view>
</template>
```
3. 导入插件
```js
import wmLogin from "@/uni_modules/wm-login/components/wm-login/wm-login.vue"
```
4. 页面中添加以下方法
```js
	const userAgreement = ref('')
	const privacyPolicy = ref('')
	onLoad(() => {
		// 模拟后端获取用户协议和隐私政策
		setTimeout(() => {
			userAgreement.value = '这是用户协议'
			privacyPolicy.value = '这是隐私政策'
		}, 2000)
	})
	const handleSendCode = () => {
		// 模拟后端发送验证码
		setTimeout(() => {
			uni.showToast({
				title: '验证码已发送'
			})
		}, 1000)
	}
	const handleWechatLogin = () => {
		// 微信登录逻辑
		console.log('微信登录');
	}
	const handlePhoneLogin = (data) => {
		console.log(data);
		uni.showToast({
			title: '登录成功'
		})
		uni.navigateBack()
	}
	// 小程序获取手机号
	const handleGetPhone = (data) => {
		console.log(data);
	}
```  

## 属性列表
| 属性 | 类型 | 默认值 | 说明 |
| ----- | ----- | ----- | ----- |
| showWechat | Boolean | true | 是否显示下方微信登录 |
| showPolicy | Boolean | true | 是否显示用户协议和隐私政策 |
| userAgreement | string | '' | 用户协议内容 |
| privacyPolicy | string | '' | 隐私政策内容 |


## 方法列表
| 名称 | 说明 | 参数 |
| ----- | ----- | ----- |
| sendCode | 发送验证码 | 无 |
| phoneLogin | 手机号登录 | data: {phone: '手机号', code: '验证码'} |
| wechatLogin | 微信登录 | 无 |
| getPhone | 小程序获取手机号回调 | data: {code: '小程序返回的code'} |