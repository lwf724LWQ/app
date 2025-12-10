<template>
    <view class="container">
        <!-- 左侧标签栏 -->
        <view class="left-tags">
            <scroll-view class="tags-scroll" scroll-y>
                <view v-for="tag in tags" :key="tag.name" class="tag-item"
                    :class="{ 'tag-active': activeTag.name === tag.name }" @click="handleTagChange(tag)">
                    <text class="tag-text">{{ tag.name }}</text>
                </view>
            </scroll-view>
        </view>

        <!-- 右侧数字选择区 -->
        <view class="right-content">
            <view class="title-section">
                <text class="title">{{ activeTag.name }}</text>
                <text class="selection-info">最多可选6个数字</text>
            </view>

            <!-- 根据标签类型显示对应的位数 -->
            <view class="digit-sections">
                <!-- 千位 -->
                <view v-if="showPositions.includes('千位')" class="digit-section">
                    <text class="digit-title">千位</text>
                    <view class="number-grid">
                        <view v-for="num in numbers" :key="`thousand-${num}`" class="number-item" :class="{
                            'number-selected': isNumberSelected('千位', num),
                            'number-disabled': isNumberDisabled('千位')
                        }" @click="toggleNumber('千位', num)">
                            <text class="number-text">{{ num }}</text>
                        </view>
                    </view>
                </view>

                <!-- 百位 -->
                <view v-if="showPositions.includes('百位')" class="digit-section">
                    <text class="digit-title">百位</text>
                    <view class="number-grid">
                        <view v-for="num in numbers" :key="`hundred-${num}`" class="number-item" :class="{
                            'number-selected': isNumberSelected('百位', num),
                            'number-disabled': isNumberDisabled('百位')
                        }" @click="toggleNumber('百位', num)">
                            <text class="number-text">{{ num }}</text>
                        </view>
                    </view>
                </view>

                <!-- 十位 -->
                <view v-if="showPositions.includes('十位')" class="digit-section">
                    <text class="digit-title">十位</text>
                    <view class="number-grid">
                        <view v-for="num in numbers" :key="`ten-${num}`" class="number-item" :class="{
                            'number-selected': isNumberSelected('十位', num),
                            'number-disabled': isNumberDisabled('十位')
                        }" @click="toggleNumber('十位', num)">
                            <text class="number-text">{{ num }}</text>
                        </view>
                    </view>
                </view>

                <!-- 个位 -->
                <view v-if="showPositions.includes('个位')" class="digit-section">
                    <text class="digit-title">个位</text>
                    <view class="number-grid">
                        <view v-for="num in numbers" :key="`single-${num}`" class="number-item" :class="{
                            'number-selected': isNumberSelected('个位', num),
                            'number-disabled': isNumberDisabled('个位')
                        }" @click="toggleNumber('个位', num)">
                            <text class="number-text">{{ num }}</text>
                        </view>
                    </view>
                </view>
            </view>

            <!-- 统计信息 -->
            <view class="stats-section">
                <view class="stat-item">
                    <text class="stat-label">已选数字：</text>
                    <text class="stat-value">{{ totalSelected }}/6</text>
                </view>
                <view class="selected-numbers">
                    <text class="selected-label">选中数字：</text>
                    <text class="selected-list">{{ selectedNumbersDisplay }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'


// 左侧标签数据
const tags = ref([
    { name: '定头', positions: ['千位'] },
    { name: '定百', positions: ['百位'] },
    { name: '定十', positions: ['十位'] },
    { name: '定尾', positions: ['个位'] },
    { name: '头尾', positions: ['千位', '个位'] },
    { name: '中肚', positions: ['百位', '十位'] },
    { name: 'ABXX', positions: ['千位', '百位'] },
    { name: 'AXCX', positions: ['千位', '十位'] },
    { name: 'XBXD', positions: ['百位', '个位'] },
    { name: 'XXCD', positions: ['十位', '个位'] },
    { name: 'ABCX', positions: ['千位', '百位', '十位'] },
    { name: 'ABXD', positions: ['千位', '百位', '个位'] },
    { name: 'AXCD', positions: ['千位', '十位', '个位'] },
    { name: 'XBCD', positions: ['百位', '十位', '个位'] }
].map(tag => ({
    ...tag,
    selectedNumbers: {
        '千位': [],
        '百位': [],
        '十位': [],
        '个位': []
    }
})))

// 当前选中的标签
const activeTag = ref(tags.value[0])

// 数字0-9
const numbers = ref([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])

// 存储选中的数字
const selectedNumbers = computed(() => {
    return activeTag.value.selectedNumbers
})

// 计算显示的位置
const showPositions = computed(() => {
    return activeTag.value.positions
})

// 切换标签
const handleTagChange = (tag) => {
    activeTag.value = tag
}

// 切换数字选中状态
const toggleNumber = (position, number) => {
    const index = selectedNumbers.value[position].indexOf(number)

    if (index > -1) {
        // 如果已选中，则取消
        selectedNumbers.value[position].splice(index, 1)
    } else {
        // 如果未选中，检查是否超过6个
        if (selectedNumbers.value[position].length >= 6) {
            uni.showToast({
                title: `${position}最多只能选6个数字`,
                icon: 'none'
            })
            return
        }
        selectedNumbers.value[position].push(number)
        selectedNumbers.value[position].sort((a, b) => a - b)
    }
}

// 检查数字是否被选中
const isNumberSelected = (position, number) => {
    return selectedNumbers.value[position].includes(number)
}

// 检查该位是否已选满6个
const isNumberDisabled = (position) => {
    return selectedNumbers.value[position].length >= 6
}

// 计算总选中数字数量
const totalSelected = computed(() => {
    let count = 0
    Object.values(selectedNumbers.value).forEach(arr => {
        count += arr.length
    })
    return count
})

// 显示选中的数字
const selectedNumbersDisplay = computed(() => {
    const result = []
    Object.entries(selectedNumbers.value).forEach(([position, nums]) => {
        if (nums.length > 0) {
            result.push(`${position}: [${nums.join(',')}]`)
        }
    })
    return result.length > 0 ? result.join('  ') : '暂无选择'
})
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    width: 100%;
    height: 100vh;
    background-color: #f5f5f5;
}

