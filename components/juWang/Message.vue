<template>
	<uni-popup ref="msgNode" type="center">
		<view class="msg">
				{{msg}}
		</view>
	</uni-popup>
</template>

<script setup>
import {ref} from 'vue'
const msgNode = ref(null)

const props = defineProps({
	delay:{
		type:Number,
		required: true,
		default: 1000
	}
})
const msg = ref('')
const send = (m)=>{
	msg.value=m
	msgNode.value.open('center')
	setTimeout(msgNode.value.close,props.delay)
}

defineExpose({
	send
})
</script>

<style scoped>
:deep([name="mask"]){
	background-color: transparent !important;
}
.msg{
	padding: 50rpx;
	border-radius: 20rpx;
	color: #fff;
	background-color: rgba(0, 0, 0, 0.7);
}
</style>