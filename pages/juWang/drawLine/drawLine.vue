<template>
	<view class="container">
		<!-- 自定义导航栏 -->
		<custom-juwang-nav-bar title="drawLine" :onSubmit="handleSubmit" @child-event="handleChildEvent"
			@share-event="handleShareEvent"></custom-juwang-nav-bar>
		<!-- <draw-select ref="child" @message-from-child="handleMessage"></draw-select> -->
		<!-- 修改线条颜色,粗细的 -->
		<select-color @select-color="handleColorMessage" @select-line-width="handleLineMessage"></select-color>
		<view class="modal-overlay" v-if="showNumberSelector" @click="closeNumberSelector">
			<view class="modal-content" @click.stop>
				<NumberSelector class='boxNumber' ref="numberSelector" @close="closeNumberSelector"
					@confirm="handleConfirmSelection" :groupIndex="selectedGroupIndex" :numIndex="selectedNumIndex" />
			</view>
		</view>
		<!-- ----------------------------------------------------------------------------------------------------------------- -->
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
					<tr v-for="(group, groupIndex) in twocounterStore.List" :key="group.qishu" class="table-row"
						:data-qishu="group.qishu" :data-group-index="groupIndex"
						:class="{ 'target-row': isTargetRow(groupIndex) }">
						<!-- 期数列 (第一列) - 不可绘制区域 -->
						<td class="table-cell col-1 non-drawable-area">
							<view class="cell-content">
								{{ group.qishu }}
							</view>
						</td>
						<td v-for="(num, numIndex) in group.numbers" :key="numIndex" class="table-cell"
							:class="'col-' + (2 + numIndex) + (isTargetRow(groupIndex) ? ' clickable' : '')"
							@click="handleCellClick(groupIndex, numIndex)">
							<view class="number-item" :class="{ highlighted: isHighlighted(groupIndex, numIndex) }"
								:data-group-index="groupIndex" :data-num-index="numIndex" ref="numberRefs">
								{{ num }}
								<!-- 添加内容容器 -->
								<div class="grid-content"></div>
							</view>
						</td>
					</tr>
				</tbody>
			</table>

			<!-- 绘图Canvas -->
			<canvas type="2d" canvas-id="drawCanvas" class="draw-canvas" @touchstart.stop="onCanvasStart"
				@touchmove.stop="onCanvasMove" @touchend.stop="onCanvasEnd" @mousedown="onCanvasStart"
				@mousemove="onCanvasMove" @mouseup="onCanvasEnd"
				:style="{ pointerEvents: canvasPointerEvents }"></canvas>

			<!-- 临时绘制层 -->
			<canvas type="2d" canvas-id="tempCanvas" class="temp-canvas"></canvas>

			<!-- 文字标注容器 -->
			<view class="text-container">
				<view v-for="(label, idx) in textLabels" :key="label.id" class="text-label"
					:style="getLabelStyle(label)" @touchstart.stop="handleLabelTouchStart(idx, $event)"
					@touchmove.stop="handleLabelTouchMove(idx, $event)"
					@touchend.stop="handleLabelTouchEnd(idx, $event)" @click.stop="handleLabelClick(idx)"
					@dblclick.stop="handleLabelDblClick(idx)" :data-index="idx">
					<span :contenteditable="label.editing" @blur="finishEditLabel(idx)"
						@input="updateLabelText(idx, $event)" class="text-content" :spellcheck="false">
						{{ label.text }}
					</span>
				</view>
			</view>

		</view>
		<image src="/static/clock.png" class="switch-mode-css" @click="switchDrawMode('none')"
			v-show="canvasPointerValue"></image>
		<image src="/static/scroll.png" class="switch-mode-css" @click="switchDrawMode('auto')"
			v-show="!canvasPointerValue"></image>
		<!-- Fab按钮组 -->
		<view class="fab-wrapper">
			<!-- 主按钮 -->
			<view class="fab-main" @click.stop="toggleFab">
				<i class="fab-main-icon">{{ isFabOpen ? '✕' : '+' }}</i>
			</view>

			<!-- 子按钮容器 -->
			<view class="fab-items-o" :class="{ 'fab-items fab-open': isFabOpen }">
				<!-- 子按钮 - 模式切换 -->
				<view class="fab-item" @click.stop="switchMode('freeDraw')">
					<div class="fab-item-inner">
						<i class="fab-item-icon">✏️</i>
						<text class="fab-item-text">曲线</text>
					</div>
				</view>
				<view class="fab-item" @click.stop="switchMode('straightLine')">
					<div class="fab-item-inner">
						<i class="fab-item-icon">—️</i>
						<text class="fab-item-text">直线</text>
					</div>
				</view>
				<view class="fab-item" @click.stop="switchMode('rectangle')">
					<div class="fab-item-inner">
						<i class="fab-item-icon">□</i>
						<text class="fab-item-text">矩形</text>
					</div>
				</view>
				<view class="fab-item" @click.stop="switchMode('circle')">
					<div class="fab-item-inner">
						<i class="fab-item-icon">○</i>
						<text class="fab-item-text">圆形</text>
					</div>
				</view>
				<view class="fab-item" @click.stop="switchMode('smart')">
					<div class="fab-item-inner">
						<i class="fab-item-icon">🧠</i>
						<text class="fab-item-text">智能模式</text>
					</div>
				</view>

				<view class="fab-item" @click.stop="switchMode('eraser')">
					<div class="fab-item-inner">
						<i class="fab-item-icon">🧽</i>
						<text class="fab-item-text">橡皮擦</text>
					</div>
				</view>

				<!-- 子按钮 - 操作按钮 -->
				<view class="fab-item fab-item-accent" @click.stop="addTextLabel">
					<div class="fab-item-inner">
						<i class="fab-item-icon">➕</i>
						<text class="fab-item-text">添加文字</text>
					</div>
				</view>
				<!-- 子按钮 - 操作按钮 -->
				<view class="fab-item fab-item-accent" @click.stop="clickBlank">
					<div class="fab-item-inner">
						<i class="fas fa-square">空</i>
						<text class="fab-item-text">空白点击</text>
					</div>
				</view>
			</view>
		</view>
	</view>

