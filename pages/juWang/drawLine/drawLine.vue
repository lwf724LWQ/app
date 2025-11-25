<template>
	<view>
		<!-- #ifdef APP-PLUS || H5 -->
		<view class="canvas-wrapper">
			<canvas canvas-id="bg_canvas" id="bg_canvas" class="canvas" :style="style"></canvas>
			<canvas canvas-id="line_canvas" id="line_canvas" class="canvas" :style="style"></canvas>
			<canvas canvas-id="topicon_canvas" id="topicon_canvas" class="canvas" :style="style"></canvas>
			<canvas canvas-id="diyNumber_canvas" id="diyNumber_canvas" class="canvas" :style="style"></canvas>
			<canvas canvas-id="control_canvas" id="control_canvas" class="canvas" :style="style"
				@touchstart="touchevent" @touchmove="touchevent" @touchend="touchevent"
				@touchcancel="touchevent"></canvas>
		</view>

		<!-- 控制菜单 -->
		<view class="top-menu-wrapper">
			<!-- 顶部 -->
			<view class="menu-item" @click="backPage">返回</view>
			<view class="menu-item" @click="undo">撤销</view>
			<view class="menu-item" @click="redo">恢复</view>
			<view class="menu-item" @click="clear">清除</view>
			<!-- <view class="menu-item" @click="share">分享</view> -->
			<view class="menu-item" @click="save">保存</view>
			<!-- <view class="menu-item" @click="openSettings">设置</view> -->
		</view>



		<!-- 按钮 -->
		<!-- <view class="control-wrapper-close-btn" @click="showBottom">{{ bottomIsShow ? "收起" : "打开" }}</view>
		<view v-show="pantype === 'autoLine'" class="autoline-menu-close-btn"
			@click="autolineMenuIsShow = !autolineMenuIsShow">{{
				autolineMenuIsShow ? "收起智能线配置" : "打开智能线配置" }}</view> -->

		<!-- #endif -->
		<!-- #ifndef APP-PLUS || H5 -->
		<canvas canvas-id="canvas2" id="canvas2" class="canvas canvas_forMP" :style="style" disable-scroll></canvas>
		<canvas canvas-id="canvas" id="canvas" class="canvas canvas_forMP" :style="style" disable-scroll></canvas>

		<cover-view class="left-row"></cover-view>
		<cover-view class="right-row" @touchstart="touchevent" @touchmove="touchevent" @touchend="touchevent"
			@touchcancel="touchevent"></cover-view>
		<!-- #endif -->

		<!-- 数字选择器 -->
		<number-select ref="numberSelect" @confirm="numberSelectConfirm"></number-select>

		<!-- 打开颜色和大小选择菜单 -->
		<view class="colorSelect" @click="colorAndSizeIsShow = !colorAndSizeIsShow">
			<uni-icons type="color-filled" :style="`color:${color}`" size="40"></uni-icons>
		</view>
		<!-- 画笔颜色选择按钮 -->
		<color-select-menu :open="colorAndSizeIsShow" v-model="color" @change="setPanStyle"></color-select-menu>
		<!-- 画笔粗细选择 -->
		<pansize :open="colorAndSizeIsShow" v-model="pansize" :color="color" @change="setPanStyle"></pansize>

		<!-- 智能线配置模版 -->
		<auto-line-setting-menu ref="autoLineSettingMenu" v-model="autolineSetting"
			@change="setAutolineSetting"></auto-line-setting-menu>
		<view class="openLineTypeChooseBtn">
			<view style="padding-right:20rpx" v-show="pantype === 'autoLine'" @click="openAutoLineSettingMenu">设置
			</view>
			<view @click="showBottom">{{ panTypeToText(pantype) }}</view>
		</view>



		<!-- 画笔类型选择 -->
		<lineTypeSelect :open="bottomIsShow" v-model="pantype" @change="setPanStyle"></lineTypeSelect>

		<view class="canvas-text-box" v-if="isShowTextInputBox">
			<input class="uni-input" focus placeholder="输入文本" v-model.trim="textValue" @confirm="textConfirm" />
		</view>
	</view>
