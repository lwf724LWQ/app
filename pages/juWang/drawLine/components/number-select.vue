<template>
    <view>
        <uni-popup ref="popup" type="bottom" border-radius="10px 10px 0 0">
            <view class="number-select-wrapper">
                <view class="title-box">
                    <view class="popup-title">数字选择器</view>
                    <view class="right-sw" v-if="!['小', '末'].includes(nowSelectPlaceValue)">
                        <view class="" @click="swSelectType('advanced')">高级</view>
                        <view class="" @click="swSelectType('simple')">简易</view>
                    </view>
                </view>

                <!-- 高级版 -->
                <template v-if="selectType == 'advanced'">
                    <view class="popup-item">
                        <view class="popup-item-title">选择号码</view>
                        <view class="grid-container">
                            <view class="grid-item" @click="handleSelectNumber(index)" v-for="(item, index) in 10"
                                :key="index">
                                <view class="number-item" :class="{ active: numbers.includes(index) }">{{ index }}
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="popup-item">
                        <view class="popup-item-title">选择条件</view>
                        <view class="grid-container">
                            <view v-for="item in typeList" :key="item" class="grid-item type-item"
                                :class="{ active: type == item }" @click="handleSelectType(item)">{{ item }}</view>
                        </view>
                    </view>
                    <view class="popup-item">
                        <view class="popup-item-title">效果预览</view>

                        <view class="preview-wrapper">
                            <view class="preview-box wenshangyima" v-if="type == '稳码'">{{ outPreview('稳码', '', numbers,
                                type) }}</view>
                            <view class="grid-container preview-box grid4" v-else>
                                <view class="grid-item preview-item"
                                    :class="{ active: outPreview('千', 'bg', numbers, type) }">
                                    <view class="top">
                                        <!-- 类型 双 单 百个合 等等 -->
                                        {{ outPreview('千', 'top', numbers, type) }}
                                    </view>
                                    <view class="center">
                                        <!-- 数字 -->
                                        {{ outPreview('千', 'num', numbers, type) }}
                                    </view>
                                </view>
                                <view class="grid-item preview-item"
                                    :class="{ active: outPreview('百', 'bg', numbers, type) }">
                                    <view class="top">
                                        <!-- 类型 双 单 百个合 等等 -->
                                        {{ outPreview('百', 'top', numbers, type) }}
                                    </view>
                                    <view class="center">
                                        <!-- 数字 -->
                                        {{ outPreview('百', 'num', numbers, type) }}
                                    </view>
                                </view>
                                <view class="grid-item preview-item"
                                    :class="{ active: outPreview('十', 'bg', numbers, type) }">
                                    <view class="top">
                                        <!-- 类型 双 单 百个合 等等 -->
                                        {{ outPreview('十', 'top', numbers, type) }}
                                    </view>
                                    <view class="center">
                                        <!-- 数字 -->
                                        {{ outPreview('十', 'num', numbers, type) }}
                                    </view>
                                </view>
                                <view class="grid-item preview-item"
                                    :class="{ active: outPreview('个', 'bg', numbers, type) }">
                                    <view class="top">
                                        <!-- 类型 双 单 百个合 等等 -->
                                        {{ outPreview('个', 'top', numbers, type) }}
                                    </view>
                                    <view class="center">
                                        <!-- 数字 -->
                                        {{ outPreview('个', 'num', numbers, type) }}
                                    </view>
                                </view>
                            </view>
                            <view class="grid-container grid4" v-if="type != '稳码'">
                                <view class="grid-item">千A</view>
                                <view class="grid-item">百B</view>
                                <view class="grid-item">十C</view>
                                <view class="grid-item">个D</view>
                            </view>
                        </view>
                    </view>
                </template>
                <!-- 简易版 -->
                <template v-if="selectType == 'simple'">
                    <view class="popup-item">
                        <view class="popup-item-title">选择号码</view>
                        <view class="grid-container">
                            <view class="grid-item" @click="handleSelectNumber(index)" v-for="(item, index) in 10"
                                :key="index">
                                <view class="number-item" :class="{ active: numbers.includes(index) }">{{ index }}
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="popup-item">
                        <view class="popup-item-title">选择对数</view>
                        <view class="grid-container">
                            <view class="grid-item" @click="handleSelectNumber(item)"
                                v-for="(item, index) in ['0/5', '1/6', '2/7', '3/8', '4/9']" :key="index">
                                <view class="number-item" :class="{ active: numbers.includes(item) }">{{ item }}
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="popup-item">
                        <view class="popup-item-title">单双大小</view>
                        <view class="grid-container">
                            <view class="grid-item" @click="handleSelectNumber(item)"
                                v-for="(item, index) in ['单', '双', '大', '小', 'X']" :key="index">
                                <view class="number-item type-item" :class="{ active: numbers.includes(item) }">{{
                                    item }}</view>
                            </view>
                        </view>
                    </view>
                </template>
                <template v-if="selectType == 'onlyNumber'">
                    <view class="popup-item">
                        <view class="popup-item-title">选择号码</view>
                        <view class="grid-container">
                            <view class="grid-item" @click="handleSelectNumber(index)" v-for="(item, index) in 36"
                                :key="index">
                                <view class="number-item" :class="{ active: numbers.includes(index) }">{{ index }}
                                </view>
                            </view>
                        </view>
                    </view>
                    <view class="popup-item">
                        <view class="popup-item-title">单双大小</view>
                        <view class="grid-container">
                            <view class="grid-item" @click="handleSelectNumber(item)"
                                v-for="(item, index) in ['单', '双', '大', '小']" :key="index">
                                <view class="number-item type-item" :class="{ active: numbers.includes(item) }">{{
                                    item }}</view>
                            </view>
                        </view>
                    </view>
                </template>
                <view class="btn-wrapper">
                    <button type="primary" @click="handleConfirm">确定</button>
                    <button type="default" @click="handleCancel">取消</button>
                </view>
            </view>
        </uni-popup>
    </view>
