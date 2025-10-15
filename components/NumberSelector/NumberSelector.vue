<template>
	<div class="NumberPos">
		<div class="container">
			<!-- 头部 -->
			<div class="header">
				<div class="title">数字选择器</div>
				<div class="mode-switch">
					<div class="mode-btn" :class="{active: mode === 'advanced'}" @click="mode = 'advanced'">
						高级
					</div>
				</div>
			</div>

			<!-- 数字选择区域 -->
			<div class="section">
				<div class="section-title">选择号码</div>
				<div class="numbers-grid">
					<div v-for="num in numbers" :key="num" class="number-btn"
						:class="{selected: selectedNumbers.includes(num)}" @click="toggleNumber(num)">
						{{ num }}
					</div>
				</div>
			</div>

			<!-- 条件选择区域 -->
			<div class="section">
				<div class="section-title">选择条件</div>
				<div class="conditions-grid">
					<div v-for="condition in conditions" :key="condition" class="condition-btn"
						:class="{selected: selectedCondition === condition}" @click="selectCondition(condition)">
						{{ condition }}
					</div>
				</div>
			</div>

			<div class="section">
				<div class="section-title">选择对数</div>
				<div class="conditions-grid">
					<div v-for="doubnumber in doubnumbers" :key="doubnumber" class="condition-btn"
						:class="{selected: selecteddoubNumber === doubnumber}" @click="selectdoubNumber(doubnumber)">
						{{ doubnumber }}
					</div>
				</div>
			</div>



			<!-- 效果预览区域 -->
			<div class="section preview-section">
				<div class="section-title">效果预览</div>
				<div class="preview-options">
					<div class="preview-option" @click="previewType = 'solid'">
						<div class="option-checkbox" :class="{selected: previewType === 'solid'}"></div>
						<span>实心</span>
					</div>
	
				</div>

				<div class="digits-container">
				  <!-- 第一个 digit-box -->
				  <div class="digit-box" v-if="selectedCondition !== '稳码'">
				    <div class="digit-display" :class="{
				        solid: numIndex === 1,
				        hollow: numIndex !== 1
				      }">
				      <div v-if="numIndex === 1">{{selectedCondition}}</div>
				      <div v-if="numIndex === 1">{{selectedNumbers2}}</div>
				      <div v-if="numIndex === 1">{{selecteddoubNumber}}</div>
				    </div>
				    <div class="digit-label">千A</div>
				  </div>
				  
				  <!-- 第二个 digit-box -->
				  <div class="digit-box" v-if="selectedCondition !== '稳码'">
				    <div class="digit-display" :class="{
				        solid: numIndex === 2,
				        hollow: numIndex !== 2
				      }">
				      <div v-if="numIndex === 2">{{selectedCondition}}</div>
				      <div v-if="numIndex === 2">{{selectedNumbers2}}</div>
				      <div v-if="numIndex === 2">{{selecteddoubNumber}}</div>
				    </div>
				    <div class="digit-label">百B</div>
				  </div>
				  
				  <!-- 第三个 digit-box -->
				  <div class="digit-box" v-if="selectedCondition !== '稳码'">
				    <div class="digit-display" :class="{
				        solid: numIndex === 3,
				        hollow: numIndex !== 3
				      }">
				      <div v-if="numIndex === 3">{{selectedCondition}}</div>
				      <div v-if="numIndex === 3">{{selectedNumbers2}}</div>
				      <div v-if="numIndex === 3">{{selecteddoubNumber}}</div>
				    </div>
				    <div class="digit-label">十C</div>
				  </div>
				  
				  <!-- 第四个 digit-box -->
				  <div class="digit-box" v-if="selectedCondition !== '稳码'">
				    <div class="digit-display" :class="{
				        solid: numIndex === 4,
				        hollow: numIndex !== 4
				      }">
				      <div v-if="numIndex === 4">{{selectedCondition}}</div>
				      <div v-if="numIndex === 4">{{selectedNumbers2}}</div>
				      <div v-if="numIndex === 4">{{selecteddoubNumber}}</div>
				    </div>
				    <div class="digit-label">个D</div>
				  </div>
					
				  <!-- 稳码样式 -->
				  <div class="digit-box" v-if="selectedCondition === '稳码'">
				    <div class="wenma">
				      <div class='firstsize'>稳上一码：{{selectedNumbers2}}</div>
				    </div>
				  </div>
				</div>
			</div>

			<!-- 这里是稳码样式的设计 -->


			<!-- 底部按钮 -->
			<div class="footer">
				<div class="action-btn cancel-btn" @click="close">关闭</div>
				<div class="action-btn confirm-btn" @click="confirm">确认</div>
			</div>
		</div>
	</div>