</template>

<script>
import Table, { tableStyle } from './table.ts'
import colorSelectMenu from './components/color-select-menu.vue';
import pansize from './components/pansize.vue';
import lineTypeSelect from './components/line-type-select.vue';
import autoLineSettingMenu from './components/auto-line-setting-menu.vue';
import numberSelect from './components/number-select.vue';
import panType from './panType';

import { apiTicketQuery } from "@/api/apis.js"

export default {
	components: {
		colorSelectMenu, pansize, lineTypeSelect, autoLineSettingMenu, numberSelect
	},

	data() {
		const width = uni.getSystemInfoSync().windowWidth
		// alert(crypto.randomUUID())
		return {
			colorAndSizeIsShow: false,

			style: `width: ${width}px; height: 2440rpx;`,
			width: width,
			height: uni.rpx2px(2440),
			data: [
				{ date: '2021-01-01', line: [1, 2, 3, 4, 5, 6] }
			],
			// 地下菜单是否收起
			bottomIsShow: false,
			// 智能笔打开关闭
			autolineMenuIsShow: false,
			// 绘制设置
			color: '#FE0000',
			pansize: 3,
			pantype: 'autoLine',
			// 智能笔设置
			autolineSetting: {
				controlSwitch: true,
				isMoreColor: false,
				interval: 1,
				panCount: 1,
				lineType: 'topBezier'
			},

			// 输入框
			isShowTextInputBox: false,
			textValue: '',
			textCallBack: null

		}
	},
	methods: {
		openAutoLineSettingMenu() {
			this.$refs.autoLineSettingMenu.open()
		},
		panTypeToText(pantype) {
			return panType[pantype]
		},
		// 处理数据
		handleData(data) {
			const lastData = data[data.length - 1]
			data.push({
				id: '',
				tname: lastData.tname,
				issueno: Number(lastData.issueno) + 1,
				number: "",
				refernumber: '',
				opendate: false,
				createTime: '',
				isWrite: true
			})
			this.data = data.map(item => ({
				...item,
				number: item.number.split(" "),
				isWrite: item.isWrite || false
			}))
		},
		// 阻止滚动
		touchevent: function (e) {
			if (this.isShowTextInputBox) {
				// this.textConfirm()
				return
			}

			if (e.touches.length >= 1) {
				if (e.touches[0].x > tableStyle.dateInfo.width) {
					e.preventDefault()
				} else if (e.type === 'touchstart') {
					return
				}
			}
			const toucheXY = e.touches.length ? e.touches[0] : false
			const touche = {
				type: e.type,
				x: toucheXY.x,
				y: toucheXY.y
			}
			this.table.touchEvent(touche)
		},
		showBottom: function () {
			console.log(this.bottomIsShow)
			this.bottomIsShow = !this.bottomIsShow
		},
		// 设置笔绘制参数
		setPanStyle: function () {
			this.bottomIsShow = false
			this.table.setPanStyle(this.createPanStyleObj())
		},
		// 创建笔样式对象
		createPanStyleObj: function () {
			return {
				type: this.pantype,
				color: this.color,
				size: this.pansize
			}
		},
		//修改智能笔配置
		setAutolineSetting: function () {
			this.table.setAutolineSetting(this.createAutolineSettingObj())
		},
		// 创建智能笔配置对象
		createAutolineSettingObj: function () {
			return Object.assign({}, this.autolineSetting)
		},
		// 返回上一页
		backPage() {
			uni.navigateBack()
		},
		// 撤销上一步操作
		undo: function () {
			this.table.undo()
		},
		// 恢复已撤销的操作
		redo: function () {
			this.table.redo()
		},
		// 清除画布内容
		clear: function () {
			this.table.clear()
		},
		//  分享绘制结果
		shar: function () {
			this.table.shar()
		},
		// 保存绘制作品
		save: function () {
			this.table.save()
		},
		// 打开设置
		openSettings: function () {

		},
		textConfirm: function () {
			const value = this.textValue
			if (this.textCallBack) {
				this.textCallBack(value)
			} else {
				this.table.textInput(value)
			}
			this.isShowTextInputBox = false
		},
		numberSelectConfirm: function (res) {
			this.table.numberSelect(res)
		}
	},
	onReady: async function () {
		const res = await apiTicketQuery({
			tname: "七星彩",
			page: 1,
			limit: 20
		})
		this.handleData(res.data.records)
		uni.pageScrollTo({ scrollTop: this.height, duration: 0 })
		// this.handleData([
		// 	{
		// 		"id": "1989326513835646979",
		// 		"tname": "七星彩",
		// 		"issueno": "25131",
		// 		"number": "3 5 0 2 1 1",
		// 		"refernumber": "0",
		// 		"opendate": "2025-11-14",
		// 		"createTime": "2025-11-14 21:36:15"
		// 	}
		// ])
		this.$nextTick(() => {

			const canvas_id = { bg_canvas: "bg_canvas", line_canvas: "line_canvas", topicon_canvas: "topicon_canvas", control_canvas: "control_canvas", diyNumber_canvas: "diyNumber_canvas" }

			this.table = new Table(canvas_id, this.width, this.height, this.createPanStyleObj(), this.data, this.createAutolineSettingObj(), (value, callback) => {
				this.textValue = value || ""
				this.textCallBack = callback
				this.isShowTextInputBox = true;
			}, (placeValue, y) => {
				this.$refs.numberSelect.open(placeValue, y)
			})
		})
	},

}
</script>
<style lang="scss" scoped>
.page-body-wrapper {
	text-align: center;
}