</template>

<script setup>
	import {
		onLoad,
		onUnload,
		onReachBottom
	} from "@dcloudio/uni-app"
	import {
		ref,
		onMounted,
		getCurrentInstance,
		nextTick,
		watch,
		reactive
	} from 'vue';
	import html2canvas from 'html2canvas';
	import useDrawing from './useFunc/useDrawing';
	import useTableData from './useFunc/useTableData';
	import useTextLabels from './useFunc/useTextLabels';
	import useFabActions from './useFunc/useFabActions';
	import useScreenshot from './useFunc/useScreenshot';
	import {
		usetwoCounterStore
	} from "@/stores/twocounter.js";
	import {
		useCounterStore
	} from "@/stores/counter.js";
	import NumberSelector from '../../../components/NumberSelector/NumberSelector.vue';
	// 创建本地的 onCanvasEnd 处理函数
	const onCanvasEnd = (event) => {
		// 首先调用从 useDrawing 导入的函数
		drawingOnCanvasEnd(event);

		// 然后添加您的自定义逻辑
		const endPoint = currentShape.value.end;
		const numberPos = checkPointOnNumber(endPoint);
		// console.log(numberPos)
		if (1) {
			// const { groupIndex, numIndex } = numberPos;
			// 应用样式到对应格子
			applyStyleToGrid(20, 1);
			console.log("111111111122222222222222")
		}
	};


	//下面是关于组件数字选择器的处理
	// 添加状态控制
	const showNumberSelector = ref(false);
	//存储格子信息，将信息传给数字选择器，方便修改条件选择
	const selectedGroupIndex = ref(null);
	const selectedNumIndex = ref(null);

	const counterStore = useCounterStore();
	console.log(counterStore)
	const classifyList = ref([]);
	//存储预览样式信息的
	const gridStyles = ref({});
	// 打开数字选择器
	const openNumberSelector = (groupIndex, numIndex) => {
		selectedGroupIndex.value = groupIndex;
		selectedNumIndex.value = numIndex;
		showNumberSelector.value = true;
	};


	// 关闭数字选择器
	const closeNumberSelector = () => {
		showNumberSelector.value = false;
	};

	// 处理确认选择
	const handleConfirmSelection = (data) => {
		console.log('确认选择:', data);
		console.log('格子位置:', selectedGroupIndex.value, selectedNumIndex.value);
		const key = `${data.groupIndex}-${data.numIndex}`;
		gridStyles.value[key] = {
			previewType: data.previewType,
			content: {
				selectedCondition: data.selectedCondition,
				selectedNumbers: data.selectedNumbers,
				selecteddoubNumber: data.selecteddoubNumber
			}
		};
		console.log(gridStyles.value) //20-2  + 内容
		closeNumberSelector();
		// 应用样式到对应格子
		applyStyleToGrid(data.groupIndex, data.numIndex);
		// 这里可以处理选择的数据
	};
	// 应用样式到格子
	const applyStyleToGrid = (groupIndex, numIndex) => {
		const key = `${groupIndex}-${numIndex}`;
		const styleData = gridStyles.value[key];
		if (!styleData) return;
		// 找到对应的格子元素
		const gridElement = document.querySelector(
			`[data-group-index="${groupIndex}"][data-num-index="${numIndex}"]`
		);
		if (!gridElement) return;
		// 清除之前的样式
		gridElement.classList.remove('solid', 'hollow');

		// 应用新样式
		if (styleData.previewType === 'solid') {
			gridElement.classList.add('solid');
		} else {
			gridElement.classList.add('hollow');
		}
		// 更新内容
		const contentElement = gridElement.querySelector('.grid-content');
		console.log(styleData.content.selectedCondition);
		if (contentElement) {
			contentElement.innerHTML = '';

			if (styleData.content.selectedCondition) {
				const conditionElement = document.createElement('div');
				conditionElement.textContent = styleData.content.selectedCondition;
				contentElement.appendChild(conditionElement);
			}

			if (styleData.content.selectedNumbers && styleData.content.selectedNumbers.length > 0) {
				const numbersElement = document.createElement('div');
				numbersElement.textContent = styleData.content.selectedNumbers.join(' ');
				contentElement.appendChild(numbersElement);
			}

			if (styleData.content.selecteddoubNumber) {
				const doubNumberElement = document.createElement('div');
				doubNumberElement.textContent = styleData.content.selecteddoubNumber;
				contentElement.appendChild(doubNumberElement);
			}
		}
	};

	//------------------------------------------------------

	// 加载状态管理
	const isLoading = ref(false);
	const hasMore = ref(true);
	const loadError = ref(null);
	// 获取异步请求的画布真实数据
	//先拿到store实例对象
	const twocounterStore = usetwoCounterStore()
	// console.log(twocounterStore.List)
	// onReachBottom(async () => {

	// 	// 防止重复加载
	// 	if (isLoading.value || !hasMore.value) {
	// 		console.log("正在加载或没有更多数据，跳过");
	// 		return;
	// 	}

	// 	try {
	// 		// 设置加载状态
	// 		isLoading.value = true;
	// 		loadError.value = null;

	// 		// 显示加载提示
	// 		uni.showLoading({
	// 			title: '加载更多数据...',
	// 			mask: false
	// 		});

	// 		// 调用 store 的加载更多方法
	// 		await twocounterStore.loadMoreData();

	// 		// 更新状态
	// 		hasMore.value = twocounterStore.hasMore;

	// 		console.log("加载更多完成，当前数据量:", twocounterStore.List.length);

	// 		// 显示成功提示（可选）
	// 		if (hasMore.value) {
	// 			uni.showToast({
	// 				title: `已加载 ${twocounterStore.List.length} 条数据`,
	// 				icon: 'none',
	// 				duration: 1500
	// 			});
	// 		}

	// 	} catch (error) {
	// 		console.error('加载更多失败:', error);
	// 		loadError.value = error;
	// 		uni.showToast({
	// 			title: '加载失败，请重试',
	// 			icon: 'none'
	// 		});
	// 	} finally {
	// 		isLoading.value = false;
	// 		uni.hideLoading();
	// 	}
	// });
	// // 添加重试方法
	// const retryLoadMore = () => {
	// 	if (loadError.value) {
	// 		loadError.value = null;
	// 		onReachBottom(); // 重新触发加载
	// 	}
	// };

	// // 监听 store 状态变化
	// watch(() => twocounterStore.isLoading, (loading) => {
	// 	isLoading.value = loading;
	// });

	// watch(() => twocounterStore.hasMore, (more) => {
	// 	hasMore.value = more;
	// });

	// watch(() => twocounterStore.error, (error) => {
	// 	if (error) {
	// 		loadError.value = error;
	// 	}
	// });



	//-------------------------------------------------------
	const canvasPointerValue = ref(true)
	const switchDrawMode = (value) => {
		uni.showToast({
			title: `当前为${value==='none'?'滚动':'画规'}模式`,
			icon: 'none', // 可选值：success, loading, none
			duration: 2000, // 提示持续时间（毫秒）
			position: 'bottom' // 可选值：top, center, bottom
		});
		canvasPointerValue.value = !canvasPointerValue.value
		canvasPointerEvents.value = value
	}
	// 父组件的方法
	const handleSubmit = (data) => {
		console.log('子组件调用了父组件的提交方法，数据：', data);
		// 可以在这里处理提交逻辑
		clearCanvas()
	};

	const handleChildEvent = (params) => {
		console.log('收到子组件事件，参数', params)
		switch (params.action) {
			case 'submit':
				saveCanvasImage()
				break
			case 'undo':
				undoDraw()
				break
		}

	}
	const handleShareEvent = () => {
		console.log('子组件调用了父组件的分享方法')

	}



	let eventHandler;
	onLoad((e) => {
		const instance = getCurrentInstance().proxy
		const eventChannel = instance.getOpenerEventChannel();
		eventChannel.emit('acceptDataFromOpenedPage', {
			data: 'data from test page'
		});
		eventChannel.emit('someEvent', {
			data: 'data from test page for someEvent'
		});
		// 监听acceptDataFromOpenerPage事件，获取上一页面通过eventChannel传送到当前页面的数据
		eventChannel.on('acceptDataFromOpenerPage', function(data) {
			console.log("acceptDataFromOpenerPage", data)
		})



	})
	//----------------------------------------------------


	//从useTableData.js中传过来的网络请求数据无法及时更新	---------------

	// 子组件引用
	const child = ref(null);
	// classifyList.value = [...newDataSort,...classifyList.value];
	// 定义 formattedClassifyList，用于存储从 drawLineRead.vue 传递过来的数据
	// const formattedClassifyList = ref(null);
	// const externalData=ref([]);

	// console.log(externalData,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
	//------------------------------------------------------------------------
	function logDataComparison(a, externalData) {
		console.group('数据比较');
		console.log('a:', a);
		console.log('externalData:', externalData);
		console.log('a === externalData:', a === externalData);
		console.log('JSON.stringify(a) === JSON.stringify(externalData):',
			JSON.stringify(a) === JSON.stringify(externalData));

		if (isRef(externalData)) {
			console.log('externalData 是 ref');
			console.log('externalData.value:', externalData.value);
			console.log('a === externalData.value:', a === externalData.value);
		}
		console.groupEnd();
	}


	// 导入各个功能模块
	const {
		numberGroups,
		highlighted,
		numberRefs,
		getTargetRowIndex,
		isTargetRow,
		handleCellClick,
		isHighlighted,
		toggleHighlight,
		handleMessage
	} = useTableData(child);
	const handleColorMessage = (val) => {
		strokeColor.value = val
	}
	const handleLineMessage = (val) => {
		lineWidth.value = val
	}
	const {
		currentMode,
		isDrawing,
		isErasing,
		canvasPointerEvents,
		strokeColor,
		lineWidth,
		canvasCtx,
		tempCanvasCtx,
		canvasSize,
		dpr,
		currentShape,
		shapes,
		eraserSize,
		onCanvasStart,
		onCanvasMove,
		onCanvasEnd: drawingOnCanvasEnd, // 重命名以避免冲突
		redraw,
		initCanvas,
		selectedColor,
		checkPointOnNumber
	} = useDrawing(numberGroups, highlighted, numberRefs, openNumberSelector);

	nextTick()
	const {
		textLabels,
		movingLabel,
		touchStartTime,
		touchStartPos,
		touchEndTime,
		touchCount,
		touchTimer,
		labelOffset,
		longPressDetected,
		handleLabelTouchStart,
		handleLabelTouchMove,
		handleLabelTouchEnd,
		handleLabelClick,
		handleLabelDblClick,
		addTextLabel,
		editLabel,
		updateLabelText,
		finishEditLabel,
		getLabelStyle
	} = useTextLabels(canvasSize);

	const {
		isFabOpen,
		toggleFab,
		switchMode,
		clearCanvas,
		clickBlank
	} = useFabActions(currentMode, canvasPointerEvents, shapes, textLabels, highlighted, redraw);

	const {
		saveCanvasImage,
		domToImage
	} = useScreenshot(html2canvas);
	const undoDraw = () => {
		console.log('undoDraw')
		if (shapes.value.length > 0) {
			shapes.value.pop();
			redraw(false);
		}
	};
	// 初始化
	onMounted(async () => {
		await twocounterStore.getCounterInfo();
		await nextTick();
		console.log('数字元素数量:', numberRefs.value.length);
		await initCanvas();
		await nextTick();

		console.log('初始化后数字元素数量:', numberRefs.value.length);
		// console.log('目标行索引:', getTargetRowIndex());
	});

	// 监听形状变化
	watch(shapes, () => redraw(false), {
		deep: true
	});