</template>

<script setup>
	//设计思想，将要设置的样式的数组放入一个新的数组中
	import {
		createApp,
		ref,
		watch,
		computed,
		defineProps,
		defineEmits
	} from "vue"
	
	const mode = ref('advanced')
	// 数字选择
	const numbers = ref([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
	//选中数字数组
	const selectedNumbers = ref([])
	//为了省略掉数组中的【】而设计转换
	const selectedNumbers2 = computed(() => {
		return selectedNumbers.value.map(num => num.toString()).join(' ')
	})
	const toggleNumber = (num) => {
		const index = selectedNumbers.value.indexOf(num)
		if (index > -1) {
			// 如果已选中，则移除
			selectedNumbers.value.splice(index, 1)
		} else {
			// 如果未选中，则添加
			selectedNumbers.value.push(num)
		}
	}
	//接受的格子信息
	const props = defineProps({
		groupIndex: Number,
		numIndex: Number
	});
	
	
	// 条件数组
	const conditions = ref([
		'单', '双', '大', '小', 'X',
		props.numIndex==1||props.numIndex==4?'头尾合':'中肚合', props.numIndex==4?'百个合':props.numIndex==3?'千十合':'千百合', props.numIndex==3||props.numIndex==4?'十个合':props.numIndex==2?'百个合':'千十合', '杀', '稳码'
	])
	if(props.numIndex === 5)
	{
		conditions.value = ['单', '双', '大', '小', 'X']
	}
	
	
	// 选中的条件数组
	const selectedCondition = ref(null)

	// 选择条件（单选）
	const selectCondition = (condition) => {
		// 如果点击的是已选中的条件，则取消选择
		if (selectedCondition.value === condition) {
			selectedCondition.value = null
			return
		}

		// 否则设置新的条件
		selectedCondition.value = condition

		// 处理特殊条件
		if (condition === '单') {
			// 选中所有奇数: 1,3,5,7,9
			selectedNumbers.value = [1, 3, 5, 7, 9]
		} else if (condition === '双') {
			// 选中所有偶数: 0,2,4,6,8
			selectedNumbers.value = [0, 2, 4, 6, 8]
		} else if (condition === '大') {
			// 选中大数: 5,6,7,8,9
			selectedNumbers.value = [5, 6, 7, 8, 9]
		} else if (condition === '小') {
			// 选中小数: 0,1,2,3,4
			selectedNumbers.value = [0, 1, 2, 3, 4]
		} else if (condition === 'X') {
			selectedNumbers.value = []
		}
	}


	// 对数选择
	const doubnumbers = ref(['0/5', '1/6', '2/7', '3/8', '4/9'])
	//选中对数数组
	const selecteddoubNumber = ref(null)
	// 选择条件（单选）
	const selectdoubNumber = (condition) => {
		// 如果点击的是已选中的条件，则取消选择
		if (selecteddoubNumber.value === condition) {
			selecteddoubNumber.value = null
			return
		}

		// 否则设置新的条件
		selecteddoubNumber.value = condition

		if (condition === '0/5') {
			selectedNumbers.value = []
			selectedCondition.value = ''
		} else if (condition === '1/6') {
			selectedNumbers.value = []
			selectedCondition.value = ''
		} else if (condition === '2/7') {
			selectedNumbers.value = []
			selectedCondition.value = ''
		} else if (condition === '3/8') {
			selectedNumbers.value = []
			selectedCondition.value = ''
		} else if (condition === '4/9') {
			selectedNumbers.value = []
			selectedCondition.value = ''
		}
	}
	
	
	

	// 添加事件发射器与drawLine.vue建立事件联系
	const emit = defineEmits(['close']);

	// 预览类型（默认为实心）
	const previewType = ref('solid')

	// 关闭按钮处理函数
	const close = () => {
		emit('close');
	}
	// 确认按钮处理函数
	const confirm = () => {
		// 准备要传递的数据
		const selectionData = {
		    selectedNumbers: selectedNumbers.value,
		    selectedCondition: selectedCondition.value,
		    selecteddoubNumber: selecteddoubNumber.value,
		    groupIndex: props.groupIndex, // 添加格子信息
		    numIndex: props.numIndex
		};
		emit('confirm', selectionData);
	}
</script>

<style>
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
		font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
	}

	body {
		background-color: #f5f7fa;
		color: #333;
		padding: 20px;
		max-width: 500px;
		margin: 0 auto;
	}

	.firstsize {
		width: 500rpx;
		text-align: left;
		font-size: 200%;
		color: darkturquoise;
	}

	.wenma {
		position: relative;
		width: 550rpx;
		height: 130rpx;
		left: 200rpx;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		font-weight: bold;
		background-color: #ff4d4f;
	}

	.NumberPos {
		width: 80%;
		height: 10%;
		margin: auto;
		margin-top: 188px;
		background-color: white;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	/* 头部样式 - Flex布局 */
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		border-bottom: 1px solid #eee;
		background-color: white;
	}

	.title {
		font-size: 20px;
		font-weight: 600;
		color: #333;
	}

	.mode-switch {
		display: flex;
		background: #f0f2f5;
		border-radius: 20px;
		padding: 4px;
	}

	.mode-btn {
		padding: 6px 16px;
		border-radius: 16px;
		font-size: 14px;
		cursor: pointer;
		transition: all 0.3s;
	}

	.mode-btn.active {
		background: #ff7900;
		color: white;
	}

	/* 数字选择区域 - Flex布局 */
	.section {
		padding: 20px;
		border-bottom: 1px solid #eee;
	}

	.section-title {
		font-size: 16px;
		font-weight: 500;
		margin-bottom: 16px;
		color: #333;
	}

	.numbers-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}

	.number-btn {
		flex: 0 0 calc(20% - 10px);
		aspect-ratio: 1;
		border-radius: 50%;
		border: 1px solid #e0e0e0;
		background: white;
		font-size: 18px;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.number-btn.selected {
		background: #1677ff;
		color: white;
		border-color: #1677ff;
		transform: scale(1.05);
	}


	/* 条件选择区域 - Flex布局 */
	.conditions-grid {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}

	.condition-btn {
		flex: 0 0 calc(20% - 8px);
		padding: 8px 0;
		border-radius: 8px;
		border: 1px solid #e0e0e0;
		background: white;
		font-size: 14px;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.condition-btn.selected {
		background: #1677ff;
		color: white;
		border-color: #1677ff;
	}

	/* 效果预览区域 - Flex布局 */
	.preview-section {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	.preview-options {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.preview-option {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 14px;
		cursor: pointer;
	}

	.option-checkbox {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1px solid #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.option-checkbox.selected {
		background: #1677ff;
		border-color: #1677ff;
	}

	.option-checkbox.selected::after {
		content: "✓";
		color: white;
		font-size: 12px;
	}

	.digits-container {
		display: flex;
		justify-content: space-between;
	}

	.digit-box {
		width: 23%;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
	}

	.digit-label {
		font-size: 14px;
		color: #666;
	}

	.digit-display {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		font-weight: bold;
	}

	.digit-display.hollow {
		display: inline-block;
		text-align: center;
		border: 2px solid #e0e0e0;
		background: white;
	}

	.digit-display.solid {
		display: inline-block;
		text-align: center;
		background: #ff4d4f;
		color: white;
	}

	/* 底部按钮 - Flex布局 */
	.footer {
		display: flex;
		padding: 20px;
		gap: 16px;
	}

	.action-btn {
		flex: 1;
		padding: 14px 0;
		border-radius: 8px;
		font-size: 16px;
		font-weight: 500;
		text-align: center;
		cursor: pointer;
		transition: all 0.2s;
	}

	.cancel-btn {
		background: #f0f2f5;
		color: #666;
	}

	.cancel-btn:hover {
		background: #e6e8eb;
	}

	.confirm-btn {
		background: #ff7900;
		color: white;
	}

	.confirm-btn:hover {
		background: #e66a00;
	}
</style>