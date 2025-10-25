<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<view class="navbar">
			<!-- 返回按钮 -->
			<view class="navbar-left" @click="goBack">
				<uni-icons type="left" size="30"></uni-icons>
			</view>
			<!-- 标题 -->
			<view class="navbar-title"></view>
			<!--      -{{ counter.count }}-->
			<!-- 右侧菜单按钮 -->
			<view class="navbar-right" @click.stop="togglePopover">
				<text class="menu-icon">⋮</text>
			</view>
		</view>



		<!-- Popover菜单 -->
		<view class="popover" :class="{ 'show': isPopoverShow }" @click.stop>
			<view class="popover-content">
				<view class="menu-item" @click="handleMenuClick('draw')">
					<uni-icons type="color-filled" size="30"></uni-icons>
					<text class="menu-text">去画规</text>
				</view>
			</view>
		</view>

		<!-- 遮罩层 -->
		<view class="mask" v-if="isPopoverShow" @click="closePopover"></view>
		<!-- 表格样式数字容器 -->
		<view class="numbers-table-container">
			<table class="numbers-table">
				<!-- 列宽定义 -->
				<colgroup>
					<col class="col-def-1"> <!-- 第一列 -->
					<col class="col-def-2"> <!-- 第二列（变窄） -->
					<col class="col-def-3"> <!-- 第三列 -->
					<col class="col-def-4"> <!-- 第四列 -->
					<col class="col-def-5"> <!-- 第五列 -->
					<col class="col-def-6"> <!-- 第六列 -->
					<col class="col-def-7"> <!-- 第七列（变窄） -->
				</colgroup>

				<!-- 表格内容 -->
				<tbody>
					<tr v-for="(group, groupIndex) in classifyList" :key="group.qishu" class="table-row"
						:data-qishu="group.qishu" :data-group-index="groupIndex">
						<!-- 期数列 (第一列) - 不可绘制区域 -->
						<td class="table-cell col-1 non-drawable-area">
							<view class="cell-content">
								{{ group.qishu }}
							</view>
						</td>

						<!-- 随机数列 (第二列) - 可点击区域（变窄） -->
						<td class="table-cell col-2">
							<view class="cell-content">
								{{ group.qishu2}}
							</view>
						</td>

						<!-- 数字列 (第3-7列) - 可交互区域 -->
						<td v-for="(num, numIndex) in group.numbers" :key="numIndex" class="table-cell"
							:class="'col-' + (3 + numIndex)">
							<view class="number-item" :data-group-index="groupIndex" :data-num-index="numIndex"
								ref="numberRefs">
								{{ num }}
							</view>
						</td>
					</tr>
				</tbody>
			</table>
		</view>
	</view>
	<view class="loading-container" v-if="isLoading">
		<view class="loading-spinner"></view>
		<text>加载中...</text>
	</view>

	<view class="no-more-data" v-if="noMoreData && !isLoading">
		<text>没有更多数据了</text>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		computed,
		watch,
		nextTick
	} from 'vue';
	import {
		apiTicketQuery
	} from "@/api/apis.js"
	import {
		onLoad,
		onUnload,
		onPullDownRefresh,
		onReachBottom
	} from "@dcloudio/uni-app"
	// import { useCounterStore } from '@/stores/counter'
	import useTableData from './useFunc/useTableData.js'; // 导入 useTableData
	// const counter = useCounterStore()

	const classifyList = ref([]);
	/**
	 * 1. 将空格分隔的数字字符串转换为数字数组（处理group.numbers）
	 * @param {string} numStr - 空格分隔的5个数字字符串（如 "1 3 5 7 9"）
	 * @returns {number[]} 转换后的数字数组（如 [1, 3, 5, 7, 9]），若格式异常返回空数组
	 */
	function convertNumStrToArray(numStr) {
		// 判空+去除首尾空格，避免空字符串干扰
		if (!numStr || typeof numStr !== 'string') return [];
		// 按空格分割字符串，过滤空字符（应对多空格情况），转成数字
		return numStr.trim()
			.split(/\s+/) // 支持多个空格分隔
			.filter(item => item !== '') // 过滤空项
			.map(item => Number(item)) // 转数字
			.slice(0, 5); // 确保只取前5个（防止格式异常）
	}

	/**
	 * 2. 计算数字数组的前4位数字之和
	 * @param {number[]} numArr - 转换后的数字数组（如 [1, 3, 5, 7, 9]）
	 * @returns {number} 前4位数字的和，若数组长度不足4位则返回0
	 */
	function calculateFirstFourSum(numArr) {
		// 判空+验证数组类型
		if (!Array.isArray(numArr) || numArr.length < 4) return 0;
		// 取前4项，过滤非数字项，求和
		return numArr.slice(0, 4)
			.filter(item => !isNaN(item) && typeof item === 'number') // 确保是有效数字
			.reduce((sum, curr) => sum + curr, 0); // 累加求和，初始值0
	}


	//分类列表数据
	const noData = ref(false)

	//定义data参数
	const queryParams = {
		page: 1,
		limit: 20,
		tname: '排列五'
	}
	const pageName = ref('')
	//------------------------------------------------------------------------
	// 转换 classifyList 为 useTableData 需要的格式  为更新2个drawLine数据一致做准备
	const formattedClassifyList = computed(() => {
		return classifyList.value.map(item => ({
			qishu: item.qishu,
			numbers: [item.qishu2, ...item.numbers]
		}));
	});
	console.log(formattedClassifyList) //验证数据获取成功了

	// 使用 useTableData，传递格式化后的数据
	const tableData = useTableData();
	// 监听 formattedClassifyList 的变化
	watch(formattedClassifyList, (newValue) => {
		console.log('formattedClassifyList 发生变化:', newValue);
		if (newValue && newValue.length > 0) {
			// 使用 nextTick 确保 DOM 更新完成
			nextTick(() => {
				if (tableData && typeof tableData.updateNumberGroups === 'function') {
					console.log('调用 updateNumberGroups');
					tableData.updateNumberGroups(newValue);
				} else {
					console.error('updateNumberGroups 函数不存在');
				}
			});
		}
	}, {
		deep: true,
		immediate: true
	});

	//------------------------------------------------------------------------
	onLoad((e) => {
		let {
			name = null
		} = e;
		if (name) queryParams.tname = name;
		pageName.value = name
		//执行获取分类列表方法
		getClassList();
	})


	onPullDownRefresh(() => {
		console.log('onPullDownRefresh')
		if (noData.value) return;
		queryParams.page++;
		getClassList()
	})
	//获取分类列表网络数据
	const getClassList = async () => {
		uni.showLoading({
			title: '加载中...',
			mask: true, // 开启遮罩，防止点击穿透
		});
		let res = await apiTicketQuery(queryParams);

		let newData = res.data.records.map((group) => {
			return {
				...group,
				qishu: Number(group.issueno),
				qishu2: calculateFirstFourSum(convertNumStrToArray(group.number)),
				numbers: convertNumStrToArray(group.number)
			}
		}) || []

		let newDataSort = newData.sort((a, b) => {
			return Number(a.issueno) - Number(b.issueno);
		});
		console.log(classifyList.value, '-----------------------------------------')
		classifyList.value = [...newDataSort, ...classifyList.value];
		await nextTick();
		console.log(classifyList.value, '//这里是从网库中获取的数据')
		if (queryParams.limit > res.data.length) noData.value = true;
		uni.hideLoading();
		uni.stopPullDownRefresh();
		//------------------------------------------------------------------------------
		// 该数据更新后，通知 useTableData 更新以便与后面画布数据一样
		tableData.updateNumberGroups(formattedClassifyList.value);
		// 数据更新后，调用 updateNumberGroups
		if (tableData && typeof tableData.updateNumberGroups === 'function') {
			tableData.updateNumberGroups(formattedClassifyList.value);
		} else {
			console.error('updateNumberGroups 函数不存在');
		}

		// 数据更新后，确保调用 updateNumberGroups
		if (tableData && typeof tableData.updateNumberGroups === 'function') {
			await nextTick(); // 确保在 DOM 更新后执行
			tableData.updateNumberGroups(formattedClassifyList.value);
		}
	}
	onUnload(() => {

	})

	// 控制Popover显示状态
	const isPopoverShow = ref(false);

	// 返回上一页
	const goBack = () => {
		// 直接使用全局API，不需要导入
		uni.navigateBack({
			delta: 1 // 返回的页面数
		});
	};

	// 切换Popover显示/隐藏
	const togglePopover = () => {
		isPopoverShow.value = !isPopoverShow.value;
	};

	// 关闭Popover
	const closePopover = () => {
		isPopoverShow.value = false;
	};
	const add4Empty = () => {
		// 生成数组长度为4的结构
		const result = Array.from({
			length: 4
		}, () => ({
			qishu: '',
			qishu2: '',
			numbers: ['', '', '', '', '']
		}));
		return result
	}
	// 处理菜单项点击
	const handleMenuClick = (action) => {
		closePopover();
		switch (action) {
			case 'draw':
				const result50 = classifyList.value.slice(-50);
				const result = [...result50, ...(add4Empty())]
				// 同步存储
				uni.setStorageSync('drawLineData', result);
				// pinia状态管理
				// counter.setStoreDrawData(formattedClassifyList,'我被传过去了...........')
				uni.navigateTo({
					url: '/pages/juWang/drawLine/drawLine?name=排列5',
					events: {
						// 为指定事件添加一个监听器，获取被打开页面传送到当前页面的数据
						acceptDataFromOpenedPage: function(data) {
							console.log(data)
						},
						someEvent: function(data) {
							console.log(data)
						}
					},
					success: function(res) {
						// 通过eventChannel向被打开页面传送数据
						res.eventChannel.emit('acceptDataFromOpenerPage', {
							data: 'data from starter page'
						})
					}
				});
				break;
		}
	};

	//----------------------------------调试数据
	watch(classifyList, (newValue) => {
		if (tableData && typeof tableData.updateNumberGroups === 'function') {
			tableData.updateNumberGroups(formattedClassifyList.value);
		}
	}, {
		deep: true
	});
	//-----------------------------------------------------------------------------------------------
	const isLoading = ref(false);
	const noMoreData = ref(false);
	onReachBottom(() => {
		// 防止重复加载
		if (isLoading.value || noMoreData.value) return;
		isLoading.value = true;
		++queryParams.page;
		getClassList()
		    .then(() => {
		      // 5. 检查是否还有更多数据
		      // 这里需要根据实际情况判断，例如检查返回的数据长度是否小于每页限制
		      if (classifyList.value.length % queryParams.limit !== 0) {
		        noMoreData.value = true;
		      }
		    })
		    .catch(error => {
		      console.error('加载更多数据失败:', error);
		      // 6. 加载失败时回退页码
		      queryParams.page--;
		    })
		    .finally(() => {
		      // 7. 重置加载状态
		      isLoading.value = false;
		    });
	});