// 左侧标签栏样式
.left-tags {
    width: 180rpx;
    background-color: #fff;
    border-right: 2rpx solid #e8e8e8;
}

.tags-scroll {
    height: 100%;
}

.tag-item {
    padding: 30rpx 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
    text-align: center;
    transition: all 0.3s;
}

.tag-text {
    font-size: 26rpx;
    color: #666;
}

.tag-active {
    background-color: #409eff;

    .tag-text {
        color: #fff;
        font-weight: bold;
    }
}

// 右侧内容区样式
.right-content {
    flex: 1;
    padding: 30rpx;
}

.title-section {
    margin-bottom: 40rpx;
    padding-bottom: 20rpx;
    border-bottom: 2rpx solid #e8e8e8;
}

.title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
    margin-right: 20rpx;
}

.selection-info {
    font-size: 24rpx;
    color: #f56c6c;
}

.digit-sections {
    margin-bottom: 40rpx;
}

.digit-section {
    margin-bottom: 40rpx;
}

.digit-title {
    display: block;
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
    margin-bottom: 20rpx;
}

.number-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20rpx;
}

.number-item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100rpx;
    background-color: #fff;
    border-radius: 12rpx;
    border: 2rpx solid #dcdfe6;
    transition: all 0.3s;

    &.number-selected {
        background-color: #409eff;
        border-color: #409eff;

        .number-text {
            color: #fff;
        }
    }

    &.number-disabled:not(.number-selected) {
        opacity: 0.5;
    }
}

.number-text {
    font-size: 32rpx;
    color: #333;
    font-weight: bold;
}

.stats-section {
    padding: 30rpx;
    background-color: #fff;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
}

.stat-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.stat-label {
    font-size: 28rpx;
    color: #666;
}

.stat-value {
    font-size: 28rpx;
    color: #409eff;
    font-weight: bold;
}

.selected-numbers {
    margin-top: 20rpx;
}

.selected-label {
    font-size: 24rpx;
    color: #999;
    margin-right: 10rpx;
}

.selected-list {
    font-size: 24rpx;
    color: #333;
    line-height: 1.6;
}
</style>