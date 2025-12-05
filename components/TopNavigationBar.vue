<template>
    <div class="top-navigation-bar" :class="[{ oldmanmode: useOldManModeStore?.enabled }]"
        :style="{ backgroundColor: props.bgColor }">
        <!-- 左侧区域插槽 -->
        <div class="nav-left" @click="goBack">
            <slot name="left">
                <!-- 默认返回按钮 -->
                <uni-icons class="back-button" :style="{ color: color }" :type="props.backIcon"></uni-icons>
            </slot>
        </div>

        <!-- 中间区域插槽 -->
        <div class="nav-center">
            <slot name="center">
                <!-- 默认标题 -->
                <span class="title" :style="{ color: color }">{{ props.title }}</span>
            </slot>
        </div>

        <!-- 右侧区域插槽 -->
        <div class="nav-right">
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, inject } from 'vue';
import { oldManModeStoreKey } from '../stores/oldManMode';

// 定义组件名称
defineOptions({
    name: 'TopNavigationBar'
});

// 注入老年代模式状态
const useOldManModeStore = inject(oldManModeStoreKey);

// 定义props
interface Props {
    backIcon?: string;
    title?: string;
    bgColor?: string;
    color?: string;
}

const props = withDefaults(defineProps<Props>(), {
    backIcon: 'left',
    title: '标题',
    bgColor: '#fff',
    color: '#111'
});

// 获取当前实例
const instance = getCurrentInstance();

// 返回方法
const goBack = () => {
    // 发出back事件
    instance?.emit('back');

    // 获取当前页面栈
    const routes = getCurrentPages();
    if (routes.length > 1) {
        uni.navigateBack();
    } else {
        // 如果没有历史记录，跳转到首页
        uni.reLaunch({ url: "/pages/index/index" });
    }
};
</script>

<style scoped lang="scss">
.top-navigation-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100rpx;
    padding: 0 30rpx;
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
    box-sizing: content-box;
    padding-top: var(--status-bar-height);


    &.oldmanmode {
        .nav-center .title {
            font-size: 48rpx;
            font-weight: bold;
        }
    }
}

.nav-left,
.nav-right {
    flex: 1;
    display: flex;
    align-items: center;
    height: 100%;
}

.nav-center {
    flex: 7;
    display: flex;
    justify-content: center;
    font-size: 33rpx;
    font-weight: 500;
    overflow: hidden;
}

.title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>