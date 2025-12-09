<template>
	<view>
		<view @click="initwx">21</view>
	</view>
</template>

<script>
// import appPay from "../../utils/uniwxsdk/app.ts";
// import h5 from '../../utils/uniwxsdk/h5';
import tool from "../../utils/tool"
export default {
	data() {
		return {

		}
	},
	methods: {
		initwx() {
			uni.chooseFile({
				complete(res) {
					console.log(res)
					tool.oss.upload(res.tempFiles[0],{
						folder: "app"
					})
				}
			})
		}
	}
}
</script>

<style></style>
