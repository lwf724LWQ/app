<template>
    <view class="line-type-select-menu">
        <view v-for="(item, index) in types" :key="index" @click="selectType(item.type)">
            <view class="line-type-item" :class="{ selected: item.type == modelValue }">
                <view class="line-type-item-text" :style="{ backgroundColor: item.type == modelValue ? color : '' }">
                    {{ item.name }}</view>
            </view>
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
        color: { type: String }, default: "#ff0000"
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
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    padding: 10rpx;

    .line-type-item {
        margin: 10rpx 0;
        border-radius: 10rpx;
        padding: 5rpx 12rpx;
        height: 80rpx;
        display: flex;
        justify-content: center;
        align-self: center;
        align-items: center;
        background-color: rgba(0, 0, 0, 0.5);

        &.selected {
            background-color: rgba(0, 0, 0, 0.8);
        }

        .line-type-item-text {
            color: #fff;
            display: block;
            text-align: center;
            line-height: 60rpx;
            font-size: 45rpx;
        }
    }
}
</style>