<template>
    <view @touchmove.stop.prevent class="auto-line-setting-menu" v-show="show">
        <view class="auto-line-setting-menu-item">
            <view class="flex" v-show="modelValue.panCount == 1">
                <view>号码拖拽点</view>
                <view>
                    <switch @change="controlSwitchChange" :checked="modelValue.controlSwitch" />
                </view>
            </view>
            <view>
                <view>颜色</view>
                <view>
                    <radio-group @change="isMoreColorChange">
                        <label class="radio">
                            <radio value="true" :checked="!modelValue.isMoreColor" />单色
                        </label>
                        <label class="radio">
                            <radio value="false" :checked="modelValue.isMoreColor"
                                :disabled="modelValue.panCount == 1" />多彩
                        </label>
                    </radio-group>
                </view>
            </view>
            <view>
                <view>线型</view>
                <view>
                    <radio-group @change="lineTypeChange">
                        <label class="radio">
                            <radio value="topBezier" :checked="modelValue.lineType == 'topBezier'" />上曲线
                        </label>
                        <label class="radio">
                            <radio value="bottomBezier" :checked="modelValue.lineType == 'bottomBezier'" />下曲线
                        </label>
                        <label class="radio">
                            <radio value="line" :checked="modelValue.lineType == 'line'" />直线
                        </label>
                    </radio-group>
                </view>
            </view>
            <view>
                <view>笔数</view>
                <view>
                    <radio-group @change="panCountChange">
                        <label class="radio" v-for="i in [1, 2, 3, 4, 5]" v-bind:key="i">
                            <radio :value="i" :checked="modelValue.panCount === i" />{{ i }}支
                        </label>
                    </radio-group>
                </view>
            </view>
            <view>
                <view>间隔</view>
                <view>
                    <radio-group @change="intervalChange">
                        <label class="radio" v-for="i in [1, 2, 3, 4, 5]" v-bind:key="i">
                            <radio :value="i" :checked="modelValue.interval === i"
                                :disabled="modelValue.panCount == 1" />{{ i }}期
                        </label>
                    </radio-group>
                </view>
            </view>
        </view>
    </view>
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
                    isMoreColor: false,
                    interval: 1,
                    panCount: 1,
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
        isMoreColorChange(e) {
            this.$emit('update:modelValue', { ...this.modelValue, isMoreColor: e.detail.value === 'true' });
            this.$emit('change')
        },
        intervalChange(e) {
            this.$emit('update:modelValue', { ...this.modelValue, interval: parseInt(e.detail.value) });
            this.$emit('change')
        },
        panCountChange(e) {
            const data = {}
            if (e.detail.value == 1) {
                data.isMoreColor = false
                data.interval = 1
            }

            this.$emit('update:modelValue', { ...this.modelValue, data, panCount: parseInt(e.detail.value) });
            this.$emit('change')
        },
        lineTypeChange(e) {
            this.$emit('update:modelValue', { ...this.modelValue, lineType: e.detail.value });
            this.$emit('change')
        }
    }
}
</script>

<style lang="scss" scoped>
.flex {
    display: flex;
}

.auto-line-setting-menu {
    position: fixed;
    bottom: 200rpx;
    left: 0;
    right: 0;
    background-color: #fff;
    border-radius: 15rpx;
    margin: 0 12rpx;
    padding: 20rpx;
}
</style>