<template>
    <!-- <view @touchmove.stop.prevent class="line-type-select-menu">
        <view v-for="(item, index) in types" :key="index" @click="selectType(item.type)" class="line-type-item"
            :class="{ selected: item.type == modelValue }">
            <view class="line-type-item-text" :style="{ backgroundColor: item.type == modelValue ? color : '' }">
                {{ item.name }}</view>
        </view>
    </view> -->


    <view class="drawSelect" :class="{ open: open }">
        <view class="item flex justify-end show" @click="selectType('autoLine')">
            <view class="text flex">
                智能线
            </view>
            <view class="icon flex">
                <icons icon="autoLine" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('line')">
            <view class="text flex">
                直线
            </view>
            <view class="icon flex">
                <icons icon="line" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('freeLine')">
            <view class="text flex">
                自由线
            </view>
            <view class="icon flex">
                <icons icon="freeLine" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('text')">
            <view class="text flex">
                添加文字
            </view>
            <view class="icon flex">
                <icons icon="text" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('eraser')">
            <view class="text flex">
                橡皮擦
            </view>
            <view class="icon flex">
                <icons icon="eraser" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('filledCircle')">
            <view class="text flex">
                实心圆形
            </view>
            <view class="icon flex">
                <icons icon="filledCircle" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('filledRect')">
            <view class="text flex">
                实心矩形
            </view>
            <view class="icon flex">
                <icons icon="filledRect" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('hollowCircle')">
            <view class="text flex">
                空心圆形
            </view>
            <view class="icon flex">
                <icons icon="hollowCircle" />
            </view>
        </view>
        <view class="item flex justify-end show" @click="selectType('hollowRect')">
            <view class="text flex">
                空心矩形
            </view>
            <view class="icon flex">
                <icons icon="hollowRect" />
            </view>
        </view>
    </view>
</template>

<script>
import icons from "./icons.vue";
export default {
    components: {
        icons,
    },
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
}


.drawSelect {
    position: fixed;
    right: 20rpx;
    bottom: 134rpx;
    z-index: 10001;

    width: 0;
    overflow: hidden;
    transition: width .3s;

    &.open {
        width: 240rpx;
    }
}

.drawSelect .item {
    margin-top: 20rpx;
    position: relative;
}

.justify-end {
    -webkit-box-pack: end;
    -ms-flex-pack: end;
    justify-content: end;
    justify-content: flex-end;
}

.drawSelect .item.show .text {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    white-space: nowrap;
}

.drawSelect .item.show .icon {
    width: 77rpx;
}

.drawSelect .item .icon {
    width: 77rpx;
    height: 77rpx;
    border-radius: 77rpx;
    background: rgba(76, 75, 75, .8);
    -webkit-transition: all .15s;
    transition: all .15s;
    position: relative;
    z-index: 1;
}

.drawSelect .item.show .icon img {
    width: 42rpx;
}

.drawSelect .item .icon img {
    width: 0;
    display: block;
    -webkit-transition: all .15s;
    transition: all .15s;
}

.drawSelect .item .text {
    width: 153rpx;
    height: 68rpx;
    font-size: 24rpx;
    line-height: normal;
    color: #fff;
    background: rgba(76, 75, 75, .8);
    margin-right: 10rpx;

}

.flex {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    -webkit-box-orient: horizontal;
    -webkit-box-direction: normal;
    -ms-flex-direction: row;
    flex-direction: row;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -ms-flex-pack: center;
    justify-content: center;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
}
</style>