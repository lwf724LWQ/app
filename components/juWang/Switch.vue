<template>
	<view class="switch" @click="change">
		<view>{{leftText}}</view>
		<view>{{rightText}}</view>
		<view class="btn" :class="{left:text===leftText,right:text===rightText}">{{text}}</view>
	</view>
</template>

<script setup>
import {ref} from "vue"
const props=defineProps({
	leftText:String,
	rightText:String,
})
const model = defineModel()

const text = ref(model||props.leftText)

const change = ()=>{
	text.value= text.value === props.leftText?props.rightText:props.leftText
}
</script>

<style lang="scss" scoped>
$var-width : 260rpx;
$var-height : 70rpx;
$var-padding : 2rpx;
.switch{
	width: $var-width;
	height: $var-height;
	font-weight: 700;
	border-radius: 35rpx;
	background-color: #EEEEEB;
	padding: $var-padding;
	position: relative;
	display: flex;
	justify-content: space-around;
	text-align: center;
	line-height: $var-height;
	color: rgba(#000,0.3);
	.btn{
		position: absolute;
		top:$var-padding;
		width: calc($var-width / 2 - $var-padding);
		border-radius: calc($var-width / 4 - $var-padding/2);
		height: calc($var-height - $var-padding * 2);
		padding: 0;
		text-align: center;
		line-height: calc($var-height - $var-padding * 2);
		color:#FF3D1E;
		background-color: #FFFFFC;
		transition: all 0.2s ease-in-out;
		z-index: 1;
	}
	.left{
		left:$var-padding;
	}
	.right{
		left:calc($var-width/2 - $var-padding);
	}
}

</style>