<template>
    <view class="container">
        <top-navigation-bar title="云规" />
        <view class="filter-bar">
            <!-- 筛选栏 -->
            <view class="filter-bar-left" @click="togglePopup">
                <view class="filter-bar-id">xxx期</view>
                <view class="filter-bar-stats">是否已开奖</view>

                <view class="id-select-popup" :class="{ active: popupIsOpen }">
                    <view class="custom-list">
                        <view class="custom-list-item">
                            <view class="custom-list-id">第xxxx期</view>
                            <view class="custom-list-opennum">312313</view>
                        </view>
                        <view class="custom-list-item active">
                            <view class="custom-list-id">第xxxx期</view>
                            <view class="custom-list-opennum">312313</view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="filter-bar-right">
                <!-- 选择展示数量 -->
                <view class="filter-bar-right-item">近10期</view>
                <view class="filter-bar-right-item">近30期</view>
                <view class="filter-bar-right-item">近100期</view>
            </view>
        </view>
        <tag-list-component class="tag-list" :tags="tagOptions" :list-data="listData">
            <!-- 自定义列表插槽 -->
            <template #list="{ data, activeTag }">
                <view class="custom-list">
                    <view v-for="item in data" :key="item.id" class="custom-list-item">
                        <view class="custom-list-title">1.杀头：1</view>
                        <view class="custom-list-btns">
                            <view class="custom-list-btn custom-list-btn-left">近10中10</view>
                            <view class="custom-list-btn">查看规律</view>
                        </view>
                    </view>
                </view>
            </template>
        </tag-list-component>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import TagListComponent from '../../components/tag-list.vue'
import TopNavigationBar from '../../components/TopNavigationBar.vue';

const tagOptions = ref([
    { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' }, { label: '全部', value: 'all' },
    { label: '技术', value: 'tech' },
    { label: '设计', value: 'design' },
    { label: '产品', value: 'product' }
])
const listData = ref({
    all: [
        { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' }, { id: 1, title: '1', description: '2' },
    ],
    tech: [
        { id: 1, title: '43242', description: 'rewrwr' }
    ],
    design: [
        { id: 1, title: 'rwrwr', description: '43423424234' }
    ],
    product: [
        { id: 1, title: '1314422', description: '312313' }
    ]
})

// 期号选择框
const popupIsOpen = ref(false)
function togglePopup() {
    popupIsOpen.value = !popupIsOpen.value
}

// 筛选条件
const filterConditions = ref({

})

</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;

    // 归类展示
    .tag-list {
        flex: 1;
        overflow: hidden;

        .custom-list {
            .custom-list-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20rpx 40rpx;
            }

            .custom-list-title {
                width: 100%;
                text-align: left;

                margin-bottom: 20rpx;
                font-size: 34rpx;
                font-weight: bold;
            }

            .custom-list-btns {
                display: flex;
                align-items: center;
                width: 100%;

                .custom-list-btn {
                    border-radius: 5px;
                    padding: 10rpx 20rpx;
                    font-size: 28rpx;
                    color: rgb(26, 66, 247);
                    background-color: rgb(229, 244, 255);

                    &.custom-list-btn-left {
                        margin-right: auto;
                    }
                }
            }
        }
    }

    .filter-bar {
        height: 90rpx;
        display: flex;
        align-items: center;
        justify-items: center;

        border-bottom: 1px solid #eee;

        .filter-bar-left {
            font-size: 32rpx;
            text-align: center;
            padding: 0 20rpx;

            position: relative;

            .filter-bar-id {
                font-weight: bold;
            }

            .filter-bar-stats {
                color: #f00;
            }

            .id-select-popup {
                position: absolute;
                z-index: -99;
                top: calc(100% - 30rpx);
                height: 700rpx;
                width: 500rpx;
                background: #fff;
                border: 1px solid #eee;
                opacity: 0;
                transition: all 0.3s ease;
                box-shadow: 0 0 10rpx rgba(0, 0, 0, 0.1);
                border-radius: 10px;

                &.active {
                    z-index: 999;
                    top: 100%;
                    opacity: 1;
                }

                .custom-list {
                    .custom-list-item {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 20rpx 40rpx;
                        border-bottom: 1px solid #eee;
                        font-size: 38rpx;

                        .custom-list-id {}

                        .custom-list-opennum {
                            border-radius: 5%;
                            padding: 10rpx 40rpx;
                            background: #eee;
                        }

                        &.active {
                            .custom-list-opennum {
                                background: #f83535;
                            }
                        }
                    }
                }
            }
        }

        .filter-bar-right {
            flex: 1;
            gap: 20rpx;
            display: flex;
            align-items: center;
            justify-items: center;
            box-sizing: border-box;
            padding: 0 30rpx;

            font-size: 28rpx;
            text-align: center;

            .filter-bar-right-item {
                flex: 1;
                height: 60rpx;
                line-height: 60rpx;
                color: #fff;
                background: #f83535;
                border-radius: 8rpx;
            }
        }
    }
}
</style>