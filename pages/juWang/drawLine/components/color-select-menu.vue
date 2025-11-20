<template>
    <view class="color-control-wrapper">
        <view class="btn">
            画笔颜色
        </view>
        <scroll-view class="color-select-menu" scroll-y="true" :show-scrollbar="false">
            <view v-for="(item, index) in colors" :key="index" @click="selectColor(item.color)">
                <view class="color-item" :class="{ selected: item.color == modelValue }"
                    :style="{ backgroundColor: item.color }">
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import colors from '../colors';
export default {
    name: "color-select-menu",
    data() {
        return {
            colors,
            open: false
        }
    },
    props: {
        modelValue: {
            type: String,
            default: "#000000"
        }
    },
    emits: ['update:modelValue', "change"],
    methods: {
        selectColor(color) {
            console.log(color)
            this.$emit("update:modelValue", color)
            this.$emit("change", color)
        }
    },
}
</script>

<style lang="scss" scoped>
.open {}

.close {
    height: 100rpx;
    width: 90rpx;
    overflow: hidden;
}

.color-control-wrapper {
    position: fixed;
    bottom: 90rpx;
    left: ;
}

.color-select-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    padding: 10rpx;

    height: 600rpx;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 40rpx;
    width: 80rpx;

    .color-item {
        margin: 10rpx 0;
        border-radius: 50%;
        width: 80rpx;
        height: 80rpx;
        display: flex;
        justify-content: center;
        align-self: center;

        &.selected::after {
            color: #fff;
            display: block;
            content: "√";
            text-align: center;
            line-height: 80rpx;
            font-size: 45rpx;
        }
    }
}
</style>