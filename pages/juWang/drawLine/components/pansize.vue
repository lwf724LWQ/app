<template>
    <view class="pansize-select-menu">
        <view v-for="(item, index) in sizes" :key="index" @click="selectSize(item.size)">
            <view class="pansize-item" :class="{ selected: item.size == modelValue }">
                <view class="pansize-item-text" :style="{ backgroundColor: item.size == modelValue ? color : '' }">{{
                    item.name }}</view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    name: "color-select-menu",
    props: {
        sizes: {
            type: Array,
            default: function () {
                return [
                    { size: 1, name: "小" },
                    { size: 3, name: "中" },
                    { size: 5, name: "大" },
                ]
            }
        },
        modelValue: {
            type: String,
            default: 3
        },
        color: { type: String }, default: "#ff0000"
    },
    emits: ['update:modelValue', 'change'],
    methods: {
        selectSize(size) {
            this.$emit("update:modelValue", size)
            this.$emit("change", size)
        }
    },
}
</script>

<style lang="scss" scoped>
.pansize-select-menu {
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 10rpx;

    .pansize-item {
        margin: 10rpx 0;
        border-radius: 50%;
        width: 80rpx;
        height: 80rpx;
        display: flex;
        justify-content: center;
        align-self: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);

        &.selected .pansize-item-text {
            width: 60rpx;
            height: 60rpx;
            border-radius: 50%;
        }

        .pansize-item-text {
            color: #fff;
            display: block;
            content: "√";
            text-align: center;
            line-height: 60rpx;
            font-size: 45rpx;
        }
    }
}
</style>