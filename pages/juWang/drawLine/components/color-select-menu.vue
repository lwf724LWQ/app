<template>
    <view @touchmove.stop.prevent class="color-control-wrapper" :class="{ open: open }">
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
            colors
        }
    },
    props: {
        modelValue: {
            type: String,
            default: "#000000"
        },
        open: {
            type: Boolean,
            default: false
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
.color-control-wrapper {
    height: 0;
    overflow: hidden;
    transition: height .3s;

    position: fixed;
    left: 21rpx;
    bottom: 140rpx;


    &.open {
        height: 620rpx;
    }
}

.color-select-menu {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;

    height: 600rpx;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: 40rpx;
    width: 100rpx;

    box-sizing: border-box;
    padding: 10rpx 10rpx;

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