<template>
    <uni-popup ref="popup" type="bottom" borderRadius="10px 10px 0 0">
        <view class="wrapper">
            <view class="title">智能笔设置</view>
            <view class="row flex justify-between" v-show="modelValue.panCount == 1">
                <switch @change="controlSwitchChange" :checked="modelValue.controlSwitch" />
                <span class="tipText flex flex1 justify-start">号码连接拖拽点</span>
            </view>
            <view class="row flex justify-start">
                <view class="name">颜色</view>
                <view class="btns flex">
                    <view class="item flex" :class="{ 'on': modelValue.isMoreColor == 'false' }"
                        @click="isMoreColorChange('false')">
                        单色笔
                    </view>
                    <view class="item flex" v-show="modelValue.panCount > 1"
                        :class="{ 'on': modelValue.isMoreColor == 'true' }" @click="isMoreColorChange('true')">
                        多色笔
                    </view>
                </view>
            </view>
            <view class="row flex justify-start">
                <view class="name">线形</view>
                <view class="btns flex">
                    <view class="item flex" :class="{ 'on': modelValue.lineType == 'topBezier' }"
                        @click="lineTypeChange('topBezier')">
                        上曲线
                    </view>
                    <view class="item flex" :class="{ 'on': modelValue.lineType == 'bottomBezier' }"
                        @click="lineTypeChange('bottomBezier')">
                        下曲线
                    </view>
                    <view class="item flex" :class="{ 'on': modelValue.lineType == 'line' }"
                        @click="lineTypeChange('line')">
                        直线
                    </view>
                </view>
            </view>
            <view class="row flex justify-start" :class="{ 'disable': modelValue.panCount == 1 }">
                <view class="name">间隔</view>
                <view class="btns flex btnsEq">
                    <view class="item flex" :class="{ 'on': modelValue.interval == '0' }" @click="intervalChange('0')">
                        0 期
                    </view>
                    <view class="item flex" :class="{ 'on': modelValue.interval == '1' }" @click="intervalChange('1')">
                        1 期
                    </view>
                    <view class="item flex" :class="{ 'on': modelValue.interval == '2' }" @click="intervalChange('2')">
                        2 期
                    </view>
                    <view class="item flex" :class="{ 'on': modelValue.interval == '3' }" @click="intervalChange('3')">
                        3 期
                    </view>
                    <view class="item flex" :class="{ 'on': modelValue.interval == '4' }" @click="intervalChange('4')">
                        4 期
                    </view>
                </view>
            </view>
            <view class="row flex justify-start">
                <view class="name">笔数</view>
                <view class="btns flex btnsEq">
                    <view data-v="1" class="item flex" :class="{ 'on': modelValue.panCount == '1' }"
                        @click="panCountChange('1')">
                        1 支
                    </view>
                    <view data-v="2" class="item flex" :class="{ 'on': modelValue.panCount == '2' }"
                        @click="panCountChange('2')">
                        2 支
                    </view>
                    <view data-v="3" class="item flex" :class="{ 'on': modelValue.panCount == '3' }"
                        @click="panCountChange('3')">
                        3 支
                    </view>
                    <view data-v="4" class="item flex" :class="{ 'on': modelValue.panCount == '4' }"
                        @click="panCountChange('4')">
                        4 支
                    </view>
                    <view data-v="5" class="item flex" :class="{ 'on': modelValue.panCount == '5' }"
                        @click="panCountChange('5')">
                        5 支
                    </view>
                </view>
            </view>
            <view class="button flex">确定</view>
        </view>
    </uni-popup>
</template>

