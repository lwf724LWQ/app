<template>
	<view>
		<scroll-view :scroll-x="true" scroll-with-animation :scroll-left="state.scrollLeft" class="pd-tabs" :style="{
			width:props.tabsWidth + 'rpx',
			height:props.tabsHeight + 'rpx',
			background:props.tabsBgColor,
			color:props.tabsColor,
			marginTop:props.tabsMarginTop + 'rpx',
			lineHeight:props.tabsHeight + 'rpx',
			textAlign:'center',
		}">
			<view class="pd-tabs__item" v-for="(item,index) in state.tabList" :style="{
				color:state.current == index ? props.activeColor : props.tabsColor
			}" :key="index" @click="tabsItem(index)">
				{{ item[props.rangeKey] }}
			</view>
		</scroll-view>
		
		<view class="content">
			<swiper :current="state.current" @change="swiperChange">
				<swiper-item v-for="(item,index) in props.content" :key="index">
					<slot :data="item"></slot>
				</swiper-item>
			</swiper>
		</view>
	</view>
</template>

<script setup>
	import {
		reactive,
		getCurrentInstance,
		onMounted
	} from 'vue';
	const props = defineProps({
		// tab  高度
		tabsHeight: {
			type: Number,
			default: 100
		},
		// tab上边距
		tabsMarginTop: {
			type: Number,
			default: 0
		},
		// tab  宽度
		tabsWidth: {
			type: Number,
			default: 750
		},
		// 背景颜色
		tabsBgColor: {
			type: String,
			default: 'red'
		},
		// 字体颜色
		tabsColor: {
			type: String,
			default: '#fff'
		},
		//  选中的颜色
		activeColor: {
			type: String,
			default: 'blue'
		},
		tabList: {
			type: Array,
			default: () => []
		},
		// tabs  显示内容key
		rangeKey: {
			type: String,
			default: 'title'
		},
		// 内容
		content:{
			type:Array,
			default:()=>[]
		}
	})
	const state = reactive({
		current: 0,
		tabList: props.tabList,
		scrollIntoView: '',
		scrollLeft: 0,
		contentScrollW: 0
	})
	const instance = getCurrentInstance();
	const swiperChange = (e) =>{
		console.log(state.current)
		state.current = e.detail.current;
		state.scrollLeft = state.tabList[e.detail.current].left - state.contentScrollW / 2 + state.tabList[e.detail.current].width / 2; 
	}  
	onMounted(() => {
		const query = uni.createSelectorQuery().in(this);
		query.select('.pd-tabs').boundingClientRect(data => {
			state.contentScrollW = data.width
			console.log(data)
		}).exec()

		query.selectAll('.pd-tabs__item').boundingClientRect(data => {
			let dataLen = data.length;
			for (let i = 0; i < dataLen; i++) {
				//  scroll-view 子元素组件距离左边栏的距离
				state.tabList[i].left = data[i].left;
				//  scroll-view 子元素组件宽度
				state.tabList[i].width = data[i].width
			}
		}).exec()
		console.log(state.tabList, '12334')
	})
	const emit = defineEmits(['tabSubmit'])
	const tabsItem = (index) => {
		state.current = index
		state.scrollLeft = state.tabList[index].left - state.contentScrollW / 2 + state.tabList[index].width / 2; 

		emit('tabSubmit', {
			current: index,
			data: state.tabList[index]
		})
	}
</script>

<style scoped>
	.pd-tabs {
		background-color: #fff;
		margin: 0 auto;
		white-space: nowrap;
		overflow-y: scroll;
		scroll-behavior: smooth;
	}

	.pd-tabs__item {
		width: 33%;
		text-align: center;
		position: relative;
		display: inline-block;
	}

</style>