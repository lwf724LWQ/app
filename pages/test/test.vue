<template>
	<view>
		<view @click="initwx">initWXsdk</view>
		123
	</view>
</template>

<script>
// import appPay from "../../utils/uniwxsdk/app.ts";
import h5 from '../../utils/uniwxsdk/h5';
export default {
	data() {
		return {

		}
	},
	methods: {
		initwx() {
			// appPay.pay()
			h5.init()
			return
			uni.requestPayment({
				provider: 'wxpay',
				orderInfo: {
					appId: "wxd930ea5d5a258f4f",
					partnerId: "1900000109",
					prepayId: "1101000000140415649af9fc314aa427",
					packageValue: "Sign=WXPay",
					nonceStr: "1101000000140429eb40476f8896f4c9",
					timeStamp: "1398746574",
					sign: "oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ\/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8Pfso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7eaLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+AehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq\/xDg=="
				},
				success: function (res) {
					console.log(res)
				},
				fail: function (res) {
					console.log(res)
				}
			})
		}
	}
}
</script>

<style></style>