<script>
export default {
    data() {
        return {}
    },
    props: {
        modelValue: {
            type: Object,
            default: function () {
                return {
                    controlSwitch: true,
                    isMoreColor: 'false',
                    interval: "1",
                    panCount: "1",
                    lineType: 'topBezier'
                }
            }
        },
        show: {
            type: Boolean,
            default: false
        }
    },
    emits: ['update:modelValue', "change"],
    copmputed: {
        tableStyle() {
            return this.$parent.tableStyle
        }
    },
    methods: {
        controlSwitchChange(e) {
            this.$emit('update:modelValue', { ...this.modelValue, controlSwitch: e.detail.value });
            this.$emit('change')
        },
        isMoreColorChange(value) {
            this.$emit('update:modelValue', { ...this.modelValue, isMoreColor: value });
            this.$emit('change')
        },
        intervalChange(value) {
            this.$emit('update:modelValue', { ...this.modelValue, interval: value });
            this.$emit('change')
        },
        panCountChange(value) {
            const data = {}
            if (value == "1") {
                data.isMoreColor = 'false'
                data.interval = "0"
            }

            this.$emit('update:modelValue', { ...this.modelValue, ...data, panCount: value });
            this.$emit('change')
        },
        lineTypeChange(value) {
            this.$emit('update:modelValue', { ...this.modelValue, lineType: value });
            this.$emit('change')
        },
        open() {
            this.$refs.popup.open()
        },
        handleCancel() {
            this.$refs.popup.close()
        }
    }
}
</script>

<style lang="scss" scoped>
.flex {
    display: flex;
}

.wrapper {
    position: relative;
    width: 100%;
    background: #fff;
    padding: 18rpx 0 38rpx 0;
}

.wrapper .row {
    margin: 28.8rpx 0 0 38.4rpx;
    font-size: 30rpx;
    color: #333;
}

.justify-start {
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: start;
    justify-content: flex-start;
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

.wrapper .row .item {
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

.wrapper .row .item.on {
    border-color: rgba(253, 61, 68, .2);
    background: #fff5f5;
    color: #fd3d44;
}

.wrapper .button {
    height: .4rem;
    margin: .2rem;
    background-image: -webkit-gradient(linear, left top, right top, from(#fe7079), to(#fc3d44));
    background-image: linear-gradient(90deg, #fe7079, #fc3d44);
    -webkit-box-shadow: 0 10px 20px 0 rgba(252, 61, 68, .7);
    box-shadow: 0 10px 20px 0 rgba(252, 61, 68, .7);
    font-size: .18rem;
    color: #fff;
}

.justify-start {
    -webkit-box-pack: start;
    -ms-flex-pack: start;
    justify-content: start;
    justify-content: flex-start;
}

.wrapper .row .item {
    height: 51.7rpx;
    margin-right: 19.2rpx;
    padding: 0 21rpx;
    border: 1px solid #f5f6f8;
    position: relative;
    line-height: normal;
}

.wrapper .row.disable .item {
    border-color: #f5f6f8;
    color: #bbb;
}

.wrapper .row .name {
    margin-right: 38.4rpx;
}

.justify-between {
    -webkit-box-pack: justify;
    -ms-flex-pack: justify;
    justify-content: space-between;
}

.flex1 {
    -ms-flex: 1;
    flex: 1;
}

.wrapper .row .tipText {
    font-size: 26rpx;
    color: #bbb;
    margin-left: 28rpx;
}

.wrapper .button {
    height: 76.8rpx;
    margin: 38.4rpx 38.4rpx 0 38.4rpx;
    background-image: -webkit-gradient(linear, left top, right top, from(#fe7079), to(#fc3d44));
    background-image: linear-gradient(90deg, #fe7079, #fc3d44);
    -webkit-box-shadow: 0 10px 20px 0 rgba(252, 61, 68, .7);
    box-shadow: 0 10px 20px 0 rgba(252, 61, 68, .7);
    font-size: 38rpx;
    color: #fff;
}

.wrapper .title {
    font-size: 38rpx;
    font-weight: 700;
    color: #333;
    line-height: 1;
    margin: 38.4rpx 0 38.4rpx 38.4rpx;
    padding: 0 0 0 19.2rpx;
    border-left: 5rpx solid #f81219;
}

.wrapper :deep(.uni-switch-input)  {
    background-image: -webkit-gradient(linear, left top, right top, from(#fe7079), to(#fc3d44));
    background-image: linear-gradient(90deg, #fe7079, #fc3d44);
    border-color: #f5f6f8;
}
</style>