.canvas {
	position: absolute;
	width: 100%;
	margin: 0;
	padding: 0;

}

.canvas_forMP {
	position: absolute;
	top: 0;
	left: 0;
	z-index: -1;
}

.canvas-wrapper {
	margin-top: 90rpx;
}

// 菜单
.top-menu-wrapper {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	width: 100%;
	height: 90rpx;
	overflow: hidden;
	display: flex;
	flex-direction: row;
	justify-content: space-around;
	align-items: center;
	color: #fff;
	background: #93c385;
	box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.5);

}

.colorSelect {
	position: fixed;
	left: 21rpx;
	bottom: 30rpx;

	height: 90rpx;
	width: 90rpx;

	border-radius: 50%;
	background: rgba(75, 75, 75, .8);

	display: flex;
	justify-content: center;
	align-items: center;

	.openColorAndSizeMenuBtn {}
}

.openLineTypeChooseBtn {
	position: fixed;
	bottom: 30rpx;
	right: 0;
	// width: 230rpx;
	height: 90rpx;

	padding: 0 40rpx;

	border-radius: 45rpx 0 0 45rpx;
	background-color: rgba(75, 75, 75, .8);
	color: #fff;

	display: flex;
	align-items: center;
	justify-content: center;
}

.control-wrapper-close-btn {
	position: fixed;

	bottom: 20rpx;
	left: 20rpx;
	right: 20rpx;
	height: 60rpx;
	line-height: 60rpx;
	border-radius: 10rpx;
	background-color: #f0a6a675;
	box-sizing: border-box;
	text-align: center;
}

.autoline-menu-close-btn {
	position: fixed;

	bottom: 120rpx;
	left: 20rpx;
	right: 20rpx;
	height: 60rpx;
	line-height: 60rpx;
	border-radius: 10rpx;
	background-color: #f0a6a675;
	box-sizing: border-box;
	text-align: center;
}

.canvas-text-box {
	position: fixed;
	top: 40%;
	left: calc(50% - 32rpx);
	bottom: 50%;
	width: 0;

	.uni-input {
		width: 240rpx;
		font-size: 50rpx;
		font-weight: bold;
		height: 65rpx;
		line-height: 65rpx;

		background-color: #fff;
		border: #4efa4e 4rpx solid;
		border-radius: 16rpx;
		box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.5);

		text-align: center;
	}
}
</style>