</template>

<script>
export default {
    name: 'numberSelect',
    data() {
        return {
            XY: { x: 0, y: 0 },
            selectType: "advanced", // selectType: "simple" | "advanced" | "onlyNumber"
            // 高级版
            nowSelectPlaceValue: "十",
            numbers: [],
            type: "",
            typeList: [
                "单", "双", "大", "小", "X", "中肚合", "千百合", "百个合", "杀", "稳码"
            ]
        }
    },
    emits: ['confirm'],
    methods: {
        open: function (placeValue, XY) {
            // 传进来的是位置
            if (placeValue == "末") {
                this.selectType = "simple"
            } else if (placeValue == "小") {
                this.selectType = "onlyNumber"
            } else {
                this.selectType = "advanced"
            }
            this.numbers = []
            this.nowSelectPlaceValue = placeValue
            this.XY = XY; // 这个y用于回传
            this.$refs.popup.open()
        },
        swSelectType: function (type) {
            this.selectType = type
            this.numbers = []
            this.type = ""
        },
        handleConfirm: function () {
            let data = {}
            if (this.selectType == 'simple' || this.selectType == 'onlyNumber') {
                data = {
                    string: this.numbers.join("")
                }
            } else if (this.selectType == 'advanced') {
                data = {
                    type: this.type,
                    numbers: this.numbers
                }
            }
            this.$emit("confirm", {
                type: this.selectType,
                XY: this.XY,
                data
            })
            this.handleCancel()
        },
        handleCancel: function () {
            this.$refs.popup.close()
        },
        handleSelectNumber: function (index) {
            if (this.selectType === 'simple' || this.selectType === 'onlyNumber') {
                this.numbers = [index]
                return
            }
            if (this.type == "X") {
                this.numbers = []
            }
            if (['单', '双', "大", "小", "X",].includes(this.type)) {
                this.type = ""
            }

            if (this.numbers.includes(index)) {
                this.numbers.splice(this.numbers.indexOf(index), 1)
                return
            } else {
                if (this.numbers.length >= 6) {
                    uni.showToast({
                        title: '最多选择6个号码',
                        icon: 'none'
                    })
                    return
                }
                if (this.numbers.length >= 2 && this.type == "杀") {
                    uni.showToast({
                        title: '杀最多选择2个号码',
                        icon: 'none'
                    })
                    return
                }
                if (this.numbers.length >= 1 && this.type == "稳码") {
                    this.numbers = [index]
                    return
                }
                this.numbers.push(index)
            }
        },
        handleSelectType: function (type) {
            if (this.type == "X") {
                this.numbers = []
            }
            const num0to9 = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
            if (type == '单') {
                this.numbers = num0to9.filter(num => num % 2 !== 0)
            } else if (type == '双') {
                this.numbers = num0to9.filter(num => num % 2 === 0)
            } else if (type == '大') {
                this.numbers = num0to9.filter(num => num > 4)
            } else if (type == '小') {
                this.numbers = num0to9.filter(num => num < 5)
            } else if (type == 'X') {
                this.numbers = ['X']
            } else if (type == '杀' && this.numbers.length > 2) {
                this.numbers = []
            }
            this.type = type
        },
        outPreview(placeValue, position) {
            const type = this.type
            const numbers = this.numbers
            if (numbers.length === 0) {
                return ''
            }
            // 判断类型是否为 中肚合 千百合 百个合
            if (["中肚合", "千百合", "百个合", "稳码"].includes(type)) {
                if (type == "中肚合") {
                    if (!["百", "十"].includes(placeValue)) {
                        return ''
                    }
                }
                if (type == "千百合") {
                    if (!["千", "百"].includes(placeValue)) {
                        return ''
                    }
                }
                if (type == "百个合") {
                    if (!["个", "百"].includes(placeValue)) {
                        return ''
                    }
                }
                if (type == "稳码" && placeValue == "稳码") {
                    return `稳上一码：${numbers.join("")}`
                }
            } else if (placeValue != this.nowSelectPlaceValue) {
                return ''
            }

            if (position === 'top') {
                if (type == "X") {
                    return ""
                }
                return type
            } else if (position === 'num') {
                return numbers.join("")
            } else if (position === 'bg') {
                return true
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.number-select-wrapper {
    width: 100%;
    box-sizing: border-box;

    background: #fff;
    border-radius: 20rpx 20rpx 0 0;

    padding: 0 20rpx;

    .title-box {
        position: relative;
        width: 100%;
        padding: 20rpx 0;

        .popup-title {
            font-size: 45rpx;
            font-weight: bold;
            text-align: center;

        }

        .title-box {}

        .right-sw {
            position: absolute;
            right: 20rpx;
            top: 20rpx;

            display: flex;
            align-items: center;
            justify-content: center;

            background-color: #aaa;
            color: #444;


        }


    }

    .preview-wrapper {
        padding: 0 20rpx;
        margin: 10rpx 40rpx;
    }

    .preview-box {
        margin: 10rpx 0;

        box-sizing: border-box;
        color: #fff;

        height: 140rpx;
        border-radius: 10rpx;

        .preview-item {
            border-radius: 10rpx;
            border: 1rpx solid #aaa;

            display: flex;

            flex-direction: column;
            font-weight: normal;
            font-size: 30rpx;

            .top {
                font-weight: normal;
            }

            .center {
                font-weight: normal;
                width: 60rpx;
                word-break: break-all;
                text-align: center
            }

            &.active {
                background-color: #FE0000;
                border-color: #FE0000;
                color: #fff;
            }
        }

        &.wenshangyima {
            background-color: #FE0000;

            text-align: center;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .grid-container {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        /* 固定5列 */
        gap: 10px;

        /* 控制网格间距 */
        &.grid4 {
            grid-template-columns: repeat(4, 1fr);
        }
    }


    .grid-item {
        display: flex;
        align-items: center;
        justify-content: center;

        &.type-item {
            background-color: #eee;
            border-radius: 8rpx;
            text-align: center;
            padding: 10rpx;
            font-size: 30rpx;
            font-weight: bold;

            &.active {
                background-color: #f3bbbba9;
                color: #FE0000;
                border: 1rpx solid rgb(253, 60, 60);
            }
        }

        .number-item {
            font-size: 50rpx;
            font-weight: bold;
            width: 80rpx;
            height: 80rpx;
            background-color: #eee;
            border-radius: 50%;
            text-align: center;
            line-height: 80rpx;
            color: #000;

            &.active {
                background-color: #FE0000;
                color: #fff;
            }
        }
    }

    .popup-item {
        margin-bottom: 20rpx;

        .popup-item-title {
            margin-bottom: 20rpx;
        }
    }

    .btn-wrapper {
        display: flex;
        justify-content: space-between;
        padding: 20rpx 0;

        button {
            width: 40%;
        }
    }
}
</style>