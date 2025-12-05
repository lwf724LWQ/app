<template>
    <view class="number-input">
        <view class="btn decrement" :class="{ disabled: isMin }" @click="decrement">
            -
        </view>

        <input type="number" v-model.number="currentValue" :min="min" :max="max" @change="handleChange"
            class="input-field" />

        <view class="btn increment" :class="{ disabled: isMax }" @click="increment">
            +
        </view>
    </view>
</template>

<script>
export default {
    name: 'NumberInput',
    props: {
        // 初始值
        modelValue: {
            type: Number,
            default: 0
        },
        // 最小值
        min: {
            type: Number,
            default: -Infinity
        },
        // 最大值
        max: {
            type: Number,
            default: Infinity
        },
        // 步长
        step: {
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            currentValue: this.modelValue
        }
    },
    computed: {
        // 是否达到最小值
        isMin() {
            return this.currentValue <= this.min
        },
        // 是否达到最大值
        isMax() {
            return this.currentValue >= this.max
        }
    },
    watch: {
        modelValue(newVal) {
            this.currentValue = this.validateValue(newVal)
        }
    },
    methods: {
        // 减少数值
        decrement() {
            const newValue = this.currentValue - this.step
            this.setValue(newValue)
        },

        // 增加数值
        increment() {
            const newValue = this.currentValue + this.step
            this.setValue(newValue)
        },

        // 处理输入框变化
        handleChange(event) {
            const value = event.target.value === '' ? 0 : Number(event.target.value)
            this.setValue(value)
        },

        // 设置值并验证
        setValue(value) {
            const validatedValue = this.validateValue(value)
            this.currentValue = validatedValue
            this.$emit('update:modelValue', validatedValue)
        },

        // 验证值是否在范围内
        validateValue(value) {
            if (value < this.min) return this.min
            if (value > this.max) return this.max
            return value
        }
    },
    mounted() {
        // 初始化时验证值
        this.currentValue = this.validateValue(this.modelValue)
    }
}
</script>

<style scoped>
.number-input {
    display: flex;
    align-items: center;
    width: fit-content;
}

.btn {
    width: 90rpx;
    height: 90rpx;
    border: 1px solid #dcdfe6;
    background-color: #f5f7fa;
    cursor: pointer;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
}

.btn.disabled {
    background-color: #f5f5f5;
    color: #c0c4cc;
    cursor: not-allowed;
}

.btn:not(.disabled):active {
    background-color: #e1e5eb;
}

.input-field {
    width: 220rpx;
    height: 90rpx;
    border-top: 1px solid #dcdfe6;
    border-bottom: 1px solid #dcdfe6;
    border-left: none;
    border-right: none;
    text-align: center;
    font-size: 38rpx;
    outline: none;
}

.input-field:focus {
    border-color: #409eff;
}

.decrement {
    border-radius: 4px 0 0 4px;
}

.increment {
    border-radius: 0 4px 4px 0;
}
</style>