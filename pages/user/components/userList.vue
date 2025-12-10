<template>
    <scroll-view class="follow-list" :class="{ oldManMode: useOldManModeStore.enabled }" scroll-y
        :refresher-enabled="true" :refresher-triggered="refreshing" @refresherrefresh="onRefresh">

        <view class="follow-item" v-for="(item, index) in followList" :key="index" @click="goToUserDetail(item.id)">
            <image class="avatar" :src="item.avatar || '/static/default-avatar.png'" mode="aspectFill">
            </image>

            <view class="user-info">
                <view class="user-name">{{ item.name }}</view>
                <view class="user-desc">{{ item.description || '暂无简介' }}</view>
            </view>
        </view>

        <!-- 空状态 -->
        <view class="empty-state" v-if="followList.length === 0 && !refreshing">
            <image class="empty-icon" src="/static/empty-follow.png" mode="aspectFit"></image>
            <text class="empty-text">{{ emptyText }}</text>
        </view>
    </scroll-view>
</template>

<script setup>
import { inject } from "vue"
const useOldManModeStore = inject('useOldManModeStore')
// 定义组件属性
const props = defineProps({
    followList: {
        type: Array,
        default: () => []
    },
    refreshing: {
        type: Boolean,
        default: false
    },
    emptyText: {
        type: String,
        default: '暂无数据'
    }
})

// 定义组件事件
const emit = defineEmits(['refresh', 'userClick'])

// 下拉刷新处理函数
const onRefresh = () => {
    emit('refresh')
}

// 跳转到用户详情页
const goToUserDetail = (userId) => {
    emit('userClick', userId)
}
</script>

<style scoped lang="scss">
.oldManMode {
    .follow-item {
        margin-bottom: 5rpx;
        padding: 15rpx 20rpx;
    }

    .user-name {
        font-size: 42rpx;
    }

    .user-desc {
        font-size: 32rpx;
    }
}

.follow-list {
    flex: 1;
    overflow: hidden;
}

.follow-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    background-color: #fff;
    border-radius: 16rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    margin-right: 20rpx;
    background-color: #eee;
}

.user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
}

.user-name {
    font-size: 30rpx;
    color: #333;
    margin-bottom: 10rpx;
    font-weight: bold;
}

.user-desc {
    font-size: 24rpx;
    color: #999;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
}

.empty-icon {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 28rpx;
    color: #999;
}
</style>