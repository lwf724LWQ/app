<template>
	<view>
		<view @click="initwx">initWXsdk</view>
		123
	</view>
</template>

<script>
import tool from '../../utils/tool';
export default {
	data() {
		return {

		}
	},
	methods: {
		initwx() {
			tool.initWxSDK()
		}
	}
}
</script>

<style></style>