</script>

<style scoped lang="less">
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
	}

	.loading-spinner {
		width: 40rpx;
		height: 40rpx;
		border: 4rpx solid #f3f3f3;
		border-top: 4rpx solid #3498db;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 10rpx;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.no-more-data {
		text-align: center;
		padding: 20rpx;
		color: #999;
		font-size: 28rpx;
	}

	/* 样式保持不变，移除canvas相关样式 */
	.container {
		position: relative;
		width: 100%;
		min-height: 100vh;
		padding: 0;
		box-sizing: border-box;
		background-color: #f9f9f9;
		overflow: hidden;
	}

	.numbers-table-container {
		width: 100%;
		padding: 10rpx;
		box-sizing: border-box;
		position: relative;
		z-index: 1;
		margin-bottom: 30rpx;
	}

	.res {
		width: 99px;
		height: 99px;
	}

	.numbers-table {
		width: 100%;
		border-collapse: collapse;
		background-color: #fff;
		border-radius: 15rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	/* 列宽定义 */
	.col-def-1 {
		width: 120rpx;
	}

	.col-def-2 {
		width: 60rpx;
	}

	.col-def-3 {
		width: 90rpx;
	}

	.col-def-4 {
		width: 90rpx;
	}

	.col-def-5 {
		width: 90rpx;
	}

	.col-def-6 {
		width: 90rpx;
	}

	.col-def-7 {
		width: 60rpx;
	}

	.table-row {
		transition: background-color 0.2s;
	}

	.table-row:nth-child(even) {
		background-color: rgba(0, 0, 0, 0.02);
	}

	.table-row:hover {
		background-color: rgba(0, 0, 0, 0.03);
	}

	.table-row:nth-child(4n) .table-cell {
		border-bottom: 2px solid #5aa3e7;
	}

	/* 目标行样式 */
	.target-row {
		background-color: rgba(255, 248, 225, 0.5);
	}

	.table-cell {
		padding: 0;
		text-align: center;
		border: 1px solid #dbe7d6;
		height: 80rpx;
		box-sizing: border-box;
		white-space: nowrap;
		overflow: hidden;
		transition: all 0.2s;
	}

	/* 可点击单元格样式 */
	.clickable {
		cursor: pointer;
		position: relative;
	}

	.clickable::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 215, 0, 0.1);
		opacity: 0;
		transition: opacity 0.2s;
	}

	.clickable:active::after {
		opacity: 1;
	}

	.cell-content {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		font-size: 28rpx;
		font-weight: 500;
		padding: 0 5rpx;
	}

	/* 列背景色设置 */
	.col-1 {
		background-color: #cddef0;
		color: #000;
	}

	.col-2 {
		border-right: 2px solid #5aa3e7;
		background-color: #90bef2;

		.cell-content {
			font-size: 32rpx !important;
		}
	}

	.col-3,
	.col-4,
	.col-5,
	.col-6 {
		background-color: #FFFFFF;
	}

	.col-7 {
		border-left: 2px solid #5aa3e7;
		background-color: #90bef0;

		.number-item {
			font-size: 55rpx !important;
		}
	}

	.number-item {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 55rpx;
		font-weight: bold;
		color: #333;
		transition: all 0.2s;
		cursor: pointer;
		box-sizing: border-box;
		padding: 0;
		margin: 0 auto;
	}

	.number-item.highlighted {
		background-color: #1a1ad9;
		color: white;
		font-weight: bold;
	}

	/* 文字标注样式（保留） */
	.text-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 20;
	}

	.text-label {
		position: absolute;
		padding: 15rpx;
		background-color: rgba(255, 255, 255, 0.95);
		border: 2rpx solid #ccc;
		border-radius: 10rpx;
		font-size: 32rpx;
		color: #333;
		pointer-events: auto;
		min-width: 120rpx;
		max-width: 400rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
		user-select: none;
		touch-action: manipulation;
	}

	/* Fab按钮样式（保留，移除canvas相关按钮样式） */
	.fab-wrapper {
		position: fixed;
		right: 40rpx;
		bottom: 40rpx;
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.fab-main {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: linear-gradient(135deg, #007aff, #0051a8);
		color: white;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 6rpx 15rpx rgba(0, 122, 255, 0.3);
		font-size: 40rpx;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 4rpx solid rgba(255, 255, 255, 0.2);
		z-index: 10;
	}

	.fab-items-o {
		display: none;
	}

	.fab-items {
		display: flex;
		flex-direction: column;
		align-items: center;
		position: absolute;
		bottom: 90rpx;
	}

	.fab-item {
		width: 100rpx;
		height: 100rpx;
		margin-bottom: 20rpx;
		opacity: 0;
		transform: translateY(50rpx) scale(0.9);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
	}

	.fab-item-inner {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
		background-color: white;
		color: #333;
		border: 1rpx solid rgba(0, 0, 0, 0.05);
	}

	.fab-open .fab-item {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	.container {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background-color: #f5f5f5;
	}

	/* 自定义导航栏 */
	.navbar {
		height: 44px;
		background-color: #1677ff;
		color: white;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 16px;
		position: relative;
		z-index: 10;
	}

	.navbar-left {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: flex-start;

		.uni-icons {
			color: #fff !important;
			font-size: 22px !important;
		}
	}

	.back-icon {
		font-size: 20px;
		font-weight: bold;
	}

	.navbar-title {
		font-size: 18px;
		font-weight: 500;
		flex: 1;
		text-align: center;
	}

	.navbar-right {
		width: 44px;
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.menu-icon {
		font-size: 24px;
		line-height: 1;
	}

	/* 页面内容 */
	.content {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
		margin-top: 44px;
		/* 避开导航栏 */
	}

	.text {
		font-size: 16px;
		color: #666;
	}

	/* Popover菜单 */
	.popover {
		position: absolute;
		top: 50px;
		right: 10px;
		width: 120px;
		background-color: white;
		border-radius: 8px;
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		overflow: hidden;
		transform-origin: top right;
		transform: scale(0.9);
		opacity: 0;
		pointer-events: none;
		transition: all 0.2s ease;
		z-index: 100;
	}

	.popover.show {
		transform: scale(1);
		opacity: 1;
		pointer-events: auto;
	}

	.popover-content {
		display: flex;
		flex-direction: column;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 12px 16px;
		font-size: 14px;
		color: #333;
		transition: background-color 0.2s;
	}

	.menu-item:hover {
		background-color: #f5f5f5;
	}

	.menu-item.menu-text {
		margin-left: 8px;
	}

	.menu-item.danger {
		color: #ff4d4f;
	}

	/* 遮罩层 */
	.mask {
		position: fixed;
		top: 44px;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.05);
		z-index: 9;
	}
</style>