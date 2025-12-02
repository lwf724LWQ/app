<template>
	<view class="tag-list-container">
		<!-- 左侧标签区域 -->
		<scroll-view class="left-tags" :scroll-y="true">
			<!-- 自定义标签插槽 -->
			<view v-if="!$slots.tags" class="tags-default">
				<view v-for="tag in tags" :key="tag.value" :class="['tag-item', { active: activeTag === tag.value }]"
					@click="switchTag(tag.value)">
					{{ tag.label }}
				</view>
			</view>
			<slot name="tags" :active-tag="activeTag" :switch-tag="switchTag"></slot>
		</scroll-view>

		<!-- 右侧列表区域 -->
		<scroll-view class="right-list" :scroll-y="true">
			<!-- 自定义列表插槽 -->
			<slot name="list" :data="currentList" :active-tag="activeTag"></slot>
		</scroll-view>
	</view>
</template>

<script>
export default {
	name: 'TagListComponent',
	props: {
		// 标签数据
		tags: {
			type: Array,
			default: () => []
		},
		// 列表数据
		listData: {
			type: Object,
			default: () => ({})
		}
	},
	data() {
		return {
			activeTag: ''
		}
	},
	computed: {
		// 当前激活标签对应的列表数据
		currentList() {
			if (!this.activeTag) {
				return []
			}
			return this.listData[this.activeTag] || []
		}
	},
	mounted() {
		// 默认激活第一个标签
		if (this.tags.length > 0 && !this.activeTag) {
			this.activeTag = this.tags[0].value
		}
	},
	methods: {
		// 切换标签
		switchTag(tagValue) {
			this.activeTag = tagValue
			// 触发标签切换事件
			this.$emit('tag-change', tagValue)
		}
	}
}
</script>

<style lang="scss" scoped>
.tag-list-container {
	display: flex;
}

.left-tags {
	width: auto;
}

.tags-default {
	min-height: 100%;
	background-color: #efefef;

	.tag-item {
		padding: 28rpx 50rpx;

		&.active {
			color: rgb(223, 34, 34);
			background-color: #fff;
		}
	}
}

.right-list {
	flex: 1;
}
</style>