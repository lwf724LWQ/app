<template>
    <view class="container">
        <top-navigation-bar>
            <template #center>
                <view class="top-tags">
                    <view class="tag-list-item" :class="{ active: nowPage === pageName.qihao }"
                        @click="changePage(pageName.qihao)">
                        期号展示
                    </view>
                    <view class="tag-list-item" :class="{ active: nowPage === pageName.guilei }"
                        @click="changePage(pageName.guilei)">
                        归类展示
                    </view>
                </view>
            </template>
        </top-navigation-bar>
        <tag-list-component class="tag-list" :tags="tagOptions" :list-data="listData"
            v-show="nowPage === pageName.guilei">
            <!-- 归类展示 -->
            <template #list="{ data, activeTag }">
                <view class="custom-list">
                    <view v-for="item in data" :key="item.id" class="custom-list-item">
                        <view class="custom-list-item-icon">局中期</view>
                        <view class="custom-list-item-id">第xxx期</view>
                        <view class="custom-list-item-num">31231<uni-icons type="right" size="18" /></view>
                    </view>
                </view>
            </template>
        </tag-list-component>

        <view v-show="nowPage === pageName.qihao" class="qihao-list">
            <!-- 期号展示 -->
            <scroll-view class="qihao-scrollbox" :scroll-y="true">
                <view class="qihao-info">
                    <view class="qihao-id">xxx期</view>
                    <view class="qihao-opennum">待开奖/开奖号码</view>
                    <view class="qihao-date">xx月xx日 周xx</view>
                </view>
                <view class="qihao-items">
                    <view class="qihao-item" v-for="i in 60" :key="i">
                        <view class="qihao-item-name">111</view>
                    </view>
                </view>
            </scroll-view>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Ref } from 'vue';
import TagListComponent from '../../components/tag-list.vue'
import TopNavigationBar from '../../components/TopNavigationBar.vue';

enum pageName {
    qihao, // 期号展示
    guilei // 归类展示
}
const nowPage: Ref<pageName> = ref(pageName.qihao);

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
// 切换页面
function changePage(e: pageName) {
    nowPage.value = e
}


</script>

<style lang="scss" scoped>
.container {
    display: flex;
    flex-direction: column;
    height: 100vh;

    // 顶部切换
    .top-tags {
        display: flex;
        align-items: center;
        justify-items: center;

        gap: 20rpx;

        .tag-list-item {
            height: 50rpx;
            box-sizing: content-box;
            font-size: 28rpx;

            &.active {
                font-size: 32rpx;
                color: rgb(223, 34, 34);
                border-bottom: 8rpx solid rgb(223, 34, 34);
            }
        }
    }


    // 归类展示
    .tag-list,
    .qihao-list {
        flex: 1;
        overflow: hidden;
    }

    .custom-tags {
        height: 100%;
        background-color: #efefef;

        .custom-tag-btn {
            padding: 28rpx 40rpx;

            &.active {
                color: rgb(223, 34, 34);
                background-color: #fff;
            }
        }
    }

    .qihao-scrollbox {
        height: 100%;

        .qihao-info {
            display: flex;
            height: 70rpx;
            align-items: center;
            text-align: center;

            .qihao-id {
                flex: 1;
            }

            .qihao-opennum {
                flex: 2;
            }

            .qihao-date {
                flex: 2;
            }
        }

        .qihao-items {
            display: grid;
            grid-template-columns: repeat(5, 1fr);

            .qihao-item {
                display: flex;
                align-items: center;
                justify-content: center;
                box-sizing: border-box;
                padding: 20rpx;
                border: 1rpx solid #ccc;

                .qihao-item-name {
                    box-sizing: 100%;
                    background-color: #666;

                    height: 80rpx;
                    width: 80rpx;
                }
            }
        }
    }


}
</style>