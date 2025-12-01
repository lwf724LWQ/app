<template>
</template>

<script setup>
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app'
import { ref, reactive, onMounted, inject } from 'vue';
import { } from '../../api/apis';

// 下拉刷新钩子
onPullDownRefresh(async () => {
	console.log('下拉刷新触发')
	// 执行刷新数据的函数
	try {
		await fetchSpaceData();
	} catch (error) {

	}
	// 停止下拉刷新
	uni.stopPullDownRefresh()
})

onShow(async () => {
	await fetchSpaceData();
})


// 获取空间数据
const spaceVideoList = ref([])
const userInfo = ref({})
async function fetchSpaceData() {

}
</script>

<style></style>