</script>

<style scoped lang="less">
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
	}

	.modal-content {
		background-color: white;
		border-radius: 16px;
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
	}

	/* 样式保持不变 */
	.boxNumber {
		position: relative;
		top: -400rpx;
		width: 100%;
		min-height: 20vh;
		padding: 0;
		box-sizing: border-box;
		background-color: #f9f9f9;
		overflow: hidden;
	}

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
		z-index: 10; //表格高于画布z-index
		margin-bottom: 30rpx;
	}

	.switch-mode-css {
		width: 100rpx;
		height: 100rpx;
		position: fixed;
		right: 200rpx;
		bottom: 40rpx;
		z-index: 100;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.numbers-table {
		width: 100%;
		border-collapse: collapse;
		background-color: #fff;
		border-radius: 15rpx;
		overflow: hidden;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		z-index: 51;
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
			font-size: 33rpx !important;
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
			font-size: 28rpx !important;
		}
	}

	.number-item {
		position: relative;
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 38rpx;
		font-weight: bold;
		color: #333;
		transition: all 0.2s;
		cursor: pointer;
		box-sizing: border-box;
		padding: 0;
		margin: 0 auto;
		pointer-events: none;
		z-index: 88;
	}

	.number-item.highlighted {
		background-color: #1a1ad9;
		color: white;
		font-weight: bold;
	}

	/* Canvas样式 */
	.draw-canvas,
	.temp-canvas {
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		background-color: transparent;
		z-index: 1;
		pointer-events: none;
	}

	.draw-canvas {
		z-index: 1;
	}

	.temp-canvas {
		z-index: 1;
		pointer-events: none;
	}

	/* 文字标注样式 */
	.text-container {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 999;
	}

	.text-label {
		position: absolute;
		padding: 15rpx;
		background-color: rgba(255, 255, 255, 0.95);
		border: 2rpx solid #ccc;
		border-radius: 10rpx;
		font-size: 80rpx;
		color: red;
		width: 20rpx;
		background-color: pink;
		pointer-events: auto;
		min-width: 120rpx;
		max-width: 400rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
		user-select: none;
		touch-action: manipulation;
	}

	.text-content {
		background-color: pink;
	}

	/* Fab按钮样式 */
	.fab-wrapper {
		position: fixed;
		right: 40rpx;
		bottom: 50rpx;
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

	/* drawLine.vue 中的样式 */
	.number-item.solid {
		width: 100%;
		border-radius: 0px;
		background-color: #ff4d4f;
		color: white;
	}

	.number-item.hollow {
		border: 2px solid #ff4d4f;
		background-color: transparent;
	}

	.grid-content {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		font-size: 12px;
		text-align: center;
		z-index: 20;
		width: 100%;
	}
</style>