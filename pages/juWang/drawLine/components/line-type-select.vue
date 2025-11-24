<template>
    <view @touchmove.stop.prevent class="line-type-select-menu" :class="{ open: open }">
        <view v-for="(item, index) in types" :key="index" @click="selectType(item.type)" class="line-type-item"
            :class="{ selected: item.type == modelValue }">
            <view class="line-type-item-text" :style="{ backgroundColor: item.type == modelValue ? color : '' }">
                {{ item.name }}</view>
        </view>
    </view>
</template>

<script>
export default {
    name: "color-select-menu",
    props: {
        types: {
            type: Array,
            default: function () {
                return [
                    // 类型
                    { type: "autoLine", name: "智能线" },
                    { type: "line", name: "普通线" },
                    { type: "freeLine", name: "自由线" },
                    { type: "text", name: "添加文字" },
                    { type: "eraser", name: "橡皮擦" },
                    { type: "filledCircle", name: "实心圆形" },
                    { type: "filledRect", name: "实心矩形" },
                    { type: "hollowCircle", name: "空心圆形" },
                    { type: "hollowRect", name: "空心矩形" },
                ]
            }
        },
        modelValue: {
            type: String,
            default: "freeLine"
        },
        color: { type: String }, default: "#ff0000",
        open: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', "change"],
    methods: {
        selectType(size) {
            this.$emit("update:modelValue", size)
            this.$emit("change", size)
        }
    },
}
</script>

<style lang="scss" scoped>
.line-type-select-menu {
    position: fixed;
    right: 20rpx;
    bottom: 130rpx;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    box-sizing: border-box;

    width: 0;
    overflow: hidden;
    transition: width .3s;

    &.open {
        width: 300rpx;
    }

    .line-type-item {
        margin: 10rpx 0;
        border-radius: 10rpx;
        padding: 5rpx 12rpx;
        height: 80rpx;
        display: flex;
        justify-content: flex-end;
        align-self: flex-end;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);

        &.selected {
            background-color: rgba(0, 0, 0, 0.8);
        }

        .line-type-item-text {
            color: #fff;
            display: block;
            text-align: right;
            line-height: 60rpx;
            font-size: 45rpx;
            white-space: nowrap;
            overflow: hidden;
        }
    }
}
</style>